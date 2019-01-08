import { stateName as chromeStateName } from 'chrome/chrome_state';
import { breadcrumbsConfig } from 'common/components/breadcrumbs/breadcrumbs_service';

import { stateName as storageName, stateUrl } from './state';
import { storageController } from './controller';
import { stateName as serviceStateName } from './service/state';
import { stateName as ingressStateName } from './ingress/state';
import { serviceConfig } from './service/stateconfig';
import { ingressConfig } from './ingress/stateconfig';

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
                templateUrl: 'network/storage.html',
            },
        },
        data: {
            [breadcrumbsConfig]: {
                'label': 'net',
            },
        },
    });
    $stateProvider.state(serviceStateName, serviceConfig);
    $stateProvider.state(ingressStateName, ingressConfig);
}