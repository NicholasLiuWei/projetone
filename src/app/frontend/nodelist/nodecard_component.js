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

import { GlobalStateParams } from 'common/resource/globalresourcedetail';
import { stateName } from 'nodedetail/nodedetail_state';

/**
 * Controller for the node card.
 *
 * @final
 */
export default class NodeCardController {
    /**
     * @param {!ui.router.$state} $state
     * @param {!md.$dialog} $mdDialog
     * @param {!angular.$interpolate} $interpolate
     * @param {!./nodeDetail_service.nodeDetailService} kdNodeDetailService
     * @ngInject
     */
    constructor($interval, $filter, $timeout, $resource, $state, $interpolate, $rootScope, kdNodeDetailService, $mdDialog) {
            /** @export */
            this.echarts = window["echarts"];
            /** @export */
            this.$ = window["$"];
            /** @export */
            this.$filter = $filter;
            /** @private {!ui.router.$state} */
            this.state_ = $state;

            /** @private */
            this.interpolate_ = $interpolate;

            /** @export */
            this.resource_ = $resource;

            /** @private {!angular.$timeout} */
            this.timeout_ = $timeout;

            /** @export */
            this.mdDialog_ = $mdDialog;

            /** @export */
            this.rootScope_ = $rootScope;

            /** @export */
            this.i18n = i18n;

            /** @private {!angular.$interval} */
            this.interval_ = $interval;

            /**
             * Initialized from the scope.
             * @export {!backendApi.Node}
             */
            this.node;

            /** @export {string} */
            this.index;
            /** @export */
            this.statusCodes = {
                1: this.i18n.MSG_nodecard_status_GOOD,
                2: this.i18n.MSG_nodecard_status_ERROE,
            };
        }
        /**
         * @export
         */
    request() {
            // console.log(this);
            let tubiao = this.resource_(`api/v1/baseinfo/${this.node.objectMeta.name}`);
            tubiao.get().$promise.then(function(data) {
                this.rootScope_.loading = false;
                // let which = 0;
                // for (let i = 0; i < data["metrics"]["MetricsList"].length; i++) {
                //     if (data["metrics"]["MetricsList"][i]["Name"] === this.node.objectMeta.name) {
                //         which = i;
                //     }
                // }
                this.rootScope_.nodedetail['detail'] = JSON.parse(JSON.stringify(data));
                if (this.rootScope_.nodedetail['detail']['baseinfo']) {
                    delete this.rootScope_.nodedetail['detail']['baseinfo']
                }
                // console.log(data);
                window.onresize = function() {
                    cpuuse["resize"]();
                    memuse["resize"]();
                    net["resize"]();
                };
                let cpuoption = {
                    "color": ['#6CB9FF'],
                    "backgroundColor": {
                        "type": 'linear',
                        "x": 0,
                        "y": 0,
                        "x2": 0,
                        "y2": 1,
                        "colorStops": [{
                                "offset": 0,
                                "color": '#F9F9F9' // 0% 处的颜色
                            }, {
                                "offset": 0.9,
                                "color": '#F9F9F9' // 100% 处的颜色
                            },
                            {
                                "offset": 0.9,
                                "color": '#FFFFFF' // 100% 处的颜色
                            },
                            {
                                "offset": 1,
                                "color": '#FFFFFF' // 100% 处的颜色
                            }
                        ],
                        "globalCoord": false // 缺省为 false
                    },
                    "tooltip": {
                        "trigger": 'axis',
                        "formatter": (params) => {
                            var html = '';
                            html += params[0]["axisValueLabel"];
                            html += '<br/>';
                            html += params[0]["seriesName"] + ' : ' + params[0].value[1] + '%';
                            return html;
                        }
                    },
                    "grid": {
                        "left": '0',
                        "right": '0',
                        "top": '0',
                        "bottom": '30'
                    },
                    "xAxis": {
                        "type": 'time',
                        "splitLine": {
                            "show": true,
                            "lineStyle": {
                                // 使用深浅的间隔色
                                "color": ['rgba(150,150,150,0.14)']
                            },
                        },
                        "axisLine": {
                            "lineStyle": {
                                "color": '#9B9B9B'
                            }
                        },
                        "axisTick": {
                            "inside": true,
                            "lineStyle": {
                                "color": '#9B9B9B',
                            },
                        },
                        "axisLabel": {
                            "formatter": function(params) {
                                return new Date(params).toTimeString().substring(0, 5);
                            },
                            "color": '#808080'
                        }
                    },
                    "yAxis": {
                        "type": 'value',
                        "show": false,
                        "max": 100,
                    },
                    "series": [{
                        "name": data["baseinfo"]["cpu"][0]["metric"]["instance"],
                        "data": data["baseinfo"]["cpu"][0]["values"].map(function(item) {
                            return [item[0] * 1000, (100 * (item[1] - 0)).toFixed(3)];
                        }),
                        "showSymbol": false,
                        "type": 'line',
                        "smooth": true,
                        "lineStyle": {
                            "color": "#6CB9FF",
                            "width": '3',
                        },
                        "areaStyle": {
                            "color": 'rgba(163,232,220,0.70)',
                        },
                    }],
                };
                let cpuuse = this.echarts["init"](this.$('.nidetailCPU').get(0));
                cpuuse["setOption"](cpuoption);
                //内存
                let memoption = {
                    "color": ['#7ED321'],
                    "backgroundColor": {
                        "type": 'linear',
                        "x": 0,
                        "y": 0,
                        "x2": 0,
                        "y2": 1,
                        "colorStops": [{
                                "offset": 0,
                                "color": '#F9F9F9' // 0% 处的颜色
                            }, {
                                "offset": 0.9,
                                "color": '#F9F9F9' // 100% 处的颜色
                            },
                            {
                                "offset": 0.9,
                                "color": '#FFFFFF' // 100% 处的颜色
                            },
                            {
                                "offset": 1,
                                "color": '#FFFFFF' // 100% 处的颜色
                            }
                        ],
                        "globalCoord": false // 缺省为 false
                    },
                    "tooltip": {
                        "trigger": 'axis',
                        "formatter": (params) => {
                            var html = '';
                            html += params[0]["axisValueLabel"];
                            html += '<br/>';
                            html += params[0]["seriesName"] + ' : ' + params[0].value[1] + '%';
                            return html;
                        }
                    },
                    "grid": {
                        "left": '0',
                        "right": '0',
                        "top": '0',
                        "bottom": '30'
                    },
                    "xAxis": {
                        "type": 'time',
                        "splitLine": {
                            "show": true,
                            "lineStyle": {
                                // 使用深浅的间隔色
                                "color": ['rgba(150,150,150,0.14)']
                            },
                        },
                        "axisLine": {
                            "lineStyle": {
                                "color": '#9B9B9B'
                            }
                        },
                        "axisTick": {
                            "inside": true,
                            "lineStyle": {
                                "color": '#9B9B9B',
                            },
                        },
                        "axisLabel": {
                            "formatter": function(params) {
                                return new Date(params).toTimeString().substring(0, 5);
                            },
                            "color": '#808080'
                        }
                    },
                    "yAxis": {
                        "type": 'value',
                        "show": false,
                        "max": 100,
                    },
                    "series": [{
                        "name": data["baseinfo"]["memory"][0]["metric"]["instance"],
                        "data": data["baseinfo"]["memory"][0]["values"].map(function(item) {
                            return [item[0] * 1000, (item[1] - 0).toFixed(3)];
                        }),
                        "showSymbol": false,
                        "type": 'line',
                        "smooth": true,
                        "lineStyle": {
                            "color": "#7ED321",
                            "width": '3',
                        },
                        "areaStyle": {
                            "color": 'rgba(216,237,193,0.57)',
                        },
                    }],
                };
                let memuse = this.echarts["init"](this.$('.nidetailMem').get(0));
                memuse["setOption"](memoption);
                //网络
                let netoption = {
                    "color": ['#F6A623', '#84BAE7'],
                    "backgroundColor": {
                        "type": 'linear',
                        "x": 0,
                        "y": 0,
                        "x2": 0,
                        "y2": 1,
                        "colorStops": [{
                                "offset": 0,
                                "color": '#F9F9F9' // 0% 处的颜色
                            }, {
                                "offset": 0.9,
                                "color": '#F9F9F9' // 100% 处的颜色
                            },
                            {
                                "offset": 0.9,
                                "color": '#FFFFFF' // 100% 处的颜色
                            },
                            {
                                "offset": 1,
                                "color": '#FFFFFF' // 100% 处的颜色
                            }
                        ],
                        "globalCoord": false // 缺省为 false
                    },
                    "tooltip": {
                        "trigger": 'axis',
                        "formatter": (params) => {
                            var html = '';
                            html += params[0]["axisValueLabel"];
                            html += '<br/>';
                            html += params[0]["marker"] + params[0]["seriesName"] + ' : ' + this.$filter("kdMemory")(params[0].value[1]);
                            html += '<br/>';
                            html += params[1]["marker"] + params[1]["seriesName"] + ' : ' + this.$filter("kdMemory")(params[1].value[1]);
                            html += '<br/>';
                            html += params[2]["marker"] + params[2]["seriesName"] + ' : ' + this.$filter("kdMemory")(params[2].value[1]);
                            html += '<br/>';
                            html += params[3]["marker"] + params[3]["seriesName"] + ' : ' + this.$filter("kdMemory")(params[3].value[1]);
                            return html;
                        }
                    },
                    "xAxis": {
                        "type": 'time',
                        "splitLine": {
                            "show": true,
                            "lineStyle": {
                                // 使用深浅的间隔色
                                "color": ['rgba(150,150,150,0.14)']
                            },
                        },
                        "axisLine": {
                            "lineStyle": {
                                "color": '#9B9B9B'
                            }
                        },
                        "axisTick": {
                            "inside": true,
                            "lineStyle": {
                                "color": '#9B9B9B',
                            },
                        },
                        "axisLabel": {
                            "formatter": function(params) {
                                return new Date(params).toTimeString().substring(0, 5);
                            },
                            "color": '#808080'
                        }
                    },
                    "yAxis": {
                        "type": 'value',
                        "show": false,
                    },
                    "grid": {
                        "left": '0',
                        "right": '0',
                        "top": '0',
                        "bottom": '30',
                    },
                    "series": [{
                            "name": this.i18n.MSG_nodecard_qianzhao_fasong,
                            "z": 2,
                            "showSymbol": false,
                            "data": data["baseinfo"]["tx1000"]["length"] == 0 ? [] : data["baseinfo"]["tx1000"][0]["values"].map(function(item) {
                                return [item[0] * 1000, item[1]]
                            }),
                            "type": 'line',
                            "smooth": true,
                            "lineStyle": {
                                "width": '3',
                            },
                            "areaStyle": 'rgba(255,221,167,0.62)',
                        },
                        {
                            "name": this.i18n.MSG_nodecard_qianzhao_receive,
                            "z": 1,
                            "showSymbol": false,
                            "data": data["baseinfo"]["rx1000"]["length"] == 0 ? [] : data["baseinfo"]["rx1000"][0]["values"].map(function(item) {
                                return [item[0] * 1000, item[1]]
                            }),
                            "type": 'line',
                            "smooth": true,
                            "lineStyle": {
                                "width": '3',
                            },
                            "areaStyle": 'rgba(165,213,255,0.35)',
                        },
                        {
                            "name": this.i18n.MSG_nodecard_wan_fasong,
                            "z": 4,
                            "showSymbol": false,
                            "data": !data["baseinfo"]["tx10000"] ? data["baseinfo"]["tx1000"][0]["values"].map(function(item) {
                                return [item[0] * 1000, 0]
                            }) : data["baseinfo"]["tx10000"][0]["values"].map(function(item) {
                                return [item[0] * 1000, item[1]]
                            }),
                            "type": 'line',
                            "smooth": true,
                            "lineStyle": {
                                "width": '3',
                            },
                            "areaStyle": 'rgba(255,221,167,0.62)',
                        },
                        {
                            "name": this.i18n.MSG_nodecard_wan_receive,
                            "z": 3,
                            "showSymbol": false,
                            "data": !data["baseinfo"]["rx10000"] ? data["baseinfo"]["tx1000"][0]["values"].map(function(item) {
                                return [item[0] * 1000, 0]
                            }) : data["baseinfo"]["rx10000"][0]["values"].map(function(item) {
                                return [item[0] * 1000, item[1]]
                            }),
                            "type": 'line',
                            "smooth": true,
                            "lineStyle": {
                                "width": '3',
                            },
                            "areaStyle": 'rgba(165,213,255,0.35)',
                        },
                    ]
                };
                let net = this.echarts["init"](this.$('.nidetailNet').get(0));
                net["setOption"](netoption);
            }.bind(this), function() {
                this.rootScope_.loading = false;
                this.rootScope_.show = false;
                if (this.rootScope_.nodedetail['interval']) {
                    this.interval_.cancel(this.rootScope_.nodedetail['interval']);
                }
                alert(this.i18n.MSG_nodecard_request_ERROE);
            }.bind(this));
            // let resource = this.resource_("gethw?host=" + this.node.externalID);
            // resource.get().$promise.then(function(data) {
            //     this.rootScope_.nodedetail['detail'] = data;
            //     this.rootScope_.loading = false;
            // }.bind(this), function() {
            //     this.rootScope_.loading = false;
            //     this.rootScope_.show = false;
            //     if (this.rootScope_.nodedetail['interval']) {
            //         this.interval_.cancel(this.rootScope_.nodedetail['interval']);
            //     }
            //     alert(this.i18n.MSG_nodecard_request_ERROE);
            // }.bind(this));
        }
        /**
         * Returns true if node is in ready state, false otherwise.
         * @export
         */
    isInReadyState() {
        //return this.node.ready === 'True';
        for (let i = 0; i < this.node.conditions.length; i++) {
            if (this.node.conditions[i].type == 'Ready') {
                return this.node.conditions[i].status === 'True';
            }
        }
    }

