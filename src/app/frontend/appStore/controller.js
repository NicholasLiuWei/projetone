/**
 * Controller for the appStore view. The view shows details about the installation
 * enviornment. The information can be used when creating issues.
 *
 * @final
 */
import { stateName as release } from 'releaselist/releaselist_state';

export class AppStoreController {
    /**
     * @param {!angular.$log} $log
     * @param {!angular.$resource} $resource
     * @param {!angular.$q} $q
     * TODO (cheld) Set correct type after fixing issue #159
     * @param {!Object} errorDialog
     * @param {!./../common/history/history_service.HistoryService} kdHistoryService
     * @param {!./../common/csrftoken/csrftoken_service.CsrfTokenService} kdCsrfTokenService
     * @ngInject
     */

    constructor($stateParams, $log, $resource, $mdDialog, $q, errorDialog, kdHistoryService, kdCsrfTokenService, $timeout, $state) {
        this.form = 'form';

        this.file = { name: '', content: '' };

        this.q_ = $q;

        this.resource_ = $resource;

        this.log_ = $log;

        this.errorDialog_ = errorDialog;
        this.mdDialog_ = $mdDialog;
        this.isDeployInProgress_ = false;

        this.kdHistoryService_ = kdHistoryService;

        this.timeout = $timeout;

        /** @private {!angular.$q.Promise} */
        this.tokenPromise = kdCsrfTokenService.getTokenForAction('deploychart');

        this.selectedClass = 'kd-chart-card-selected';

        this.selectedChart = '';

        this.name = '';

        this.repos = [];

        this.getRepos();
        this.state = $state;
        /** @export */
        this.allDeployCon = {};
        /** @export */
        this.advanced = false;
        /** @export */
        this.selectedRepos = '';
        /** @export */
        this.selectedCharts = '';
        /** @export */
        this.choice = true;
        /** @export */
        this.commit = false;
        /** @export */
        this.charts = [];
        /** @export */
        this.deployCon = {};
        /** @export */
        this.namespaceList = [];
        /** @export platform */
        this.platform = 'auto';
        /** @export arch */
        this.arch = 1;
        /** @export 支持的平台字符串 */
        this.platformstr = "";
        this.getNamespaceList();
        /** @public */
        this.commitmes;
        /** @public */
        this.repo = '';
        /** @public */
        this.namespace = $stateParams.namespace;
        /** @export */
        this.comform = 'comform';

        // this.getCharts('testtest');
        this.i18n = i18n;
        /** @export {boolean} */
        this.disable = false;
        this.translate = true;
        this.translateobj = {
            "image": "容器镜像地址",
            "pullPolicy": "镜像拉取策略",
            "repositorybase": "基础镜像",
            "repositorymonitor": "监控器镜像",
            "repositoryubuntu": "Ubuntu镜像",
            "tagbase": "基础镜像标签",
            "tagmonitor": "监控器镜像标签",
            "tagubuntu": "Ubuntu镜像标签",
            "resources": "资源",
            "limits": "配额",
            "memory": "内存",
            "requests": "请求",
            "resourcesset": "设置资源",
            "service": "服务",
            "name": "名称",
            "storage": "存储",
            "storageclassname": "存储库",
            "storagesize": "存储大小",
            "hpa": "自动扩容",
            "maxpods": "最大份数",
            "minpods": "最小份数",
            "targetcpupercent": "目标CPU利用率",
            "replicaCount": "初始份数",
            "externalPort": "外部端口",
            "internalPort": "内部端口",
            "type": "类型",
            "repository": "仓库",
            "tag": "标签",
        };
    }

    $onInit() {
        console.log("$onInit")
        let archResource = this.resource_("api/v1/clusterArch");
        let a = archResource.get().$promise;
        a.then((res) => {
            this.arch = res["arch"];
        }, () => {});
    }

