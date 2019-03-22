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

// import { StateParams } from 'common/resource/resourcedetail';
// import { stateName } from 'usermanagement/usermanagementlist_state';

/**
 * Controller for the replica set card.
 *
 * @final
 */
export default class UsermanagementCardController {
    /**
     * @param {!ui.router.$state} $state
     * @param {!angular.$interpolate} $interpolate
     * @param {!./../common/namespace/namespace_service.NamespaceService} kdNamespaceService
     * @ngInject
     */
    constructor($state, $resource, $interpolate, kdNamespaceService, $mdDialog, toastr) {
            /** @export  */
            this.toastr = toastr;
            // {!backendApi.Usermanagement}
            /**
             * Initialized from the scope.
             * @export
             */
            this.usermanagement = {};

            /** @private {!ui.router.$state} */
            this.state = $state;
            /** @private */
            this.resource = $resource;

            /** @private {!angular.$interpolate} */
            this.interpolate_ = $interpolate;

            /** @private {!./../common/namespace/namespace_service.NamespaceService} */
            this.kdNamespaceService_ = kdNamespaceService;
            /**@export*/
            this.$mdDialog = $mdDialog;
        }
        /**
         * @export
         */
    $onInit() {}

    /**
     * @return {boolean}
     * @export
     */
    areMultipleNamespacesSelected() {
        return this.kdNamespaceService_.areMultipleNamespacesSelected();
    }

    // /**
    //  * @return {string}
    //  * @export
    //  */
    // getUsermanagementDetailHref() {
    //     return this.state_.href(
    //         stateName,
    //         new StateParams(this.usermanagement.objectMeta.namespace, this.usermanagement.objectMeta.name));
    // }

    /**
     * Returns true if any of replica set pods has warning, false otherwise
     * @return {boolean}
     * @export
     */
    hasWarnings() {
        // return this.usermanagement.pods.warnings.length > 0;
    }

    /**
     * Returns true if replica set pods have no warnings and there is at least one pod
     * in pending state, false otherwise
     * @return {boolean}
     * @export
     */
    isPending() {
        // return !this.hasWarnings() && this.usermanagement.pods.pending > 0;
    }

    /**
     * @return {boolean}
     * @export
     */
    isSuccess() {
        return !this.isPending() && !this.hasWarnings();
    }

    /**
     * @export
     */
    fResetPassword(ev, currentUser) {
            // Appending dialog to document.body to cover sidenav in docs app
            var confirm = this.$mdDialog.confirm()
                .title('该用户I密码会被重置为88888888，确定重置？')
                .ariaLabel('Lucky day')
                .targetEvent(ev)
                .ok('确定重置')
                .cancel('取消');

            this.$mdDialog.show(confirm).then(() => {
                let resource = this.resource(`api/v1/user/chgpwd`, {}, { save: { method: 'put' } });
                resource.save({
                        "username": currentUser.username,
                        "password": window["sha1"]("88888888"),
                        "email": currentUser.email,
                        "isadmin": false
                    },
                    (res) => {
                        if (res['errcode'] == "0") {
                            this.state.reload();
                            this.toastr["success"]("重置成功");
                        } else {
                            this.toastr["error"](res['errmsg']);
                        }
                    },
                    (err) => {
                        alert("重置失败")
                    }
                )
            }, function() {});
        }
        /**
         * @export
         */
    fDeleteUserMsg(ev, currentUser) {
            var confirm = this.$mdDialog.confirm()
                .title('用户删除后资源不可恢复，确定删除？')
                .ariaLabel('Lucky day')
                .targetEvent(ev)
                .ok('确定删除')
                .cancel('取消');

            this.$mdDialog.show(confirm).then(() => {
                let resource = this.resource(`api/v1/user/${currentUser.username}`, {}, { save: { method: 'delete' } });
                resource.save(
                    (res) => {
                        if (res['errcode'] == "0") {
                            this.state.reload();
                            this.toastr["success"]("删除成功");
                        } else {
                            this.toastr["error"](res['errmsg']);
                        }
                    },
                    (err) => {
                        alert("删除失败")
                    }
                )
            }, function() {});
        }
        // /**
        //  * @export
        //  * @param  {string} creationDate - creation date of the usermanagement
        //  * @return {string} localized tooltip with the formatted creation date
        //  */
        // getCreatedAtTooltip(creationDate) {
        //   let filter = this.interpolate_(`{{date | date}}`);
        //   /** @type {string} @desc Tooltip 'Created at [some date]' showing the exact creation time of
        //    * a usermanagement. */
        //   let MSG_DEPLOYMENT_LIST_CREATED_AT_TOOLTIP =
        //       goog.getMsg('Created at {$creationDate}', {'creationDate': filter({'date': creationDate})});
        //   return MSG_DEPLOYMENT_LIST_CREATED_AT_TOOLTIP;
        // }
}

/**
 * @return {!angular.Component}
 */
export const usermanagementCardComponent = {
    bindings: {
        'usermanagement': '=',
    },
    controller: UsermanagementCardController,
    templateUrl: 'usermanagement/usermanagementcard.html',
};