    /**
     * Returns true if node is in non-ready state, false otherwise.
     * @export
     */
    isInNotReadyState() {
        //return this.node.ready === 'False';
        for (let i = 0; i < this.node.conditions.length; i++) {
            if (this.node.conditions[i].type == 'Ready') {
                return this.node.conditions[i].status === 'False';
            }
        }
    }

    /**
     * Returns true if node is in unknown state, false otherwise.
     * @export
     */
    isInUnknownState() {
            //return this.node.ready === 'Unknown';
            for (let i = 0; i < this.node.conditions.length; i++) {
                if (this.node.conditions[i].type == 'Ready') {
                    return this.node.conditions[i].status === 'Unknown';
                }
            }
        }
        /**
         * @export
         */
    getDetail() {
            this.rootScope_.loading = true;
            this.rootScope_.show = true;
            this.rootScope_.nodedetail['node'] = {
                "name": this.node.objectMeta.name,
                "status": this.isReady(),
                "architecture": this.node.nodeInfo.architecture
            };
            this.request();
            this.rootScope_.nodedetail['interval'] = this.interval_(() => {
                this.request();
            }, 10000);
        }
        /**
         * @export
         */
    isReady() {
        for (let i = 0; i < this.node.conditions.length; i++) {
            if (this.node.conditions[i].type == 'Ready') {
                if (this.node.conditions[i].status === 'True') {
                    return 1;
                } else {
                    return 2;
                }
            }
        }
    }

