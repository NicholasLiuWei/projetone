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
 * Controller for the replica set list view.
 *
 * @final
 */
export class ReleaseListController {
    /**
     * @param {!backendApi.ReleaseList} releaseList
     * @param {!angular.Resource} kdReleaseListResource
     * @ngInject
     */
    constructor(releaseList, kdReleaseListResource, $rootScope, $scope, $resource) {
        /** @export {!backendApi.ReleaseList} */
        this.releaseList = releaseList;

        /** @export {!angular.Resource} */
        this.releaseListResource = kdReleaseListResource;

        /** @export */
        this.rootScope_ = $rootScope;

        /** @export */
        $rootScope.releaseDetail = [];

        /** @export */
        this.show = false;

        /** @export */
        this.loading = true;

        /** @export */
        this.i18n = i18n;

        /** @export */
        $rootScope.releaseStr = "";
        $scope.$on('loading', () => {
            this.show = true;
        })
        $scope.$on('getsuccess', () => {
            this.loading = false;
        })
        $scope.$on('geterroe', () => {
            this.loading = false;
        })
    }

    /**
     * @return {boolean}
     * @export
     */
    shouldShowZeroState() {
        return this.releaseList.listMeta.totalItems === 0;
    }

    /**
     * @export
     */
    getReleaseHref() {
        let i = this.rootScope_.releaseStr.indexOf('/TCP') == -1 ? this.rootScope_.releaseStr.indexOf('/UDP') : this.rootScope_.releaseStr.indexOf('/TCP');
        let str = this.rootScope_.releaseStr.substring(i - 5, i);
        if (i == -1 || str.indexOf(':') == -1) {
            return '-';
        } else {
            return str;
        }
    }

    /**
     * @export
     */
    getHost() {
        return location.hostname;
    }
}

const i18n = {
    /** @export {string} @desc 域名服务*/
    MSG_RELEASE_DOMAIN_SERVICE: goog.getMsg('域名服务'),

    /** @export {string} @desc 域名 */
    MSG_RELEASE_DOMAIN: goog.getMsg('域名'),
}