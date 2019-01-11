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
 * Controller for the release card.
 *
 * @final
 */
export default class ReleaseCardController {
    /**
     * @param {!ui.router.$state} $state
     * @param {!angular.$interpolate} $interpolate
     * @param {!./../common/namespace/namespace_service.NamespaceService} kdNamespaceService
     * @param {!./../common/resource/verber_service.VerberService} kdResourceVerberService
     * @ngInject
     */
    constructor($resource, kdAppConfigService, $state, $interpolate, kdNamespaceService, $mdSidenav, $scope, $rootScope, $mdDialog, kdResourceVerberService, kdReleaseService) {
        /**
         * Initialized from the scope.
         * @export {!backendApi.Release}
         */
        this.release;

        /** @private {!ui.router.$state} */
        this.state_ = $state;

        /** @private {!angular.$interpolate} */
        this.interpolate_ = $interpolate;

        /** @private {!./../common/namespace/namespace_service.NamespaceService} */
        this.kdNamespaceService_ = kdNamespaceService;

        /** @private {!./../common/resource/verber_service.VerberService} */
        this.kdResourceVerberService_ = kdResourceVerberService;

        /** @private {!./updateRelease_service.ReleaseService} */
        this.kdReleaseService_ = kdReleaseService;

        /** @export */
        this.i18n = i18n;

        /** @export */
        this.typeMeta = {
            'kind': 'release',
        };
        /** @export */
        this.objectMeta = {};
        this.servertime = kdAppConfigService;

        /** @export */
        this.mdSidenav_ = $mdSidenav;

        /** @export */
        this.mdDialog_ = $mdDialog;

        /** @export */
        this.rootScope_ = $rootScope;

        /** @export */
        this.resource_ = $resource;
        this.statusCodes = {
            8: i18n.MSG_RELEASE_LIST_RELEASE_STATUS_WORK,
            9: i18n.MSG_RELEASE_LIST_RELEASE_STATUS_ERROR,
            10: i18n.MSG_RELEASE_LIST_RELEASE_STATUS_CREATING,
        };
        this.scope = $scope;

        /** @export */
        this.stateful = false;
    }
    $onInit() {
            let serverTime = this.servertime.getServerTime();
            let releaseTime = new Date(this.release.info["last_deployed"]["seconds"] * 1000).getTime();
            let time = serverTime - releaseTime;
            if (time < 5 * 60 * 1000) {
                if (this.release.info["status"]["code"] == 9) {
                    this.release.info["status"]["code"] = 10;
                }
            }
        }
        /**
         * is stateful release.
         *
         * @export
         */
    isStatefulRelease() {
            if (this.release.chart["values"]["raw"].indexOf('storagesize') != -1) {
                this.stateful = false;
            } else {
                this.stateful = true;
            }
        }
        /**
         * @return {boolean}
         * @export
         */
    areMultipleNamespacesSelected() {
        return this.kdNamespaceService_.areMultipleNamespacesSelected();
    }

    /**
     * @export
     */
    remove() {
        this.objectMeta = {
            'name': this.release.name,
            'namespace': this.release.namespace,
            "labels": {
                "release": "release",
            },
            "creationTimestamp": "1516699148",
        };
        this.kdResourceVerberService_
            .showDeleteDialog(
                "Release", this.typeMeta, this.objectMeta)
            .then(() => {
                // For now just reload the state. Later we can remove the item in place.
                this.state_.reload();
            });
        return false;
    }

    /**
     * @export
     */
    update() {
        this.kdReleaseService_
            .showEditReleaseDialog(
                this.release)
            .then(() => {
                // For now just reload the state. Later we can remove the item in place.
                this.state_.reload();
            });
        return false;
    }

    /**
     * @export
     */
    updateImage() {
        this.kdReleaseService_
            .showEditReleaseImageDialog(
                this.release)
            .then(() => {
                // For now just reload the state. Later we can remove the item in place.
                this.state_.reload();
            });
        return false;
    }

    /**
     * @return {string}
     * @export
     */
    getReleaseStatus() {
        return this.statusCodes[this.release.info.status.code];
    }

    /**
     * @return {number}
     * @export
     */
    getReleaseRelativeTime() {
        return this.release.info.last_deployed.seconds * 1000;
    }

    /**
     * Returns true if any of replica set pods has warning, false otherwise
     * @return {boolean}
     * @export
     */
    hasWarnings() {
            return false;
        }
        // TODO: Releases

    /**
     * Returns true if replica set pods have no warnings and there is at least one pod
     * in pending state, false otherwise
     * @return {boolean}
     * @export
     */
    isPending() {
            return false;
        }
        // TODO: Releases

    /**
     * @return {boolean}
     * @export
     */
    isSuccess() {
            return true;
        }
        // TODO: Releases

