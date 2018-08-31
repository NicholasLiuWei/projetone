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
 * Controller for the change email dialog.
 *
 * @final
 */
export default class AddEmailDialogController {
    /**
     * @param {!md.$dialog} $mdDialog
     * @param {!angular.$log} $log
     * @param {!ui.router.$state} $state
     * @param {!angular.$resource} $resource
     * @ngInject
     */
    constructor($mdDialog, $log, $state, $resource, toastr) {
        /** @export {string} */
        this.repoURL = '';

        /** @private {!md.$dialog} */
        this.mdDialog_ = $mdDialog;

        /** @private {!angular.$log} */
        this.log_ = $log;

        /** @export  */
        this.toastr = toastr;

        /** @private {!ui.router.$state} */
        this.state_ = $state;

        /** @private {!angular.$resource} */
        this.resource_ = $resource;

        /** @export {!angular.FormController} Initialized from the template */
        this.addRepositoryForm;

        /** @export */
        this.i18n = i18n();
        /** @export */
        this.emaillist = [];
        /** @export */
        this.addemail = '';
        /** @export */
        this.disabled = false;
        $resource('email').query((res) => {
                this.emaillist = res;
            },
            (res) => {
                console.log(res);
            });
    }


    /**
     * Change the email.
     *
     * @export
     */
    changeEmail() {
        if (this.addRepositoryForm.$valid) {
            this.disabled = true;
            let obj = {
                "email": this.addemail,
            };
            let resource = this.resource_('email');
            resource.save(
                obj, this.onChangeEmailSuccess_.bind(this),
                this.onChangeEmailError_.bind(this));
        }
    }

    /**
     *  Cancels the add repository dialog.
     *  @export
     */
    cancel() {
        this.mdDialog_.cancel();
    }

    /**
     * @private
     */
    onChangeEmailSuccess_() {
        this.log_.info(`Successfully added repository`);
        this.mdDialog_.hide();
        this.toastr.success('修改成功');
        // this.state_.reload();
    }

    /**
     * @param {!angular.$http.Response} err
     * @private
     */
    onChangeEmailError_(err) {
        this.log_.error(err);
        this.mdDialog_.hide();
        this.toastr.error('修改失败,请重试');
    }
}

function i18n() {
    return {
        /** @export {string} @desc Title for the change email dialog. */
        MSG_CHANGE_EMAIL_TITLE: goog.getMsg('修改收件人'),
        /** @export {string} @desc user help for email. */
        MSG_CHANGE_EMAIL_USER_HELP: goog.getMsg('填写邮箱(多个收件人用 ; 隔开)'),
        /** @export {string} @desc Label for the email. */
        MSG_CHANGE_EMAIL_NAME_LABEL: goog.getMsg('邮箱'),
        /** @export {string} @desc Label for the email. */
        MSG_EMAIL_INVALIED: goog.getMsg('邮箱填写非法,多个收件人用 ; 隔开'),
        /** @export {string} @desc Warning for the email. */
        MSG_CHANGE_EMAIL_NAME_REQUIRED_WARNING: goog.getMsg('邮箱必填'),
        /** @export {string} @desc Action 'Cancel' for the confirmation button on the "change email
            dialog" */
        MSG_CHANGE_EMAIL_CANCEL_ACTION: goog.getMsg('取消'),
        /** @export {string} @desc Action 'OK' for the confirmation button on the "change email
            dialog". */
        MSG_CHANGE_EMAIL_OK_ACTION: goog.getMsg('启用'),
        /** @export {string} @desc Action 'OK' for the confirmation button on the "change email
            dialog". */
        MSG_CHANGE_EMAIL_CURRENT_EMAIL: goog.getMsg('当前接收邮箱'),
    };
};