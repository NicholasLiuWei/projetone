export class pvcController {
    /**
     * @ngInject
     */
    constructor($resource, toastr) {
        // $mdDateLocaleProvider.months = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
        // $mdDateLocaleProvider.shortMonths = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
        // $mdDateLocaleProvider.days = ['dimanche', 'lundi', 'mardi', ...];

        // $mdDateLocaleProvider.shortDays = ['日', '一', '二', '三', '四', '五', '六'];
        /** @export */
        this.resource = $resource;

        /** @export */
        this.toastr = toastr;

        /** @export */
        this.data = [];

        /** @export */
        this.sCurrentIndexArr = "k8s-kernel-*";

        /** @export */
        this.sSearchIndexArr = "k8s-kernel-*";

        /** @export */
        this.aIndexArr = [];

        /** @export */
        this.reqdata = {
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
                                    "gte": "",
                                    "lte": "",
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

        /** @export */
        // this.sSortTimeStamp = 0;
        this.nSmall = 0;

        /** @export */
        this.oStartDate = new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 30);

        /** @export */
        this.oSearchStartDate = new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 30);

        /** @export */
        this.oEndDate = new Date();

        /** @export */
        this.oSearchEndDate = new Date();

        /** @export */
        this.bSearch = true;

        /** @export */
        this.bSearchLoading = false;

        /** @export */
        this.bLoading = false;

        /** @export */
        this.nDownward = 0;
    }

    /**
     * @export
     */
    getIndex() {
        let resource = this.resource('api/v1/logs/index_patterns/_search');
        resource.get((res) => {
            let aIndexArr = res['hits']['hits'];
            for (let val of aIndexArr) {
                this.aIndexArr.push(val['_source']['name'])
            }
        }, (err) => {
            this.toastr["error"]("请求出错");
        })
    }

    /**
     * @export
     */
    getData(indexArr, startDate, endDate) {
        this.reqdata.query.bool.must[1].range['@timestamp'].gte = startDate.getTime();
        this.reqdata.query.bool.must[1].range['@timestamp'].lte = endDate.getTime();
        if (this.bSearch) {
            if (this.reqdata['search_after']) {
                delete this.reqdata['search_after'];
            }
        } else {
            this.reqdata['search_after'] = this.data[this.data.length - 1]['sort'];
        }
        let reqdata = this.reqdata;
        let requestTimeout = setTimeout(() => {
            if (this.data.length == 0) {
                console.log("请求超时");
            }
        }, 5000)
        let resource = this.resource(`api/v1/logs/${indexArr}/_search`, {}, { save: { method: 'POST' } });
        resource.save(
            reqdata,
            (res) => {
                clearTimeout(requestTimeout);
                this.nSmall = res['hits']['hits'].length;
                if (this.bSearch) {
                    this.data = res['hits']['hits'];
                } else {
                    this.data = this.data.concat(res['hits']['hits']);
                }
                this.bLoading = false;
                this.bSearchLoading = false;
                this.nDownward = 0;
                console.log(this.data)
            },
            (err) => {
                this.toastr["error"]("请求出错");
            });
    }

    /**
     * @export
     */
    fSearchData() {
        this.bSearch = true;
        this.bLoading = false;
        this.bSearchLoading = true;
        this.data = [];
        this.sSearchIndexArr = this.sCurrentIndexArr;
        this.oSearchStartDate = this.oStartDate;
        this.oSearchEndDate = this.oEndDate;
        this.getData(this.sSearchIndexArr, this.oSearchStartDate, this.oSearchEndDate);
    }

    $onInit() {
        this.getIndex();
        this.getData(this.sCurrentIndexArr, this.oSearchStartDate, this.oSearchEndDate);
        let that = this;
        window["$"](".kd-app-content").scroll(function(e) {
            let num = e.currentTarget.scrollHeight - e.currentTarget.clientHeight;
            if (e.currentTarget.scrollTop === num && that.nSmall == '20') {
                that.bSearch = false;
                that.bLoading = true;
                that.nDownward++;
                if (that.nDownward > 1) {
                    return;
                }
                that.getData(that.sSearchIndexArr, that.oSearchStartDate, that.oSearchEndDate);
            }
        })
    }
}