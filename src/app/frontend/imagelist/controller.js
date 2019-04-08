/**
 * Controller for the imagelist view. The view shows base images and user images.
 * The image can be used when creating release.
 *
 * @final
 */
export class imagelistController {
    /**
     * @param {!angular.$log} $log
     * @param {!angular.$resource} $resource
     * @param {!angular.$q} $q
     * @param {!Object} errorDialog
     * @ngInject
     */
    constructor($stateParams, $state, $log, $mdDialog, $resource, toastr, $q, errorDialog, kdService, baseimageList, normalimageList) {
            /** @export */
            this.i18n = i18n;

            /** @private {!angular.$log} */
            this.log_ = $log;

            /** @private */
            this.resource = $resource;

            /** @export */
            this.choicedBaseimage = baseimageList[0];

            /** @export */
            this.choicedNormalimage = normalimageList[0];

            /** @export */
            this.baseimageList = baseimageList;

            /** @export */
            this.normalimageList = normalimageList;

            /** @export */
            this.kdService = kdService;

            /** @export */
            this.toastr = toastr;
            // this.showDeploynow = false;

            /** @export {string} */
            this.form;

            /** @export */
            this.mdDialog_ = $mdDialog;

            /** @export */
            this.state = $state;

            /** @export */
            this.namespace = $stateParams.namespace;

            /** @export */
            this.releasename = '';
            /** @export */
            this.currentNavItem = "base";
            /** @export */
            this.show = true;
            /** @export */
            this.oBaseImageMsg = {};
            /** @export */
            this.baseImages = {
                "branch": "",
                "url": "",
                "name": ""
            };
            /** @export */
            this.customImages = {
                "branch": "",
                "url": "",
                "name": ""
            };
            /** @export */
            this.oBaseFillInFields = {
                    "url": false,
                    "branch": false,
                    "name": false
                }
                /** @export */
            this.oCustomFillInFields = {
                    "url": false,
                    "branch": false,
                    "name": false
                }
                /** @export */
            this.baseShowNum = 1;
            /** @export */
            this.customShowNum = 1;
            /** @export */
            this.workloadType = [
                { "id": "1", "name": 'Deployment' },
                { "id": "2", "name": 'Statefulset' },
                { "id": "3", "name": 'DaemonSet' }
            ];
            /** @export */
            this.creatWorkloadNum = 1;
            /** @export */
            this.oWorkloadName = "";
            /** @export */
            this.oWorkloadUrl = "";
            /** @export */
            this.oWorkloadVersion = "";
            /** @export */
            this.types = ['Deployment', 'Statefulset', 'DaemonSet']
                /** @export */
            this.selectedUser = 'Deployment';
            /** @export */
            this.oDefaultWorkloadComponent = { "appType": "deployment", "hpa": { "enabled": true, "maxReplicas": 10, "minReplicas": 5, "targetAvgUtil": 50 }, "images": [{ "args": ["--init"], "command": ["/cmd"], "env": [{ "name": "GOROOT", "value": "/go" }], "ports": [{ "containerPort": 80, "protocol": "TCP" }], "pullPolicy": "IfNotPresent", "pvcs": [{ "accessModes": "ReadWriteOnce", "mountpoint": "/var/data", "name": "pv-claim", "requestStorage": "100Gi", "storageClassName": "ceph-sc" }], "repository": "http://172.16.113.1/centos:1.1", "resources": { "enabled": false, "limits": { "cpu": "200m", "memory": "500Mi" }, "requests": { "cpu": "100m", "memory": "300Mi" } } }], "name": "first", "replicaCount": 1, "restartPolicy": "Always", "$$hashKey": "object:109" };
            /** @export */
            this.aAddWorkloadComponent = [];
            /** @export */
            this.oWorkloadComponent = [];
            /** @export */
            this.deploymentSpec = {};
            /** @export */
            this.oWorkloadIngress = {};
        }
        /** @export */
    $onInit() {}
        /** @export */
    tablesBaseClick() {
            this.show = true;
        }
        /** @export */
    tablesCustomClick() {
            this.show = false;
        }
        /**
         * @export
         */
    fPreviousStep() {
            this.baseShowNum--;
            this.prevClassNameShow(document.getElementsByClassName("base-process-children-background")[0]);
        }
        /**
         * @export
         */
    fCreateBaseImagePre(msg) {
            this.baseShowNum++;
            this.nextClassNameShow(document.getElementsByClassName("base-process-children-background")[0]);
            this.oBaseImageMsg = msg;
        }
        /** @export */
    fInputChangeUrl(value) {
            if (value == undefined) {
                this.oBaseFillInFields.url = true;
            } else {
                this.oBaseFillInFields.url = false;
            }
        }
        /** @export */
    fInputChangeBranch(value) {
            if (value == undefined) {
                this.oBaseFillInFields.branch = true;
            } else {
                this.oBaseFillInFields.branch = false;
            }
        }
        /** @export */
    fInputChangeName(value) {
            if (value == undefined) {
                this.oBaseFillInFields.name = true;
            } else {
                this.oBaseFillInFields.name = false;
            }
        }
        /** @export */
    fCustomInputChangeName(value) {
            if (value == undefined) {
                this.oCustomFillInFields.name = true;
            } else {
                this.oCustomFillInFields.name = false;
            }
        }
        /**
         * @export
         */
    fInputMsgPreNext() {
            if (this.oBaseFillInFields.url == false && this.oBaseFillInFields.branch == false) {
                this.baseShowNum++;
                this.nextClassNameShow(document.getElementsByClassName("base-process-children-background")[0]);
            } else {
                if (this.baseImages.url == "" || this.baseImages.url == undefined) {
                    this.oBaseFillInFields.url = true;
                } else {
                    this.oBaseFillInFields.branch = true;
                }
            }
        }
        /**
         * @export
         */
    fBaseImagePre() {
            if (this.baseImages.name == "" || this.baseImages.name == undefined) {
                this.oBaseFillInFields.name = true;
                return;
            }
            this.baseShowNum = 1;
            this.nextClassNameShow(document.getElementsByClassName("base-process-children-background")[0]);
            let msg = {
                "gitUrl": this.baseImages.url,
                "gitBranch": this.baseImages.branch,
                "builderImg": this.oBaseImageMsg["url"],
                "imageTag": this.baseImages.name
            }

            let resource = this.resource(`api/v1/helm/s2i`, {}, { save: { method: 'POST' } });
            resource.save(
                msg, this.onEditReleaseSuccess_.bind(this),
                this.onEditReleaseError_.bind(this),
                this.baseImages = {
                    branch: "",
                    url: "",
                    name: ""
                });
        }
        /**
         * @export
         */
    prevClassNameShow(elementNode) {
            let oCustomProcessChildrenBackground = elementNode,
                sClassName = elementNode.className;
            oCustomProcessChildrenBackground.previousElementSibling.className = sClassName;
            oCustomProcessChildrenBackground.className = "";
        }
        /**
         * @export
         */
    nextClassNameShow(elementNode) {
        let oCustomProcessChildrenBackground = elementNode,
            sClassName = elementNode.className,
            sElementParentNode = document.getElementsByClassName(sClassName)[0].parentNode;
        oCustomProcessChildrenBackground.className = "";
        if (oCustomProcessChildrenBackground.nextElementSibling) {
            oCustomProcessChildrenBackground.nextElementSibling.className = sClassName;
        } else {
            sElementParentNode.children[0].className = sClassName;
        }
    }

