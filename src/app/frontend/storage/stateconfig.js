import { stateName as chromeStateName } from 'chrome/chrome_state';
import { breadcrumbsConfig } from 'common/components/breadcrumbs/breadcrumbs_service';

import { stateName as storageName, stateUrl } from './state';
import { storageController } from './controller';
import { stateName as pvcStateName } from './pvc/state';
import { stateName as pvStateName } from './pv/state';
import { stateName as storageclassStateName } from './storageclass/state';
import { pvcConfig } from './pvc/stateconfig';
import { pvConfig } from './pv/stateconfig';
import { storageclassConfig } from './storageclass/stateconfig';

/**
 * Configures states for the home.
 *
 * @param {!ui.router.$stateProvider} $stateProvider
 * @ngInject
 */
export default function stateConfig($stateProvider) {
    $stateProvider.state(storageName, {
        url: stateUrl,
        parent: chromeStateName,
        resolve: {},
        views: {
            '': {
                controller: storageController,
                controllerAs: '$ctrl',
                templateUrl: 'storage/storage.html',
            },
        },
        data: {
            [breadcrumbsConfig]: {
                'label': i18n.MSG_BREADCRUMBS_STORAGE_LABEL,
            },
        },
    });
    $stateProvider.state(pvStateName, pvConfig);
    $stateProvider.state(pvcStateName, pvcConfig);
    $stateProvider.state(storageclassStateName, storageclassConfig);
}

const i18n = {
    /** @type {string} @desc Label 'Storage' that appears as a breadcrumbs on the action bar. */
    MSG_BREADCRUMBS_STORAGE_LABEL: goog.getMsg('Storage'),
};