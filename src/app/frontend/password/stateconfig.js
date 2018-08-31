/**
 * Created by huimi on 17-7-18.
 */

import { stateName, stateUrl } from './state';
import { PasswordController } from './controller';
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
                controller: PasswordController,
                controllerAs: '$ctrl',
                templateUrl: 'password/password.html',
            },
        },
    });
}