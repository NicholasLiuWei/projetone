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
 * Controller for the node list view.
 *
 * @final
 */
export class NodeListController {
    /**
     * @param {!backendApi.NodeList} nodeList
     * @param {!angular.Resource} kdNodeListResource
     * @ngInject
     */
    constructor(nodeList, kdNodeListResource, $rootScope, $interval) {
            /** @export {!backendApi.NodeList} */
            this.nodeList = nodeList;

            /** @export {!angular.Resource} */
            this.nodeListResource = kdNodeListResource;

            /** @private {!angular.$interval} */
            this.interval_ = $interval;

            /** @export */
            this.rootScope_ = $rootScope;

            /** @export */
            $rootScope.loading = false;

            /** @export */
            $rootScope.show = false;

            /** @export */
            this.i18n = i18n;

            /** @export */
            $rootScope.nodedetail = {};

            /** @export */
            this.statusCodes = {
                1: i18n.MSG_NODE_CARD_detail_good,
                2: i18n.MSG_NODE_CARD_detail_error,
            };
        }
        /** 
         * 隐藏详情
         * @export 
         */
    hide() {
        if (this.rootScope_.nodedetail['interval']) {
            this.interval_.cancel(this.rootScope_.nodedetail['interval']);
        }
        this.rootScope_.show = false;
        this.rootScope_.loading = true;
    }
}
const i18n = {
    /** @export {string} @desc 服务器详情页千兆网卡 */
    MSG_NODE_CARD_QIANZHAO_NET: goog.getMsg('千兆网卡'),
    /** @export {string} @desc 服务器详情页万兆网卡 */
    MSG_NODE_CARD_WANZHAO_NET: goog.getMsg('万兆网卡'),
    /** @export {string} @desc 正常 Normal */
    MSG_NODE_CARD_detail_good: goog.getMsg('正常'),
    /** @export {string} @desc 异常 Abnormal*/
    MSG_NODE_CARD_detail_error: goog.getMsg('异常'),
};