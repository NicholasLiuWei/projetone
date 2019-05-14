// Copyright 2015 Google Inc. All Rights Reserved.
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

import { stateName as adminState } from 'admin/state';
import { stateName as configState } from 'config/state';
import { stateName as configMapState } from 'configmaplist/configmaplist_state';
import { stateName as daemonSetState } from 'daemonsetlist/daemonsetlist_state';
import { stateName as deploymentState } from 'deploymentlist/deploymentlist_state';
import { stateName as ingressState } from 'ingresslist/list_state';
import { stateName as jobState } from 'joblist/joblist_state';
import { stateName as namespaceState } from 'namespacelist/namespacelist_state';
import { stateName as nodeState } from 'nodelist/nodelist_state';
import { stateName as persistentVolumeClaimState } from 'persistentvolumeclaimlist/persistentvolumeclaimlist_state';
import { stateName as persistentVolumeState } from 'persistentvolumelist/persistentvolumelist_state';
import { stateName as podState } from 'podlist/podlist_state';
import { stateName as replicaSetState } from 'replicasetlist/replicasetlist_state';
import { stateName as replicationControllerState } from 'replicationcontrollerlist/replicationcontrollerlist_state';
import { stateName as secretState } from 'secretlist/list_state';
import { stateName as serviceState } from 'servicelist/servicelist_state';
import { stateName as servicesanddiscoveryState } from 'servicesanddiscovery/state';
import { stateName as statefulSetState } from 'statefulsetlist/statefulsetlist_state';
import { stateName as storageClassState } from 'storageclasslist/state';
import { stateName as workloadState } from 'workloads/workloads_state';
import { stateName as repositoryState } from 'repositorylist/repositorylist_state';
//import {deployAppStateName} from 'deploy/deploy_state';
import { stateName as appStore } from 'appStore/state';
import { stateName as home } from 'newhome/state';
import { stateName as release } from 'releaselist/releaselist_state';
import { stateName as image } from 'imagelist/state';
// import { stateName as usermanagement } from 'usermanagement/state';
import { stateName as warning } from 'warning/list/state';
import { stateName as storage } from 'storage/pvc/state';
import { stateName as network } from 'network/service/state';
import { stateName as rizhi } from 'rizhi/platform/state';
import { stateName as jiankong } from 'jiankong/state';

/**
 * @final
 */
export class NavController {
    /**
     * @param {!./nav_service.NavService} kdNavService
     * @ngInject
     */
    constructor(kdNavService, $rootScope, $http, $scope, $resource, $cookies) {
        /** @export {boolean} */
        this.isVisible = true;
        /** @private {!./nav_service.NavService} */
        this.kdNavService_ = kdNavService;

        /** @export */
        this.resource_ = $resource;

        /**@export */
        this.rootScope_ = $rootScope;
        /** adfas */
        this.http_ = $http;
        this.cookies = $cookies;
        /** @export  */
        this.navitems = {};

        /** @export {!Object<string, string>} */
        this.states = {
            'namespace': namespaceState,
            'node': nodeState,
            'workload': workloadState,
            'admin': adminState,
            'pod': podState,
            'deployment': deploymentState,
            'replicaSet': replicaSetState,
            'replicationController': replicationControllerState,
            'daemonSet': daemonSetState,
            'persistentVolume': persistentVolumeState,
            'statefulSet': statefulSetState,
            'repository': repositoryState,
            'job': jobState,
            'service': serviceState,
            'persistentVolumeClaim': persistentVolumeClaimState,
            'secret': secretState,
            'configMap': configMapState,
            'ingress': ingressState,
            'serviceDiscovery': servicesanddiscoveryState,
            'config': configState,
            'storageClass': storageClassState,
            'appStore': appStore,
            'home': home,
            'release': release,
            'image': image,
            // 'usermanagement': usermanagement,
            'warning': warning,
            'storage': storage,
            'net': network,
            'rizhi': rizhi,
            'jiankong': cephcluster
        };

        /** cunchu */
        this.getNav();

    }


    /** @export */
    $onInit() {
        this.kdNavService_.registerNav(this);
    }

    /** @export */
    getNav() {
        this.rootScope_.mes = {};
        // let data1 = {"Name":"dashboard-shuai","Namespace":"25179ff49b014e8fb31d38aaa193ec44","Authserver":"10.105.221.213","User":"test-user","Role":"k8s-user","Tree":{"APP Store":{"state":"appStore","item":[]},"Config and Storage":{"state":"config","item":[{"name":"Config Maps","state":"configmap.list"},{"name":"Secrets","state":"secret.list"}]},"Discovery and Load Balancing":{"state":"discovery","item":[{"name":"Services","state":"service.list"}]},"Workloads":{"state":"workload","item":[{"name":"Deployments","state":"deployment.list"},{"name":"Pods","state":"pod.list"},{"name":"Replica Sets","state":"replicaset.list"}]},"repositories":{"state":"repositories","item":[]}}};
        // console.log(data1["Tree"]);
        // this.navitems = data1["Tree"];
        //           this.rootScope_.mes = data1;
        //   let resource = this.resource_('http://'+location.host+'/identity');
        //   resource.get(
        //       (res) => {
        //           this.rootScope_["mes"] = res;
        //           // console.log(this.rootScope_);
        //           // let data = {"Name":"dashboard-shuai","Namespace":"25179ff49b014e8fb31d38aaa193ec44","Authserver":"10.105.221.213","User":"test-user","Role":"k8s-user","Tree":{"APP Store":{"state":"appStore","item":[]},"Config and Storage":{"state":"config","item":[{"name":"Config Maps","state":"configmap.list"},{"name":"Secrets","state":"secret.list"}]},"Discovery and Load Balancing":{"state":"discovery","item":[{"name":"Services","state":"service.list"}]},"Workloads":{"state":"workload","item":[{"name":"Deployments","state":"deployment.list"},{"name":"Pods","state":"pod.list"},{"name":"Replica Sets","state":"replicaset.list"}]},"repositories":{"state":"repositories","item":[]}}};
        //           // res["Tree"] = data.Tree;
        //           // res["User"] = data.User;
        //           this.navitems = res["Tree"];
        //       },
        //       (err) => {
        //           console.log(err)
        //       });
    }

    /**
     * Toggles visibility of the navigation component.
     */
    toggle() {
        this.isVisible = !this.isVisible;
    }

    /**
     * Sets visibility of the navigation component.
     */
    setVisibility(isVisible) {
        this.isVisible = isVisible;
    }

    /**
     * Sets navitem of the navigation component.
     *@export
     */
    setNavitem() {
        // let str = JSON.stringify(this.navitems);
        let user = this.cookies.get('username');
        // console.log(str);
        // console.log(state);
        // console.log(str.indexOf(state));
        if (user == "admin") {
            return true;
        }
        return false;
    }
}
/**
 * @type {!angular.Component}
 */
export const navComponent = {
    controller: NavController,
    templateUrl: 'chrome/nav/navs.html',
};