    /**
     * @export
     */
    showAdvanced() {
        this.advanced ? this.advanced = false : this.advanced = true;
    }

    /**
     * translate the response content.
     *
     * @export
     */
    tanslate(str) {
        if (this.translate) {
            if (this.translateobj.hasOwnProperty(str)) {
                return this.translateobj[str];
            } else {
                return str;
            }
        } else {
            return str;
        }
    }

    /**
     * @export
     * 根据平台架构选择是否显示当前chart
     */
    showChart(platform) {
        switch (this.arch) {
            //0auto   1  amd   2arm
            case 0:
                return true;
            case 1:
                if (platform == "ARM64") {
                    return false;
                } else {
                    return true;
                }
            case 2:
                if (platform == "X86") {
                    return false;
                } else {
                    return true;
                }
        }
    }

    /**
     * commitmes the application based on the state of the controller.
     *
     * @export
     */

    deploynow() {
        if (this.comform.$valid) {
            if (this.advanced) {
                this.commitmes.content = JSON.stringify(this.allDeployCon);
            } else {
                switch (this.deployCon["platform"]) {
                    case "X86":
                        this.deployCon["arch"]["amd64"] = 'yes';
                        this.deployCon["arch"]["arm64"] = 'no';
                        break;
                    case "ARM64":
                        this.deployCon["arch"]["amd64"] = 'no';
                        this.deployCon["arch"]["arm64"] = 'yes';
                        break;
                    case "auto":
                        this.deployCon["arch"]["amd64"] = 'yes';
                        this.deployCon["arch"]["arm64"] = 'yes';
                        break;
                }
                this.commitmes.content = JSON.stringify(this.deployCon);
            }
            let mes = this.commitmes;
            console.log(mes);
            let defer = this.q_.defer();

            this.tokenPromise.then(
                (token) => {
                    /** @type {!angular.Resource<!backendApi.AppDeploymentFromChartSpec>} */
                    let resource = this.resource_('api/v1/helm/deploychartnow', {}, { save: { method: 'POST', headers: { 'X-CSRF-TOKEN': token } } });
                    this.disable = true;
                    resource.save(
                        mes,
                        (response, req) => {
                            this.choice = false;
                            this.commit = true;
                            //console.log(response);
                            //console.log(JSON.parse(response.content));
                            this.deployCon = JSON.parse(response.content);
                            defer.resolve(response); // Progress ends
                            this.log_.info('Chart deployment completed: ', response);
                            /** @type {string} @desc Chart deployment has partly completed. 应用部署未完成 */
                            let MSG_chart_deployment_partly = goog.getMsg('Chart deployment has partly completed');
                            if (response.error > 0) {
                                this.errorDialog_.open(MSG_chart_deployment_partly, response.error);
                            }
                            this.state.go(release);
                        },
                        (err) => {
                            this.disable = false;
                            defer.reject(err); // Progress ends
                            this.log_.error('Error deploying chart:', err);
                            /** @type {string} @desc appstore 部署失败提示 */
                            let MSG_chart_deployment_failed_button = goog.getMsg('确定');
                            /** @type {string} @desc appstore 部署失败提示 */
                            let MSG_chart_deployment_failed_title = goog.getMsg('服务器错误');
                            /** @type {string} @desc appstore 部署失败提示 */
                            let MSG_chart_deployment_failed_con = goog.getMsg('部署失败，请重试');
                            this.mdDialog_.show(this.mdDialog_.alert()
                                .ok(MSG_chart_deployment_failed_button)
                                .title(MSG_chart_deployment_failed_title)
                                .textContent(MSG_chart_deployment_failed_con));
                        });
                },
                (err) => {
                    defer.reject(err);
                    this.log_.error('Error deploying application:', err);
                });

            defer.promise.finally(() => {
                this.isDeployInProgress_ = false;
            });
            return defer.promise;
        }
        // return undefined;
    }

