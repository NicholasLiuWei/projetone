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
 * Controller for the node card.
 *
 * @final
 */
export class NodeCardListController {
    /**
     * @param {!ui.router.$state} $state
     * @param {!md.$dialog} $mdDialog
     * @ngInject
     */
    constructor($state, $mdDialog) {
        this.current = -1;
    }

    /**
     * only open function
     * @export
     */
    oneopen() {

    }
}

/**
 * @return {!angular.Component}
 */
export const nodeCardListComponent = {
    transclude: {
        // Optional header that is transcluded instead of the default one.
        'header': '?kdHeader',
    },
    bindings: {
        'nodeList': '<',
        'nodeListResource': '<',
    },
    bindToController: true,
    controller: NodeCardListController,
    templateUrl: 'nodelist/nodecardlist.html',
};