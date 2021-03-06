// Copyright 2017 The Kubernetes Authors.
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

import { breadcrumbsConfig } from 'common/components/breadcrumbs/breadcrumbs_service';

import { stateName as parentState } from '../state';
import { stateUrl } from './state';
import { warningListController } from './controller';

/**
 * Config state object for the Node list view.
 *
 * @type {!ui.router.StateConfig}
 */
export const listConfig = {
    url: stateUrl,
    parent: parentState,
    resolve: {
        "alertList": resolveAlertList
    },
    data: {
        [breadcrumbsConfig]: {
            'label': "warning",
            'parent': 'chrome.warning'
        },
    },
    views: {
        '': {
            controller: warningListController,
            controllerAs: '$ctrl',
            templateUrl: 'warning/list/list.html',
        },
    },
};

/**
 * @param {!angular.Resource} kdAlertResource
 * @param {!../../chrome/chrome_state.StateParams} $stateParams
 * @param {!../../common/pagination/pagination_service.PaginationService} kdPaginationService
 * @return {!angular.$q.Promise}
 * @ngInject
 */
export function resolveAlertList(kdAlertResource, $stateParams, kdPaginationService) {
    let query = kdPaginationService.getDefaultResourceQuery($stateParams.namespace);
    return kdAlertResource.get(query).$promise;
}