    /**
     * commitmes the application based on the state of the controller.
     *
     * @export
     */
    commitmes() {
        // if(this.comform.$valid){
        //     this.commitmes.deployCon = this.deployCon;
        //     let mes = this.commitmes;
        //     console.log(mes);
        //     let defer = this.q_.defer();

        //     this.tokenPromise.then(
        //         (token) => {


        //             /** @type {!angular.Resource<!backendApi.AppDeploymentFromChartSpec>} */
        //             let resource = this.resource_('api/v1/deploychartcommit',{},
        //                 {save: {method: 'POST', headers: {'X-CSRF-TOKEN': token}}});
        //             this.isDeployInProgress_ = true;
        //             resource.save(
        //                 mes,
        //                 (response) => {
        //                     console.log(response);
        //                     console.log(JSON.parse(response.content));
        //                     this.deployCon = JSON.parse(response.content);
        //                     defer.resolve(response);  // Progress ends
        //                     this.log_.info('Chart deployment completed: ', response);
        //                     if (response.error > 0) {
        //                         this.errorDialog_.open('Chart deployment has partly completed', response.error);
        //                     }
        //                     // this.kdHistoryService_.back(workloads);
        //                 },
        //                 (err) => {
        //                     defer.reject(err);  // Progress ends
        //                     this.log_.error('Error deploying chart:', err);
        //                     this.errorDialog_.open('Deploying chart has failed', err.data);
        //                 });
        //         },
        //         (err) => {
        //             defer.reject(err);
        //             this.log_.error('Error deploying application:', err);
        //         });

        //     defer.promise.finally(() => {
        //         this.isDeployInProgress_ = false;
        //     });
        //     return defer.promise;
        // }
        // return undefined;
    }

    /**
     * Deploys the application based on the state of the controller.
     *
     * @export
     */
    deploy() {
        if (this.form.$valid && this.form["name"]["$valid"]) {
            let deploymentSpec = {
                chartURL: this.selectedChart,
                releaseName: this.name,
                namespace: this.namespace == "_all" ? "default" : this.namespace,
            };
            let defer = this.q_.defer();

            this.tokenPromise.then(
                (token) => {


                    /** @type {!angular.Resource<!backendApi.AppDeploymentFromChartSpec>} */
                    let resource = this.resource_('api/v1/helm/deploychartprepare', {}, { save: { method: 'POST', headers: { 'X-CSRF-TOKEN': token } } });
                    this.isDeployInProgress_ = true;
                    resource.save(
                        deploymentSpec,
                        (response, headers) => {
                            this.choice = false;
                            this.commit = true;
                            this.disable = false;
                            // if (headers().hasOwnProperty("content-language")) {
                            if (headers()["content-language"].indexOf("zh-CN") != -1) {
                                this.translate = true;
                            } else {
                                this.translate = false;
                            }
                            // }
                            //console.log(response);
                            //console.log(JSON.parse(response.content));
                            this.commitmes = response;
                            delete this.commitmes["$promise"];
                            delete this.commitmes["$resolved"];
                            delete this.commitmes["error"];
                            this.allDeployCon = JSON.parse(response.content);
                            // console.log(this.allDeployCon);
                            let con = JSON.parse(response.content);
                            this.platform = con["platform"];
                            if (this.arch == 1) {
                                con["platform"] = "X86";
                            }
                            if (this.arch == 2) {
                                con["platform"] = "ARM64";
                            }
                            //delete con["resources"];
                            //delete con["service"];
                            //delete con["resourcesset"];
                            // if (con.hasOwnProperty('storage')) {
                            //     delete con["storage"]["storageclassname"];
                            // }
                            delete con["image"]["tagbase"];
                            delete con["image"]["pullPolicy"];
                            delete con["image"]["tagubuntu"];
                            delete con["image"]["tag"];
                            delete con["image"]["tagmonitor"];
                            this.deployCon = con;
                        },
                        (err) => {
                            defer.reject(err); // Progress ends
                            this.log_.error('Error deploying chart:', err);
                            /** @type {string} @desc Deploying chart has failed. 应用部署失败 */
                            let MSG_chart_deploypre_failed = goog.getMsg('Deploying chart has failed');
                            this.errorDialog_.open(MSG_chart_deploypre_failed, err.data);
                        });
                },
                (err) => {
                    defer.reject(err);
                    this.log_.error('Error deploying application:', err);
                });

            defer.promise.finally(() => {
                this.isDeployInProgress_ = false;
            });
            return defer.promise;
        }
        return undefined;
    }

