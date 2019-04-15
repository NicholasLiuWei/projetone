// Copyright 2017 The Kubernetes Authors.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package handler

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/emicklei/go-restful"
	"github.com/ghw"
	"github.com/kubernetes/dashboard/src/app/backend/api"
	"github.com/kubernetes/dashboard/src/app/backend/auth"
	authApi "github.com/kubernetes/dashboard/src/app/backend/auth/api"
	clientapi "github.com/kubernetes/dashboard/src/app/backend/client/api"
	kdErrors "github.com/kubernetes/dashboard/src/app/backend/errors"
	"github.com/kubernetes/dashboard/src/app/backend/integration"
	metricapi "github.com/kubernetes/dashboard/src/app/backend/integration/metric/api"
	"github.com/kubernetes/dashboard/src/app/backend/resource/cluster"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/config"
	"github.com/kubernetes/dashboard/src/app/backend/resource/configmap"
	"github.com/kubernetes/dashboard/src/app/backend/resource/container"
	"github.com/kubernetes/dashboard/src/app/backend/resource/controller"
	"github.com/kubernetes/dashboard/src/app/backend/resource/cronjob"
	"github.com/kubernetes/dashboard/src/app/backend/resource/daemonset"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"github.com/kubernetes/dashboard/src/app/backend/resource/deployment"
	"github.com/kubernetes/dashboard/src/app/backend/resource/discovery"
	"github.com/kubernetes/dashboard/src/app/backend/resource/endpoint"
	"github.com/kubernetes/dashboard/src/app/backend/resource/event"
	"github.com/kubernetes/dashboard/src/app/backend/resource/horizontalpodautoscaler"
	"github.com/kubernetes/dashboard/src/app/backend/resource/ingress"
	"github.com/kubernetes/dashboard/src/app/backend/resource/job"
	"github.com/kubernetes/dashboard/src/app/backend/resource/logs"
	ns "github.com/kubernetes/dashboard/src/app/backend/resource/namespace"
	"github.com/kubernetes/dashboard/src/app/backend/resource/node"
	"github.com/kubernetes/dashboard/src/app/backend/resource/overview"
	"github.com/kubernetes/dashboard/src/app/backend/resource/panel"
	"github.com/kubernetes/dashboard/src/app/backend/resource/persistentvolume"
	"github.com/kubernetes/dashboard/src/app/backend/resource/persistentvolumeclaim"
	"github.com/kubernetes/dashboard/src/app/backend/resource/pod"
	"github.com/kubernetes/dashboard/src/app/backend/resource/rbacrolebindings"
	"github.com/kubernetes/dashboard/src/app/backend/resource/rbacroles"
	"github.com/kubernetes/dashboard/src/app/backend/resource/replicaset"
	"github.com/kubernetes/dashboard/src/app/backend/resource/replicationcontroller"
	"github.com/kubernetes/dashboard/src/app/backend/resource/secret"
	resourceService "github.com/kubernetes/dashboard/src/app/backend/resource/service"
	"github.com/kubernetes/dashboard/src/app/backend/resource/statefulset"
	"github.com/kubernetes/dashboard/src/app/backend/resource/storageclass"
	"github.com/kubernetes/dashboard/src/app/backend/resource/workload"
	"github.com/kubernetes/dashboard/src/app/backend/scaling"
	"github.com/kubernetes/dashboard/src/app/backend/search"
	"github.com/kubernetes/dashboard/src/app/backend/settings"
	"github.com/kubernetes/dashboard/src/app/backend/systembanner"
	"github.com/kubernetes/dashboard/src/app/backend/user"
	"github.com/kubernetes/dashboard/src/app/backend/validation"
	"golang.org/x/net/xsrftoken"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/client-go/tools/remotecommand"
)

const (
	// RequestLogString is a template for request log message.
	RequestLogString = "[%s] Incoming %s %s %s request from %s: %s"

	// ResponseLogString is a template for response log message.
	ResponseLogString = "[%s] Outcoming response to %s with %d status code"
)

// APIHandler is a representation of API handler. Structure contains clientapi, Heapster clientapi and clientapi configuration.
type APIHandler struct {
	iManager integration.IntegrationManager
	cManager clientapi.ClientManager
	sManager settings.SettingsManager
}

//全局缓存
var baseInfo = BaseInfo{}

// TerminalResponse is sent by handleExecShell. The Id is a random session id that binds the original REST request and the SockJS connection.
// Any clientapi in possession of this Id can hijack the terminal session.
type TerminalResponse struct {
	Id string `json:"id"`
}

