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

/**
 * Controller for the update release image dialog.
 *
 * @final
 */
export default class UpdateReleaseImageDialogController {
    /**
     * @param {!md.$dialog} $mdDialog
     * @param {!angular.$log} $log
     * @param {!ui.router.$state} $state
     * @param {!angular.$resource} $resource
     * @ngInject
     */
    constructor($mdDialog, $log, $state, $resource, toastr, release) {
            /** @export */
            this.release = release;

            /** @private {!md.$dialog} */
            this.mdDialog_ = $mdDialog;

            /** @private {!angular.$log} */
            this.log_ = $log;

            /** @private {!ui.router.$state} */
            this.state_ = $state;

            /** @private {!angular.$resource} */
            this.resource_ = $resource;

            /** @export {!angular.FormController} Initialized from the template */
            this.updateReleaseImageForm;

            /** @export */
            this.i18n = i18n();

            /** @export */
            this.imageMes = {};

            /** @export */
            this.IP = '';

            /** @export */
            this.stateful = false;

            /** @export */
            this.loading = false;

            //is stateful release
            this.isStatefulRelease();

            //get image mes
            this.getImageMes();

            this.toastr = toastr;
        }
        /**
         * get image mes.
         *
         * @export
         */
    getImageMes() {
            let resource = this.resource_(`api/v1/helm/release/values/${this.release.name}`);
            resource.get({}, (res) => {
                let values = res["values"];
                this.imageMes = values["image"];
                if (this.imageMes["pullPolicy"]) {
                    delete this.imageMes["pullPolicy"];
                }
                if (values["image"]["repository"]) {
                    this.IP = this.imageMes["repository"].substring(0, this.imageMes["repository"].indexOf(':'));
                } else {
                    this.IP = this.imageMes["repositorybase"].substring(0, this.imageMes["repositorybase"].indexOf(':'));
                }
            }, this.onGetReleaseValuesErr.bind(this));
        }
        /**
         * is stateful release.
         *
         * @export
         */
    isStatefulRelease() {
            if (this.release.chart.values.raw.indexOf('storagesize') != -1) {
                this.stateful = false;
            } else {
                this.stateful = true;
            }
        }
        /**
         * update release.
         *
         * @export
         */
    updateRelease() {
        console.log(this.imageMes);
        if (this.updateReleaseImageForm.$valid) {
            this.loading = true;
            let updatedata = {
                "releaseName": this.release.name,
                "namespace": this.release.namespace,
                "chartpath": this.release.chart,
                "imageInfo": [],
            }
            for (let key in this.imageMes) {
                updatedata["imageInfo"].push({
                    "repoKey": `${key}`,
                    "repoUrl": `${this.imageMes[key]}`,
                    "imageIp": `${this.IP}`
                });
            }
            // if (this.stateful) {
            //     updatedata["imageInfo"] = [{
            //         "repoKey": "repository",
            //         "repoUrl": `${this.imageMes["repository"]}`,
            //         "imageIp": `${this.IP}`
            //     }];
            // } else {
            //     updatedata["imageInfo"] = [{
            //             "repoKey": "repositorybase",
            //             "repoUrl": `${this.imageMes["repositorybase"]}`,
            //             "imageIp": `${this.IP}`
            //         },
            //         {
            //             "repoKey": "repositorymonitor",
            //             "repoUrl": `${this.imageMes["repositorymonitor"]}`,
            //             "imageIp": `${this.IP}`
            //         },
            //         {
            //             "repoKey": "repositoryubuntu",
            //             "repoUrl": `${this.imageMes["repositoryubuntu"]}`,
            //             "imageIp": `${this.IP}`
            //         }
            //     ];
            // }

            let resource = this.resource_(`api/v1/helm/_row/release/image/namespace/${this.release.namespace}/name/${this.release.name}`, {}, { save: { method: 'PUT' } });
            resource.save(
                updatedata, this.onEditReleaseSuccess_.bind(this),
                this.onEditReleaseError_.bind(this));
        }
    }

    /**
     *  Cancels the edit release dialog.
     *  @export
     */
    cancel() {
        this.mdDialog_.cancel();
    }

    /**
     * @private
     */
    onGetReleaseValuesErr() {
        this.log_.info(`get release values err`);
        /** @type {string} @desc release 获取信息失败 */
        let MSG_release_image_values_title = goog.getMsg('获取失败，请重试');
        this.toastr["warning"](MSG_release_image_values_title, 0, {
            closeButton: true,
            timeOut: 10000,
        });
        this.mdDialog_.hide();
        // this.state_.reload();
    }

    /**
     * @private
     */
    onEditReleaseSuccess_() {
        this.log_.info(`Successfully update release`);
        /** @type {string} @desc release 更新成功 */
        let MSG_release_image_success_title = goog.getMsg('更新成功');
        this.toastr["success"](MSG_release_image_success_title, 0, {
            closeButton: true,
            timeOut: 10000,
        });
        this.loading = false;
        this.mdDialog_.hide();
        // this.state_.reload();
    }

    /**
     * @param {!angular.$http.Response} err
     * @private
     */
    onEditReleaseError_(err) {
        this.log_.error(err);
        /** @type {string} @desc release 更新失败 */
        let MSG_release_image_error_title = goog.getMsg('更新失败');
        this.toastr["warning"](MSG_release_image_error_title, 0, {
            closeButton: true,
            timeOut: 10000,
        });
        this.loading = false;
        this.mdDialog_.hide();
    }
}

function i18n() {
    return {
        /** @export {string} @desc update release cancle. */
        MSG_RELEASE_IMAGE_CANCEL_ACTION: goog.getMsg('Cancle'),
        /** @export {string} @desc update release OK. */
        MSG_RELEASE_IMAGE_OK_ACTION: goog.getMsg('OK'),
        /** @export {string} @desc image location. */
        MSG_RELEASE_IMAGE_LOCATION: goog.getMsg('Image location'),
        /** @export {string} @desc update image. */
        MSG_RELEASE_IMAGE_Title: goog.getMsg('Update Image'),
    };
}