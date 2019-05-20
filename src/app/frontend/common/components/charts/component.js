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

class chartController {
    /**
     * @param {!angular.JQLite} $element
     * @ngInject
     */

    constructor($element, $filter, $scope, $timeout, $resource) {
        /**
         * Limit of displayed warnings used by default.
         * @export {number}
         */
        this.defaultLimit = 2;
        /**
         * Currently used limit of displayed warnings.
         * @export {number|undefined}
         */
        this.limit = this.defaultLimit;

        /** @private {!angular.JQLite} */
        this.element_ = $element;

        /** @export */
        this.echarts = window["echarts"];

        /** @export */
        this.$ = window["$"];

        /** @export */
        this.$filter = $filter;

        /** @export */
        this.chartresource = [];

        /** @export */
        this.render = {};

        /** @export */
        this.option = {};

        /** @export */
        this.type = "";

        /** @export */
        this.title = "";

        /** @export */
        this.timerange = 0;

        /** @export */
        this.step = 0;

        /** @export */
        this.reqtimerange = 0;

        /** @export */
        this.isChart = false;

        /** @export */
        this.chartRef = {};

        /** @export */
        this.contentTxt = '';

        /** @export */
        this.format = "";

        /** @export */
        this.interval = setInterval(() => {});

        /** @export */
        this.charturl = [];

        /** @export */
        this.$scope = $scope;

        /** @export */
        this.$resource_ = $resource;

        /** @export */
        this.$timeout_ = $timeout;
    }

    $onInit() {
        if (this.type == 'chart' || this.type == 'txt&chart') {
            this.isChart = true;
            angular.element(this.element_[0].children[1]).addClass('aaa');
            this.chartRef = this.echarts["init"](this.element_[0].children[1], 'light');
        }
        this.$scope.$watch(() => this.charturl, (newValue, oldValue) => {
            this.getChartData()
        }, true)
        this.interval = setInterval(() => this.getChartData(), this.reqtimerange * 1000)
    }

    $onDestroy() {
        clearInterval(this.interval)
    }



