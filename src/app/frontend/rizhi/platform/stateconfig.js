import { breadcrumbsConfig } from 'common/components/breadcrumbs/breadcrumbs_service';

import { stateName as rizhiName, stateUrl } from './state';
import { platformController } from './controller';
import { stateName as parentState } from '../state';

/**
 * Configures states for the pvc.
 * @type {!ui.router.StateConfig}
 */
export const platformConfig = {
    url: stateUrl,
    parent: parentState,
    // resolve: {
    //     "platformList": resolveStorageResource,
    // },
    views: {
        '': {
            controller: platformController,
            controllerAs: '$ctrl',
            templateUrl: 'rizhi/platform/platform.html',
        },
    },
    data: {
        [breadcrumbsConfig]: {
            'label': 'platform',
        },
    },
};

// /**
//  * @param {!angular.Resource} kdStorageResource
//  * @param {!./../../common/pagination/pagination_service.PaginationService} kdPaginationService
//  * @return {!angular.$q.Promise}
//  * @ngInject
//  */
// export function resolveStorageResource(kdStorageResource, kdPaginationService) {
//     let query = kdPaginationService.getDefaultResourceQuery("default");
//     return kdStorageResource.get(query).$promise;
// }