    /**
     * Selects a chart to deploy.
     * @export
     */
    isDeployDisabled() {
        return this.isDeployInProgress_;
    }

    /**
     * Selects a chart to deploy.
     * @export
     */

    isSureDisabled() {
        return this.disable;
    }

    /**
     * Selects a chart to deploy.
     * @export
     */

    cancel() {
        if (this.name != '') {
            window['$']('#name').eq(0).focus().val('');
        }
        // this.kdHistoryService_.back(workloads);
    }

    /**
     * Selects a chart to deploy.
     * @export
     */
    cancell() {
        this.commit = false;
        this.choice = true;
        this.isDeployInProgress_ = false;
    }

    /**
     * Selects a chart to deploy.
     * @export
     */
    getRepos() {
        /** @type {!angular.Resource<!backendApi.RepositoryList>} */
        let resource = this.resource_(`api/v1/helm/repository`);
        resource.get(
            (res) => {
                this.repos = [].concat(res.repositories.map((e) => e.name));
                if (this.repos.length > 0) {
                    this.getCharts(res.repositories[0]['name']);
                }
            },
            (err) => {
                this.log_.log(`Error getting repos: ${err}`);
            });
    }

    /**
     * get namespacelist.
     * @export
     */
    getNamespaceList() {
        /** @type {!angular.Resource<!backendApi.NamespaceList>} */
        let resource = this.resource_(`api/v1/namespace`);
        resource.get(
            (res) => {
                //console.log(res);
                this.namespaceList = [].concat(res.namespaces.map((e) => e.objectMeta.name));
            },
            (err) => {
                this.log_.log(`Error getting repos: ${err}`);
            });
    }

    /**
     * Selects a chart to deploy.
     * @export
     */
    getCharts(repo) {
        //console.log('get charts');
        /** @type {!angular.Resource<!backendApi.ChartList>} */
        let resource = this.resource_(`api/v1/helm/repository/${repo}`);
        resource.get(
            (res) => {
                this.charts = res.charts.sort(function(a, b) {
                    let nameA = a.name.toUpperCase();
                    let nameB = b.name.toUpperCase();
                    return (nameA < nameB) ? -1 : (nameA > nameB) ? 1 : 0;
                });
            },
            (err) => {
                this.log_.log(`Error getting charts: ${err}`);
            });
    }

