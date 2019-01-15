/**
 * Controller for the home view. The view shows details about the installation
 * enviornment. The information can be used when creating issues.
 *
 * @final
 */
export class homeController {
    /**
     * @param {!md.$dialog} $mdDialog
     * @param {!./../common/namespace/namespace_service.NamespaceService} kdNamespaceService
     * @param {!./../common/pagination/pagination_service.PaginationService} kdPaginationService
     * @param {!angular.$timeout} $timeout
     * @ngInject
     */
    constructor($interval, $rootScope, kdCephResource, kdFsmonResource, kdPanelResource, kdReleaseResource, $mdDialog, kdNamespaceService, kdPaginationService, $timeout, $filter, $scope, $resource) {
            /** @private {!angular.Scope} */
            this.scope_ = $scope;
            /** @export {!angular.Scope}*/
            this.rootScope_ = $rootScope;
            /** @export */
            this.echarts = window["echarts"];
            /** @export */
            this.$ = window["$"];
            /** @private {!angular.$timeout} */
            this.timeout_ = $timeout;
            /** @private {!angular.$interval} */
            this.interval_ = $interval;
            this.i18n = i18n;
            this.$filter = $filter;
            this.events = [];
            this.kdFsmonResource = kdFsmonResource;
            this.kdPanelResource = kdPanelResource;
            this.kdReleaseResource = kdReleaseResource;
            this.kdCephResource = kdCephResource;
            this.resource_ = $resource;
            /** @export */
            $rootScope.alertsnum = 0;
            /** @export */
            this.cmRate = [0, 100];
            /** @export */
            this.fsmonMes = {};
            /** @export */
            this.panelMes = {};
            /** @export */
            this.statusCodes = {
                8: i18n.MSG_HOME_GOOD_STATUS,
                9: i18n.MSG_HOME_ERROE_STATUS,
            };
            /** @export */
            this.amdnodelist = [];
            /** @export */
            this.armnodelist = [];
            /** @export */
            this.nodelist = {
                "nodes": []
            };
            /** @export */
            this.releaselist = {};
            /** @export */
            this.releasenum = {
                "normal": 0,
                "abnormal": 0,
            };
            /** @export */
            this.nodenum = {
                "amdnormal": 0,
                "amdabnormal": 0,
                "armnormal": 0,
                "armabnormal": 0,
            };
            /** @export */
            this.releasestatus = [{
                "status": "none",
            }, {
                "status": "none",
            }, {
                "status": "none",
            }, {
                "status": "none",
            }, {
                "status": "none",
            }, {
                "status": "none",
            }, {
                "status": "none",
            }, {
                "status": "none",
            }, {
                "status": "none",
            }, {
                "status": "none",
            }, {
                "status": "none",
            }, {
                "status": "none",
            }, {
                "status": "none",
            }, {
                "status": "none",
            }, {
                "status": "none",
            }, {
                "status": "none",
            }, {
                "status": "none",
            }, {
                "status": "none",
            }];
            /** @export */
            this.nodestatus = [{
                "status": "none",
            }, {
                "status": "none",
            }, {
                "status": "none",
            }, {
                "status": "none",
            }, {
                "status": "none",
            }, {
                "status": "none",
            }, {
                "status": "none",
            }, {
                "status": "none",
            }, {
                "status": "none",
            }, {
                "status": "none",
            }, {
                "status": "none",
            }, {
                "status": "none",
            }, {
                "status": "none",
            }, {
                "status": "none",
            }, {
                "status": "none",
            }, {
                "status": "none",
            }, {
                "status": "none",
            }, {
                "status": "none",
            }];
        }
        /**
         * 计算CPU,内存利用率
         */
    countRate(data) {
            let cpuusage = (data["cpuUseRate"] - 0) * 100;
            let memusage = 100 - (data["memoryUseRate"] - 0) * 100;
            // for (let i = 0; i < data["MonMAry"].length; i++) {
            //     cpuusage += data["MonMAry"][i]["CpuMem"]["Cpu"]["Id"] - 0;
            //     memusage += data["MonMAry"][i]["CpuMem"]["Mem"]["Used"] / data["MonMAry"][i]["CpuMem"]["Mem"]["Total"];
            // }
            // cpuusage = 100 - cpuusage / data["MonMAry"].length;
            cpuusage = cpuusage.toFixed(1);
            // memusage = 100 * memusage / data["MonMAry"].length;
            memusage = memusage.toFixed(1);
            return [cpuusage, memusage];
        }
        /** @export */
    $onInit() {
            //格式化CPU 内存 网络速率数据
            let getcpuData = () => {
                //echarts全局颜色设置
                let colors = [{
                    "type": 'linear',
                    "x": 0,
                    "y": 0,
                    "x2": 0,
                    "y2": 1,
                    "colorStops": [{
                        "offset": 0,
                        "color": '#E7FBC4', // 0% 处的颜色
                    }, {
                        "offset": 0.72,
                        "color": 'rgba(219,255,154,0.01)', // 100% 处的颜色
                    }],
                    "globalCoord": false, // 缺省为 false
                }, {
                    "type": 'linear',
                    "x": 0,
                    "y": 0,
                    "x2": 0,
                    "y2": 1,
                    "colorStops": [{
                        "offset": 0,
                        "color": 'rgba(137,197,255,0.53)', // 0% 处的颜色
                    }, {
                        "offset": 0.82,
                        "color": 'rgba(136,197,255,0.01)', // 100% 处的颜色
                    }],
                    "globalCoord": false, // 缺省为 false
                }, {
                    "type": 'linear',
                    "x": 0,
                    "y": 0,
                    "x2": 0,
                    "y2": 1,
                    "colorStops": [{
                        "offset": 0,
                        "color": 'rgba(247,179,64,0.36)', // 0% 处的颜色
                    }, {
                        "offset": 0.6,
                        "color": 'rgba(245,166,35,0.00)', // 100% 处的颜色
                    }],
                    "globalCoord": false, // 缺省为 false
                }];
                //CPU 内存 网络数据
                // for (let i = 0; i < this.panelMes["metrics"]["MetricsList"].length; i++) {
                //CPU
                for (let i = 0; i < this.panelMes["cpu"].length; i++) {
                    // if(this.panelMes["cpu"][i]["metric"]["instance"]!=""){}
                    for (let j = 0; j < this.nodelist["nodes"].length; j++) {
                        if (this.nodelist["nodes"][j]["objectMeta"]["name"] == this.panelMes["cpu"][i]["metric"]["instance"]) {
                            cpuoption["series"][i] = {
                                "name": this.panelMes["cpu"][i]["metric"]["instance"] + "(" + this.nodelist["nodes"][j]["objectMeta"]["labels"]["beta.kubernetes.io/arch"] + ")",
                                "data": this.panelMes["cpu"][i]["values"].map(function(item) {
                                    return [item[0] * 1000, (100 * (item[1] - 0)).toFixed(3)];
                                }),
                                "type": 'line',
                                "z": i,
                                "showSymbol": false,
                                "smooth": true,
                                "lineStyle": {
                                    "width": '3',
                                },
                                "areaStyle": {
                                    "color": colors[i % 3],
                                },
                            };
                            break;
                        }
                    }
                }
                //内存
                for (let i = 0; i < this.panelMes["memory"].length; i++) {
                    for (let j = 0; j < this.nodelist["nodes"].length; j++) {
                        if (this.nodelist["nodes"][j]["objectMeta"]["name"] == this.panelMes["cpu"][i]["metric"]["instance"]) {
                            memoption["series"][i] = {
                                "name": this.panelMes["memory"][i]["metric"]["instance"] + "(" + this.nodelist["nodes"][j]["objectMeta"]["labels"]["beta.kubernetes.io/arch"] + ")",
                                "data": this.panelMes["memory"][i]["values"].map(function(item) {
                                    return [item[0] * 1000, (item[1] - 0).toFixed(3)];
                                }),
                                "type": 'line',
                                "z": i,
                                "showSymbol": false,
                                "smooth": true,
                                "lineStyle": {
                                    "width": '3',
                                },
                                "areaStyle": {
                                    "color": colors[i % 3],
                                },
                            };
                        }
                    }
                }
                //千兆网卡
                for (let i = 0; i < this.panelMes["net1000"].length; i++) {
                    for (let j = 0; j < this.nodelist["nodes"].length; j++) {
                        if (this.nodelist["nodes"][j]["objectMeta"]["name"] == this.panelMes["cpu"][i]["metric"]["instance"]) {
                            qianoption["series"][i] = {
                                "name": this.panelMes["net1000"][i]["metric"]["instance"] + "(" + this.nodelist["nodes"][j]["objectMeta"]["labels"]["beta.kubernetes.io/arch"] + ")",
                                "data": this.panelMes["net1000"][i]["values"].map(function(item) {
                                    return [item[0] * 1000, item[1]];
                                }),
                                "type": 'line',
                                "z": i,
                                "showSymbol": false,
                                "smooth": true,
                                "lineStyle": {
                                    "width": '3',
                                },
                                "areaStyle": {
                                    "color": colors[i % 3],
                                },
                            };
                        }
                    }
                }
                //万兆网卡
                for (let i = 0; i < this.panelMes["net10000"].length; i++) {
                    for (let j = 0; j < this.nodelist["nodes"].length; j++) {
                        if (this.nodelist["nodes"][j]["objectMeta"]["name"] == this.panelMes["cpu"][i]["metric"]["instance"]) {
                            wanoption["series"][i] = {
                                "name": this.panelMes["net10000"][i]["metric"]["instance"] + "(" + this.nodelist["nodes"][j]["objectMeta"]["labels"]["beta.kubernetes.io/arch"] + ")",
                                "data": this.panelMes["net10000"][i]["values"].map(function(item) {
                                    return [item[0] * 1000, item[1]];
                                }),
                                "type": 'line',
                                "z": i,
                                "showSymbol": false,
                                "smooth": true,
                                "lineStyle": {
                                    "width": '3',
                                },
                                "areaStyle": {
                                    "color": colors[i % 3],
                                },
                            };
                        }
                    }
                }
            };
            //echarts CPU配置
            let cpuoption = {
                "color": ['#9CE83D', '#6CB9FF', '#50D3E3'],
                "tooltip": {
                    "trigger": 'axis',
                    "formatter": (params) => {
                        let html = '';
                        html += params[0]["axisValueLabel"];
                        html += '<br/>';
                        for (let i = 0; i < params.length; i++) {
                            html += params[i]["marker"] + params[i]["seriesName"] + ' : ' + params[i].value[1] + '%';
                            i != params.length ? html += '<br/>' : html += '';
                        }
                        return html;
                    }
                },
                "grid": {
                    "top": '20',
                    "left": '40',
                    "right": '40',
                    "bottom": '30',
                },
                "xAxis": {
                    "type": 'time',
                    "splitLine": {
                        "show": false,
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
                    "show": true,
                    "max": 100,
                    "splitNumber": 2,
                    "axisLabel": {
                        "formatter": '{value}%',
                    },
                    "axisTick": {
                        "show": false,
                    },
                    "splitLine": {
                        "show": false,
                    },
                },
                "series": [],
            };
            //echarts 内存配置
            let memoption = {
                "color": ['#9CE83D', '#6CB9FF', '#50D3E3'],
                "tooltip": {
                    "trigger": 'axis',
                    "formatter": (params) => {
                        let html = '';
                        html += params[0]["axisValueLabel"];
                        html += '<br/>';
                        for (let i = 0; i < params.length; i++) {
                            html += params[i]["marker"] + params[i]["seriesName"] + ' : ' + params[i].value[1] + '%';
                            i != params.length ? html += '<br/>' : html += '';
                        }
                        return html;
                    }
                },
                "xAxis": {
                    "type": 'time',
                    "axisLabel": {
                        "formatter": function(params) {
                            return new Date(params).toTimeString().substring(0, 5);
                        },
                        "color": '#808080',
                    },
                    "splitLine": false,
                    "axisLine": {
                        "lineStyle": {
                            "color": '#9B9B9B',
                        },
                    },
                    "axisTick": {
                        "inside": true,
                        "lineStyle": {
                            "color": '#9B9B9B',
                        },
                    }
                },
                "yAxis": {
                    "type": 'value',
                    "max": 100,
                    "axisLabel": {
                        "formatter": '{value}%'
                    },
                    "splitLine": false,
                    "show": true,
                    "splitNumber": 2,
                    "axisTick": {
                        "show": false,
                    },
                },
                "grid": {
                    "top": '20',
                    "left": '40',
                    "right": '40',
                    "bottom": '30'
                },
                "series": []
            };
            //千兆网卡速率
            let qianoption = {
                "color": ['#9CE83D', '#6CB9FF', '#50D3E3'],
                "tooltip": {
                    "trigger": 'axis',
                    "formatter": (params) => {
                        let html = '';
                        html += params[0]["axisValueLabel"];
                        html += '<br/>';
                        for (let i = 0; i < params.length; i++) {
                            html += params[i]["marker"] + params[i]["seriesName"] + ' : ' + this.$filter("kdMemory")(params[i].value[1]);
                            i != params.length ? html += '<br/>' : html += '';
                        }
                        return html;
                    }
                },
                "grid": {
                    "left": '20',
                    "right": '20',
                    "top": '30',
                    "bottom": '30'
                },
                "xAxis": {
                    "type": 'time',
                    "splitLine": false,
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
                    "show": false
                },
                "series": [],
            };
            //万兆网卡速率
            let wanoption = {
                "color": ['#9CE83D', '#6CB9FF', '#50D3E3'],
                "tooltip": {
                    "trigger": 'axis',
                    "formatter": (params) => {
                        let html = '';
                        html += params[0]["axisValueLabel"];
                        html += '<br/>';
                        for (let i = 0; i < params.length; i++) {
                            html += params[i]["marker"] + params[i]["seriesName"] + ' : ' + this.$filter("kdMemory")(params[i].value[1]);
                            i != params.length ? html += '<br/>' : html += '';
                        }
                        return html;
                    },
                },
                "grid": {
                    "left": '20',
                    "right": '20',
                    "top": '30',
                    "bottom": '30'
                },
                "xAxis": {
                    "type": 'time',
                    "splitLine": false,
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
                    "show": false
                },
                "series": [],
            };
            //echarts初始化 画图   CPU 内存 网络   实例
            let cpuuse = this.echarts["init"](this.$('.linebox').get(0));
            let memuse = this.echarts["init"](this.$('.linebox').get(1));
            let receive = this.echarts["init"](this.$('.rec_rate').get(0));
            let send = this.echarts["init"](this.$('.send_rate').get(0));
            //实时获取数据
            let interreq = this.interval_(() => {
                //CPU，内存利用率
                this.kdFsmonResource.get().$promise.then((data) => {
                    // this.fsmonMes = data;
                    // fsusage = this.fsmonMes["MonMAry"][0]["CephIn"]["Stat"]["Kb_used"] / this.fsmonMes["MonMAry"][0]["CephIn"]["Stat"]["Kb"] * 100;
                    // fsusage = fsusage.toFixed(1);
                    // option1['series'][0]['data'][0]['value'] = fsusage;
                    // option1['series'][0]['data'][1]['value'] = 100 - fsusage;
                    // option1['series'][1]['data'][0]['value'] = fsusage;
                    // option1['series'][1]['data'][1]['value'] = 100 - fsusage;
                    // tu1["setOption"](option1);
                    this.cmRate = this.countRate(data);
                }, () => {});
                //存储
                this.kdCephResource.get().$promise.then((data) => {
                    this.fsmonMes = data;
                    fsusage = this.fsmonMes["storageUsed"] / this.fsmonMes["storageTotal"] * 100;
                    fsusage = fsusage.toFixed(1);
                    option1['series'][0]['data'][0]['value'] = fsusage;
                    option1['series'][0]['data'][1]['value'] = 100 - fsusage;
                    option1['series'][1]['data'][0]['value'] = fsusage;
                    option1['series'][1]['data'][1]['value'] = 100 - fsusage;
                    tu1["setOption"](option1);
                }, () => {});
                //CPU 内存  网络
                this.kdPanelResource.get().$promise.then((data) => {
                    this.panelMes = data;
                    //调用格式化数据函数
                    getcpuData();
                    cpuuse["setOption"](cpuoption);
                    memuse["setOption"](memoption);
                    receive["setOption"](qianoption);
                    send["setOption"](wanoption);
                }, () => {});
                //应用
                this.kdReleaseResource.get().$promise.then((data) => {
                    if (data['releases'] == null) {
                        data['releases'] = [];
                        this.releaselist = data;
                    } else {
                        this.releaselist = data;
                    }
                }, () => {});
                //告警数量
                let getWarnCount = this.resource_('alert/alertsnum');
                getWarnCount.get().$promise.then(
                    (data) => {
                        this.rootScope_.alertsnum = data['alertsnum'];
                    },
                    (res) => {
                        // console.log(res);
                    }
                );
                //应用状态
                let getreleasestatus = this.resource_('api/v1/helm/allreleasestatus/default');
                getreleasestatus.get().$promise.then(
                    (data) => {
                        this.releasenum = data;
                        // this.formatstatus('release', [data["normal"], data["abnormal"]]);
                    },
                    (res) => {
                        // console.log(res);
                    }
                );
                //服务器状态
                let getnode = this.resource_('api/v1/node');
                getnode.get().$promise.then(
                    (data) => {
                        this.nodelist = data;
                        this.amdnodelist = [];
                        this.armnodelist = [];
                        let list = [0, 0, 0, 0];
                        for (let i = 0; i < data['nodes'].length; i++) {
                            if (data["nodes"][i]["objectMeta"]["labels"]["beta.kubernetes.io/arch"].indexOf("amd") != -1) {
                                this.amdnodelist[this.amdnodelist.length] = data["nodes"][i];
                            } else {
                                this.armnodelist[this.armnodelist.length] = data["nodes"][i];
                            }
                            if (data['nodes'][i]['ready'] == "True") {
                                if (data["nodes"][i]["objectMeta"]["labels"]["beta.kubernetes.io/arch"].indexOf("amd") != -1) {
                                    list[0]++;
                                } else {
                                    list[2]++;
                                }
                            } else {
                                if (data["nodes"][i]["objectMeta"]["labels"]["beta.kubernetes.io/arch"].indexOf("amd") != -1) {
                                    list[1]++;
                                } else {
                                    list[3]++;
                                }
                            }
                        }
                        this.nodenum["amdnormal"] = list[0];
                        this.nodenum["amdabnormal"] = list[1];
                        this.nodenum["armnormal"] = list[2];
                        this.nodenum["armabnormal"] = list[3];
                        // this.formatstatus('node', list);
                    },
                    (res) => {
                        // console.log(res);
                    }
                );
            }, 10000);
            //echarts 存储配置
            let fsusage = 0;
            let option1 = {
                "color": ['#7ED321', '#E3E3EA'],
                "series": [{
                        "name": '存储使用率',
                        "type": 'pie',
                        "radius": ['90%', '100%'],
                        "avoidLabelOverlap": false,
                        "hoverAnimation": false,
                        "label": {
                            "show": true,
                            "position": 'center',
                            "formatter": () => {
                                /** @type {string} @desc dashboard存储使用率 */
                                let MSG_HOME_STORAGE_RATE = goog.getMsg('Storage Rate');
                                return '{a|' + fsusage + '%}\n{b|' + MSG_HOME_STORAGE_RATE + '}';
                            },
                            "rich": {
                                "a": {
                                    "fontSize": 45,
                                    "color": '#78869C'
                                },
                                "b": {
                                    "fontSize": 18,
                                    "color": '#78869C'
                                },
                            }
                        },
                        "labelLine": {
                            "normal": {
                                "show": false
                            }
                        },
                        "data": [{
                                "value": fsusage,
                                "name": '直接访问',
                                "itemStyle": {
                                    "emphasis": { color: '#7ED321' }
                                }
                            },
                            {
                                "value": 100 - fsusage,
                                "name": '邮件营销',
                                "itemStyle": {
                                    "opacity": 0
                                }
                            },
                        ]
                    },
                    {
                        "name": '存储使用率',
                        "type": 'pie',
                        "radius": ['92%', '98%'],
                        "avoidLabelOverlap": false,
                        "hoverAnimation": false,
                        "label": {
                            "normal": {
                                "show": false,
                                "position": 'center'
                            },
                            "emphasis": {
                                "show": false,
                                "textStyle": {
                                    "fontSize": '30',
                                    "fontWeight": 'bold'
                                }
                            }
                        },
                        "labelLine": {
                            "normal": {
                                "show": false
                            }
                        },
                        "data": [{
                                "value": fsusage,
                                "name": '直接访问',
                                "itemStyle": {
                                    "opacity": 0
                                }
                            },
                            {
                                "value": 100 - fsusage,
                                "name": '邮件营销'
                            },
                        ]
                    }
                ]
            };
            //echarts 存储画图
            let tu1 = this.echarts["init"](this.$('.storageusetu').get(0));
            //CPU,内存使用率
            this.kdFsmonResource.get().$promise.then((data) => {
                this.cmRate = this.countRate(data);
            }, () => {});
            //存储
            this.kdCephResource.get().$promise.then((data) => {
                this.fsmonMes = data;
                fsusage = this.fsmonMes["storageUsed"] / this.fsmonMes["storageTotal"] * 100;
                fsusage = fsusage.toFixed(1);
                option1['series'][0]['data'][0]['value'] = fsusage;
                option1['series'][0]['data'][1]['value'] = 100 - fsusage;
                option1['series'][1]['data'][0]['value'] = fsusage;
                option1['series'][1]['data'][1]['value'] = 100 - fsusage;
                tu1["setOption"](option1);
            }, () => {});
            //CPU 内存  网络
            this.kdPanelResource.get().$promise.then((data) => {
                this.panelMes = data;
                getcpuData();
                cpuuse["setOption"](cpuoption);
                memuse["setOption"](memoption);
                receive["setOption"](qianoption);
                send["setOption"](wanoption);
            }, () => {});
            //应用
            this.kdReleaseResource.get().$promise.then((data) => {
                if (data['releases'] == null) {
                    data['releases'] = [];
                    this.releaselist = data;
                } else {
                    this.releaselist = data;
                }
            }, () => {});
            //获取告警数量
            let getWarnCount = this.resource_('alertsnum');
            getWarnCount.get().$promise.then(
                (data) => {
                    // console.log(data);
                    this.rootScope_.alertsnum = data['alertsnum'];
                },
                (res) => {
                    // console.log(res);
                }
            );
            //获取应用健康状态
            let getreleasestatus = this.resource_('api/v1/helm/allreleasestatus/default');
            getreleasestatus.get().$promise.then(
                (data) => {
                    this.releasenum = data;
                    // this.formatstatus('release', [data["normal"], data["abnormal"]]);
                    // console.log(data);
                },
                (res) => {
                    // console.log(res);
                }
            );
            //获取node健康信息
            let getnode = this.resource_('api/v1/node');
            getnode.get().$promise.then(
                (data) => {
                    this.nodelist = data;
                    this.amdnodelist = [];
                    this.armnodelist = [];
                    let list = [0, 0, 0, 0];
                    for (let i = 0; i < data['nodes'].length; i++) {
                        if (data["nodes"][i]["objectMeta"]["labels"]["beta.kubernetes.io/arch"].indexOf("amd") != -1) {
                            this.amdnodelist[this.amdnodelist.length] = data["nodes"][i];
                        } else {
                            this.armnodelist[this.armnodelist.length] = data["nodes"][i];
                        }
                        if (data['nodes'][i]['ready'] == "True") {
                            if (data["nodes"][i]["objectMeta"]["labels"]["beta.kubernetes.io/arch"].indexOf("amd") != -1) {
                                list[0]++;
                            } else {
                                list[2]++;
                            }
                        } else {
                            if (data["nodes"][i]["objectMeta"]["labels"]["beta.kubernetes.io/arch"].indexOf("amd") != -1) {
                                list[1]++;
                            } else {
                                list[3]++;
                            }
                        }
                    }
                    this.nodenum["amdnormal"] = list[0];
                    this.nodenum["amdabnormal"] = list[1];
                    this.nodenum["armnormal"] = list[2];
                    this.nodenum["armabnormal"] = list[3];
                    // this.formatstatus('node', list);
                    // console.log(data);
                },
                (res) => {
                    // console.log(res);
                }
            );
            // this.timeout_(() => {
            //应用
            let resize = function() {
                // node["resize"]();
                // myChart["resize"]();
                cpuuse["resize"]();
                memuse["resize"]();
                receive["resize"]();
                send["resize"]();
                tu1["resize"]();
                // net["resize"]();
            };
            window.onresize = resize;
            this.scope_.$on('$destroy', () => {
                if (interreq)
                    this.interval_.cancel(interreq);
            });
        }
        // 500);
}

const i18n = {
    /** @export {string} @desc 看板应用健康状态 */
    MSG_RELEASE_HEALTHY_STATUS: goog.getMsg('应用健康状态'),
    /** @export {string} @desc Normal */
    MSG_HOME_GOOD_STATUS: goog.getMsg('正常'),
    /** @export {string} @desc Abnormal */
    MSG_HOME_ERROE_STATUS: goog.getMsg('异常'),
    /** @export {string} @desc No Warning */
    MSG_HOME_NO_WARN: goog.getMsg('系统无警告'),
    /** @export {string} @desc Serious Warning */
    MSG_HOME_HAVE_WARN: goog.getMsg('系统警告'),
};