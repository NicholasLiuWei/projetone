export class storageController {
    /**
     * @param {!ui.router.$state} $state
     * @param {!./../common/namespace/namespace_service.NamespaceService} kdNamespaceService
     * @param {!./../common/pagination/pagination_service.PaginationService} kdPaginationService
     * @param {!./../chrome/chrome_state.StateParams} $stateParams
     * @ngInject
     */
    constructor($scope,StorageMes,$interval,$state, $stateParams, kdPaginationService, kdNamespaceService,$resource) {
        /** @private {!ui.router.$state} */
        this.state_ = $state;

        /** @private {!./../common/namespace/namespace_service.NamespaceService} */
        this.kdNamespaceService_ = kdNamespaceService;

        /** @private {!./../common/pagination/pagination_service.PaginationService} kdPaginationService*/
        this.kdPaginationService_ = kdPaginationService;

        /** @private {!./../chrome/chrome_state.StateParams} */
        this.stateParams_ = $stateParams;

        /** @export */
        this.storage = StorageMes["MonMAry"];
        //this.storage = 
//[{"CephIn":{"Kb":11715329460,"Kb_used":2235452,"Kb_avail":11713094008,"Num_objects":384},"DiskIn":[{"Name":"sda","Type":"HDD","Good":"WARNING","Parts":[{"Name":"sda1","Usage":"25%"},{"Name":"sda2","Usage":"1%"},{"Name":"sda4","Usage":"28%"}]},{"Name":"sdb","Type":"HDD","Good":"ERROR","Parts":[{"Name":"sdb1","Usage":"1%"}]},{"Name":"sdc","Type":"SSD","Good":"OK","Parts":null}],"Good":"OK","TimeStamp":"2017-11-29T16:12:29.653558647+08:00","Hostname":"node1"},{"CephIn":{"Kb":11715329460,"Kb_used":2235452,"Kb_avail":11713094008,"Num_objects":384},"DiskIn":[{"Name":"sda","Type":"HDD","Good":"OK","Parts":[{"Name":"sda1","Usage":"25%"},{"Name":"sda2","Usage":"1%"},{"Name":"sda4","Usage":"28%"}]},{"Name":"sdb","Type":"HDD","Good":"PLUGOUT","Parts":[{"Name":"sdb1","Usage":"1%"}]},{"Name":"sdc","Type":"SSD","Good":"OK","Parts":null}],"Good":"OK","TimeStamp":"2017-11-29T16:12:28.04474312+08:00","Hostname":"node2"},{"CephIn":{"Kb":11715329460,"Kb_used":2235452,"Kb_avail":11713094008,"Num_objects":384},"DiskIn":[{"Name":"sda","Type":"HDD","Good":"OK","Parts":[{"Name":"sda1","Usage":"25%"},{"Name":"sda2","Usage":"1%"},{"Name":"sda4","Usage":"28%"}]},{"Name":"sdb","Type":"HDD","Good":"PLUGOUT","Parts":[{"Name":"sdb1","Usage":"1%"}]},{"Name":"sdc","Type":"SSD","Good":"ERROR","Parts":null}],"Good":"ERROR","TimeStamp":"2017-11-29T16:12:19.09089137+08:00","Hostname":"node3"}]
//;
    
        /** @export */
        this.hddCount = 0;

        /** @export */
        this.ssdCount = 0;

        var self = this;
        let count = function(){
	       self.hddCount = 0;
	       self.ssdCount = 0;
            for(let i = 0 ; i<self.storage.length; i++){
                for(let j = 0 ; j<self.storage[i]["DiskIn"].length; j++){
                    if(self.storage[i]["DiskIn"][j]["Type"]=='HDD'){
                        self.hddCount++;
                    }else{
                        self.ssdCount++;
                    }
                }
            }
        }
        count();
        let intervalReq = $interval(function(){
            $resource('fsmon').get().$promise.then(function(data){
                self.storage = data["MonMAry"];
                count();
            });
        },5000);
        $scope.$on('$destroy',function(){
            if(intervalReq)
                $interval.cancel(intervalReq);   
        });
    }
    /**
    * @return {boolean}
    * @export
    */
    shouldShowZeroState() {
        return false;
    }
}
