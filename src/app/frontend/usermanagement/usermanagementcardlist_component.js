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
 * @final
 */
class UsermanagementCardListController {
    /**
     * @param {!./../common/namespace/namespace_service.NamespaceService} kdNamespaceService
     * @ngInject
     */
    constructor(kdNamespaceService, $mdDialog) {

        // /** @private {!./../common/namespace/namespace_service.NamespaceService} */
        // this.usermanagementList = {
        //     items: [
        //         { "name": "name1", "email": "11@163.com", "root": "普通用户" },
        //         { "name": "name2", "email": "22@163.com", "root": "普通用户" },
        //         { "name": "name3", "email": "33@163.com", "root": "普通用户" },
        //         { "name": "name4", "email": "44@163.com", "root": "普通用户" },
        //         { "name": "name5", "email": "55@163.com", "root": "普通用户" }
        //     ],
        //     listMeta: {
        //         "totalitems": 5
        //     },
        //     typeMeta: {
        //         "kind": "usermanagement"
        //     }
        // };
        /**@export */
        this.kdNamespaceService_ = kdNamespaceService;
        /**@export */
        this.usermanagementListResource = {};
        /**@export */
        this.$mdDialog = $mdDialog;
    }

    /**
     * @return {boolean}
     * @export
     */
    areMultipleNamespacesSelected() {
        return this.kdNamespaceService_.areMultipleNamespacesSelected();
    }

    // -----------------------
    /**
     * @export
     */
    fAddNewUser() {
        this.$mdDialog.show({
            contentElement: '#myDialog',
            parent: angular.element(document.body),
            clickOutsideToClose: true
        });
    }
}

/**
 * @return {!angular.Component}
 */
export const usermanagementCardListComponent = {
    transclude: {
        // Optional header that is transcluded instead of the default one.
        'header': '?kdHeader',
    },
    bindings: {
        'usermanagementList': '<',
        'usermanagementListResource': '<',
    },
    templateUrl: 'usermanagement/usermanagementcardlist.html',
    controller: UsermanagementCardListController,
};