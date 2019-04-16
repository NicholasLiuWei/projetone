import { breadcrumbsConfig } from 'common/components/breadcrumbs/breadcrumbs_service';

import { stateName as storageName, stateUrl } from './state';
import { storageClassController } from './controller';
import { stateName as parentState } from '../state';

/**
 * Configures states for the pvc.
 * @type {!ui.router.StateConfig}
 */
export const storageclassConfig = {
    url: stateUrl,
    parent: parentState,
    resolve: {
        "storageClassList": resolveStorageResource,
    },
    views: {
        '': {
            controller: storageClassController,
            controllerAs: '$ctrl',
            templateUrl: 'storage/storageclass/storageclass.html',
        },
    },
    data: {
        [breadcrumbsConfig]: {
            'label': 'storageclass',
        },
    },
};

/**
 * @param {!angular.Resource} kdStorageResource
 * @param {!./../../common/pagination/pagination_service.PaginationService} kdPaginationService
 * @return {!angular.$q.Promise}
 * @ngInject
 */
export function resolveStorageResource(kdStorageResource, kdPaginationService) {
    let query = kdPaginationService.getDefaultResourceQuery("");
    return kdStorageResource.get(query).$promise;
}