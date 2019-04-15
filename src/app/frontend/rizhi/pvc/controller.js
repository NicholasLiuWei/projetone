export class pvcController {
    /**
     * @ngInject
     */
    constructor($resource) {

            /** @export */
            this.resource = $resource;

            this.data = [];
            this.sCurrentIndexArr = "k8s-kubelet-*";
            this.aIndexArr = [];
            this.oStartDate = new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 30);
            this.oEndDate = new Date();
        }
        /**
         * @export
         */
    getIndex() {
        let resource = this.resource('logs/index_patterns/_search');
        resource.get((res) => {
            this.aIndexArr = res['hits']['hits'];
            console.log(this.aIndexArr);
        }, (err) => {
            console.log(err)
        })
    }

    /**
     * @export
     */
    getData() {
        // reqdata = {
        //     "version": true,
        //     "size": 20,
        //     "sort": [
        //         { "@timestamp": {
        //             "order": "desc",
        //             "unmapped_type": "boolean"
        //             } 
        //         } 
        //     ], 
        //     "query": {
        //         "bool": {
        //             "must": [ 
        //                 { "match_all": {} },
        //                 { "range": {
        //                     "@timestamp": {
        //                         "gte": this.dateRange[0].getTime(),    //查询范围开始时间（ms） 
        //                         "lte": this.dateRange[1].getTime(),    //查询范围结束时间（ms） 
        //                         "format": "epoch_millis" 
        //                     } 
        //                 }} 
        //             ] 
        //         } 
        //     }, 
        //     // "stored_fields": [ "*" ], 
        //     "docvalue_fields": [ "@timestamp" ], 
        //     "search_after": this.sSortTimeStamp //#注意此字段的值是前一次查询最后一条记录中“sort”的值 
        // };
        // this.sSortTimeStamp = res.hits.hits[res.hits.hits.length - 1]['sort'];

        let reqdata = {
            "version": true,
            "size": 20,
            "sort": [{
                "@timestamp": {
                    "order": "desc",
                    "unmapped_type": "boolean"
                }
            }],
            "query": {
                "bool": {
                    "must": [
                        { "match_all": {} },
                        {
                            "range": {
                                "@timestamp": {
                                    "gte": this.oStartDate.getTime(),
                                    "lte": this.oEndDate.getTime(),
                                    "format": "epoch_millis"
                                }
                            }
                        }
                    ]
                }
            },
            // "stored_fields": [ "*" ], 
            "docvalue_fields": ["@timestamp"]
        };
        let resource = this.resource(`logs/k8s-kubelet-*/_search`, {}, { save: { method: 'POST' } });
        resource.save(
            reqdata,
            (res) => {
                this.data = res['hits']['hits'];
                console.log(this.data)
            },
            (err) => {
                console.log(err)
            });
    }

    $onInit() {
        this.getIndex();
        this.getData();
    }
}