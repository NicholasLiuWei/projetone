// created by CK
// provide a new api for the instrument panel

package panel

import (
  "log"
  "strconv"
  "time"

  k8sClient "k8s.io/client-go/kubernetes"
  // "github.com/kubernetes/dashboard/src/app/backend/resource/deployment"
  noderes "github.com/kubernetes/dashboard/src/app/backend/resource/node"
  "github.com/kubernetes/dashboard/src/app/backend/client"
  "github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
  "github.com/kubernetes/dashboard/src/app/backend/resource/common"
  //daemonset "github.com/kubernetes/dashboard/src/app/backend/resource/daemonset/list"
  //job "github.com/kubernetes/dashboard/src/app/backend/resource/job/list"
  //"github.com/kubernetes/dashboard/src/app/backend/resource/pod"
  //replicaset "github.com/kubernetes/dashboard/src/app/backend/resource/replicaset/list"
  //replicationcontroller "github.com/kubernetes/dashboard/src/app/backend/resource/replicationcontroller/list"
  //statefulset "github.com/kubernetes/dashboard/src/app/backend/resource/statefulset/list"
)

// type OverviewMetrics struct {
//   CpuUsage float64  `json:"cpuUsage"`
//   MemUsage float64  `json:"memUsage"`
//   FsUsage float64  `json:"fsUsage"`
//   TxRate  int64  `json:"txRate"`
//   RxRate  int64  `json:"rxRate"`
// }

// type Pair [2]string
// type DataPoint []Pair

//#-CK_FEATURE_MAGIC-#  tanck1 1000/10000NetworkRates 20180606 "add metrics for 1000/10000Mb network subsystem"
// type NodeMetrics struct {
//   Name string
//   Cpu DataPoint 
//   Mem DataPoint 
//   Rx1000 DataPoint 
//   Rx10000 DataPoint 
//   Tx1000  DataPoint
//   Tx10000  DataPoint
// }

// type NodeMetricsList struct {
//   MetricsList []NodeMetrics
// }

type Panels struct {
  NodeDetailList []noderes.NodeDetail  `json:"nodeDetailList"`
  // DeploymentList deployment.DeploymentList `json:"deploymentList"`
  // Overview OverviewMetrics  `json:"overview"`
  // Metrics NodeMetricsList  `json:"metrics"`
}


// func GetDataStr(ts int64) string {
//   JavascriptISOString := "2006-01-02T15:04:05.999Z07:00"
//   return time.Unix(ts, 0).Format(JavascriptISOString)
// }