    /**
     * @export
     */
    fCustomPreviousStep() {
        this.customShowNum--;
        this.prevClassNameShow(document.getElementsByClassName("custom-process-children-background")[0]);
    }

    /**
     * @export
     */
    deploypre(value) {
            console.log(this.choicedNormalimage)
            this.oDefaultWorkloadComponent.images[0]["repository"] = this.choicedNormalimage["url"];
            if (this.customImages.name == "" || this.customImages.name == undefined) {
                this.oCustomFillInFields.name = true;
                return;
            }
            this.customShowNum++;
            this.nextClassNameShow(document.getElementsByClassName("custom-process-children-background")[0]);
            let deploymentSpec = {
                "imageURLs": [this.choicedNormalimage["url"]],
                "chartURL": "",
                "releaseName": value,
                "namespace": this.namespace == "_all" ? "default" : this.namespace,
            };
            /** @type {!angular.Resource<!backendApi.AppDeploymentFromChartSpec>} */
            let resource = this.resource('api/v1/helm/deploychartprepare', {}, { save: { method: 'POST' } });
            resource.save(
                deploymentSpec,
                (response) => {
                    this.oWorkloadIngress = JSON.parse(response['content'])['ingress'];
                    this.deploymentSpec = deploymentSpec;
                    this.kdService.value = response;
                    this.kdService.value["content"] = JSON.parse(this.kdService.value["content"]);
                    this.kdService.value["content"]["components"][0]["name"] = value;
                    this.kdService.value.content["components"][0].images[0]["repository"] = this.choicedNormalimage["url"];
                    // this.value = this.kdService.value.content.services;
                }
            )
        }
        /**
         * @export
         */
    fSeeMsg(msg) {
            if (this.oWorkloadComponent.length == 0) {
                this.oWorkloadComponent.push(msg);
            } else {
                this.oWorkloadComponent = [];
                this.oWorkloadComponent.push(msg);
            }
            this.creatWorkloadNum = 2;
        }
        /**
         * @export
         */
    fWorkloadInit() {
            this.creatWorkloadNum = 1;
        }
        /**
         * @export
         */
    fAddWorkloadInit() {
            this.creatWorkloadNum = 3;
        }
        /**
         * @export
         */
    fCancelCreatWorkload() {
            this.creatWorkloadNum = 1;
        }
        /**
         * @export
         */
    fAddWorkload() {
            if (this.oWorkloadName && this.selectedUser && this.oWorkloadUrl && this.oWorkloadVersion) {
                this.creatWorkloadNum = 1;
                let currrentComponent = JSON.parse(JSON.stringify(this.oDefaultWorkloadComponent));
                currrentComponent.name = this.oWorkloadName;
                currrentComponent.appType = this.selectedUser;
                currrentComponent.url = this.oWorkloadUrl;
                currrentComponent.version = this.oWorkloadVersion;
                this.kdService.value["content"]["components"].push(currrentComponent);
                this.oWorkloadName = "";
                this.oWorkloadUrl = "";
                this.oWorkloadVersion = "";
            }
        }
        /**
         * @export
         */
    fDeleteComponent(event, index) {
            let bool = false;
            for (let currentClass in event.target.classList) {
                if (event.target.classList[currentClass] == "disable-class") {
                    bool = true;
                }
            }
            if (bool != true) {
                this.kdService.value["content"]["components"].splice(index, 1);
            }
        }
        /**
         * @export
         */
    deployWorkload() {
            this.customShowNum++;
            this.nextClassNameShow(document.getElementsByClassName("custom-process-children-background")[0]);
        }
        /**
         * @export
         */
    deployService() {
            this.customShowNum++;
            this.nextClassNameShow(document.getElementsByClassName("custom-process-children-background")[0]);
        }
        /**
         * @export
         */
    deployServiceAfter() {
            let content = {};
            content['components'] = this.kdService.value["content"]["components"];
            content['ingress'] = this.oWorkloadIngress;
            content['services'] = this.kdService.value.content.services;
            let deploynowData = {
                "chartURL": "",
                "chartpath": "",
                "error": "",
                "imageURLs": [this.choicedNormalimage["url"]],
                "namespace": this.namespace == "_all" ? "default" : this.namespace,
                "releaseName": this.deploymentSpec.releaseName,
                "content": JSON.stringify(content)
            }
            this.customShowNum = 1;
            this.nextClassNameShow(document.getElementsByClassName("custom-process-children-background")[0]);
            let resource = this.resource('api/v1/helm/deploychartnow', {}, { save: { method: 'POST', } });
            resource.save(
                deploynowData,
                (response, req) => {
                    this.state.go("chrome.release");
                    this.customImages = {
                        branch: "",
                        url: "",
                        name: ""
                    };
                },
                (err) => {
                    // this.disable = false;
                    // defer.reject(err); // Progress ends
                    // this.log_.error('Error deploying chart:', err);
                    /** @type {string} @desc image 部署失败提示 */
                    let MSG_image_deployment_failed_button = goog.getMsg('确定');
                    /** @type {string} @desc image 部署失败提示 */
                    let MSG_image_deployment_failed_title = goog.getMsg('服务器错误');
                    /** @type {string} @desc image 部署失败提示 */
                    let MSG_image_deployment_failed_con = goog.getMsg('部署失败，请重试');
                    this.mdDialog_.show(this.mdDialog_.alert()
                        .ok(MSG_image_deployment_failed_button)
                        .title(MSG_image_deployment_failed_title)
                        .textContent(MSG_image_deployment_failed_con));
                    this.customImages = {
                        "branch": "",
                        "url": "",
                        "name": ""
                    };
                })
        }
        /**
         * @private
         */
    onEditReleaseSuccess_() {
        this.log_.info(`Successfully update release`);
        /** @type {string} @desc release 更新成功 */
        let MSG_image_imagelist_success_title = goog.getMsg('更新成功');
        this.toastr["success"](MSG_image_imagelist_success_title, 0, {
            closeButton: true,
            timeOut: 10000,
        });

        // this.loading = false;
        // this.mdDialog_.hide();
        // this.state_.reload();
    }

    /**
     * @param {!angular.$http.Response} err
     * @private
     */
    onEditReleaseError_(err) {
        this.log_.error(err);
        /** @type {string} @desc release 更新失败 */
        let MSG_image_imagelist_error_title = goog.getMsg('更新失败');
        this.toastr["warning"](MSG_image_imagelist_error_title, 0, {
            closeButton: true,
            timeOut: 10000,
        });

        // this.loading = false;
        // this.mdDialog_.hide();
    }

    /**
     * @export
     */
    showadvanced() {
        this.kdService.show == true ? this.kdService.show = false : this.kdService.show = true;
    }

    /**
     * @export
     */
    choiceBaseimage(imagename) {
        console.log(imagename)
        this.choicedBaseimage = imagename;
    }

    /**
     * @export
     */
    choiceNormalimage(imagename) {
        console.log(imagename)
        this.choicedNormalimage = imagename;
    }
}

const i18n = {
    /** @export {string} @desc imagelist */
    MSG_IMAGELIST_TEST: goog.getMsg('imagelist'),

    /** @export {string} @desc imagelist version */
    MSG_IMAGELIST_VERSION: goog.getMsg('Ver')
};