    // 或取数据
    getChartData() {
        let endtime = Math.round(new Date() / 1000)
        let strtime = endtime - (this.timerange * 60)
        if (this.charturl) { //url格式请求
            this.charturl.forEach((element, index) => {
                this.$resource_(element).get({ start: strtime, end: endtime, step: this.step }).$promise.then(e => {
                    let { data: { result } } = e;
                    // 判断是不是有图表
                    if (this.isChart) {
                        if (this.format == 'dashboard') { //过滤格式为dashboard
                            this.option['series'][index].data = [{ value: (result[0]['values'][0][1] * 100).toFixed(2), name: '占用比例' }]
                        } else if (this.format == 'dashboard_1') { //过滤格式为dashboard
                            if (result[0]['values'][0][1] >= 10) {
                                this.option['series'][index].data = [{ value: Number(result[0]['values'][0][1]).toFixed(0), name: '占用比例' }]
                            } else {
                                this.option['series'][index].data = [{ value: Number(result[0]['values'][0][1]).toFixed(2), name: '占用比例' }]
                            }
                        } else if (this.format == 'GB') { //过滤格式为GB
                            this.option['series'][index].data = result[0]['values'].map(e => ([e[0] * 1000, Math.round(e[1] / (1024 * 1024 * 1024))]))
                        } else if (this.format == 'MB') { //过滤格式为MB
                            this.option['series'][index].data = result[0]['values'].map(e => ([e[0] * 1000, (e[1] / 1024 / 1024).toFixed(2)]))
                        } else if (this.format == 'KB') { //过滤格式为KB
                            this.option['series'][index].data = result[0]['values'].map(e => ([e[0] * 1000, Math.round(e[1] / 1024)]))
                        } else if (this.format == 'dashboard_line') { //过滤格式为dashboard_line
                            this.option['series'][index].data = [{ value: Math.round((result[0]['values'][0][1])), name: '占用比例' }]
                        } else if (this.format == 'latency') { //过滤格式为latency
                            this.option['series'][index].data = result[0]['values'].map(e => ([e[0] * 1000, Math.round(e[1] * 1000)]))
                        } else if (this.format == 'utilizationvariance') { //过滤格式为utilizationvariance
                            this.option['series'][index].data = result[0]['values'].map(e => ([e[0] * 1000, Number(e[1]).toFixed(5)]))
                        } else if (this.format == 'podsusage1') { //过滤格式为podsusage1
                            for (let i in result) {
                                this.option['series'][i] = {
                                    name: result[i]['metric']['pod_name'],
                                    type: 'line',
                                    step: 'middle',
                                    data: result[i]['values'].map(e => ([e[0] * 1000, Number(e[1]).toFixed(3)]))
                                }
                            }
                        } else if (this.format == 'podsusage2') { //过滤格式为podsusage2
                            for (let i in result) {
                                this.option['series'][i] = {
                                    name: result[i]['metric']['pod_name'],
                                    type: 'line',
                                    data: result[i]['values'].map(e => ([e[0] * 1000, (e[1] / 1024 / 1024).toFixed(2)]))
                                }
                            }
                        } else {
                            this.option['series'][index].data = result[0]['values'].map(e => ([e[0] * 1000, e[1]]))
                        }
                        this.chartRef["setOption"](this.option);
                        if (this.type == 'txt&chart') {
                            //有文字也有图表
                            switch (this.format) {
                                case "GB": //过滤格式为GB
                                    this.contentTxt = this.$filter('kdMemory')(result[0]['values'][0][1]);
                                    break;
                                case "MS": //过滤格式为MS
                                    let MS = result[0]['values'].reduce((a, b) => {
                                        return [a[0], Number(a[1]) + Number(b[1])]
                                    });
                                    this.contentTxt = (MS[1] / result[0]['values'].length * 1000).toFixed(3) + ' ms';
                                    break;
                                case "US": //过滤格式为US
                                    let US = result[0]['values'].reduce((a, b) => {
                                        return [a[0], Number(a[1]) + Number(b[1])]
                                    });
                                    this.contentTxt = (US[1] / result[0]['values'].length * 1000000).toFixed(3) + ' μs';
                                    break;
                                default:
                                    this.contentTxt = Math.round(Number(result[0]['values'][0][1])) + '';
                                    break;
                            }
                        }
                    } else {
                        if (!!result.length > 0 && this.format == "healthy") {
                            switch (result[0]['values'][0][1]) {
                                case '0':
                                    this.contentTxt = "HEALTHY";
                                    break;
                                case "1":
                                    this.contentTxt = "WARNING";
                                    break;
                                case "2":
                                    this.contentTxt = "ERROR";
                                    break;
                                default:
                                    this.contentTxt = "N/A";
                                    break;
                            }
                        } else if (!!result.length > 0 && this.format == "up") {
                            if (result[0]['values'][0][1] >= 0 && result[0]['values'][0][1] <= 0.99) {
                                this.contentTxt = "DOWN"
                            } else if (result[0]['values'][0][1] > 0.99 && result[0]['values'][0][1] <= 1) {
                                this.contentTxt = "UP"
                            } else {
                                this.contentTxt = "N/A"
                            }
                        } else if (!!result.length > 0 && this.format == "in") {
                            if (result[0]['values'][0][1] >= 0 && result[0]['values'][0][1] <= 0.99) {
                                this.contentTxt = "OUT"
                            } else if (result[0]['values'][0][1] > 0.99 && result[0]['values'][0][1] <= 1) {
                                this.contentTxt = "IN"
                            } else {
                                this.contentTxt = "N/A"
                            }
                        } else if (!!result.length > 0 && this.format == "text") {
                            this.contentTxt = result[0]['values'][0][1]
                        } else if (!!result.length > 0 && this.format == "TB") {
                            this.contentTxt = Number(result[0]['values'][0][1] / (1024 * 1024 * 1024 * 1024)).toFixed(2) + "TB";
                        } else if (!!result.length > 0 && this.format == "GB") {
                            this.contentTxt = Number(result[0]['values'][0][1] / (1024 * 1024 * 1024)).toFixed(2) + "GB";
                        } else if (!!result.length > 0 && this.format == "cores") {
                            this.contentTxt = Number(result[0]['values'][0][1]).toFixed(2) + "cores";
                        } else {
                            this.contentTxt = "N/A"
                        }
                    }
                })

            })
        } else { //chartresource请求
            this.chartresource.forEach((element, index) => {
                element.get({ start: strtime, end: endtime, step: this.step }).$promise.then((e) => {
                    let { data: { result } } = e;
                    // 判断是不是有图表
                    if (this.isChart) {
                        if (this.format == 'dashboard') { //过滤格式为dashboard
                            this.option['series'][index].data = [{ value: (result[0]['values'][0][1] * 100).toFixed(2), name: '占用比例' }]
                        } else if (this.format == 'GB') { //过滤格式为GB
                            this.option['series'][index].data = result[0]['values'].map(e => ([e[0] * 1000, Math.round(e[1] / (1024 * 1024 * 1024))]))
                        } else if (this.format == 'KB') { //过滤格式为KB
                            this.option['series'][index].data = result[0]['values'].map(e => ([e[0] * 1000, Math.round(e[1] / 1024)]))
                        } else {
                            console.log(result[0]['values'])
                            this.option['series'][index].data = result[0]['values'].map(e => ([e[0] * 1000, e[1]]))
                        }
                        this.chartRef["setOption"](this.option);
                        if (this.type == 'txt&chart') { //有文字也有图表
                            switch (this.format) {
                                case "GB": //过滤格式为GB
                                    this.contentTxt = this.$filter('kdMemory')(result[0]['values'][0][1]);
                                    break;
                                case "MS": //过滤格式为MS
                                    let MS = result[0]['values'].reduce((a, b) => {
                                        return [a[0], Number(a[1]) + Number(b[1])]
                                    });
                                    this.contentTxt = (MS[1] / result[0]['values'].length * 1000).toFixed(3) + ' ms';
                                    break;
                                case "US": //过滤格式为US
                                    let US = result[0]['values'].reduce((a, b) => {
                                        return [a[0], Number(a[1]) + Number(b[1])]
                                    });
                                    this.contentTxt = (US[1] / result[0]['values'].length * 1000000).toFixed(3) + ' μs';
                                    break;
                                default:
                                    this.contentTxt = Math.round(Number(result[0]['values'][0][1])) + '';
                                    break;
                            }
                        }
                    } else {
                        if (!!result.length > 0 && this.format == "healthy") {
                            switch (result[0]['values'][0][1]) {
                                case '0':
                                    this.contentTxt = "HEALTHY"
                                    break;
                                case "1":
                                    this.contentTxt = "WARNING"
                                    break;
                                case "2":
                                    this.contentTxt = "ERROR"
                                    break;
                                default:
                                    this.contentTxt = "N/A"
                                    break;
                            }
                        } else if (!!result.length > 0 && this.format == "text") {
                            this.contentTxt = result[0]['values'][0][1]
                        } else {
                            this.contentTxt = "N/A"
                        }
                    }
                }, error => {
                    console.log(error)
                })
            });
        }

    }


}





/**
 * @type {!angular.Component}
 */
export const chartComponent = {
    bindings: {
        'render': '<',
        'chartresource': '<',
        'charturl': '=',
        'option': '<',
        'type': '<',
        'title': '<',
        'timerange': '<',
        'step': '<',
        'reqtimerange': '<',
        'format': '<',
    },
    controller: chartController,
    templateUrl: 'common/components/charts/chart.html',
};