func GetPanels(client *k8sClient.Clientset, heapsterClient client.HeapsterClient,
  nsQuery *common.NamespaceQuery, metricQuery *dataselect.MetricQuery) (*Panels, error) {
  //channels := &common.ResourceChannels{
  //  NodeList: common.GetNodeListChannel(client, 1),
  //  DeploymentList: common.GetDeploymentListChannel(client, nsQuery, 1),
  //}
  channels := &common.ResourceChannels{
        NodeList: common.GetNodeListChannel(client, 1),
	ReplicationControllerList: common.GetReplicationControllerListChannel(client, nsQuery, 1),
	ReplicaSetList:            common.GetReplicaSetListChannel(client, nsQuery, 1),
	JobList:                   common.GetJobListChannel(client, nsQuery, 1),
	DaemonSetList:             common.GetDaemonSetListChannel(client, nsQuery, 1),
	DeploymentList:            common.GetDeploymentListChannel(client, nsQuery, 1),
	StatefulSetList:           common.GetStatefulSetListChannel(client, nsQuery, 1),
	ServiceList:               common.GetServiceListChannel(client, nsQuery, 1),
	PodList:                   common.GetPodListChannel(client, nsQuery, 7),
	EventList:                 common.GetEventListChannel(client, nsQuery, 7),
  }


  nodeChan := make(chan *noderes.NodeList)
  // deploymentChan := make(chan *deployment.DeploymentList)
  errChan := make(chan error, 7)

  go func() {
  	nodeList, err := noderes.GetNodeListFromChannels(channels, dataselect.DefaultDataSelect, nil)
  	errChan <- err
  	nodeChan <- nodeList
  }()
  // go func() {
  // 	deploymentList, err := deployment.GetDeploymentListFromChannels(channels, dataselect.DefaultDataSelect, nil)
  // 	errChan <- err
  // 	deploymentChan <- deploymentList
  // }()

  //panels := new(Panels)
  //panels := &Panels{}
  nodeList := <- nodeChan
  err := <-errChan
  if err != nil {
        log.Print("Getting node lists error")
  	return nil, err
  }

  _cpu:=0.0
  _mem:=0.0 
  //_fs:=0.0
  var _tx int64 = 0
  var _rx int64 = 0
  var  metrList NodeMetricsList
  ndl := []noderes.NodeDetail{}
  for _, node := range nodeList.Nodes {
    nodeDetail, err := noderes.GetNodeDetail(client, heapsterClient, node.ObjectMeta.Name)
    if err != nil {
      return nil, err
    }
    ndl=append(ndl, *nodeDetail)
  //   if len(nodeDetail.Metrics) >= 8 {
  //     if len(nodeDetail.Metrics[0].DataPoints)>0 {
  //       _cpu += float64(nodeDetail.AllocatedResources.CPURequests)/float64(nodeDetail.AllocatedResources.CPUCapacity)
  //       //_cpu += float64(nodeDetail.Metrics[0].DataPoints[len(nodeDetail.Metrics[0].DataPoints)-1].Y)
  //     }
  //     if len(nodeDetail.Metrics[1].DataPoints)>0 {
  //       _mem += float64(nodeDetail.AllocatedResources.MemoryRequests)/float64(nodeDetail.AllocatedResources.MemoryCapacity)
  //       //_mem += float64(nodeDetail.Metrics[1].DataPoints[len(nodeDetail.Metrics[1].DataPoints)-1].Y)
  //     }
  //     // get _tx
  //     if len(nodeDetail.Metrics[2].DataPoints)>0 {
  //       _tx += nodeDetail.Metrics[2].DataPoints[len(nodeDetail.Metrics[2].DataPoints)-1].Y
  //     }
  //     // get _rx
  //     if len(nodeDetail.Metrics[3].DataPoints)>0 {
  //       _rx += nodeDetail.Metrics[3].DataPoints[len(nodeDetail.Metrics[3].DataPoints)-1].Y
  //     }

  //     // build NodeMetricsList
  //     var  nodeMetr NodeMetrics
  //     nodeMetr.Name = nodeDetail.ExternalID
  //     // assign cpu
  //     cpuOrg := nodeDetail.Metrics[0]
  //     for _, data := range cpuOrg.DataPoints {
	// str_date := GetDataStr(data.X)
	// str_value := strconv.FormatFloat(float64(data.Y*100) / float64(nodeDetail.AllocatedResources.CPUCapacity), 'f', 3, 64)
	// p := Pair{str_date, str_value}
  //       nodeMetr.Cpu = append(nodeMetr.Cpu, p)
  //     }
  //     // assign mem
  //     memOrg := nodeDetail.Metrics[1]
  //     for _, data := range memOrg.DataPoints {
	// str_date := GetDataStr(data.X)
	// str_value := strconv.FormatFloat(float64(data.Y*100) / float64(nodeDetail.AllocatedResources.MemoryCapacity), 'f', 3, 64)
	// p := Pair{str_date, str_value}
  //       nodeMetr.Mem = append(nodeMetr.Mem, p)
  //     }
  //     // assign Rx1000
  //     rx1000Org := nodeDetail.Metrics[4]
  //     for _, data := range rx1000Org.DataPoints {
	// str_date := GetDataStr(data.X)
	// str_value := strconv.FormatInt(data.Y, 10)
	// p := Pair{str_date, str_value}

  //       nodeMetr.Rx1000 = append(nodeMetr.Rx1000, p)
  //     }
  //     // assign Rx10000
  //     rx10000Org := nodeDetail.Metrics[5]
  //     for _, data := range rx10000Org.DataPoints {
	// str_date := GetDataStr(data.X)
	// str_value := strconv.FormatInt(data.Y, 10)
	// p := Pair{str_date, str_value}
  //       nodeMetr.Rx10000 = append(nodeMetr.Rx10000, p)
  //     }
  //     // assign Tx1000
  //     tx1000Org := nodeDetail.Metrics[6]
  //     for _, data := range tx1000Org.DataPoints {
	// str_date := GetDataStr(data.X)
	// str_value := strconv.FormatInt(data.Y, 10)
	// p := Pair{str_date, str_value}
  //       nodeMetr.Tx1000 = append(nodeMetr.Tx1000, p)
  //     }
  //     // assign Tx10000
  //     tx10000Org := nodeDetail.Metrics[7]
  //     for _, data := range tx10000Org.DataPoints {
	// str_date := GetDataStr(data.X)
	// str_value := strconv.FormatInt(data.Y, 10)
	// p := Pair{str_date, str_value}
  //       nodeMetr.Tx10000 = append(nodeMetr.Tx10000, p)
  //     }

  //     metrList.MetricsList = append(metrList.MetricsList, nodeMetr)
  //   }

      //_fs += float64(nodeDetail.Metrics[2].DataPoints[len(nodeDetail.Metrics[2].DataPoints)-1].Y)/float64(nodeDetail.Metrics[3].DataPoints[len(nodeDetail.Metrics[3].DataPoints)-1].Y)
  }


  // log.Print("Getting deployment list")
  // deploymentList := <-deploymentChan
  // err = <-errChan
  // if err != nil {
  //       log.Print("Getting deployment lists error")
  // 	return nil, err
  // }

  panels := &Panels {
    NodeDetailList: ndl,
    // DeploymentList: *deploymentList,
    // Overview: OverviewMetrics{CpuUsage: _cpu/float64(len(nodeList.Nodes)), MemUsage: _mem/float64(len(nodeList.Nodes)), FsUsage: 0.0, TxRate: _tx,  RxRate: _rx},
    // Metrics: metrList,
  }

  
  //panels.DeploymentList = *deploymentList
  //panels.Overview = OverviewMetrics{CpuUsage: _cpu/float64(len(nodeList.Nodes)), MemUsage: _mem/float64(len(nodeList.Nodes)), FsUsage:_fs/float64(len(nodeList.Nodes)) }
  log.Print("Getting overview metrics")
  //panels.Overview = OverviewMetrics{CpuUsage: 0.0, MemUsage: 0.0, FsUsage: 0.0 }

  return panels, nil
}