    /**
     * 默认选择的repo
     * @export
     */
    defaultrepo(value) {
        if (value == 0) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * Selects a chart to deploy.
     * @export
     */
    selectRepos(repoName) {
        if (repoName === 'None') {
            //console.log('none');
            this.charts = [];
        } else {
            //console.log('charts');
            this.getCharts(repoName);
        }
        this.selectedChart = null;
        this.selectedRepos = repoName;
    }

    /**
     * Selects a chart to deploy.
     * @export
     */
    type(value) {
        if (typeof(value) == 'object') {
            return true;
        }
        return false;
    }

    /**
     * Selects a chart to deploy.
     * @export
     */
    selectChart(chartName) {
        //console.log(chartName)
        // window['$']('#name').eq(0).focus();
        for (let i = 0; i < this.charts.length; i++) {
            this.charts[i]['selected'] = '';
            if (this.charts[i]['fullURL'] === chartName) {
                this.charts[i]['selected'] = this.selectedClass;
            }
        }
        this.selectedChart = chartName;
        this.selectedCharts = chartName;
    }
}

const i18n = {
    /** @export {string} @desc Label "Chart Repository" label, for the chart repository on the deploy
     *  from chart page. */
    MSG_CHART_REPOSITORY_LABEL1: goog.getMsg('Chart Repository'),

    /** @export {string} @desc User help for chart repository selection on the deploy from chart page.
     */
    MSG_DEPLOY_CHART_REPO_USER_HELP1: goog.getMsg(`Select a Chart Repository.`),

    /** @export {string} @desc User help for chart selection on the deploy from chart page. */
    MSG_DEPLOY_CHART_USER_HELP1: goog.getMsg(`Select a Chart to deploy.`),

    /** @export {string} @desc Label "Chart URL" label, for the chart to deploy. */
    MSG_CHART_URL_LABEL1: goog.getMsg('Chart URL'),

    /** @export {string} @desc Label "Version" label, for the chart to deploy. */
    MSG_CHART_VERSION_LABEL: goog.getMsg('Ver'),

    /** @export {string} @desc User helm for chart URL to deploy
     */
    MSG_DEPLOY_CHART_URL_USER_HELP1: goog.getMsg(`Specify the URL of the chart to deploy.`),

    /** @export {string} @desc Label "Release Name" label, for the release name on the deploy
     *  from chart page. */
    MSG_DEPLOY_CHART_RELEASE_NAME_LABEL1: goog.getMsg('Release Name'),

    /** @export {string} @desc User help for chart release name on the deploy from chart page.
     */
    MSG_DEPLOY_CHART_RELEASE_NAME_USER_HELP1: goog.getMsg(`specify a release name.`),

    /** @export {string} @desc Label "Custom values YAML file", for the custom values file on the deploy
     *  from chart page. */
    MSG_DEPLOY_CHART_VALUES_YAML_FILE_LABEL1: goog.getMsg('Custom Values YAML file'),

    /** @export {string} @desc User help for chart custom values on the deploy from chart page.
     */
    MSG_DEPLOY_CHART_CUSTOM_VALUES_USER_HELP1: goog.getMsg(`Optionally, specify a custom values file.`),

    /** @export {string} @desc The text is put on the button at the end of the chart deploy
     * page. */
    MSG_DEPLOY_CHART_ACTION1: goog.getMsg('Deploy'),

    /** @export {string} @desc The text is put on the 'Cancel' button at the end of the chart deploy
     * page. */
    MSG_DEPLOY_CHART_ACTION_CANCEL1: goog.getMsg('Cancel'),

    /** @export {string} @desc 域名服务
     * page. */
    MSG_DEPLOY_CHART_DOMAIN_SERVICE: goog.getMsg('域名服务'),

    /** @export {string} @desc 域名
     * page. */
    MSG_DEPLOY_CHART_DOMAIN: goog.getMsg('域名'),

    /** @export {string} @desc 显示高级选项
     * page. */
    MSG_DEPLOY_CHART_ADVANCED: goog.getMsg('显示高级选项'),

    /** @export {string} @desc 隐藏高级选项
     * page. */
    MSG_DEPLOY_CHART_NOADVANCED: goog.getMsg('隐藏高级选项'),

    /** @export {string} @desc The text is put on the 'OK' button at the end of the chart deploy
     * page. */
    MSG_DEPLOY_CHART_ACTION_NOW_OK: goog.getMsg('确定'),

    /** @export {string} @desc The text is put on the 'Cancel' button at the end of the chart deploy
     * page. */
    MSG_DEPLOY_CHART_ACTION_NOW_CANCLE1: goog.getMsg('取消'),

    /** @export {string} @desc The text is put on the 'Cancel' button at the end of the chart deploy
     * page. */
    MSG_DEPLOY_CHART_TEST: goog.getMsg('取消1'),

};