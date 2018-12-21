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
    constructor($state, $log, $mdDialog, $resource, $q, errorDialog, kdService, baseimageList, normalimageList) {
            /** @export */
            this.i18n = i18n;

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
            this.showDeploynow = false;

            /** @export {string} */
            this.form;

            /** @export */
            this.mdDialog_ = $mdDialog;

            /** @export */
            this.state = $state;

            /** @export */
            this.releasename = '';
        }
        /** @export */
    $onInit() {
        //     let deploymentSpec = {
        //         "imageURLs": [this.choicedNormalimage["url"]],
        //         "chartURL": "",
        //         "releaseName": "",
        //         "namespace": "default",
        //     };
        //     /** @type {!angular.Resource<!backendApi.AppDeploymentFromChartSpec>} */
        //     let resource = this.resource('api/v1/helm/deploychartprepare', {}, { save: { method: 'POST' } });
        //     resource.save(
        //         deploymentSpec,
        //         (response) => {
        //             console.log(response);
        //             this.kdService.value = response;
        //             this.kdService.value.content = JSON.parse(this.kdService.value.content);
        //             this.value = this.kdService.value.content.services;
        //         }
        //     )
    }
    hehe() {
        console.log(this.kdService);
    }

    /**
     * @export
     */
    deploypre() {
        let deploymentSpec = {
            "imageURLs": [this.choicedNormalimage["url"]],
            "chartURL": "",
            "releaseName": "",
            "namespace": "default",
        };
        /** @type {!angular.Resource<!backendApi.AppDeploymentFromChartSpec>} */
        let resource = this.resource('api/v1/helm/deploychartprepare', {}, { save: { method: 'POST' } });
        resource.save(
            deploymentSpec,
            (response) => {
                console.log(response);
                this.showDeploynow = true;
                this.kdService.value = response;
                this.kdService.value["content"] = JSON.parse(this.kdService.value["content"]);
                // this.value = this.kdService.value.content.services;
            }
        )
    }

    /**
     * @export
     */
    deploynow() {
        if (this.form.$valid) {
            let deploynowData = {
                "chartURL": "",
                "chartpath": "",
                "error": "",
                "imageURLs": [this.choicedNormalimage["url"]],
                "namespace": "default",
                "releaseName": this.releasename,
                "content": JSON.stringify(this.kdService.value.content)
            }
            console.log(this.choicedNormalimage);
            let resource = this.resource('api/v1/helm/deploychartnow', {}, { save: { method: 'POST', } });
            resource.save(
                deploynowData,
                (response, req) => {
                    this.state.go("chrome.release");
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
                })
        }
    }

    /**
     * @export
     */
    showadvanced() {
        console.log(this.kdService.show);
        console.log(this.kdService.show == true);
        this.kdService.show == true ? this.kdService.show = false : this.kdService.show = true;
    }

    /**
     * @export
     */
    choiceBaseimage(imagename) {
        // console.log(this.choicedBaseimage);
        this.choicedBaseimage = imagename;
    }

    /**
     * @export
     */
    choiceNormalimage(imagename) {
        // console.log(this.choicedNormalimage);
        this.choicedNormalimage = imagename;
    }
}

const i18n = {
    /** @export {string} @desc imagelist */
    MSG_IMAGELIST_TEST: goog.getMsg('imagelist'),
};