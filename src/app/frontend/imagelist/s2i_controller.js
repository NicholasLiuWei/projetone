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
export default class S2IDialogController {
    /**
     * @param {!md.$dialog} $mdDialog
     * @param {!angular.$log} $log
     * @param {!ui.router.$state} $state
     * @param {!angular.$resource} $resource
     * @ngInject
     */
    constructor($mdDialog, $log, $state, $resource, toastr, image) {
        /** @export */
        this.image = image;

        /** @private {!md.$dialog} */
        this.mdDialog_ = $mdDialog;

        /** @private {!angular.$log} */
        this.log_ = $log;

        /** @private {!ui.router.$state} */
        this.state_ = $state;

        /** @private {!angular.$resource} */
        this.resource_ = $resource;

        /** @export {!angular.FormController} Initialized from the template */
        this.s2iForm;

        /** @export */
        this.i18n = i18n();

        /** @export */
        this.imageMes = {};

        /** @export */
        this.gitUrl = '';

        /** @export */
        this.gitBranch = '';

        /** @export */
        this.builderImg = '';

        /** @export */
        this.imageTag = '';

        /** @export */
        this.loading = false;

        this.toastr = toastr;
    }

    /**
     * update release.
     *
     * @export
     */
    s2i() {
        if (this.s2iForm.$valid) {
            this.loading = true;
            let s2idata = {
                "gitUrl": this.gitUrl,
                "gitBranch": this.gitBranch,
                "builderImg": this.image["url"],
                "imageTag": this.imageTag,
            }
            console.log(s2idata)

            let resource = this.resource_(`api/v1/helm/s2i`, {}, { save: { method: 'POST' } });
            resource.save(
                s2idata, this.onEditReleaseSuccess_.bind(this),
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
    onEditReleaseSuccess_() {
        this.log_.info(`Successfully update release`);
        /** @type {string} @desc release 更新成功 */
        let MSG_image_s2i_success_title = goog.getMsg('更新成功');
        this.toastr["success"](MSG_image_s2i_success_title, 0, {
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
        let MSG_image_s2i_error_title = goog.getMsg('更新失败');
        this.toastr["warning"](MSG_image_s2i_error_title, 0, {
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
        MSG_S2I_CANCEL_ACTION: goog.getMsg('Cancle'),
        /** @export {string} @desc update release OK. */
        MSG_S2I_OK_ACTION: goog.getMsg('OK'),
        /** @export {string} @desc image location. */
        MSG_S2I_LOCATION: goog.getMsg('Image location'),
        /** @export {string} @desc update image. */
        MSG_S2I_Title: goog.getMsg('Source To Image'),
    };
}