/**
 * Created by huimi on 17-7-18.
 */

import { stateName, stateUrl } from './state';
import { LoginController } from './controller';
/**
 * Configures states for the login view.
 *
 * @param {!ui.router.$stateProvider} $stateProvider
 * @ngInject
 */
export default function stateConfig($stateProvider) {
    $stateProvider.state(stateName, {
        url: stateUrl,
        views: {
            'main': {
                controller: LoginController,
                controllerAs: '$ctrl',
                templateUrl: 'login/login.html',
            },
        },
    });
}