    /**
     * @export
     * @param  {string} creationDate - creation date of the release
     * @return {string} localized tooltip with the formatted creation date
     */
    getCreatedAtTooltip(creationDate) {
            let filter = this.interpolate_(`{{date | date:'short'}}`);
            /** @type {string} @desc Tooltip 'Created at [some date]' showing the exact creation time of
             * a release. */
            let MSG_RELEASE_LIST_CREATED_AT_TOOLTIP =
                goog.getMsg('Created at {$creationDate}', { 'creationDate': filter({ 'date': creationDate }) });
            return MSG_RELEASE_LIST_CREATED_AT_TOOLTIP;
        }
        /**
         * @export
         */
    toggleRight() {
        this.scope.$emit('loading', {});
        let resource = this.resource_("api/v1/helm/release/namespace/" + this.release.namespace + "/name/" + this.release.name);
        resource.get().$promise.then(function(data) {
            this.scope.$emit('getsuccess', {});
            // this.rootScope_.releaseStr = data["release"]["info"]["status"]["resources"];
            this.rootScope_.releaseStr = data;
            this.structReleaseStr();
        }.bind(this), function(data) {
            this.scope.$emit('geterror', {});
            /** @type {string} @desc 请求服务器详情出错 */
            let MSG_request_release_detail_title = goog.getMsg('错误');
            /** @type {string} @desc 请求服务器详情出错 */
            let MSG_request_release_detail_content = goog.getMsg('请求服务器信息错误,请重试');
            /** @type {string} @desc 请求服务器详情出错 */
            let MSG_request_release_detail_close = goog.getMsg('关闭');
            this.mdDialog_.show(this.mdDialog_.alert()
                .title(MSG_request_release_detail_title)
                .textContent(MSG_request_release_detail_content)
                .ok(MSG_request_release_detail_close));
        }.bind(this));
    }

    /**
     * @export
     */
    structReleaseStr() {
        this.rootScope_.releaseDetail = this.rootScope_.releaseStr;
        // let arr = this.rootScope_.releaseStr.split('\n');
        // for (let i = 0; i < arr.length; i++) {
        //     switch (arr[i]) {
        //         case '==> v1beta1/Deployment':
        //             let deployarr = [];
        //             let j = i + 2;
        //             while (arr[j] != "") {
        //                 let deploy = arr[j].replace(/\s+/g, " ");
        //                 deploy = deploy.split(" ");
        //                 deployarr[j - i - 2] = deploy;
        //                 j++;
        //             }
        //             this.rootScope_.releaseDetail[0] = deployarr;
        //             break;
        //         case '==> v1/Service':
        //             let servicearr = [];
        //             let k = i + 2;
        //             while (arr[k] != "") {
        //                 let service = arr[k].replace(/\s+/g, " ");
        //                 service = service.split(" ");
        //                 servicearr[k - i - 2] = service;
        //                 k++;
        //             };
        //             for (let i = 0; i < servicearr.length; i++) {
        //                 let mes = servicearr[i][3];
        //                 if (mes.indexOf(':') == -1) {
        //                     mes = mes.substr(0, mes.indexOf('/') + 4);
        //                 };
        //                 servicearr[i][3] = [];
        //                 if (mes.indexOf(',') != -1) {
        //                     servicearr[i][3] = mes.split(',');
        //                 } else {
        //                     servicearr[i][3][0] = mes;
        //                 }
        //             }
        //             this.rootScope_.releaseDetail[1] = servicearr;
        //             break;
        //         case '==> v1/PersistentVolumeClaim':
        //             let cunchuarr = [];
        //             let l = i + 2;
        //             while (arr[l] != "") {
        //                 let cunchu = arr[l].replace(/\s+/g, " ");
        //                 cunchu = cunchu.split(" ");
        //                 cunchuarr[l - i - 2] = cunchu;
        //                 l++;
        //             }
        //             this.rootScope_.releaseDetail[2] = cunchuarr;
        //             break;
        //     }
        // }
        // this.rootScope_.releaseDetail[3] = this.release.name;
        //console.log(this.rootScope_.releaseDetail);
    }
}
/**
 * @return {!angular.Component}
 */
export const releaseCardComponent = {
    bindings: {
        'release': '=',
    },
    controller: ReleaseCardController,
    templateUrl: 'releaselist/releasecard.html',
};

const i18n = {
    /** @export {string} @desc Tooltip saying that some pods in a release have errors. */
    MSG_RELEASE_LIST_PODS_ERRORS_TOOLTIP: goog.getMsg('One or more pods have errors'),
    /** @export {string} @desc Tooltip saying that some pods in a release are pending. */
    MSG_RELEASE_LIST_PODS_PENDING_TOOLTIP: goog.getMsg('One or more pods are in pending state'),
    /** @export {string} @desc Label 'Release' which will appear in the release
        delete dialog opened from a release card on the list page.*/
    MSG_RELEASE_LIST_RELEASE_LABEL: goog.getMsg('Release'),
    /** @export {string} @desc 应用状态正常*/
    MSG_RELEASE_LIST_RELEASE_STATUS_WORK: goog.getMsg('正常'),
    /** @export {string} @desc 应用状态正常*/
    MSG_RELEASE_LIST_RELEASE_STATUS_ERROR: goog.getMsg('异常'),
    /** @export {string} @desc 删除应用*/
    MSG_RELEASE_DELETE: goog.getMsg('删除'),
    /** @export {string} @desc 编辑应用*/
    MSG_RELEASE_EDIT: goog.getMsg('编辑应用'),
    /** @export {string} @desc 更新应用镜像*/
    MSG_RELEASE_EDIT_IMAGE: goog.getMsg('更新应用'),
    /** @export {string} @desc 应用状态创建中*/
    MSG_RELEASE_LIST_RELEASE_STATUS_CREATING: goog.getMsg('创建中'),
};