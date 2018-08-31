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
 * Controller for the update release dialog.
 *
 * @final
 */
export default class UpdateReleaseDialogController {
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

        /** @export */
        this.minpods = 1;

        /** @export */
        this.maxpods = 1;

        /** @export */
        this.targetcpupercent = 1;

        /** @export */
        this.storage = '';

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
        this.updateReleaseForm;

        /** @export */
        this.i18n = i18n();

        /** @export */
        this.loading = false;

        /** @export */
        this.stateful = false;

        //is stateful release
        this.isStatefulRelease();

        //get current release values
        this.curValue();

        this.toastr = toastr;
    }

    /**
     * release current values.
     *
     * @export
     */
    curValue() {
            let resource = this.resource_(`api/v1/helm/release/values/${this.release.name}`);
            resource.get().$promise.then((res) => {
                if (this.stateful) {
                    let values = res["values"];
                    this.minpods = values["hpa"].minpods;
                    this.maxpods = values["hpa"].maxpods;
                    this.targetcpupercent = values["hpa"].targetcpupercent;
                } else {
                    let values = res["values"];
                    this.storage = values["storage"]["storagesize"];
                }
            }, (err) => {
                console.log(err);
            });
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
        if (this.updateReleaseForm.$valid) {
            this.loading = true;
            let updatedata = {
                "releaseName": this.release.name,
                "namespace": this.release.namespace,
                "chartpath": this.release.chart,
                "hpa": [],
            }
            if (this.stateful) {
                updatedata["hpa"] = [`hpa.minpods=${this.minpods}`, `hpa.maxpods=${this.maxpods}`, `hpa.targetcpupercent=${this.targetcpupercent}`];
            } else {
                updatedata["hpa"] = [`storage.storagesize=${this.storage}`];
            }

            let resource = this.resource_(`api/v1/helm/_row/release/namespace/${this.release.namespace}/name/${this.release.name}`, {}, { save: { method: 'POST' } });
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
    onEditReleaseSuccess_() {
        this.log_.info(`Successfully update release`);
        /** @type {string} @desc release 更新成功 */
        let MSG_release_success_title = goog.getMsg('更新成功');
        this.toastr["success"](MSG_release_success_title, 0, {
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
        let MSG_release_error_title = goog.getMsg('更新失败');
        this.toastr["warning"](MSG_release_error_title, 0, {
            closeButton: true,
            timeOut: 10000,
        });
        this.loading = false;
        this.mdDialog_.hide();
    }
}

function i18n() {
    return {
        /** @export {string} @desc Title for the edit release dialog. */
        MSG_RELEASE_EDIT_HPA_TITLE: goog.getMsg('Update release Hpa'),
        /** @export {string} @desc Title for the edit release dialog. */
        MSG_RELEASE_EDIT_STORAGE_TITLE: goog.getMsg('Update release Storage'),
        /** @export {string} @desc update release minpods. */
        MSG_RELEASE_MINPODS: goog.getMsg('Minpods'),
        /** @export {string} @desc update release maxpods. */
        MSG_RELEASE_MAXPODS: goog.getMsg('Maxpods'),
        /** @export {string} @desc update release targetcpupercent. */
        MSG_RELEASE_TARGECPUPERCENT: goog.getMsg('Targetcpupercent'),
        /** @export {string} @desc update release storage. */
        MSG_RELEASE_STORAGE: goog.getMsg('Storage'),
        /** @export {string} @desc update release cancle. */
        MSG_RELEASE_CANCEL_ACTION: goog.getMsg('Cancle'),
        /** @export {string} @desc update release OK. */
        MSG_RELEASE_OK_ACTION: goog.getMsg('OK'),
    };
}