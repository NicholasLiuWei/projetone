import { breadcrumbsConfig } from 'common/components/breadcrumbs/breadcrumbs_service';

import { stateName as rizhiName, stateUrl } from './state';
import { logController } from './controller';
import { stateName as parentState } from '../state';

/**
 * Configures states for the pvc.
 * @type {!ui.router.StateConfig}
 */
export const logConfig = {
    url: stateUrl,
    parent: parentState,
    // resolve: {
    //     "logList": resolveStorageResource,
    // },
    views: {
        '': {
            controller: logController,
            controllerAs: '$ctrl',
            templateUrl: 'rizhi/log/log.html',
        },
    },
    data: {
        [breadcrumbsConfig]: {
            'label': 'log',
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