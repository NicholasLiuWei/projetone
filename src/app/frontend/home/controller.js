/**
 * Controller for the home view. The view shows details about the installation
 * enviornment. The information can be used when creating issues.
 *
 * @final
 */
// import {ALL_NAMESPACES} from 'common/namespace/namespaceselect_component';
export class homeController {
    /**
     * @param {!ui.router.$state} $state
     * @param {!angular.$interpolate} $interpolate
     * @param {!md.$dialog} $mdDialog
     * @param {!./../common/namespace/namespace_service.NamespaceService} kdNamespaceService
     * @param {!./../common/pagination/pagination_service.PaginationService} kdPaginationService
     * @param {!./../chrome/chrome_state.StateParams} $stateParams
     * @ngInject
     */
    constructor(panelMes,$scope,$state,$timeout,$filter, $interval, $interpolate, $stateParams, kdPaginationService, kdNamespaceService,$resource,kdPanelResource, $mdDialog) {
            /** @private {!ui.router.$state} */
            this.state_ = $state;

            /** @private {!angular.$interpolate} */
            this.interpolate_ = $interpolate;

            /** @private {!./../common/namespace/namespace_service.NamespaceService} */
            this.kdNamespaceService_ = kdNamespaceService;

            /** @private {!./../common/pagination/pagination_service.PaginationService} kdPaginationService*/
            this.kdPaginationService_ = kdPaginationService;

            this.resource_ = $resource;

            this.stateParams_ = $stateParams;
            /**  @export */
            this.nodelist = panelMes["nodeDetailList"];

            /**  @export */
            this.podboxShow = false;

            /**  @export */
            this.deployment = panelMes["deploymentList"]["deployments"];

            /**  @export */
            this.podeName = '';

            /**   @export */
            this.pod = [];

            /**   @export */
            this.podcount = 0;

            /**   @export */
            this.overview = panelMes["overview"];

            /**   @export */            
            this.NodeHealth = true;
            /**   @export */            
            this.ReleaseHealth = true;
            /**   @export */            
            this.FSHealth = true;
            let self = this;
            for(var i = 0 ;i <this.nodelist.length;i++){
                var change = window["$"]('.warning div');
	            if(this.nodelist[i]["conditions"][this.nodelist[i]["conditions"].length-1].status!="True"){
                    this.NodeHealth = false;
                    change.eq(0).text('1');
                    change.eq(2).text(this.nodelist[i]["objectMeta"]["name"]+'机器发生故障');
                    break;
                }
                //if(this.nodelist[i].allocatedResources.cpuLimitsFraction>=90||this.nodelist[i].allocatedResources.cpuRequestsFraction>=90||this.nodelist[i].allocatedResources.memoryLimitsFraction>=90||this.nodelist[i].allocatedResources.memoryRequestsFraction>=90||(this.nodelist[i].allocatedPods/this.nodelist[i].podCapacity)*100>=90){
                //    this.NodeHealth = false;
                //    break;
                //};
                change.eq(0).text('0');
                change.eq(2).text('暂无警告');
                this.NodeHealth = true;
            }
            for(var i = 0 ;i <this.deployment.length;i++){
                this.podcount += this.deployment[i]["pods"]["desired"];
                if(this.deployment[i].pods.running<this.deployment[i].pods.desired){
                    this.ReleaseHealth = false;
                    break;
                };
                this.ReleaseHealth = true;
            }
            // 基于准备好的dom，初始化echarts实例
            let echarts = window["echarts"];
            var myChart = echarts["init"](window["$"]('.cpu').get(0));
            let chart1 = echarts["init"](window["$"]('.memory').get(0));
            let fschart = echarts["init"](window["$"]('.filesystem').get(0));
            let rxnetchart = echarts["init"](window["$"]('.rxRate').get(0));
            let txnetchart = echarts["init"](window["$"]('.txRate').get(0));
            // 指定图表的配置项和数据
            let cpuusage = panelMes["overview"]["cpuUsage"]*100;
            cpuusage = cpuusage.toFixed(1);
            let memusage = panelMes["overview"]["memUsage"]*100;
            memusage = memusage.toFixed(1);  
            //if(fsusage>90){
            //    this.FSHealth = false;
            //};      
            var cpuoption = {
                "tooltip": {
                    "formatter": "{a} <br/>{b} : {c}%"
                },
                "series": [{
                    "name": 'CPU',
                    "type": 'gauge',
                    "detail": { "formatter": '{value}%' },
                    "data": [{ value: cpuusage, name: 'CPU占比' }],
                    "splitLine":{
                        "show":false
                    },
                    "axisLine":{
                        "show":false,
                        "lineStyle":{
                            "width":10
                        }
                    },
                    "axisTick":{
                        "show":false
                    },
                    "axisLabel":{
                        "show":false
                    },
                    "title":{
                        "fontSize":16,
                        "show":false
                    }
                }]
            };
            var memoption = {
                "tooltip": {
                    "formatter": "{a} <br/>{b} : {c}%"
                },
                "series": [{
                    "name": '内存',
                    "type": 'gauge',
                    "detail": { "formatter": '{value}%' },
                    "data": [{ value: memusage, name: '内存占比' }],
                    "splitLine":{
                        "show":false
                    },
                    "axisLine":{
                        "show":false,
                        "lineStyle":{
                            "width":10
                        }
                    },
                    "axisTick":{
                        "show":false
                    },
                    "axisLabel":{
                        "show":false
                    },
                    "title":{
                        "fontSize":16,
                        "show":false
                    }
                }]
            };           
            var time = new Date().toTimeString().substring(0,8);
            var xdata = ['','','','','','','','','','','','','','','','','','','',time];
            var rxdata =  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,panelMes["overview"]["rxRate"]];
            var txdata =  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,panelMes["overview"]["txRate"]];
            var rxoption = {
                "title": {
                    "text": '接收速率'+$filter("kdMemory")(panelMes["overview"]["rxRate"]),
                    "textStyle":{
                        "fontSize":14,
                        "fontFamily":"Microsoft YaHei",
                        "lineHeight":14,
                        "default":"normal"
                    }
                },
                "tooltip": {
                    "trigger": 'axis',
                    "formatter": function (params) {
                        params = params[0];
                        return params["name"]+'<br/>'+params["seriesName"]+" : "+$filter("kdMemory")(params["data"]);
                    },
                },
                "xAxis": {
                    "type": 'category',
                    "data":xdata
                },
                "yAxis": {
                    "type": 'value',
                    "splitLine": {
                        "show": false
                    },
                    "show":false   
                },
                "series": [{
                    "name": '接收速率',
                    "type": 'line',
                    "smooth": true,
                    "data":rxdata
                }]
            };
            var txoption = {
                "title": {
                    "text": '发送速率'+$filter("kdMemory")(panelMes["overview"]["txRate"]),
                    "textStyle":{
                        "fontSize":14,
                        "fontFamily":"Microsoft YaHei",
                        "lineHeight":14,
                        "default":"normal"
                    }
                },
                "tooltip": {
                    "trigger": 'axis',
                    "formatter": function (params) {
                        params = params[0];
                        return params["name"]+'<br/>'+params["seriesName"]+" : "+$filter("kdMemory")(params["data"]);
                    },
                },
                "xAxis": {
                    "type": 'category',
                    "data":xdata
                },
                "yAxis": {
                    "type": 'value',
                    "splitLine": {
                        "show": false
                    },
                    "show":false
                },
                "series": [{
                    "name": '发送速率',
                    "type": 'line',
                    "smooth": true,
                    "data":txdata,
                    "itemStyle":{  
                        "normal":{  
                            "color":'green',  
                            "lineStyle":{  
                                "color":'green'  
                            }  
                        }  
                    },  
                }]
            };
            rxnetchart["setOption"](rxoption);
            txnetchart["setOption"](txoption);
            //myChart["setOption"](cpuoption);
            // 使用刚指定的配置项和数据显示图表。
            //chart1["setOption"](memoption);
            window.onresize = function() {
                myChart["resize"]();
                chart1["resize"]();
                fschart["resize"]();
                rxnetchart["resize"]();
                txnetchart["resize"]();
            };
            let countRate = (data) =>{
                cpuusage = 0;
                memusage = 0;
                for(let i = 0 ; i <data["MonMAry"].length ; i ++){
                    cpuusage += data["MonMAry"][i]["CpuMem"]["Cpu"]["Id"] - 0;
                    memusage += data["MonMAry"][i]["CpuMem"]["Mem"]["Used"]/data["MonMAry"][i]["CpuMem"]["Mem"]["Total"];
                }
                cpuusage = 100 - cpuusage /data["MonMAry"].length;
                cpuusage = cpuusage.toFixed(1);
                memusage = 100*memusage/data["MonMAry"].length;
                memusage = memusage.toFixed(1);
            }
            var fsoption ;
            //countRate({"MonMAry":[{"CephIn":{"Kb":17303445720,"Kb_used":1384464,"Kb_avail":16422680976,"Num_objects":0},"DiskIn":[{"Name":"sda","Type":"HDD","Good":"OK","Parts":[{"Name":"sda1","Usage":"1%"}]},{"Name":"sdb","Type":"HDD","Good":"OK","Parts":[{"Name":"sdb1","Usage":"1%"}]},{"Name":"sdc","Type":"HDD","Good":"OK","Parts":[{"Name":"sdc1","Usage":"1%"}]},{"Name":"sdd","Type":"HDD","Good":"OK","Parts":[{"Name":"sdd1","Usage":"1%"}]},{"Name":"sde","Type":"HDD","Good":"OK","Parts":[{"Name":"sde1","Usage":"1%"}]},{"Name":"sdf","Type":"HDD","Good":"OK","Parts":[{"Name":"sdf1","Usage":"1%"}]},{"Name":"sdg","Type":"SSD","Good":"OK","Parts":null},{"Name":"sdh","Type":"SSD","Good":"OK","Parts":null},{"Name":"sdi","Type":"HDD","Good":"OK","Parts":[{"Name":"sdi1","Usage":"25%"},{"Name":"sdi2","Usage":"2%"},{"Name":"sdi6","Usage":"28%"}]}],"CpuMem":{"Cpu":{"Us":"0.7","Sy":"0.3","Ni":"0.0","Id":"98.0","Wa":"1.0","Hi":"0.0","Si":"0.0","St":"0.0"},"Mem":{"Total":"32895168","Free":"21743664","Used":"1216948","BuffCache":"9934556"}},"Good":"OK","TimeStamp":"2017-12-06T17:21:12.34297324+08:00","Hostname":"node2"},{"CephIn":{"Kb":17303445720,"Kb_used":1384464,"Kb_avail":16422680976,"Num_objects":0},"DiskIn":[{"Name":"sda","Type":"HDD","Good":"OK","Parts":[{"Name":"sda1","Usage":"1%"}]},{"Name":"sdb","Type":"HDD","Good":"OK","Parts":[{"Name":"sdb1","Usage":"1%"}]},{"Name":"sdc","Type":"HDD","Good":"OK","Parts":[{"Name":"sdc1","Usage":"1%"}]},{"Name":"sdd","Type":"HDD","Good":"OK","Parts":[{"Name":"sdd1","Usage":"1%"}]},{"Name":"sde","Type":"HDD","Good":"OK","Parts":[{"Name":"sde1","Usage":"1%"}]},{"Name":"sdf","Type":"HDD","Good":"OK","Parts":[{"Name":"sdf1","Usage":"1%"}]},{"Name":"sdg","Type":"SSD","Good":"OK","Parts":null},{"Name":"sdh","Type":"SSD","Good":"OK","Parts":null},{"Name":"sdi","Type":"HDD","Good":"WARNING","Parts":[{"Name":"sdi1","Usage":"25%"},{"Name":"sdi2","Usage":"2%"},{"Name":"sdi6","Usage":"28%"}]}],"CpuMem":{"Cpu":{"Us":"0.7","Sy":"0.3","Ni":"0.0","Id":"97.7","Wa":"1.2","Hi":"0.0","Si":"0.0","St":"0.0"},"Mem":{"Total":"32895168","Free":"21843500","Used":"1123716","BuffCache":"9927952"}},"Good":"OK","TimeStamp":"2017-12-06T17:21:09.97829168+08:00","Hostname":"node3"},{"CephIn":{"Kb":17303445720,"Kb_used":1384464,"Kb_avail":16422680976,"Num_objects":0},"DiskIn":[{"Name":"sda","Type":"HDD","Good":"OK","Parts":[{"Name":"sda1","Usage":"1%"}]},{"Name":"sdb","Type":"HDD","Good":"OK","Parts":[{"Name":"sdb1","Usage":"1%"}]},{"Name":"sdc","Type":"HDD","Good":"OK","Parts":[{"Name":"sdc1","Usage":"1%"}]},{"Name":"sdd","Type":"HDD","Good":"OK","Parts":[{"Name":"sdd1","Usage":"1%"}]},{"Name":"sde","Type":"HDD","Good":"OK","Parts":[{"Name":"sde1","Usage":"1%"}]},{"Name":"sdf","Type":"HDD","Good":"OK","Parts":[{"Name":"sdf1","Usage":"1%"}]},{"Name":"sdg","Type":"SSD","Good":"OK","Parts":null},{"Name":"sdh","Type":"SSD","Good":"OK","Parts":null},{"Name":"sdi","Type":"HDD","Good":"WARNING","Parts":[{"Name":"sdi1","Usage":"25%"},{"Name":"sdi2","Usage":"2%"},{"Name":"sdi6","Usage":"28%"}]}],"CpuMem":{"Cpu":{"Us":"1.5","Sy":"0.6","Ni":"0.0","Id":"96.8","Wa":"1.0","Hi":"0.0","Si":"0.0","St":"0.0"},"Mem":{"Total":"32895168","Free":"16243300","Used":"1182580","BuffCache":"15469288"}},"Good":"OK","TimeStamp":"2017-12-06T17:21:05.70934094+08:00","Hostname":"node1"}]});
            //cpuoption["series"][0]["data"][0].value = cpuusage;
            //myChart["setOption"](cpuoption);
            //console.log(cpuoption);
            //memoption["series"][0]["data"][0].value = memusage;
            //chart1["setOption"](memoption);
            //console.log(memoption);     
            $resource('fsmon').get().$promise.then(function(data){
                countRate(data);
                cpuoption["series"][0]["data"][0].value = cpuusage;
                memoption["series"][0]["data"][0].value = memusage;
                myChart["setOption"](cpuoption);
                chart1["setOption"](memoption);
                panelMes["overview"]["fsUsage"] = data["MonMAry"][0]["CephIn"]["Kb_used"]/data["MonMAry"][0]["CephIn"]["Kb"];
                let fsusage = panelMes["overview"]["fsUsage"]*100;
                fsusage = fsusage.toFixed(1);
                fsoption = {
                    "tooltip": {
                        "formatter": "{a} <br/>{b} : {c}%"
                    },
                    "series": [{
                        "name": '存储',
                        "type": 'gauge',
                        "detail": { "formatter": '{value}%' },
                        "data": [{ value: fsusage, name: '存储占比' }],
                        "splitLine":{
                            "show":false
                        },
                        "axisLine":{
                            "show":false,
                            "lineStyle":{
                                "width":10
                            }
                        },
                        "axisTick":{
                            "show":false
                        },
                        "axisLabel":{
                            "show":false
                        },
                        "title":{
                            "fontSize":16,
                            "show":false
                        }
                    }]
                }; 
                fschart["setOption"](fsoption);
            });
            var intervalReq = $interval(function(){
                $resource('fsmon').get().$promise.then(function(data){
                    countRate(data);
                    cpuoption["series"][0]["data"][0].value = cpuusage;
                    memoption["series"][0]["data"][0].value = memusage;
                    myChart["setOption"](cpuoption);
                    chart1["setOption"](memoption);
                    let fsusage1 = data["MonMAry"][0]["CephIn"]["Kb_used"]/data["MonMAry"][0]["CephIn"]["Kb"]*100;
                    fsusage1 = fsusage1.toFixed(1);
                    fsoption["series"][0]["data"][0].value = fsusage1;
                    fschart["setOption"](fsoption);
                });
                let query = kdPaginationService.getDefaultResourceQuery($stateParams.namespace);
                kdPanelResource.get(query).$promise.then(function(data){
                    self.nodelist = data["nodeDetailList"];
                    self.deployment = data.deploymentList.deployments;
                    self.overview = data.overview;
                    //let memusage1 = data.overview["memUsage"]*100;
                    //memusage1 = memusage1.toFixed(1);
                    //memoption["series"][0]["data"][0].value = memusage1;
                    //chart1["setOption"](memoption);
                    //let cpuusage1 = data.overview["cpuUsage"]*100;
                    //cpuusage1 = cpuusage1.toFixed(1);
                    //cpuoption["series"][0]["data"][0].value = cpuusage1;
                    //myChart["setOption"](cpuoption);
                    // let now = new Date();
                    // let currentData = {
                    //     name: now.toString(),
                    //     value: [
                    //         [now.getFullYear(), now.getMonth() + 1, now.getDate()].join('/'),
                    //         $filter("kdMemory")(data.overview["rxRate"])
                    //     ]
                    // };
                    // if(rxdata.length>9){
                        rxdata.shift();
                        txdata.shift();
                        xdata.shift();
                    // }else{
                        rxdata.push(data.overview["rxRate"]);
                        txdata.push(data.overview["txRate"]);
                        xdata.push(new Date().toTimeString().substring(0,8));
                    // };
                    // console.log(rxdata);
                    rxnetchart["setOption"]({
                        "title":{
                            "text":'接收速率'+$filter("kdMemory")(data["overview"]["rxRate"])
                        },
                        "xAxis": {
                            "type": 'category',
                            "data": xdata
                        },
                        "series": [{
                            "data": rxdata
                        }]
                    });
                    txnetchart["setOption"]({
                        "title":{
                            "text":'发送速率'+$filter("kdMemory")(data["overview"]["txRate"])
                        },
                        "xAxis": {
                            "type": 'category',
                            "data": xdata
                        },
                        "series": [{
                            "data": txdata
                        }]
                    });
                    for(var i = 0 ;i <data["nodeDetailList"].length;i++){
			            var change = window["$"]('.warning div');
                        if(data["nodeDetailList"][i]["conditions"][data["nodeDetailList"][i]["conditions"].length-1].status!="True"){
                            self.NodeHealth = false;
                            change.eq(0).text('1');
                            change.eq(2).text(data["nodeDetailList"][i]["objectMeta"]["name"]+'机器发生故障');
                            break;
                        }
                        //if(data["nodeDetailList"][i].allocatedResources.cpuLimitsFraction>=90||data["nodeDetailList"][i].allocatedResources.cpuRequestsFraction>=90||data["nodeDetailList"][i].allocatedResources.memoryLimitsFraction>=90||data["nodeDetailList"][i].allocatedResources.memoryRequestsFraction>=90||(data["nodeDetailList"][i].allocatedPods/data["nodeDetailList"][i].podCapacity)*100>=90){
                        //    self.NodeHealth = false;
                        //    break;
                        //};
			            change.eq(0).text('0');
			            change.eq(2).text('暂无警告');
                        self.NodeHealth = true;
                    }
                    let count1 = 0;
                    for(var i = 0 ;i <data["deploymentList"]["deployments"].length;i++){
                        count1 += self.deployment[i]["pods"]["desired"];
                        if(data["deploymentList"]["deployments"][i].pods.running<data["deploymentList"]["deployments"][i].pods.desired){
                            self.ReleaseHealth = false;
                            break;
                        };
                        self.ReleaseHealth = true;
                    }
                    self.podcount = count1;
                });
            },5000);
            $scope.$on('$destroy',function(){
                if(intervalReq)
                    $interval.cancel(intervalReq);   
            });

        }
        /**
         * @export	
         */
    getColor(percent) {
            if (percent < 50) {
                return 'green';
            } else if (percent < 90) {
                return 'orange';
            } else {
                return 'red';
            }
        }
        /**
         * @export
         * @param  {string} creationDate - creation date of the deployment
         * @return {string} localized tooltip with the formatted creation date
         */
    getCreatedAtTooltip(creationDate) {
            let filter = this.interpolate_(`{{date | date}}`);
            /** @type {string} @desc Tooltip 'Created at [some date]' showing the exact creation time of
             * a deployment. */
            let MSG_HOMEDEPLOYMENT_LIST_CREATED_AT_TOOLTIP =
                goog.getMsg('Created at {$creationDate}', { 'creationDate': filter({ 'date': creationDate }) });
            return MSG_HOMEDEPLOYMENT_LIST_CREATED_AT_TOOLTIP;
        }
        /**
         * Returns true if any of replica set pods has warning, false otherwise
         * @return {boolean}
         * @export
         */
    hasWarnings(str) {
        return str.pods.warnings.length > 0;
    }

    /**
     * Returns true if replica set pods have no warnings and there is at least one pod
     * in pending state, false otherwise
     * @return {boolean}
     * @export
     */
    isPending(str) {
        return !this.hasWarnings(str) && str.pods.pending > 0;
    }

    /**
     * @return {boolean}
     * @export
     */
    isSuccess(str) {
            return !this.isPending(str) && !this.hasWarnings(str);
        }
        /**
         * @export
         */
    areMultipleNamespacesSelected() {
            return this.kdNamespaceService_.areMultipleNamespacesSelected();
        }
        /**
         * @export
         */
    podIsPending(str) {
        // podPhase should be Pending if init containers are running but we are being extra thorough.
        return str.podStatus.status === 'pending';
    }

    /**
     * @export
     */
    podIsSuccess(str) {
        return str.podStatus.status === 'success';
    }

    /**
     * @export
     */
    podIsFailed(str) {
            return str.podStatus.status === 'failed';
        }
        /**
         * @export
         */
    hasPodMemoryUsage(str) {
        return !!str && !!str.metrics && !!str.metrics.memoryUsageHistory &&
            str.metrics.memoryUsageHistory.length > 0;
    }

    /**
     * @export
     */
    hasPodCpuUsage(str) {
            return !!str && !!str.metrics && !!str.metrics.cpuUsageHistory &&
                str.metrics.cpuUsageHistory.length > 0;
        }
        /**
         * @export
         */
    showPodMetrics() {
            if (this.pod && this.pod.length > 0) {
                let firstPod = this.pod[0];
                return !!firstPod.metrics;
            }
            return false;
        }
        /**
         * Returns a displayable status message for the pod.
         * @return {string}
         * @export
         */
    getPodDisplayStatus(str) {
            // See kubectl resource_printer.go for logic in kubectl.
            // https://github.com/kubernetes/kubernetes/blob/master/pkg/kubectl/resource_printer.go

            let msgState = 'running';
            let reason = undefined;

            // NOTE: Init container statuses are currently not taken into account.
            // However, init containers with errors will still show as failed because
            // of warnings.
            if (str.podStatus.containerStates) {
                // Container states array may be null when no containers have
                // started yet.

                for (let i = str.podStatus.containerStates.length - 1; i >= 0; i--) {
                    let state = str.podStatus.containerStates[i];

                    if (state.waiting) {
                        msgState = 'waiting';
                        reason = state.waiting.reason;
                    }
                    if (state.terminated) {
                        msgState = 'terminated';
                        reason = state.terminated.reason;
                        if (!reason) {
                            if (state.terminated.signal) {
                                reason = 'Signal:${state.terminated.signal}';
                            } else {
                                reason = 'ExitCode:${state.terminated.exitCode}';
                            }
                        }
                    }
                }
            }

            /** @type {string} @desc Status message showing a waiting status with [reason].*/
            let MSG_HOMEPOD_LIST_POD_WAITING_STATUS = goog.getMsg('Waiting: {$reason}', { 'reason': reason });
            /** @type {string} @desc Status message showing a terminated status with [reason].*/
            let MSG_HOMEPOD_LIST_POD_TERMINATED_STATUS =
                goog.getMsg('Terminated: {$reason}', { 'reason': reason });

            if (msgState === 'waiting') {
                return MSG_HOMEPOD_LIST_POD_WAITING_STATUS;
            }
            if (msgState === 'terminated') {
                return MSG_HOMEPOD_LIST_POD_TERMINATED_STATUS;
            }
            return str.podStatus.podPhase;
        }
        /**
         * @export
         */
    showpod(name,namespace) {
        this.pod = [];
        this.podeName = name;
        let self = this;
        let query = this.kdPaginationService_.getDefaultResourceQuery(namespace);
        let nodePodMes = this.resource_('api/v1/deployment/:namespace/'+name).get(query).$promise;
        nodePodMes.then(function(data){
            self.pod = data.podList.pods;
            self.podboxShow = true;
        });
    }
    /**
     * @export
     */
    isNodeHealth(value){
        // if(value.length){
        //     for(var i = 0 ;i <value.length;i++){
        //         if(value[i].allocatedResources.cpuLimitsFraction>=90||value[i].allocatedResources.cpuRequestsFraction>=90||value[i].allocatedResources.memoryLimitsFraction>=90||value[i].allocatedResources.memoryRequestsFraction>=90||(value[i].allocatedPods/value[i].podCapacity)*100>=90){
        //             return false;
        //         }else{
        //             return true;
        //         }
        //     }
        // }
    }
    /**
     * function for gaojing
     */
    isReleaseHealth(value){
        // if(value.length){
        //     for(var i = 0 ;i <value.length;i++){
        //         if(value[i].pods.pending<value[i].pods.desired){
        //             return false;
        //         }else{
        //             return true;
        //         }
        //     }
        // }
    }
}
