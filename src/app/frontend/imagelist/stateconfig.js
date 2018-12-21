import { stateName as chromeStateName } from 'chrome/chrome_state';
import { breadcrumbsConfig } from 'common/components/breadcrumbs/breadcrumbs_service';

import { stateName as imagelistName, stateUrl } from './state';
import { imagelistController } from './controller';


/**
 * Configures states for the imagelist.
 *
 * @param {!ui.router.$stateProvider} $stateProvider
 * @ngInject
 */
export default function stateConfig($stateProvider) {
    $stateProvider.state(imagelistName, {
        url: stateUrl,
        parent: chromeStateName,
        resolve: {
            'baseimageList': resolveBaseImageList,
            'normalimageList': resolveNormalImageList
        },
        views: {
            '': {
                controller: imagelistController,
                controllerAs: 'ctrl',
                templateUrl: 'imagelist/imagelist.html',
            },
        },
        data: {
            [breadcrumbsConfig]: {
                'label': i18n.MSG_IMAGE_LABEL,
            },
        },
    });
}

/**
 * @param {!angular.Resource} kdBaseImageResource
 * @param {!./../chrome/chrome_state.StateParams} $stateParams
 * @param {!./../common/pagination/pagination_service.PaginationService} kdPaginationService
 * @return {!angular.$q.Promise}
 * @ngInject
 */
export function resolveBaseImageList(kdBaseImageResource, $stateParams, kdPaginationService) {
    let query = kdPaginationService.getDefaultResourceQuery($stateParams.namespace);
    return kdBaseImageResource.query(query).$promise;
}

/**
 * @param {!angular.Resource} kdNormalImageResource
 * @param {!./../chrome/chrome_state.StateParams} $stateParams
 * @param {!./../common/pagination/pagination_service.PaginationService} kdPaginationService
 * @return {!angular.$q.Promise}
 * @ngInject
 */
export function resolveNormalImageList(kdNormalImageResource, $stateParams, kdPaginationService) {
    let query = kdPaginationService.getDefaultResourceQuery($stateParams.namespace);
    return kdNormalImageResource.query(query).$promise;
}

const i18n = {
    /** @type {string} @desc Label 'Releases' that appears as a breadcrumbs on the action bar. */
    MSG_IMAGE_LABEL: goog.getMsg('Image'),
};