// CreateHTTPAPIHandler creates a new HTTP handler that handles all requests to the API of the backend.
func CreateHTTPAPIHandler(iManager integration.IntegrationManager, cManager clientapi.ClientManager,
	authManager authApi.AuthManager, sManager settings.SettingsManager,
	sbManager systembanner.SystemBannerManager) (

	http.Handler, error) {
	apiHandler := APIHandler{iManager: iManager, cManager: cManager}
	wsContainer := restful.NewContainer()
	wsContainer.EnableContentEncoding(true)

	apiV1Ws := new(restful.WebService)

	InstallFilters(apiV1Ws, cManager)

	apiV1Ws.Path("/api/v1").
		Consumes(restful.MIME_JSON).
		Produces(restful.MIME_JSON)
	wsContainer.Add(apiV1Ws)

	integrationHandler := integration.NewIntegrationHandler(iManager)
	integrationHandler.Install(apiV1Ws)

	authHandler := auth.NewAuthHandler(authManager)
	authHandler.Install(apiV1Ws)

	settingsHandler := settings.NewSettingsHandler(sManager)
	settingsHandler.Install(apiV1Ws)

	systemBannerHandler := systembanner.NewSystemBannerHandler(sbManager)
	systemBannerHandler.Install(apiV1Ws)

	apiV1Ws.Route(
		apiV1Ws.GET("csrftoken/{action}").
			To(apiHandler.handleGetCsrfToken).
			Writes(api.CsrfToken{}))

	apiV1Ws.Route(
		apiV1Ws.POST("/appdeployment").
			To(apiHandler.handleDeploy).
			Reads(deployment.AppDeploymentSpec{}).
			Writes(deployment.AppDeploymentSpec{}))
	apiV1Ws.Route(
		apiV1Ws.POST("/appdeployment/validate/name").
			To(apiHandler.handleNameValidity).
			Reads(validation.AppNameValiditySpec{}).
			Writes(validation.AppNameValidity{}))
	apiV1Ws.Route(
		apiV1Ws.POST("/appdeployment/validate/imagereference").
			To(apiHandler.handleImageReferenceValidity).
			Reads(validation.ImageReferenceValiditySpec{}).
			Writes(validation.ImageReferenceValidity{}))
	apiV1Ws.Route(
		apiV1Ws.POST("/appdeployment/validate/protocol").
			To(apiHandler.handleProtocolValidity).
			Reads(validation.ProtocolValiditySpec{}).
			Writes(validation.ProtocolValidity{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/appdeployment/protocols").
			To(apiHandler.handleGetAvailableProcotols).
			Writes(deployment.Protocols{}))

	apiV1Ws.Route(
		apiV1Ws.POST("/appdeploymentfromfile").
			To(apiHandler.handleDeployFromFile).
			Reads(deployment.AppDeploymentFromFileSpec{}).
			Writes(deployment.AppDeploymentFromFileResponse{}))

	apiV1Ws.Route(
		apiV1Ws.GET("/replicationcontroller").
			To(apiHandler.handleGetReplicationControllerList).
			Writes(replicationcontroller.ReplicationControllerList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/replicationcontroller/{namespace}").
			To(apiHandler.handleGetReplicationControllerList).
			Writes(replicationcontroller.ReplicationControllerList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/replicationcontroller/{namespace}/{replicationController}").
			To(apiHandler.handleGetReplicationControllerDetail).
			Writes(replicationcontroller.ReplicationControllerDetail{}))
	apiV1Ws.Route(
		apiV1Ws.POST("/replicationcontroller/{namespace}/{replicationController}/update/pod").
			To(apiHandler.handleUpdateReplicasCount).
			Reads(replicationcontroller.ReplicationControllerSpec{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/replicationcontroller/{namespace}/{replicationController}/pod").
			To(apiHandler.handleGetReplicationControllerPods).
			Writes(pod.PodList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/replicationcontroller/{namespace}/{replicationController}/event").
			To(apiHandler.handleGetReplicationControllerEvents).
			Writes(common.EventList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/replicationcontroller/{namespace}/{replicationController}/service").
			To(apiHandler.handleGetReplicationControllerServices).
			Writes(resourceService.ServiceList{}))

	apiV1Ws.Route(
		apiV1Ws.GET("/workload").
			To(apiHandler.handleGetWorkloads).
			Writes(workload.Workloads{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/workload/{namespace}").
			To(apiHandler.handleGetWorkloads).
			Writes(workload.Workloads{}))

	apiV1Ws.Route(
		apiV1Ws.GET("/panel").
			To(apiHandler.handleGetPanels).
			Writes(panel.Panels{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/panel/{namespace}").
			To(apiHandler.handleGetPanels).
			Writes(panel.Panels{}))

	apiV1Ws.Route(
		apiV1Ws.GET("/cluster").
			To(apiHandler.handleGetCluster).
			Writes(cluster.Cluster{}))

	apiV1Ws.Route(
		apiV1Ws.GET("/discovery").
			To(apiHandler.handleGetDiscovery).
			Writes(discovery.Discovery{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/discovery/{namespace}").
			To(apiHandler.handleGetDiscovery).
			Writes(discovery.Discovery{}))

	apiV1Ws.Route(
		apiV1Ws.GET("/config").
			To(apiHandler.handleGetConfig).
			Writes(config.Config{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/config/{namespace}").
			To(apiHandler.handleGetConfig).
			Writes(config.Config{}))

	apiV1Ws.Route(
		apiV1Ws.GET("/replicaset").
			To(apiHandler.handleGetReplicaSets).
			Writes(replicaset.ReplicaSetList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/replicaset/{namespace}").
			To(apiHandler.handleGetReplicaSets).
			Writes(replicaset.ReplicaSetList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/replicaset/{namespace}/{replicaSet}").
			To(apiHandler.handleGetReplicaSetDetail).
			Writes(replicaset.ReplicaSetDetail{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/replicaset/{namespace}/{replicaSet}/pod").
			To(apiHandler.handleGetReplicaSetPods).
			Writes(pod.PodList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/replicaset/{namespace}/{replicaSet}/event").
			To(apiHandler.handleGetReplicaSetEvents).
			Writes(common.EventList{}))

	apiV1Ws.Route(
		apiV1Ws.GET("/pod").
			To(apiHandler.handleGetPods).
			Writes(pod.PodList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/pod/{namespace}").
			To(apiHandler.handleGetPods).
			Writes(pod.PodList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/pod/{namespace}/{pod}").
			To(apiHandler.handleGetPodDetail).
			Writes(pod.PodDetail{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/pod/{namespace}/{pod}/container").
			To(apiHandler.handleGetPodContainers).
			Writes(pod.PodDetail{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/pod/{namespace}/{pod}/event").
			To(apiHandler.handleGetPodEvents).
			Writes(common.EventList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/pod/{namespace}/{pod}/shell/{container}").
			To(apiHandler.handleExecShell).
			Writes(TerminalResponse{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/pod/{namespace}/{pod}/persistentvolumeclaim").
			To(apiHandler.handleGetPodPersistentVolumeClaims).
			Writes(persistentvolumeclaim.PersistentVolumeClaimList{}))

	apiV1Ws.Route(
		apiV1Ws.GET("/deployment").
			To(apiHandler.handleGetDeployments).
			Writes(deployment.DeploymentList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/deployment/{namespace}").
			To(apiHandler.handleGetDeployments).
			Writes(deployment.DeploymentList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/deployment/{namespace}/{deployment}").
			To(apiHandler.handleGetDeploymentDetail).
			Writes(deployment.DeploymentDetail{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/deployment/{namespace}/{deployment}/event").
			To(apiHandler.handleGetDeploymentEvents).
			Writes(common.EventList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/deployment/{namespace}/{deployment}/oldreplicaset").
			To(apiHandler.handleGetDeploymentOldReplicaSets).
			Writes(replicaset.ReplicaSetList{}))

	apiV1Ws.Route(
		apiV1Ws.PUT("/scale/{kind}/{namespace}/{name}/").
			To(apiHandler.handleScaleResource).
			Writes(scaling.ReplicaCounts{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/scale/{kind}/{namespace}/{name}").
			To(apiHandler.handleGetReplicaCount).
			Writes(scaling.ReplicaCounts{}))

	apiV1Ws.Route(
		apiV1Ws.GET("/daemonset").
			To(apiHandler.handleGetDaemonSetList).
			Writes(daemonset.DaemonSetList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/daemonset/{namespace}").
			To(apiHandler.handleGetDaemonSetList).
			Writes(daemonset.DaemonSetList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/daemonset/{namespace}/{daemonSet}").
			To(apiHandler.handleGetDaemonSetDetail).
			Writes(daemonset.DaemonSetDetail{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/daemonset/{namespace}/{daemonSet}/pod").
			To(apiHandler.handleGetDaemonSetPods).
			Writes(pod.PodList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/daemonset/{namespace}/{daemonSet}/service").
			To(apiHandler.handleGetDaemonSetServices).
			Writes(resourceService.ServiceList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/daemonset/{namespace}/{daemonSet}/event").
			To(apiHandler.handleGetDaemonSetEvents).
			Writes(common.EventList{}))

	apiV1Ws.Route(
		apiV1Ws.GET("/horizontalpodautoscaler").
			To(apiHandler.handleGetHorizontalPodAutoscalerList).
			Writes(horizontalpodautoscaler.HorizontalPodAutoscalerList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/horizontalpodautoscaler/{namespace}").
			To(apiHandler.handleGetHorizontalPodAutoscalerList).
			Writes(horizontalpodautoscaler.HorizontalPodAutoscalerList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/horizontalpodautoscaler/{namespace}/{horizontalpodautoscaler}").
			To(apiHandler.handleGetHorizontalPodAutoscalerDetail).
			Writes(horizontalpodautoscaler.HorizontalPodAutoscalerDetail{}))

	apiV1Ws.Route(
		apiV1Ws.GET("/job").
			To(apiHandler.handleGetJobList).
			Writes(job.JobList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/job/{namespace}").
			To(apiHandler.handleGetJobList).
			Writes(job.JobList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/job/{namespace}/{name}").
			To(apiHandler.handleGetJobDetail).
			Writes(job.JobDetail{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/job/{namespace}/{name}/pod").
			To(apiHandler.handleGetJobPods).
			Writes(pod.PodList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/job/{namespace}/{name}/event").
			To(apiHandler.handleGetJobEvents).
			Writes(common.EventList{}))

	apiV1Ws.Route(
		apiV1Ws.GET("/cronjob").
			To(apiHandler.handleGetCronJobList).
			Writes(cronjob.CronJobList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/cronjob/{namespace}").
			To(apiHandler.handleGetCronJobList).
			Writes(cronjob.CronJobList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/cronjob/{namespace}/{name}").
			To(apiHandler.handleGetCronJobDetail).
			Writes(cronjob.CronJobDetail{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/cronjob/{namespace}/{name}/job").
			To(apiHandler.handleGetCronJobJobs).
			Writes(job.JobList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/cronjob/{namespace}/{name}/event").
			To(apiHandler.handleGetCronJobEvents).
			Writes(common.EventList{}))

	apiV1Ws.Route(
		apiV1Ws.POST("/namespace").
			To(apiHandler.handleCreateNamespace).
			Reads(ns.NamespaceSpec{}).
			Writes(ns.NamespaceSpec{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/namespace").
			To(apiHandler.handleGetNamespaces).
			Writes(ns.NamespaceList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/namespace/{name}").
			To(apiHandler.handleGetNamespaceDetail).
			Writes(ns.NamespaceDetail{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/namespace/{name}/event").
			To(apiHandler.handleGetNamespaceEvents).
			Writes(common.EventList{}))

	apiV1Ws.Route(
		apiV1Ws.GET("/secret").
			To(apiHandler.handleGetSecretList).
			Writes(secret.SecretList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/secret/{namespace}").
			To(apiHandler.handleGetSecretList).
			Writes(secret.SecretList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/secret/{namespace}/{name}").
			To(apiHandler.handleGetSecretDetail).
			Writes(secret.SecretDetail{}))
	apiV1Ws.Route(
		apiV1Ws.POST("/secret").
			To(apiHandler.handleCreateImagePullSecret).
			Reads(secret.ImagePullSecretSpec{}).
			Writes(secret.Secret{}))

	apiV1Ws.Route(
		apiV1Ws.GET("/configmap").
			To(apiHandler.handleGetConfigMapList).
			Writes(configmap.ConfigMapList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/configmap/{namespace}").
			To(apiHandler.handleGetConfigMapList).
			Writes(configmap.ConfigMapList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/configmap/{namespace}/{configmap}").
			To(apiHandler.handleGetConfigMapDetail).
			Writes(configmap.ConfigMapDetail{}))

	apiV1Ws.Route(
		apiV1Ws.GET("/service").
			To(apiHandler.handleGetServiceList).
			Writes(resourceService.ServiceList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/service/{namespace}").
			To(apiHandler.handleGetServiceList).
			Writes(resourceService.ServiceList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/service/{namespace}/{service}").
			To(apiHandler.handleGetServiceDetail).
			Writes(resourceService.ServiceDetail{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/service/{namespace}/{service}/pod").
			To(apiHandler.handleGetServicePods).
			Writes(pod.PodList{}))

	apiV1Ws.Route(
		apiV1Ws.GET("/ingress").
			To(apiHandler.handleGetIngressList).
			Writes(ingress.IngressList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/ingress/{namespace}").
			To(apiHandler.handleGetIngressList).
			Writes(ingress.IngressList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/ingress/{namespace}/{name}").
			To(apiHandler.handleGetIngressDetail).
			Writes(ingress.IngressDetail{}))

	apiV1Ws.Route(
		apiV1Ws.GET("/statefulset").
			To(apiHandler.handleGetStatefulSetList).
			Writes(statefulset.StatefulSetList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/statefulset/{namespace}").
			To(apiHandler.handleGetStatefulSetList).
			Writes(statefulset.StatefulSetList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/statefulset/{namespace}/{statefulset}").
			To(apiHandler.handleGetStatefulSetDetail).
			Writes(statefulset.StatefulSetDetail{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/statefulset/{namespace}/{statefulset}/pod").
			To(apiHandler.handleGetStatefulSetPods).
			Writes(pod.PodList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/statefulset/{namespace}/{statefulset}/event").
			To(apiHandler.handleGetStatefulSetEvents).
			Writes(common.EventList{}))

	apiV1Ws.Route(
		apiV1Ws.GET("/node").
			To(apiHandler.handleGetNodeList).
			Writes(node.NodeList{}))

	apiV1Ws.Route(
		apiV1Ws.GET("/clusterArch").
			To(apiHandler.handleGetClusterArch))

	apiV1Ws.Route(
		apiV1Ws.GET("/node/{name}").
			To(apiHandler.handleGetNodeDetail).
			Writes(node.NodeDetail{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/node/{name}/event").
			To(apiHandler.handleGetNodeEvents).
			Writes(common.EventList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/node/{name}/pod").
			To(apiHandler.handleGetNodePods).
			Writes(pod.PodList{}))

	apiV1Ws.Route(
		apiV1Ws.DELETE("/_raw/{kind}/namespace/{namespace}/name/{name}").
			To(apiHandler.handleDeleteResource))
	apiV1Ws.Route(
		apiV1Ws.GET("/_raw/{kind}/namespace/{namespace}/name/{name}").
			To(apiHandler.handleGetResource))
	apiV1Ws.Route(
		apiV1Ws.PUT("/_raw/{kind}/namespace/{namespace}/name/{name}").
			To(apiHandler.handlePutResource))

	apiV1Ws.Route(
		apiV1Ws.DELETE("/_raw/{kind}/name/{name}").
			To(apiHandler.handleDeleteResource))
	apiV1Ws.Route(
		apiV1Ws.GET("/_raw/{kind}/name/{name}").
			To(apiHandler.handleGetResource))
	apiV1Ws.Route(
		apiV1Ws.PUT("/_raw/{kind}/name/{name}").
			To(apiHandler.handlePutResource))

	apiV1Ws.Route(
		apiV1Ws.GET("/rbac/role").
			To(apiHandler.handleGetRbacRoleList).
			Writes(rbacroles.RbacRoleList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/rbac/rolebinding").
			To(apiHandler.handleGetRbacRoleBindingList).
			Writes(rbacrolebindings.RbacRoleBindingList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/rbac/status").
			To(apiHandler.handleRbacStatus).
			Writes(validation.RbacStatus{}))

	apiV1Ws.Route(
		apiV1Ws.GET("/persistentvolume").
			To(apiHandler.handleGetPersistentVolumeList).
			Writes(persistentvolume.PersistentVolumeList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/persistentvolume/{persistentvolume}").
			To(apiHandler.handleGetPersistentVolumeDetail).
			Writes(persistentvolume.PersistentVolumeDetail{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/persistentvolume/namespace/{namespace}/name/{persistentvolume}").
			To(apiHandler.handleGetPersistentVolumeDetail).
			Writes(persistentvolume.PersistentVolumeDetail{}))

	apiV1Ws.Route(
		apiV1Ws.GET("/persistentvolumeclaim/").
			To(apiHandler.handleGetPersistentVolumeClaimList).
			Writes(persistentvolumeclaim.PersistentVolumeClaimList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/persistentvolumeclaim/{namespace}").
			To(apiHandler.handleGetPersistentVolumeClaimList).
			Writes(persistentvolumeclaim.PersistentVolumeClaimList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/persistentvolumeclaim/{namespace}/{name}").
			To(apiHandler.handleGetPersistentVolumeClaimDetail).
			Writes(persistentvolumeclaim.PersistentVolumeClaimDetail{}))

	apiV1Ws.Route(
		apiV1Ws.GET("/storageclass").
			To(apiHandler.handleGetStorageClassList).
			Writes(storageclass.StorageClassList{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/storageclass/{storageclass}").
			To(apiHandler.handleGetStorageClass).
			Writes(storageclass.StorageClass{}))

	apiV1Ws.Route(
		apiV1Ws.GET("/storageclass/{storageclass}/persistentvolume").
			To(apiHandler.handleGetStorageClassPersistentVolumes).
			Writes(persistentvolume.PersistentVolumeList{}))

	apiV1Ws.Route(
		apiV1Ws.GET("/search").
			To(apiHandler.handleSearch).
			Writes(search.SearchResult{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/search/{namespace}").
			To(apiHandler.handleSearch).
			Writes(search.SearchResult{}))

	apiV1Ws.Route(
		apiV1Ws.GET("/log/source/{namespace}/{resourceName}/{resourceType}").
			To(apiHandler.handleLogSource).
			Writes(controller.LogSources{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/log/{namespace}/{pod}").
			To(apiHandler.handleLogs).
			Writes(logs.LogDetails{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/log/{namespace}/{pod}/{container}").
			To(apiHandler.handleLogs).
			Writes(logs.LogDetails{}))

	apiV1Ws.Route(
		apiV1Ws.GET("/log/file/{namespace}/{pod}/{container}").
			To(apiHandler.handleLogFile).
			Writes(logs.LogDetails{}))

	apiV1Ws.Route(
		apiV1Ws.GET("/overview/").
			To(apiHandler.handleOverview).
			Writes(overview.Overview{}))

	apiV1Ws.Route(
		apiV1Ws.GET("/overview/{namespace}").
			To(apiHandler.handleOverview).
			Writes(overview.Overview{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/storage/info").
			To(apiHandler.handleGetStorageInfo))

	apiV1Ws.Route(
		apiV1Ws.GET("/userate").
			To(apiHandler.handleUseRate))

	apiV1Ws.Route(
		apiV1Ws.GET("/baseinfo").
			To(apiHandler.handleBaseInfo))
	apiV1Ws.Route(
		apiV1Ws.GET("/baseinfo/{node}").
			To(apiHandler.handleBaseInfoByNode))

	apiV1Ws.Route(
		apiV1Ws.POST("/user/login").
			To(apiHandler.handleUserLogin).
			Reads(user.LoginSpec{}))
	apiV1Ws.Route(
		apiV1Ws.POST("/user/create").
			To(apiHandler.handleCreateUser).
			Reads(user.UserSpec{}))
	apiV1Ws.Route(
		apiV1Ws.GET("/user").
			To(apiHandler.handleListUser).
			Writes(user.RespData{}))
	apiV1Ws.Route(
		apiV1Ws.PUT("/user/chgpwd").
			To(apiHandler.handleUserChgpwd).
			Reads(user.ChgPasswordSpec{}))
	apiV1Ws.Route(
		apiV1Ws.DELETE("/user/{userid}").
			To(apiHandler.handleDeleteUser))
	return wsContainer, nil
}

//storage_info
func (apiHandler *APIHandler) handleGetStorageInfo(request *restful.Request, response *restful.Response) {
	var storageInfo = &StorageInfo{}
	//storage_status
	storageStatus, err := storageStatus()
	if err != nil {
		storageInfo.StorageStatus = 0
	} else {
		storageInfo.StorageStatus = storageStatus
	}
	//storage_use_rate
	storageUseRate, err := storageUseRate()
	if err != nil {
		storageInfo.StorageUseRate = 0
	} else {
		storageInfo.StorageUseRate = storageUseRate
	}
	//storage_total
	storageTotal, err := storageTotal()
	if err != nil {
		storageInfo.StorageTotal = 0
	} else {
		storageInfo.StorageTotal = storageTotal
	}
	//storage_available
	storageAvailable, err := storageAvailable()
	if err != nil {
		storageInfo.StorageAvailable = 0
	} else {
		storageInfo.StorageAvailable = storageAvailable
	}
	//storage_used
	storageUsed, err := storageUsed()
	if err != nil {
		storageInfo.StorageUsed = 0
	} else {
		storageInfo.StorageUsed = storageUsed
	}

	//storage_read_bytes
	storageReaBytes, err := storageReadBytes()
	if err != nil {
		storageInfo.StorageUsed = 0
	} else {
		storageInfo.StorageReadBytes = storageReaBytes
	}

	//storage_read_ops
	storageReadOps, err := storageReadOps()
	if err != nil {
		storageInfo.StorageReadOps = 0
	} else {
		storageInfo.StorageReadOps = storageReadOps
	}

	//storage_write_bytes
	storageWriteBytes, err := storageWriteBytes()
	if err != nil {
		storageInfo.StorageWriteBytes = 0
	} else {
		storageInfo.StorageWriteBytes = storageWriteBytes
	}

	//storage_write_ops
	storageWriteOps, err := storageWriteOps()
	if err != nil {
		storageInfo.StorageWriteOps = 0
	} else {
		storageInfo.StorageWriteOps = storageWriteOps
	}

	response.WriteHeaderAndEntity(http.StatusOK, storageInfo)
}

//storage_status
func storageStatus() (interface{}, error) {
	var cephResp = &CephRespInt{}
	respData, err := http.Get("http://prometheus.monitoring:9090/api/v1/query?query=count(ceph_health_status)")
	if respData != nil {
		defer respData.Body.Close()
	}
	if err != nil {
		log.Print(err)
		return 0, err
	}
	respBytes, err := ioutil.ReadAll(respData.Body)
	if err != nil {
		log.Println(err)
		return 0, err
	}
	err = json.Unmarshal(respBytes, cephResp)
	if err != nil {
		log.Println("storageStatus Unmarshal", err, string(respBytes))
		return 0, err
	}
	if cephResp != nil && cephResp.Status == "success" && (len(cephResp.Data.Result) > 0) {
		return cephResp.Data.Result[0].Value[1], nil
	}else{
		log.Println("storageStatus fenxi rangeResp:",cephResp)
	}
	return 0, nil
}

//storage_use_rate
func storageUseRate() (interface{}, error) {
	var cephResp = &CephRespFloat{}
	respData, err := http.Get("http://prometheus.monitoring:9090/api/v1/query?query=ceph_cluster_available_bytes/ceph_cluster_capacity_bytes")
	if respData != nil {
		defer respData.Body.Close()
	}
	if err != nil {
		log.Print(err)
		return 0, err
	}
	respBytes, err := ioutil.ReadAll(respData.Body)
	if err != nil {
		log.Println(err)
		return 0, err
	}
	err = json.Unmarshal(respBytes, cephResp)
	if err != nil {
		log.Println("storageUseRate Unmarshal", err, string(respBytes))
		return 0, err
	}
	if cephResp != nil && cephResp.Status == "success" && (len(cephResp.Data.Result) > 0) {
		return cephResp.Data.Result[0].Value[1], nil
	}else{
		log.Println("storageUseRate fenxi rangeResp:",cephResp)
	}
	return 0, nil
}

//storage_total
func storageTotal() (interface{}, error) {
	var cephResp = &CephRespInt{}
	respData, err := http.Get("http://prometheus.monitoring:9090/api/v1/query?query=ceph_cluster_capacity_bytes")
	if respData != nil {
		defer respData.Body.Close()
	}
	if err != nil {
		log.Print(err)
		return 0, err
	}
	respBytes, err := ioutil.ReadAll(respData.Body)
	if err != nil {
		log.Println(err)
		return 0, err
	}
	err = json.Unmarshal(respBytes, cephResp)
	if err != nil {
		log.Println("storageTotal Unmarshal", err, string(respBytes))
		return 0, err
	}
	if cephResp != nil && cephResp.Status == "success" && (len(cephResp.Data.Result) > 0) {
		return cephResp.Data.Result[0].Value[1], nil
	}else{
		log.Println("storageTotal fenxi rangeResp:",cephResp)
	}
	return 0, nil
}

//storage_available
func storageAvailable() (interface{}, error) {
	var cephResp = &CephRespInt{}
	respData, err := http.Get("http://prometheus.monitoring:9090/api/v1/query?query=ceph_cluster_available_bytes")
	if respData != nil {
		defer respData.Body.Close()
	}
	if err != nil {
		log.Print(err)
		return 0, err
	}
	respBytes, err := ioutil.ReadAll(respData.Body)
	if err != nil {
		log.Println(err)
		return 0, err
	}
	err = json.Unmarshal(respBytes, cephResp)
	if err != nil {
		log.Println("storageAvailable Unmarshal", err, string(respBytes))
		return 0, err
	}
	if cephResp != nil && cephResp.Status == "success" && (len(cephResp.Data.Result) > 0) {
		return cephResp.Data.Result[0].Value[1], nil
	}else{
		log.Println("storageAvailable fenxi rangeResp:",cephResp)
	}
	return 0, nil
}

//storage_used
func storageUsed() (interface{}, error) {
	var cephResp = &CephRespInt{}
	respData, err := http.Get("http://prometheus.monitoring:9090/api/v1/query?query=ceph_cluster_used_bytes")
	if respData != nil {
		defer respData.Body.Close()
	}
	if err != nil {
		log.Print(err)
		return 0, err
	}
	respBytes, err := ioutil.ReadAll(respData.Body)
	if err != nil {
		log.Println(err)
		return 0, err
	}
	err = json.Unmarshal(respBytes, cephResp)
	if err != nil {
		log.Println("storageUsed Unmarshal", err, string(respBytes))
		return 0, err
	}
	if cephResp != nil && cephResp.Status == "success" && (len(cephResp.Data.Result) > 0) {
		return cephResp.Data.Result[0].Value[1], nil
	}else{
		log.Println("storageUsed fenxi rangeResp:",cephResp)
	}
	return 0, nil
}

//storage_read_bytes
func storageReadBytes() (interface{}, error) {
	var cephResp = &CephRespInt{}
	respData, err := http.Get("http://prometheus.monitoring:9090/api/v1/query?query=ceph_client_io_read_bytes")
	if respData != nil {
		defer respData.Body.Close()
	}
	if err != nil {
		log.Print(err)
		return 0, err
	}
	respBytes, err := ioutil.ReadAll(respData.Body)
	if err != nil {
		log.Println(err)
		return 0, err
	}
	err = json.Unmarshal(respBytes, cephResp)
	if err != nil {
		log.Println("storageReadBytes Unmarshal", err, string(respBytes))
		return 0, err
	}
	if cephResp != nil && cephResp.Status == "success" && (len(cephResp.Data.Result) > 0) {
		return cephResp.Data.Result[0].Value[1], nil
	}else{
		log.Println("storageReadBytes fenxi rangeResp:",cephResp)
	}
	return 0, nil
}

//storage_read_ops
func storageReadOps() (interface{}, error) {
	var cephResp = &CephRespInt{}
	respData, err := http.Get("http://prometheus.monitoring:9090/api/v1/query?query=ceph_client_io_read_ops")
	if respData != nil {
		defer respData.Body.Close()
	}
	if err != nil {
		log.Print(err)
		return 0, err
	}
	respBytes, err := ioutil.ReadAll(respData.Body)
	if err != nil {
		log.Println(err)
		return 0, err
	}
	err = json.Unmarshal(respBytes, cephResp)
	if err != nil {
		log.Println("storageReadOps Unmarshal", err, string(respBytes))
		return 0, err
	}
	if cephResp != nil && cephResp.Status == "success" && (len(cephResp.Data.Result) > 0) {
		return cephResp.Data.Result[0].Value[1], nil
	}else{
		log.Println("storageReadOps fenxi rangeResp:",cephResp)
	}
	return 0, nil
}

//storage_write_bytes
func storageWriteBytes() (interface{}, error) {
	var cephResp = &CephRespInt{}
	respData, err := http.Get("http://prometheus.monitoring:9090/api/v1/query?query=ceph_client_io_write_bytes")
	if respData != nil {
		defer respData.Body.Close()
	}
	if err != nil {
		log.Print(err)
		return 0, err
	}
	respBytes, err := ioutil.ReadAll(respData.Body)
	if err != nil {
		log.Println(err)
		return 0, err
	}
	err = json.Unmarshal(respBytes, cephResp)
	if err != nil {
		log.Println("storageWriteBytes Unmarshal", err, string(respBytes))
		return 0, err
	}
	if cephResp != nil && cephResp.Status == "success" && (len(cephResp.Data.Result) > 0) {
		return cephResp.Data.Result[0].Value[1], nil
	}else{
		log.Println("storageWriteBytes fenxi rangeResp:",cephResp)
	}
	return 0, nil
}

//storage_write_ops
func storageWriteOps() (interface{}, error) {
	var cephResp = &CephRespInt{}
	respData, err := http.Get("http://prometheus.monitoring:9090/api/v1/query?query=ceph_client_io_write_ops")
	if respData != nil {
		defer respData.Body.Close()
	}
	if err != nil {
		log.Print(err)
		return 0, err
	}
	respBytes, err := ioutil.ReadAll(respData.Body)
	if err != nil {
		log.Println(err)
		return 0, err
	}
	err = json.Unmarshal(respBytes, cephResp)
	if err != nil {
		log.Println("storageWriteOps Unmarshal", err, string(respBytes))
		return 0, err
	}
	if cephResp != nil && cephResp.Status == "success" && (len(cephResp.Data.Result) > 0) {
		return cephResp.Data.Result[0].Value[1], nil
	}else{
		log.Println("storageWriteOps fenxi rangeResp:",cephResp)
	}
	return 0, nil
}

//cpu_userate&memory_userate
func (apiHandler *APIHandler) handleUseRate(equest *restful.Request, response *restful.Response) {
	var useRateInfo = &UseRateInfo{}
	//cpu
	cpuUseRate, err := cpuUseRate()
	if err != nil {
		useRateInfo.CpuUseRate = 0
	} else {
		useRateInfo.CpuUseRate = cpuUseRate
	}
	//memory
	memoryUserate, err := memoryUseRate()
	if err != nil {
		useRateInfo.MemoryUseRate = 0
	} else {
		useRateInfo.MemoryUseRate = memoryUserate
	}
	response.WriteHeaderAndEntity(http.StatusOK, useRateInfo)

}

//cpu_use_rate
func cpuUseRate() (interface{}, error) {
	var cephResp = &CephRespFloat{}
	respData, err := http.Get(`http://prometheus.monitoring:9090/api/v1/query?query=sum(irate(smart_cpu_seconds_total{mode!="idle"}[1m]))/sum(irate(smart_cpu_seconds_total[1m]))`)
	if respData != nil {
		defer respData.Body.Close()
	}
	if err != nil {
		log.Print(err)
		return 0, err
	}
	respBytes, err := ioutil.ReadAll(respData.Body)
	if err != nil {
		log.Println(err)
		return 0, err
	}
	err = json.Unmarshal(respBytes, cephResp)
	if err != nil {
		log.Println("cpuUseRate Unmarshal", err)
		return 0, err
	}
	if cephResp != nil && cephResp.Status == "success" && (len(cephResp.Data.Result) > 0){
		return cephResp.Data.Result[0].Value[1], nil
	}else{
		log.Println("cpuUseRate fenxi rangeResp:",cephResp)
	}
	return 0, nil
}

//memory_userate
func memoryUseRate() (interface{}, error) {
	var cephResp = &CephRespFloat{}
	respData, err := http.Get(`http://prometheus.monitoring:9090/api/v1/query?query=sum(smart_memory_MemFree_bytes)/sum(smart_memory_MemTotal_bytes)`)
	if respData != nil {
		defer respData.Body.Close()
	}
	if err != nil {
		log.Print(err)
		return 0, err
	}
	respBytes, err := ioutil.ReadAll(respData.Body)
	if err != nil {
		log.Println(err)
		return 0, err
	}
	err = json.Unmarshal(respBytes, cephResp)
	if err != nil {
		log.Println("memoryUseRate Unmarshal", err)
		return 0, err
	}
	if cephResp != nil && cephResp.Status == "success" && (len(cephResp.Data.Result) > 0){
		return cephResp.Data.Result[0].Value[1], nil
	}else{
		log.Println("memoryUseRate fenxi rangeResp:",cephResp)
	}
	return 0, nil
}

//全局缓存baseinfo数据
func GetBaseInfo() {
	start := time.Now()
	//获取时间戳
	t1 := time.Now().Add(-30 * time.Minute).Unix()
	t2 := time.Now().Unix()
	//cpu_info
	var ch =  make([] chan []ResultData,3)
	for i:=0; i<3; i++ {
        ch[i] = make(chan []ResultData)
    }
	go cpuInfo(t1, t2, ch[0])
	//memory_info
	go memoryInfo(t1, t2, ch[1])

	//网卡网速信息
	go networkInfo(t1, t2, ch[2])
	// err, qianStr, wanStr := netName()
	// if err != nil {
	// 	baseInfo.Net1000 = nil
	// 	baseInfo.Net10000 = nil
	// 	log.Println("get net name error : ", err)
	// }else{
	// 	//千兆网卡信息
	// 	go networkInfo(t1, t2, qianStr, ch[2])
	// 	//万兆网卡
	// 	go networkInfo(t1, t2, wanStr, ch[3])
	// }

	//cpu信息
	tmp := <-ch[0]
	if tmp == nil {
		baseInfo.Cpu = nil
	} else {
		baseInfo.Cpu = tmp
	}

	//内存信息
	tmp = <-ch[1]
	if tmp == nil {
		baseInfo.Memory = nil
	} else {
		baseInfo.Memory = tmp
	}

	//千兆网卡
	tmp = <-ch[2]
	baseInfo.Net1000 = nil
	baseInfo.Net10000 = nil
	for i,_ := range tmp{
		switch tmp[i].Metric.Speed{
		case "1000": baseInfo.Net1000 = append(baseInfo.Net1000,tmp[i])
		case "10000": baseInfo.Net10000 = append(baseInfo.Net10000,tmp[i])
		}
	}
	cost := time.Since(start)
	log.Println("handleBaseInfo spend: ",cost)
}

//base Info
func (apiHandler *APIHandler) handleBaseInfo(request *restful.Request, response *restful.Response) {
	// start := time.Now()
	// var baseInfo = &BaseInfo{}
	// //获取时间戳
	// t1 := time.Now().Add(-30 * time.Minute).Unix()
	// t2 := time.Now().Unix()
	// //cpu_info
	// var ch =  make([] chan []ResultData,3)
	// for i:=0; i<3; i++ {
    //     ch[i] = make(chan []ResultData)
    // }
	// go cpuInfo(t1, t2, ch[0])
	// //memory_info
	// go memoryInfo(t1, t2, ch[1])

	// //网卡网速信息
	// go networkInfo(t1, t2, ch[2])
	// // err, qianStr, wanStr := netName()
	// // if err != nil {
	// // 	baseInfo.Net1000 = nil
	// // 	baseInfo.Net10000 = nil
	// // 	log.Println("get net name error : ", err)
	// // }else{
	// // 	//千兆网卡信息
	// // 	go networkInfo(t1, t2, qianStr, ch[2])
	// // 	//万兆网卡
	// // 	go networkInfo(t1, t2, wanStr, ch[3])
	// // }

	// //cpu信息
	// tmp := <-ch[0]
	// if tmp == nil {
	// 	baseInfo.Cpu = nil
	// } else {
	// 	baseInfo.Cpu = tmp
	// }

	// //内存信息
	// tmp = <-ch[1]
	// if tmp == nil {
	// 	baseInfo.Memory = nil
	// } else {
	// 	baseInfo.Memory = tmp
	// }

	// //千兆网卡
	// tmp = <-ch[2]
	// if tmp == nil {
	// 	baseInfo.Net1000 = nil
	// 	baseInfo.Net10000 = nil
	// }else{
	// 	for i,_ := range tmp{
	// 		switch tmp[i].Metric.Speed{
	// 		case "1000": baseInfo.Net1000 = append(baseInfo.Net1000,tmp[i])
	// 		case "10000": baseInfo.Net10000 = append(baseInfo.Net10000,tmp[i])
	// 		}
	// 	}
	// }
	// cost := time.Since(start)
	// log.Println("handleBaseInfo spend: ",cost)
	response.WriteHeaderAndEntity(http.StatusOK, baseInfo)
	log.Println("handleBaseInfo: ", baseInfo)
}

//cpu_info
func cpuInfo(t1 int64, t2 int64, ch chan []ResultData) ([]ResultData, error) {
	start := time.Now()
	defer func(){
		cost := time.Since(start)
		log.Println("cpuInfo spend: ",cost)
	}()
	var rangeResp = &RangeResp{}
	var cpuUrl = "http://prometheus.monitoring:9090/api/v1/query_range?query=sum(irate(smart_cpu_seconds_total{mode!=" + `"idle"` + "}[30s]))by(instance)/sum(irate(smart_cpu_seconds_total[30s]))by(instance)&start=" + strconv.FormatInt(t1, 10) + "&end=" + strconv.FormatInt(t2, 10) + "&step=60"
	log.Println("cpuUrl ", cpuUrl)
	// log.Println(cpuUrl)
	respData, err := http.Get(cpuUrl)
	if respData != nil {
		defer respData.Body.Close()
	}
	if err != nil {
		log.Print(err)
		ch <- nil
		return nil, err
	}
	respBytes, err := ioutil.ReadAll(respData.Body)
	if err != nil {
		log.Println(err)
		ch <- nil
		return nil, err
	}
	err = json.Unmarshal(respBytes, rangeResp)
	if err != nil {
		log.Println("cpuInfo Unmarshal", err)
		ch <- nil
		return nil, err
	}
	if rangeResp != nil && rangeResp.Status == "success" && (len(rangeResp.Data.Result) > 0){
		ch <- rangeResp.Data.Result
		return rangeResp.Data.Result, nil
	}else{
		log.Println("cpuInfo fenxi rangeResp:",rangeResp)
	}
	ch <- nil
	return nil, nil
}

//memory_info
func memoryInfo(t1 int64, t2 int64, ch chan []ResultData) ([]ResultData, error) {
	start := time.Now()
	defer func(){
		cost := time.Since(start)
		log.Println("memoryInfo spend: ",cost)
	}()
	var rangeResp = &RangeResp{}
	respData, err := http.Get("http://prometheus.monitoring:9090/api/v1/query_range?query=(smart_memory_MemTotal_bytes-smart_memory_MemFree_bytes-smart_memory_Buffers_bytes-smart_memory_Cached_bytes)/smart_memory_MemTotal_bytes*100&start=" + strconv.FormatInt(t1, 10) + "&end=" + strconv.FormatInt(t2, 10) + "&step=60")
	if respData != nil {
		defer respData.Body.Close()
	}
	if err != nil {
		log.Print(err)
		ch <- nil
		return nil, err
	}
	respBytes, err := ioutil.ReadAll(respData.Body)
	if err != nil {
		log.Println(err)
		ch <- nil
		return nil, err
	}
	err = json.Unmarshal(respBytes, rangeResp)
	if err != nil {
		log.Println("memoryInfo Unmarshal", err)
		ch <- nil
		return nil, err
	}
	if rangeResp != nil && rangeResp.Status == "success" && (len(rangeResp.Data.Result) > 0) {
		//log.Println(string(respBytes))
		ch <- rangeResp.Data.Result
		return rangeResp.Data.Result, nil
	}else{
		log.Println("memoryinfo fenxi rangeResp:",rangeResp)
	}
	ch <- nil
	return nil, nil
}

//net name
func netName() (error, string, string){
	start := time.Now()
	defer func(){
		cost := time.Since(start)
		log.Println("netName spend: ",cost)
	}()
	qianNet := ""
	wanNet := ""
	nics, err := ghw.Network()
	if err != nil {
		return err, "", ""
	}
	for _ , net := range nics.NICs{
		if net.Speed == "10000" {
			if wanNet ==""{
				wanNet = wanNet + net.Name
			}else{
				wanNet = wanNet + "|" + net.Name
			}
		}else{
			if qianNet ==""{
				qianNet = qianNet + net.Name
			}else{
				qianNet = qianNet + "|" + net.Name
			}
		}
	}
	return nil, qianNet, wanNet
}

//networ_info
func networkInfo(t1 int64, t2 int64, ch chan []ResultData) ([]ResultData, error) {
	var rangeResp = &RangeResp{}
	respData, err := http.Get("http://prometheus.monitoring:9090/api/v1/query_range?query=sum(irate(smart_network_receive_bytes_total{isVirtual='false',speed=~'1000|10000'}[1m]))by(instance,isVirtual,speed)&start=" + strconv.FormatInt(t1, 10) + "&end=" + strconv.FormatInt(t2, 10) + "&step=60")
	// respData, err := http.Get("http://prometheus.monitoring:9090/api/v1/query_range?query=sum(smart_network_receive_bytes_total{device=~"+ `"` + netType + `"` + "}+smart_network_transmit_bytes_total{device=~"+ `"` + netType + `"` + "})by(instance)&start=" + strconv.FormatInt(t1, 10) + "&end=" + strconv.FormatInt(t2, 10) + "&step=60")
	// log.Println("http://prometheus.monitoring:9090/api/v1/query_range?query=sum(smart_network_receive_bytes_total{device=~"+ `"` + netType + `"` + "}+smart_network_transmit_bytes_total{device=~"+ `"` + netType + `"` + "})by(instance)&start=" + strconv.FormatInt(t1, 10) + "&end=" + strconv.FormatInt(t2, 10) + "&step=60")
	if respData != nil {
		defer respData.Body.Close()
	}
	if err != nil {
		log.Print(err)
		ch <- nil
		return nil, err
	}
	respBytes, err := ioutil.ReadAll(respData.Body)
	if err != nil {
		log.Println(err)
		ch <- nil
		return nil, err
	}
	// log.Println(string(respBytes))
	err = json.Unmarshal(respBytes, rangeResp)
	if err != nil {
		log.Println("networkInfo Unmarshal", err)
		ch <- nil
		return nil, err
	}
	log.Println(rangeResp.Status)
	if rangeResp != nil && rangeResp.Status == "success" && (len(rangeResp.Data.Result) > 0) {
		ch <- rangeResp.Data.Result
		return rangeResp.Data.Result, nil
	}else{
	log.Println("networkInfo fenxi rangeResp:",rangeResp)
	}
	ch <- nil
	return nil, nil
}

//networ_info
func networkInfoByNode(t1 int64, t2 int64, url string, node string, ch chan []ResultData) ([]ResultData, error) {
	start := time.Now()
	defer func(){
		cost := time.Since(start)
		log.Println("networkInfoByNode spend: ",cost)
	}()
	var rangeResp = &RangeResp{}
	respData, err := http.Get(url)
	if respData != nil {
		defer respData.Body.Close()
	}
	if err != nil {
		log.Print(err)
		ch <- nil
		return nil, err
	}
	respBytes, err := ioutil.ReadAll(respData.Body)
	if err != nil {
		log.Println(err)
		ch <- nil
		return nil, err
	}
	err = json.Unmarshal(respBytes, rangeResp)
	if err != nil {
		log.Println(err)
		ch <- nil
		return nil, err
	}
	log.Println(string(respBytes))
	if rangeResp != nil && rangeResp.Status == "success" && (len(rangeResp.Data.Result) > 0) {
		ch <- rangeResp.Data.Result
		return rangeResp.Data.Result, nil
	}else{
		log.Println("networkInfo fenxi rangeResp:",rangeResp)
	}
	ch <- nil
	return nil, nil
}

//缓存node详细信息  CPU 内存 网卡  硬盘
func GetBaseInfoAllNode(){
	t1 := time.Now().Add(-30 * time.Minute).Unix()
	t2 := time.Now().Unix()
	// node := request.PathParameter("node")
	var ch =  make([] chan []ResultData,2)
	for i:=0; i<2; i++ {
        ch[i] = make(chan []ResultData)
    }

	//network-info 

	//network info 千万兆网卡接收
	url := "http://prometheus.monitoring:9090/api/v1/query_range?query=sum(irate(smart_network_receive_bytes_total{isVirtual='false',speed=~'1000|10000'}[1m]))by(instance,speed)&start=" + strconv.FormatInt(t1, 10) + "&end=" + strconv.FormatInt(t2, 10) + "&step=60"
	go networkInfoByNode(t1, t2, url, "node", ch[0])
	//network info 千万兆网卡发送
	url = "http://prometheus.monitoring:9090/api/v1/query_range?query=sum(irate(smart_network_transmit_bytes_total{isVirtual='false',speed=~'1000|10000'}[1m]))by(instance,speed)&start=" + strconv.FormatInt(t1, 10) + "&end=" + strconv.FormatInt(t2, 10) + "&step=60"
	go networkInfoByNode(t1, t2, url, "node", ch[1])

	//get 千兆接收
	tmp := <-ch[0] 
	if tmp == nil {
		baseInfo.Rx1000 = nil
		baseInfo.Rx10000 = nil
		// log.Println("Rx1000", err)
	}else{
		baseInfo.Rx1000 = nil
		baseInfo.Rx10000 = nil
		for i,_ := range tmp{
			switch tmp[i].Metric.Speed{
			case "1000": baseInfo.Rx1000 = append(baseInfo.Rx1000,tmp[i])
			case "10000": baseInfo.Rx10000 = append(baseInfo.Rx10000,tmp[i])
			}
		}
	}
	//get 万兆接收
	tmp = <-ch[1] 
	if tmp == nil {
		baseInfo.Tx1000 = nil
		baseInfo.Tx10000 = nil
		// log.Println("Rx10000", err)
	}else{
		baseInfo.Tx1000 = nil
		baseInfo.Tx10000 = nil
		for i,_ := range tmp{
			switch tmp[i].Metric.Speed{
			case "1000": baseInfo.Tx1000 = append(baseInfo.Tx1000,tmp[i])
			case "10000": baseInfo.Tx10000 = append(baseInfo.Tx10000,tmp[i])
			}
		}
	}
}

//从缓存数据获取相应机器数据
func getBaseInfoByNode(arr []ResultData, node string ) ([]ResultData){
	a := make([]ResultData, 0)
	if arr != nil{
		for i,_ := range arr{
			if arr[i].Metric.Instance == node{
				a = append(a,arr[i])
			}
		}
	}else{
		return  nil
	}
	return a
}

//base Info
func (apiHandler *APIHandler) handleBaseInfoByNode(request *restful.Request, response *restful.Response) {
	start := time.Now()
	var nodeInfo = &NodeInfo{}
	//cpu_info
	// t1 := time.Now().Add(-30 * time.Minute).Unix()
	// t2 := time.Now().Unix()
	node := request.PathParameter("node")
	var ch =  make([] chan []ResultData,10)
	for i:=0; i<10; i++ {
        ch[i] = make(chan []ResultData)
    }
	//cpu info
	nodeInfo.BaseInfo.Cpu = getBaseInfoByNode(baseInfo.Cpu,node)
	// go cpuInfoByNode(t1, t2, node,ch[0])
	//memory info
	nodeInfo.BaseInfo.Memory = getBaseInfoByNode(baseInfo.Memory,node)
	// go memoryInfoByNode(t1, t2, node,ch[1])
	// cpuResult, err := cpuInfoByNode(t1, t2, node)

	//network-info 

	// //network info 千万兆网卡接收
	// url := "http://prometheus.monitoring:9090/api/v1/query_range?query=sum(irate(smart_network_receive_bytes_total{isVirtual='false',speed=~'1000|10000',instance=" + `"` + node + `"` + "}[1m]))by(instance,speed)&start=" + strconv.FormatInt(t1, 10) + "&end=" + strconv.FormatInt(t2, 10) + "&step=60"
	// go networkInfoByNode(t1, t2, url, node, ch[2])
	// //network info 千万兆网卡发送
	// url = "http://prometheus.monitoring:9090/api/v1/query_range?query=sum(irate(smart_network_transmit_bytes_total{isVirtual='false',speed=~'1000|10000',instance=" + `"` + node + `"` + "}[1m]))by(instance,speed)&start=" + strconv.FormatInt(t1, 10) + "&end=" + strconv.FormatInt(t2, 10) + "&step=60"
	// go networkInfoByNode(t1, t2, url, node, ch[3])

	//node cpu info 
	url := "http://prometheus.monitoring:9090/api/v1/query?query=smart_info_cpu_info{instance=" + `"` + node + `"` +"}"
	go nodeInfos(url,ch[4])

	//node memory info 
	url = "http://prometheus.monitoring:9090/api/v1/query?query=smart_info_memory_info{instance=" + `"` + node + `"` +"}"
	go nodeInfos(url,ch[5])

	//node disk info 
	url = "http://prometheus.monitoring:9090/api/v1/query?query=smart_info_disk_info{instance=" + `"` + node + `"` +"}"
	go nodeInfos(url,ch[6])

	//node net info 
	url = "http://prometheus.monitoring:9090/api/v1/query?query=smart_info_network_info{instance=" + `"` + node + `"` +"}"
	go nodeInfos(url,ch[7])

	// //get cpu info
	// tmp := <-ch[0] 
	// if tmp == nil {
	// 	nodeInfo.BaseInfo.Cpu = nil
	// } else {
	// 	nodeInfo.BaseInfo.Cpu = tmp
	// }

	// //get memory_info
	// tmp = <-ch[1] 
	// if tmp == nil {
	// 	nodeInfo.BaseInfo.Memory = nil
	// } else {
	// 	nodeInfo.BaseInfo.Memory = tmp
	// }

	//get 千兆接收
	nodeInfo.BaseInfo.Rx1000 = getBaseInfoByNode(baseInfo.Rx1000,node)
	nodeInfo.BaseInfo.Rx10000 = getBaseInfoByNode(baseInfo.Rx10000,node)
	nodeInfo.BaseInfo.Tx1000 = getBaseInfoByNode(baseInfo.Tx1000,node)
	nodeInfo.BaseInfo.Tx10000 = getBaseInfoByNode(baseInfo.Tx10000,node)
	// nodeInfo.BaseInfo = baseInfo
	// tmp = <-ch[2] 
	// if tmp == nil {
	// 	nodeInfo.BaseInfo.Rx1000 = nil
	// 	nodeInfo.BaseInfo.Rx10000 = nil
	// 	// log.Println("Rx1000", err)
	// }else{
	// 	for i,_ := range tmp{
	// 		switch tmp[i].Metric.Speed{
	// 		case "1000": nodeInfo.BaseInfo.Rx1000 = append(nodeInfo.BaseInfo.Rx1000,tmp[i])
	// 		case "10000": nodeInfo.BaseInfo.Rx10000 = append(nodeInfo.BaseInfo.Rx10000,tmp[i])
	// 		}
	// 	}
	// }
	// //get 万兆接收
	// tmp = <-ch[3] 
	// if tmp == nil {
	// 	nodeInfo.BaseInfo.Tx1000 = nil
	// 	nodeInfo.BaseInfo.Tx10000 = tmp
	// 	// log.Println("Rx10000", err)
	// }else{
	// 	for i,_ := range tmp{
	// 		switch tmp[i].Metric.Speed{
	// 		case "1000": nodeInfo.BaseInfo.Tx1000 = append(nodeInfo.BaseInfo.Tx1000,tmp[i])
	// 		case "10000": nodeInfo.BaseInfo.Tx10000 = append(nodeInfo.BaseInfo.Tx10000,tmp[i])
	// 		}
	// 	}
	// }

	//CPU信息
	tmp := <-ch[4]
	if tmp == nil {
		nodeInfo.CPU.Feature = ""
		nodeInfo.CPU.Model = ""
		nodeInfo.CPU.NumCores = ""
	}else{
		if len(tmp) == 0{
			nodeInfo.CPU.Feature = ""
			nodeInfo.CPU.Model = ""
			nodeInfo.CPU.NumCores = ""
		}else{
			nodeInfo.CPU.Feature = (tmp)[0].Metric.Feature
			nodeInfo.CPU.Model = (tmp)[0].Metric.Model
			nodeInfo.CPU.NumCores = (tmp)[0].Metric.NumCores
		}
	}

	//内存信息
	tmp = <-ch[5]
	if tmp == nil {
		nodeInfo.Memory.SupportedPageSizes = ""
		nodeInfo.Memory.TotalPhysicalBytes = ""
		nodeInfo.Memory.TotalUsableBytes = ""
	}else{
		if len(tmp) == 0 {
			nodeInfo.Memory.SupportedPageSizes = ""
			nodeInfo.Memory.TotalPhysicalBytes = ""
			nodeInfo.Memory.TotalUsableBytes = ""
		}else{
			nodeInfo.Memory.SupportedPageSizes = (tmp)[0].Metric.SupportedPageSizes
			nodeInfo.Memory.TotalPhysicalBytes = (tmp)[0].Metric.TotalPhysicalBytes
			nodeInfo.Memory.TotalUsableBytes = (tmp)[0].Metric.TotalUsableBytes
		}
	}

	//硬盘信息
	tmp = <-ch[6]
	if tmp == nil {
		nodeInfo.Disk = nil
	}else{
		if len(tmp) == 0 {
			nodeInfo.Disk = nil
		}else{
			d := make([]DiskInfo,len(tmp),len(tmp))
			for i, disk := range tmp {
				d[i].BusType = disk.Metric.BusType
				d[i].Good = disk.Metric.Good
				d[i].SectorSizeBytes = disk.Metric.SectorSizeBytes
				d[i].SerialNumber = disk.Metric.SerialNumber
				d[i].SizeBytes = disk.Metric.SizeBytes
				d[i].Type = disk.Metric.Type
				d[i].Vendor = disk.Metric.Vendor
				d[i].Name = disk.Metric.DiskName
			}
			nodeInfo.Disk = d
		}
	}

	//网卡信息
	tmp = <-ch[7]
	if tmp == nil {
		nodeInfo.Net = nil
	}else{
		if len(tmp) == 0 {
			nodeInfo.Net = nil
		}else{
			d := make([]NetInfo,len(tmp),len(tmp))
			for i, _ := range tmp {
				d[i].Driver = (tmp)[i].Metric.Driver
				d[i].MacAddress = (tmp)[i].Metric.MacAddress
				d[i].Model = (tmp)[i].Metric.Model
				d[i].Name = (tmp)[i].Metric.NetName
			}
			nodeInfo.Net = d
		}
	}
	cost := time.Since(start)
	log.Println("handleBaseInfoByNode spend: ",cost)
	//	namespace := request.PathParameter("namespace")
	response.WriteHeaderAndEntity(http.StatusOK, nodeInfo)
}

//node info 
func nodeInfos (str string, ch chan []ResultData) ([]ResultData, error) {
	start := time.Now()
	defer func(str string){
		cost := time.Since(start)
		log.Println(str)
		log.Println("nodeInfos spend: ",cost)
	}(str)
	var rangeResp = &RangeResp{}
	respData, err := http.Get(str)
	if respData != nil {
		defer respData.Body.Close()
	}
	if err != nil {
		log.Print(err)
		ch <- nil
		return nil, err
	}
	respBytes, err := ioutil.ReadAll(respData.Body)
	// log.Println("cpubynode:", string(respBytes))
	if err != nil {
		log.Println(err)
		ch <- nil
		return nil, err
	}
	err = json.Unmarshal(respBytes, rangeResp)
	if err != nil {
		log.Println(err)
		ch <- nil
		return nil, err
	}
	if rangeResp != nil && rangeResp.Status == "success" && (len(rangeResp.Data.Result) > 0){
		ch <- rangeResp.Data.Result
		return rangeResp.Data.Result, nil
	}else{
		log.Println("nodeInfos fenxi rangeResp:",rangeResp)
	}
	ch <- nil
	return nil, nil
}

//cpu_info_by_node
func cpuInfoByNode(t1 int64, t2 int64, node string, ch chan []ResultData) ([]ResultData, error) {
	start := time.Now()
	defer func(){
		cost := time.Since(start)
		log.Println()
		log.Println("cpuInfoByNode spend: ",cost)
	}()
	var rangeResp = &RangeResp{}
	var cpuUrl = "http://prometheus.monitoring:9090/api/v1/query_range?query=sum(irate(smart_cpu_seconds_total{mode!=" + `"idle"` + ",instance=" + `"` + node + `"` + "}[30s]))by(instance)/sum(irate(smart_cpu_seconds_total{instance="+`"`+ node +`"`+"}[30s]))by(instance)&start=" + strconv.FormatInt(t1, 10) + "&end=" + strconv.FormatInt(t2, 10) + "&step=60"
	log.Println("cpuInfoByNode",cpuUrl)
	respData, err := http.Get(cpuUrl)
	if respData != nil {
		defer respData.Body.Close()
	}
	if err != nil {
		log.Print(err)
		ch <- nil
		return nil, err
	}
	respBytes, err := ioutil.ReadAll(respData.Body)
	// log.Println("cpubynode:", string(respBytes))
	if err != nil {
		log.Println(err)
		ch <- nil
		return nil, err
	}
	err = json.Unmarshal(respBytes, rangeResp)
	if err != nil {
		log.Println(err)
		ch <- nil
		return nil, err
	}
	if rangeResp != nil && rangeResp.Status == "success" && (len(rangeResp.Data.Result) > 0){
		ch <- rangeResp.Data.Result
		return rangeResp.Data.Result, nil
	}else{
		log.Println("cpuInfoByNode fenxi rangeResp:",rangeResp)
	}
	ch <- nil
	return nil, nil
}

//memory_info_by_node
func memoryInfoByNode(t1 int64, t2 int64, node string, ch chan []ResultData) ([]ResultData, error) {
	start := time.Now()
	defer func(){
		cost := time.Since(start)
		log.Println("memoryInfoByNode spend: ",cost)
	}()
	var rangeResp = &RangeResp{}
	var memoryUrl = "http://prometheus.monitoring:9090/api/v1/query_range?query=(smart_memory_MemTotal_bytes{instance=" + `"` + node + `"` + "}-(smart_memory_MemFree_bytes{instance=" + `"` + node + `"` + "}+smart_memory_Buffers_bytes{instance=" + `"` + node + `"` + "}+smart_memory_Cached_bytes{instance=" + `"` + node + `"` + "}))/smart_memory_MemTotal_bytes{instance=" + `"` + node + `"` + "}*100&start=" + strconv.FormatInt(t1, 10) + "&end=" + strconv.FormatInt(t2, 10) + "&step=60"
	log.Println(memoryUrl)
	respData, err := http.Get(memoryUrl)
	if respData != nil {
		defer respData.Body.Close()
	}
	if err != nil {
		log.Print(err)
		ch <- nil
		return nil, err
	}
	respBytes, err := ioutil.ReadAll(respData.Body)
	// log.Println("memorybynode:", string(respBytes))
	if err != nil {
		log.Println(err)
		ch <- nil
		return nil, err
	}
	err = json.Unmarshal(respBytes, rangeResp)
	if err != nil {
		log.Println(err)
		ch <- nil
		return nil, err
	}
	if rangeResp != nil && rangeResp.Status == "success" && (len(rangeResp.Data.Result) > 0){
		ch <- rangeResp.Data.Result
		return rangeResp.Data.Result, nil
	}else{
		log.Println("memoryInfoByNode fenxi rangeResp:",rangeResp)
	}
	ch <- nil
	return nil, nil
}

// TODO: Handle case in which RBAC feature is not enabled in API server. Currently returns 404 resource not found
func (apiHandler *APIHandler) handleGetRbacRoleList(request *restful.Request, response *restful.Response) {
	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	dataSelect := parseDataSelectPathParameter(request)
	result, err := rbacroles.GetRbacRoleList(k8sClient, dataSelect)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusOK, result)
}

// TODO: Handle case in which RBAC feature is not enabled in API server. Currently returns 404 resource not found
func (apiHandler *APIHandler) handleGetRbacRoleBindingList(request *restful.Request, response *restful.Response) {
	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	dataSelect := parseDataSelectPathParameter(request)
	result, err := rbacrolebindings.GetRbacRoleBindingList(k8sClient, dataSelect)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusOK, result)
}

func (apiHandler *APIHandler) handleRbacStatus(request *restful.Request, response *restful.Response) {
	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	result, err := validation.ValidateRbacStatus(k8sClient)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusOK, result)
}

func (apiHandler *APIHandler) handleGetCsrfToken(request *restful.Request, response *restful.Response) {
	action := request.PathParameter("action")
	token := xsrftoken.Generate(apiHandler.cManager.CSRFKey(), "none", action)
	response.WriteHeaderAndEntity(http.StatusOK, api.CsrfToken{Token: token})
}

func (apiHandler *APIHandler) handleGetStatefulSetList(request *restful.Request, response *restful.Response) {
	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	namespace := parseNamespacePathParameter(request)
	dataSelect := parseDataSelectPathParameter(request)
	dataSelect.MetricQuery = dataselect.StandardMetrics
	result, err := statefulset.GetStatefulSetList(k8sClient, namespace, dataSelect,
		apiHandler.iManager.Metric().Client())
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusOK, result)
}

func (apiHandler *APIHandler) handleGetStatefulSetDetail(request *restful.Request, response *restful.Response) {
	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	namespace := request.PathParameter("namespace")
	name := request.PathParameter("statefulset")
	result, err := statefulset.GetStatefulSetDetail(k8sClient, apiHandler.iManager.Metric().Client(), namespace, name)

	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusOK, result)
}

func (apiHandler *APIHandler) handleGetStatefulSetPods(request *restful.Request, response *restful.Response) {
	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	namespace := request.PathParameter("namespace")
	name := request.PathParameter("statefulset")
	dataSelect := parseDataSelectPathParameter(request)
	dataSelect.MetricQuery = dataselect.StandardMetrics
	result, err := statefulset.GetStatefulSetPods(k8sClient, apiHandler.iManager.Metric().Client(), dataSelect, name, namespace)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusOK, result)
}

func (apiHandler *APIHandler) handleGetStatefulSetEvents(request *restful.Request, response *restful.Response) {
	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	namespace := request.PathParameter("namespace")
	name := request.PathParameter("statefulset")
	dataSelect := parseDataSelectPathParameter(request)
	result, err := event.GetResourceEvents(k8sClient, dataSelect, namespace, name)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusOK, result)
}

func (apiHandler *APIHandler) handleGetServiceList(request *restful.Request, response *restful.Response) {
	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	namespace := parseNamespacePathParameter(request)
	dataSelect := parseDataSelectPathParameter(request)
	result, err := resourceService.GetServiceList(k8sClient, namespace, dataSelect)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusOK, result)
}

func (apiHandler *APIHandler) handleGetServiceEndpoints(request *restful.Request, response *restful.Response) {
	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	namespace := request.PathParameter("namespace")
	name := request.PathParameter("service")
	result, err := endpoint.GetServiceEndpoints(k8sClient, namespace, name)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusOK, result)
}

func (apiHandler *APIHandler) handleGetServiceDetail(request *restful.Request, response *restful.Response) {
	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	namespace := request.PathParameter("namespace")
	name := request.PathParameter("service")
	dataSelect := parseDataSelectPathParameter(request)
	dataSelect.MetricQuery = dataselect.StandardMetrics
	result, err := resourceService.GetServiceDetail(k8sClient, apiHandler.iManager.Metric().Client(), namespace, name, dataSelect)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusOK, result)
}

func (apiHandler *APIHandler) handleGetIngressDetail(request *restful.Request, response *restful.Response) {
	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	namespace := request.PathParameter("namespace")
	name := request.PathParameter("name")
	result, err := ingress.GetIngressDetail(k8sClient, namespace, name)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusOK, result)
}

func (apiHandler *APIHandler) handleGetIngressList(request *restful.Request, response *restful.Response) {
	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	dataSelect := parseDataSelectPathParameter(request)
	namespace := parseNamespacePathParameter(request)
	result, err := ingress.GetIngressList(k8sClient, namespace, dataSelect)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusOK, result)
}

func (apiHandler *APIHandler) handleGetServicePods(request *restful.Request, response *restful.Response) {
	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	namespace := request.PathParameter("namespace")
	name := request.PathParameter("service")
	dataSelect := parseDataSelectPathParameter(request)
	dataSelect.MetricQuery = dataselect.StandardMetrics
	result, err := resourceService.GetServicePods(k8sClient, apiHandler.iManager.Metric().Client(), namespace, name, dataSelect)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusOK, result)
}

func (apiHandler *APIHandler) handleGetNodeList(request *restful.Request, response *restful.Response) {
	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	dataSelect := parseDataSelectPathParameter(request)
	dataSelect.MetricQuery = dataselect.StandardMetrics
	result, err := node.GetNodeList(k8sClient, dataSelect, apiHandler.iManager.Metric().Client())
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusOK, result)
}

func (apiHandler *APIHandler) handleGetClusterArch(request *restful.Request, response *restful.Response) {
	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	dataSelect := parseDataSelectPathParameter(request)
	dataSelect.MetricQuery = dataselect.StandardMetrics
	result, err := node.GetNodeList(k8sClient, dataSelect, apiHandler.iManager.Metric().Client())
	var archMes ClusterArch
	archMes.Arch = 0
	var amd,arm = 0,0
	for _,node := range result.Nodes{
		if node.ObjectMeta.Labels["beta.kubernetes.io/arch"] == "amd64"{
			amd++
		}
		if node.ObjectMeta.Labels["beta.kubernetes.io/arch"] == "arm64"{
			arm++
		}
	}
	if amd == 0 {
		//2 arm64
		archMes.Arch = 2
	}
	if arm == 0 {
		//1 x86
		archMes.Arch = 1
	}
	if arm != 0 && amd != 0{
		//0 auto
		archMes.Arch = 0
	}
	log.Println("archMes.Arch",archMes.Arch)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusOK, archMes)
}

func (apiHandler *APIHandler) handleGetCluster(request *restful.Request, response *restful.Response) {
	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	dataSelect := parseDataSelectPathParameter(request)
	dataSelect.MetricQuery = dataselect.NoMetrics
	result, err := cluster.GetCluster(k8sClient, dataSelect, apiHandler.iManager.Metric().Client())
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusOK, result)
}

func (apiHandler *APIHandler) handleGetNodeDetail(request *restful.Request, response *restful.Response) {
	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	name := request.PathParameter("name")
	dataSelect := parseDataSelectPathParameter(request)
	dataSelect.MetricQuery = dataselect.StandardMetrics
	result, err := node.GetNodeDetail(k8sClient, apiHandler.iManager.Metric().Client(), name, dataSelect)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusOK, result)
}

func (apiHandler *APIHandler) handleGetNodeEvents(request *restful.Request, response *restful.Response) {
	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	name := request.PathParameter("name")
	dataSelect := parseDataSelectPathParameter(request)
	dataSelect.MetricQuery = dataselect.StandardMetrics
	result, err := event.GetNodeEvents(k8sClient, dataSelect, name)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusOK, result)
}

func (apiHandler *APIHandler) handleGetNodePods(request *restful.Request, response *restful.Response) {
	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	name := request.PathParameter("name")
	dataSelect := parseDataSelectPathParameter(request)
	dataSelect.MetricQuery = dataselect.StandardMetrics
	result, err := node.GetNodePods(k8sClient, apiHandler.iManager.Metric().Client(), dataSelect, name)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusOK, result)
}

func (apiHandler *APIHandler) handleDeploy(request *restful.Request, response *restful.Response) {
	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	appDeploymentSpec := new(deployment.AppDeploymentSpec)
	if err := request.ReadEntity(appDeploymentSpec); err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	if err := deployment.DeployApp(appDeploymentSpec, k8sClient); err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusCreated, appDeploymentSpec)
}

func (apiHandler *APIHandler) handleScaleResource(request *restful.Request, response *restful.Response) {
	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	namespace := request.PathParameter("namespace")
	kind := request.PathParameter("kind")
	name := request.PathParameter("name")
	count := request.QueryParameter("scaleBy")
	replicaCountSpec, err := scaling.ScaleResource(k8sClient, kind, namespace, name, count)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusOK, replicaCountSpec)
}

func (apiHandler *APIHandler) handleGetReplicaCount(request *restful.Request, response *restful.Response) {
	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	namespace := request.PathParameter("namespace")
	kind := request.PathParameter("kind")
	name := request.PathParameter("name")
	scaleSpec, err := scaling.GetScaleSpec(k8sClient, kind, namespace, name)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusOK, scaleSpec)
}

func (apiHandler *APIHandler) handleDeployFromFile(request *restful.Request, response *restful.Response) {
	cfg, err := apiHandler.cManager.Config(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	deploymentSpec := new(deployment.AppDeploymentFromFileSpec)
	if err := request.ReadEntity(deploymentSpec); err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	isDeployed, err := deployment.DeployAppFromFile(cfg, deploymentSpec)
	if !isDeployed {
		kdErrors.HandleInternalError(response, err)
		return
	}

	errorMessage := ""
	if err != nil {
		errorMessage = err.Error()
	}

	response.WriteHeaderAndEntity(http.StatusCreated, deployment.AppDeploymentFromFileResponse{
		Name:    deploymentSpec.Name,
		Content: deploymentSpec.Content,
		Error:   errorMessage,
	})
}

func (apiHandler *APIHandler) handleNameValidity(request *restful.Request, response *restful.Response) {
	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	spec := new(validation.AppNameValiditySpec)
	if err := request.ReadEntity(spec); err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	validity, err := validation.ValidateAppName(spec, k8sClient)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	response.WriteHeaderAndEntity(http.StatusOK, validity)
}

func (APIHandler *APIHandler) handleImageReferenceValidity(request *restful.Request, response *restful.Response) {
	spec := new(validation.ImageReferenceValiditySpec)
	if err := request.ReadEntity(spec); err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	validity, err := validation.ValidateImageReference(spec)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusOK, validity)
}

func (apiHandler *APIHandler) handleProtocolValidity(request *restful.Request, response *restful.Response) {
	spec := new(validation.ProtocolValiditySpec)
	if err := request.ReadEntity(spec); err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusOK, validation.ValidateProtocol(spec))
}

func (apiHandler *APIHandler) handleGetAvailableProcotols(request *restful.Request, response *restful.Response) {
	response.WriteHeaderAndEntity(http.StatusOK, deployment.GetAvailableProtocols())
}

func (apiHandler *APIHandler) handleGetReplicationControllerList(request *restful.Request, response *restful.Response) {
	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	namespace := parseNamespacePathParameter(request)
	dataSelect := parseDataSelectPathParameter(request)
	dataSelect.MetricQuery = dataselect.StandardMetrics
	result, err := replicationcontroller.GetReplicationControllerList(k8sClient, namespace, dataSelect, apiHandler.iManager.Metric().Client())
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusOK, result)
}

func (apiHandler *APIHandler) handleGetWorkloads(request *restful.Request, response *restful.Response) {
	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	namespace := parseNamespacePathParameter(request)
	dataSelect := parseDataSelectPathParameter(request)
	dataSelect.MetricQuery = dataselect.NoMetrics
	result, err := workload.GetWorkloads(k8sClient, apiHandler.iManager.Metric().Client(), namespace, dataSelect)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusOK, result)
}

// Handles get Panels list API call.
func (apiHandler *APIHandler) handleGetPanels(
	request *restful.Request, response *restful.Response) {
	log.Println("Getting panels ")
	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	namespace := parseNamespacePathParameter(request)
	log.Println("namespace", namespace)
	dataSelect := parseDataSelectPathParameter(request)
	dataSelect.MetricQuery = dataselect.StandardMetrics
	result, err := panel.GetPanels(k8sClient, dataSelect, apiHandler.iManager.Metric().Client())
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	response.WriteHeaderAndEntity(http.StatusOK, result)
}

func (apiHandler *APIHandler) handleOverview(request *restful.Request, response *restful.Response) {
	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	namespace := parseNamespacePathParameter(request)
	dataSelect := parseDataSelectPathParameter(request)
	dataSelect.FilterQuery = dataselect.NoFilter
	dataSelect.MetricQuery = dataselect.NoMetrics
	result, err := overview.GetOverview(k8sClient, apiHandler.iManager.Metric().Client(), namespace, dataSelect)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusOK, result)
}

func (apiHandler *APIHandler) handleSearch(request *restful.Request, response *restful.Response) {
	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	namespace := parseNamespacePathParameter(request)
	dataSelect := parseDataSelectPathParameter(request)
	dataSelect.MetricQuery = dataselect.NoMetrics
	result, err := search.Search(k8sClient, apiHandler.iManager.Metric().Client(), namespace, dataSelect)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusOK, result)
}

func (apiHandler *APIHandler) handleGetDiscovery(request *restful.Request, response *restful.Response) {
	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	namespace := parseNamespacePathParameter(request)
	dsQuery := parseDataSelectPathParameter(request)
	result, err := discovery.GetDiscovery(k8sClient, namespace, dsQuery)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusOK, result)
}

func (apiHandler *APIHandler) handleGetConfig(request *restful.Request, response *restful.Response) {
	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	namespace := parseNamespacePathParameter(request)
	dsQuery := parseDataSelectPathParameter(request)
	result, err := config.GetConfig(k8sClient, namespace, dsQuery)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusOK, result)
}

func (apiHandler *APIHandler) handleGetReplicaSets(request *restful.Request, response *restful.Response) {
	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	namespace := parseNamespacePathParameter(request)
	dataSelect := parseDataSelectPathParameter(request)
	dataSelect.MetricQuery = dataselect.StandardMetrics
	result, err := replicaset.GetReplicaSetList(k8sClient, namespace, dataSelect, apiHandler.iManager.Metric().Client())
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusOK, result)
}

func (apiHandler *APIHandler) handleGetReplicaSetDetail(request *restful.Request, response *restful.Response) {
	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	namespace := request.PathParameter("namespace")
	replicaSet := request.PathParameter("replicaSet")
	result, err := replicaset.GetReplicaSetDetail(k8sClient, apiHandler.iManager.Metric().Client(), namespace, replicaSet)

	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	response.WriteHeaderAndEntity(http.StatusOK, result)
}

func (apiHandler *APIHandler) handleGetReplicaSetPods(request *restful.Request, response *restful.Response) {
	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	namespace := request.PathParameter("namespace")
	replicaSet := request.PathParameter("replicaSet")
	dataSelect := parseDataSelectPathParameter(request)
	dataSelect.MetricQuery = dataselect.StandardMetrics
	result, err := replicaset.GetReplicaSetPods(k8sClient, apiHandler.iManager.Metric().Client(), dataSelect, replicaSet, namespace)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	response.WriteHeaderAndEntity(http.StatusOK, result)
}

func (apiHandler *APIHandler) handleGetReplicaSetServices(request *restful.Request, response *restful.Response) {
	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	namespace := request.PathParameter("namespace")
	replicaSet := request.PathParameter("replicaSet")
	dataSelect := parseDataSelectPathParameter(request)
	dataSelect.MetricQuery = dataselect.StandardMetrics
	result, err := replicaset.GetReplicaSetServices(k8sClient, dataSelect, namespace, replicaSet)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	response.WriteHeaderAndEntity(http.StatusOK, result)
}

func (apiHandler *APIHandler) handleGetReplicaSetEvents(request *restful.Request, response *restful.Response) {
	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	namespace := request.PathParameter("namespace")
	name := request.PathParameter("replicaSet")
	dataSelect := parseDataSelectPathParameter(request)
	dataSelect.MetricQuery = dataselect.StandardMetrics
	result, err := event.GetResourceEvents(k8sClient, dataSelect, namespace, name)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusOK, result)

}

func (apiHandler *APIHandler) handleGetPodEvents(request *restful.Request, response *restful.Response) {
	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	log.Println("Getting events related to a pod in namespace")
	namespace := request.PathParameter("namespace")
	name := request.PathParameter("pod")
	dataSelect := parseDataSelectPathParameter(request)
	dataSelect.MetricQuery = dataselect.StandardMetrics
	result, err := pod.GetEventsForPod(k8sClient, dataSelect, namespace, name)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusOK, result)
}

// Handles execute shell API call
func (apiHandler *APIHandler) handleExecShell(request *restful.Request, response *restful.Response) {
	sessionId, err := genTerminalSessionId()
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	cfg, err := apiHandler.cManager.Config(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	terminalSessions[sessionId] = TerminalSession{
		id:       sessionId,
		bound:    make(chan error),
		sizeChan: make(chan remotecommand.TerminalSize),
	}
	go WaitForTerminal(k8sClient, cfg, request, sessionId)
	response.WriteHeaderAndEntity(http.StatusOK, TerminalResponse{Id: sessionId})
}

func (apiHandler *APIHandler) handleGetDeployments(request *restful.Request, response *restful.Response) {
	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	namespace := parseNamespacePathParameter(request)
	dataSelect := parseDataSelectPathParameter(request)
	dataSelect.MetricQuery = dataselect.StandardMetrics
	result, err := deployment.GetDeploymentList(k8sClient, namespace, dataSelect, apiHandler.iManager.Metric().Client())
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusOK, result)
}

func (apiHandler *APIHandler) handleGetDeploymentDetail(request *restful.Request, response *restful.Response) {
	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	namespace := request.PathParameter("namespace")
	name := request.PathParameter("deployment")
	result, err := deployment.GetDeploymentDetail(k8sClient, apiHandler.iManager.Metric().Client(), namespace, name)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	response.WriteHeaderAndEntity(http.StatusOK, result)
}

func (apiHandler *APIHandler) handleGetDeploymentEvents(request *restful.Request, response *restful.Response) {
	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	namespace := request.PathParameter("namespace")
	name := request.PathParameter("deployment")
	dataSelect := parseDataSelectPathParameter(request)
	result, err := event.GetResourceEvents(k8sClient, dataSelect, namespace, name)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusOK, result)
}

func (apiHandler *APIHandler) handleGetDeploymentOldReplicaSets(request *restful.Request, response *restful.Response) {
	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	namespace := request.PathParameter("namespace")
	name := request.PathParameter("deployment")
	dataSelect := parseDataSelectPathParameter(request)
	dataSelect.MetricQuery = dataselect.StandardMetrics
	result, err := deployment.GetDeploymentOldReplicaSets(k8sClient, dataSelect, namespace, name)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusOK, result)
}

func (apiHandler *APIHandler) handleGetPods(request *restful.Request, response *restful.Response) {
	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	namespace := parseNamespacePathParameter(request)
	dataSelect := parseDataSelectPathParameter(request)
	dataSelect.MetricQuery = dataselect.StandardMetrics // download standard metrics - cpu, and memory - by default
	result, err := pod.GetPodList(k8sClient, apiHandler.iManager.Metric().Client(), namespace, dataSelect)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusOK, result)
}

func (apiHandler *APIHandler) handleGetPodDetail(request *restful.Request, response *restful.Response) {
	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	namespace := request.PathParameter("namespace")
	name := request.PathParameter("pod")
	result, err := pod.GetPodDetail(k8sClient, apiHandler.iManager.Metric().Client(), namespace, name)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusOK, result)
}

func (apiHandler *APIHandler) handleGetReplicationControllerDetail(request *restful.Request, response *restful.Response) {
	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	namespace := request.PathParameter("namespace")
	name := request.PathParameter("replicationController")
	result, err := replicationcontroller.GetReplicationControllerDetail(k8sClient, apiHandler.iManager.Metric().Client(), namespace, name)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusOK, result)
}

func (apiHandler *APIHandler) handleUpdateReplicasCount(request *restful.Request, response *restful.Response) {
	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	namespace := request.PathParameter("namespace")
	name := request.PathParameter("replicationController")
	spec := new(replicationcontroller.ReplicationControllerSpec)
	if err := request.ReadEntity(spec); err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	if err := replicationcontroller.UpdateReplicasCount(k8sClient, namespace, name, spec); err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	response.WriteHeader(http.StatusAccepted)
}

func (apiHandler *APIHandler) handleGetResource(request *restful.Request, response *restful.Response) {
	verber, err := apiHandler.cManager.VerberClient(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	kind := request.PathParameter("kind")
	namespace, ok := request.PathParameters()["namespace"]
	name := request.PathParameter("name")
	result, err := verber.Get(kind, ok, namespace, name)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	response.WriteHeaderAndEntity(http.StatusOK, result)
}

func (apiHandler *APIHandler) handlePutResource(
	request *restful.Request, response *restful.Response) {
	verber, err := apiHandler.cManager.VerberClient(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	kind := request.PathParameter("kind")
	namespace, ok := request.PathParameters()["namespace"]
	name := request.PathParameter("name")
	putSpec := &runtime.Unknown{}
	if err := request.ReadEntity(putSpec); err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	if err := verber.Put(kind, ok, namespace, name, putSpec); err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	response.WriteHeader(http.StatusCreated)
}

func (apiHandler *APIHandler) handleDeleteResource(
	request *restful.Request, response *restful.Response) {
	verber, err := apiHandler.cManager.VerberClient(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	kind := request.PathParameter("kind")
	namespace, ok := request.PathParameters()["namespace"]
	name := request.PathParameter("name")

	if err := verber.Delete(kind, ok, namespace, name); err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	response.WriteHeader(http.StatusOK)
}

func (apiHandler *APIHandler) handleGetReplicationControllerPods(request *restful.Request, response *restful.Response) {
	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	namespace := request.PathParameter("namespace")
	rc := request.PathParameter("replicationController")
	dataSelect := parseDataSelectPathParameter(request)
	dataSelect.MetricQuery = dataselect.StandardMetrics
	result, err := replicationcontroller.GetReplicationControllerPods(k8sClient, apiHandler.iManager.Metric().Client(), dataSelect, rc, namespace)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusOK, result)
}

func (apiHandler *APIHandler) handleCreateNamespace(request *restful.Request, response *restful.Response) {
	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	namespaceSpec := new(ns.NamespaceSpec)
	if err := request.ReadEntity(namespaceSpec); err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	if err := ns.CreateNamespace(namespaceSpec, k8sClient); err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusCreated, namespaceSpec)
}

func (apiHandler *APIHandler) handleGetNamespaces(request *restful.Request, response *restful.Response) {
	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	dataSelect := parseDataSelectPathParameter(request)
	result, err := ns.GetNamespaceList(k8sClient, dataSelect)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusOK, result)
}

func (apiHandler *APIHandler) handleGetNamespaceDetail(request *restful.Request, response *restful.Response) {
	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	name := request.PathParameter("name")
	result, err := ns.GetNamespaceDetail(k8sClient, name)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusOK, result)
}

func (apiHandler *APIHandler) handleGetNamespaceEvents(request *restful.Request, response *restful.Response) {
	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	name := request.PathParameter("name")
	dataSelect := parseDataSelectPathParameter(request)
	result, err := event.GetNamespaceEvents(k8sClient, dataSelect, name)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusOK, result)
}

func (apiHandler *APIHandler) handleCreateImagePullSecret(request *restful.Request, response *restful.Response) {
	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	spec := new(secret.ImagePullSecretSpec)
	if err := request.ReadEntity(spec); err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	result, err := secret.CreateSecret(k8sClient, spec)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusCreated, result)
}

func (apiHandler *APIHandler) handleGetSecretDetail(request *restful.Request, response *restful.Response) {
	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	namespace := request.PathParameter("namespace")
	name := request.PathParameter("name")
	result, err := secret.GetSecretDetail(k8sClient, namespace, name)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusOK, result)
}

func (apiHandler *APIHandler) handleGetSecretList(request *restful.Request, response *restful.Response) {
	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	dataSelect := parseDataSelectPathParameter(request)
	namespace := parseNamespacePathParameter(request)
	result, err := secret.GetSecretList(k8sClient, namespace, dataSelect)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusOK, result)
}

func (apiHandler *APIHandler) handleGetConfigMapList(request *restful.Request, response *restful.Response) {
	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	namespace := parseNamespacePathParameter(request)
	dataSelect := parseDataSelectPathParameter(request)
	result, err := configmap.GetConfigMapList(k8sClient, namespace, dataSelect)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusOK, result)
}

func (apiHandler *APIHandler) handleGetConfigMapDetail(request *restful.Request, response *restful.Response) {
	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	namespace := request.PathParameter("namespace")
	name := request.PathParameter("configmap")
	result, err := configmap.GetConfigMapDetail(k8sClient, namespace, name)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusOK, result)
}

func (apiHandler *APIHandler) handleGetPersistentVolumeList(request *restful.Request, response *restful.Response) {
	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	dataSelect := parseDataSelectPathParameter(request)
	result, err := persistentvolume.GetPersistentVolumeList(k8sClient, dataSelect)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusOK, result)
}

func (apiHandler *APIHandler) handleGetPersistentVolumeDetail(request *restful.Request, response *restful.Response) {
	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	name := request.PathParameter("persistentvolume")
	result, err := persistentvolume.GetPersistentVolumeDetail(k8sClient, name)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusOK, result)
}

func (apiHandler *APIHandler) handleGetPersistentVolumeClaimList(request *restful.Request, response *restful.Response) {
	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	namespace := parseNamespacePathParameter(request)
	dataSelect := parseDataSelectPathParameter(request)
	result, err := persistentvolumeclaim.GetPersistentVolumeClaimList(k8sClient, namespace, dataSelect)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusOK, result)
}

func (apiHandler *APIHandler) handleGetPersistentVolumeClaimDetail(request *restful.Request, response *restful.Response) {
	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	namespace := request.PathParameter("namespace")
	name := request.PathParameter("name")
	result, err := persistentvolumeclaim.GetPersistentVolumeClaimDetail(k8sClient, namespace, name)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusOK, result)
}

func (apiHandler *APIHandler) handleGetPodContainers(request *restful.Request, response *restful.Response) {
	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	namespace := request.PathParameter("namespace")
	name := request.PathParameter("pod")
	result, err := container.GetPodContainers(k8sClient, namespace, name)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusOK, result)
}

func (apiHandler *APIHandler) handleGetReplicationControllerEvents(request *restful.Request, response *restful.Response) {
	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	namespace := request.PathParameter("namespace")
	name := request.PathParameter("replicationController")
	dataSelect := parseDataSelectPathParameter(request)
	result, err := event.GetResourceEvents(k8sClient, dataSelect, namespace, name)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusOK, result)
}

func (apiHandler *APIHandler) handleGetReplicationControllerServices(request *restful.Request,
	response *restful.Response) {
	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	namespace := request.PathParameter("namespace")
	name := request.PathParameter("replicationController")
	dataSelect := parseDataSelectPathParameter(request)
	result, err := replicationcontroller.GetReplicationControllerServices(k8sClient, dataSelect, namespace, name)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusOK, result)
}

func (apiHandler *APIHandler) handleGetDaemonSetList(request *restful.Request, response *restful.Response) {
	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	namespace := parseNamespacePathParameter(request)
	dataSelect := parseDataSelectPathParameter(request)
	dataSelect.MetricQuery = dataselect.StandardMetrics
	result, err := daemonset.GetDaemonSetList(k8sClient, namespace, dataSelect, apiHandler.iManager.Metric().Client())
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusOK, result)
}

func (apiHandler *APIHandler) handleGetDaemonSetDetail(
	request *restful.Request, response *restful.Response) {
	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	namespace := request.PathParameter("namespace")
	name := request.PathParameter("daemonSet")
	result, err := daemonset.GetDaemonSetDetail(k8sClient, apiHandler.iManager.Metric().Client(), namespace, name)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusOK, result)
}

func (apiHandler *APIHandler) handleGetDaemonSetPods(request *restful.Request, response *restful.Response) {
	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	namespace := request.PathParameter("namespace")
	name := request.PathParameter("daemonSet")
	dataSelect := parseDataSelectPathParameter(request)
	dataSelect.MetricQuery = dataselect.StandardMetrics
	result, err := daemonset.GetDaemonSetPods(k8sClient, apiHandler.iManager.Metric().Client(), dataSelect, name, namespace)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusOK, result)
}

func (apiHandler *APIHandler) handleGetDaemonSetServices(request *restful.Request, response *restful.Response) {
	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	namespace := request.PathParameter("namespace")
	daemonSet := request.PathParameter("daemonSet")
	dataSelect := parseDataSelectPathParameter(request)
	result, err := daemonset.GetDaemonSetServices(k8sClient, dataSelect, namespace, daemonSet)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusOK, result)
}

func (apiHandler *APIHandler) handleGetDaemonSetEvents(request *restful.Request, response *restful.Response) {
	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	namespace := request.PathParameter("namespace")
	name := request.PathParameter("daemonSet")
	dataSelect := parseDataSelectPathParameter(request)
	result, err := event.GetResourceEvents(k8sClient, dataSelect, namespace, name)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusOK, result)
}

func (apiHandler *APIHandler) handleGetHorizontalPodAutoscalerList(request *restful.Request,
	response *restful.Response) {
	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	namespace := parseNamespacePathParameter(request)
	result, err := horizontalpodautoscaler.GetHorizontalPodAutoscalerList(k8sClient, namespace)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusOK, result)
}

func (apiHandler *APIHandler) handleGetHorizontalPodAutoscalerDetail(request *restful.Request, response *restful.Response) {
	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	namespace := request.PathParameter("namespace")
	name := request.PathParameter("horizontalpodautoscaler")
	result, err := horizontalpodautoscaler.GetHorizontalPodAutoscalerDetail(k8sClient, namespace, name)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusOK, result)
}

func (apiHandler *APIHandler) handleGetJobList(request *restful.Request, response *restful.Response) {
	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	namespace := parseNamespacePathParameter(request)
	dataSelect := parseDataSelectPathParameter(request)
	dataSelect.MetricQuery = dataselect.StandardMetrics
	result, err := job.GetJobList(k8sClient, namespace, dataSelect, apiHandler.iManager.Metric().Client())
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusOK, result)
}

func (apiHandler *APIHandler) handleGetJobDetail(request *restful.Request, response *restful.Response) {
	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	namespace := request.PathParameter("namespace")
	name := request.PathParameter("name")
	dataSelect := parseDataSelectPathParameter(request)
	dataSelect.MetricQuery = dataselect.StandardMetrics
	result, err := job.GetJobDetail(k8sClient, apiHandler.iManager.Metric().Client(), namespace, name)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusOK, result)
}

func (apiHandler *APIHandler) handleGetJobPods(request *restful.Request, response *restful.Response) {
	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	namespace := request.PathParameter("namespace")
	name := request.PathParameter("name")
	dataSelect := parseDataSelectPathParameter(request)
	dataSelect.MetricQuery = dataselect.StandardMetrics
	result, err := job.GetJobPods(k8sClient, apiHandler.iManager.Metric().Client(), dataSelect, namespace, name)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusOK, result)
}

func (apiHandler *APIHandler) handleGetJobEvents(request *restful.Request, response *restful.Response) {
	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	namespace := request.PathParameter("namespace")
	name := request.PathParameter("name")
	dataSelect := parseDataSelectPathParameter(request)
	result, err := job.GetJobEvents(k8sClient, dataSelect, namespace, name)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusOK, result)
}

func (apiHandler *APIHandler) handleGetCronJobList(request *restful.Request, response *restful.Response) {
	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	namespace := parseNamespacePathParameter(request)
	dataSelect := parseDataSelectPathParameter(request)
	dataSelect.MetricQuery = dataselect.StandardMetrics
	result, err := cronjob.GetCronJobList(k8sClient, namespace, dataSelect, apiHandler.iManager.Metric().Client())
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusOK, result)
}

func (apiHandler *APIHandler) handleGetCronJobDetail(request *restful.Request, response *restful.Response) {
	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	namespace := request.PathParameter("namespace")
	name := request.PathParameter("name")
	dataSelect := parseDataSelectPathParameter(request)
	dataSelect.MetricQuery = dataselect.StandardMetrics
	result, err := cronjob.GetCronJobDetail(k8sClient, dataSelect, apiHandler.iManager.Metric().Client(), namespace,
		name)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusOK, result)
}

func (apiHandler *APIHandler) handleGetCronJobJobs(request *restful.Request, response *restful.Response) {
	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	namespace := request.PathParameter("namespace")
	name := request.PathParameter("name")
	dataSelect := parseDataSelectPathParameter(request)
	result, err := cronjob.GetCronJobJobs(k8sClient, apiHandler.iManager.Metric().Client(), dataSelect, namespace, name)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusOK, result)
}

func (apiHandler *APIHandler) handleGetCronJobEvents(request *restful.Request, response *restful.Response) {
	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	namespace := request.PathParameter("namespace")
	name := request.PathParameter("name")
	dataSelect := parseDataSelectPathParameter(request)
	result, err := cronjob.GetCronJobEvents(k8sClient, dataSelect, namespace, name)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusOK, result)
}

func (apiHandler *APIHandler) handleGetStorageClassList(request *restful.Request, response *restful.Response) {
	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	dataSelect := parseDataSelectPathParameter(request)
	result, err := storageclass.GetStorageClassList(k8sClient, dataSelect)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusOK, result)
}

func (apiHandler *APIHandler) handleGetStorageClass(request *restful.Request, response *restful.Response) {
	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	name := request.PathParameter("storageclass")
	result, err := storageclass.GetStorageClass(k8sClient, name)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusOK, result)
}

func (apiHandler *APIHandler) handleGetStorageClassPersistentVolumes(request *restful.Request,
	response *restful.Response) {
	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	name := request.PathParameter("storageclass")
	dataSelect := parseDataSelectPathParameter(request)
	result, err := persistentvolume.GetStorageClassPersistentVolumes(k8sClient,
		name, dataSelect)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusOK, result)
}

func (apiHandler *APIHandler) handleGetPodPersistentVolumeClaims(request *restful.Request,
	response *restful.Response) {
	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	name := request.PathParameter("pod")
	namespace := request.PathParameter("namespace")
	dataSelect := parseDataSelectPathParameter(request)
	result, err := persistentvolumeclaim.GetPodPersistentVolumeClaims(k8sClient,
		namespace, name, dataSelect)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusOK, result)
}

func (apiHandler *APIHandler) handleLogSource(request *restful.Request, response *restful.Response) {
	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	resourceName := request.PathParameter("resourceName")
	resourceType := request.PathParameter("resourceType")
	namespace := request.PathParameter("namespace")
	logSources, err := logs.GetLogSources(k8sClient, namespace, resourceName, resourceType)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusOK, logSources)
}

func (apiHandler *APIHandler) handleLogs(request *restful.Request, response *restful.Response) {
	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}

	namespace := request.PathParameter("namespace")
	podID := request.PathParameter("pod")
	containerID := request.PathParameter("container")

	refTimestamp := request.QueryParameter("referenceTimestamp")
	if refTimestamp == "" {
		refTimestamp = logs.NewestTimestamp
	}

	refLineNum, err := strconv.Atoi(request.QueryParameter("referenceLineNum"))
	if err != nil {
		refLineNum = 0
	}
	usePreviousLogs := request.QueryParameter("previous") == "true"
	offsetFrom, err1 := strconv.Atoi(request.QueryParameter("offsetFrom"))
	offsetTo, err2 := strconv.Atoi(request.QueryParameter("offsetTo"))
	logFilePosition := request.QueryParameter("logFilePosition")

	logSelector := logs.DefaultSelection
	if err1 == nil && err2 == nil {
		logSelector = &logs.Selection{
			ReferencePoint: logs.LogLineId{
				LogTimestamp: logs.LogTimestamp(refTimestamp),
				LineNum:      refLineNum,
			},
			OffsetFrom:      offsetFrom,
			OffsetTo:        offsetTo,
			LogFilePosition: logFilePosition,
		}
	}

	result, err := container.GetLogDetails(k8sClient, namespace, podID, containerID, logSelector, usePreviousLogs)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusOK, result)
}

func (apiHandler *APIHandler) handleLogFile(request *restful.Request, response *restful.Response) {
	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	namespace := request.PathParameter("namespace")
	podID := request.PathParameter("pod")
	containerID := request.PathParameter("container")
	usePreviousLogs := request.QueryParameter("previous") == "true"

	logStream, err := container.GetLogFile(k8sClient, namespace, podID, containerID, usePreviousLogs)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	handleDownload(response, logStream)
}

// parseNamespacePathParameter parses namespace selector for list pages in path parameter.
// The namespace selector is a comma separated list of namespaces that are trimmed.
// No namespaces means "view all user namespaces", i.e., everything except kube-system.
func parseNamespacePathParameter(request *restful.Request) *common.NamespaceQuery {
	namespace := request.PathParameter("namespace")
	namespaces := strings.Split(namespace, ",")
	var nonEmptyNamespaces []string
	for _, n := range namespaces {
		n = strings.Trim(n, " ")
		if len(n) > 0 {
			nonEmptyNamespaces = append(nonEmptyNamespaces, n)
		}
	}
	return common.NewNamespaceQuery(nonEmptyNamespaces)
}

func parsePaginationPathParameter(request *restful.Request) *dataselect.PaginationQuery {
	itemsPerPage, err := strconv.ParseInt(request.QueryParameter("itemsPerPage"), 10, 0)
	if err != nil {
		return dataselect.NoPagination
	}

	page, err := strconv.ParseInt(request.QueryParameter("page"), 10, 0)
	if err != nil {
		return dataselect.NoPagination
	}

	// Frontend pages start from 1 and backend starts from 0
	return dataselect.NewPaginationQuery(int(itemsPerPage), int(page-1))
}

func parseFilterPathParameter(request *restful.Request) *dataselect.FilterQuery {
	return dataselect.NewFilterQuery(strings.Split(request.QueryParameter("filterBy"), ","))
}

// Parses query parameters of the request and returns a SortQuery object
func parseSortPathParameter(request *restful.Request) *dataselect.SortQuery {
	return dataselect.NewSortQuery(strings.Split(request.QueryParameter("sortBy"), ","))
}

// Parses query parameters of the request and returns a MetricQuery object
func parseMetricPathParameter(request *restful.Request) *dataselect.MetricQuery {
	metricNamesParam := request.QueryParameter("metricNames")
	var metricNames []string
	if metricNamesParam != "" {
		metricNames = strings.Split(metricNamesParam, ",")
	} else {
		metricNames = nil
	}
	aggregationsParam := request.QueryParameter("aggregations")
	var rawAggregations []string
	if aggregationsParam != "" {
		rawAggregations = strings.Split(aggregationsParam, ",")
	} else {
		rawAggregations = nil
	}
	aggregationModes := metricapi.AggregationModes{}
	for _, e := range rawAggregations {
		aggregationModes = append(aggregationModes, metricapi.AggregationMode(e))
	}
	return dataselect.NewMetricQuery(metricNames, aggregationModes)

}

// Parses query parameters of the request and returns a DataSelectQuery object
func parseDataSelectPathParameter(request *restful.Request) *dataselect.DataSelectQuery {
	paginationQuery := parsePaginationPathParameter(request)
	sortQuery := parseSortPathParameter(request)
	filterQuery := parseFilterPathParameter(request)
	metricQuery := parseMetricPathParameter(request)
	return dataselect.NewDataSelectQuery(paginationQuery, sortQuery, filterQuery, metricQuery)
}

func (apiHandler *APIHandler) handleUserLogin(request *restful.Request, response *restful.Response) {
	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	loginSpec:=new(user.LoginSpec)
	if err := request.ReadEntity(loginSpec); err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	newErr:=user.HandleLogin(k8sClient,loginSpec)
	response.WriteHeaderAndEntity(http.StatusOK,newErr)
}

func (apiHandler *APIHandler) handleListUser(request *restful.Request, response *restful.Response) {
	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	resp:=user.HandleGetUsers(k8sClient)
	response.WriteHeaderAndEntity(http.StatusOK,resp)
}

func (apiHandler *APIHandler) handleCreateUser(request *restful.Request, response *restful.Response) {
	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	UserSpec:=new(user.UserSpec)
	if err := request.ReadEntity(UserSpec); err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	newErr:=user.HandleCreatUser(k8sClient,UserSpec)
	response.WriteHeaderAndEntity(http.StatusOK,newErr)
}

func (apiHandler *APIHandler) handleUserChgpwd(request *restful.Request, response *restful.Response) {
	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	chgPasswordSpec:=new(user.ChgPasswordSpec)
	if err := request.ReadEntity(chgPasswordSpec); err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	newErr:=user.HandleUserChgpwd(k8sClient,chgPasswordSpec)
	response.WriteHeaderAndEntity(http.StatusOK,newErr)
}

func (apiHandler *APIHandler) handleDeleteUser(request *restful.Request, response *restful.Response) {
	k8sClient, err := apiHandler.cManager.Client(request)
	if err != nil {
		kdErrors.HandleInternalError(response, err)
		return
	}
	username := request.PathParameter("userid")
	newErr:=user.HandleDeleteUser(k8sClient,username)
	response.WriteHeaderAndEntity(http.StatusOK,newErr)

}