    /**
     * @return {string}
     * @export
     */
    getNodeDetailHref() {
        return this.state_.href(stateName, new GlobalStateParams(this.node.objectMeta.name));
    }

    /**
     * @export
     * @param  {string} creationDate - creation date of the node
     * @return {string} localized tooltip with the formated creation date
     */
    getCreatedAtTooltip(creationDate) {
            let filter = this.interpolate_(`{{date | date}}`);
            /** @type {string} @desc Tooltip 'Created at [some date]' showing the exact creation time of
             * node. */
            let MSG_NODE_LIST_CREATED_AT_TOOLTIP =
                goog.getMsg('Created at {$creationDate}', { 'creationDate': filter({ 'date': creationDate }) });
            return MSG_NODE_LIST_CREATED_AT_TOOLTIP;
        }
        /**
         * @export
         */
    toggleRight() {
        let resource = this.resource_("gethw?host=" + this.node.externalID);
        resource.get().$promise.then(function(data) {
            this.rootScope_.nodeDetail.detail = data;
        }.bind(this), function(data) {
            this.mdDialog_.show(this.mdDialog_.alert()
                .title('错误')
                .textContent('请求服务器信息错误')
                .ok('关闭'));
        }.bind(this));
    }
}

/**
 * @return {!angular.Component}
 */
export const nodeCardComponent = {
    bindings: {
        'node': '=',
        'index': '=',
    },
    controller: NodeCardController,
    templateUrl: 'nodelist/nodecard.html',
    require: {
        'nodeListCtrl': '^kdNodeCardList',
    },
};
const i18n = {
    /** @export {string} @desc Request server information error */
    MSG_nodecard_request_ERROE: goog.getMsg('请求服务器信息错误,请重试'),
    /** @export {string} @desc Abnormal */
    MSG_nodecard_status_ERROE: goog.getMsg('异常'),
    /** @export {string} @desc Normal */
    MSG_nodecard_status_GOOD: goog.getMsg('正常'),
    /** @export {string} @desc Gigabit receiving */
    MSG_nodecard_qianzhao_receive: goog.getMsg('千兆(应用)接收'),
    /** @export {string} @desc Gigabit send */
    MSG_nodecard_qianzhao_fasong: goog.getMsg('千兆(应用)发送'),
    /** @export {string} @desc 10Gigabit receiving */
    MSG_nodecard_wan_receive: goog.getMsg('万兆(存储)接收'),
    /** @export {string} @desc 10Gigabit send */
    MSG_nodecard_wan_fasong: goog.getMsg('万兆(存储)发送'),
}