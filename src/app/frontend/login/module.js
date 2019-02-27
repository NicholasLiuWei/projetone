/**
 * Created by huimi on 17-7-18.
 */

import stateConfig from './stateconfig';

export default angular
    .module(
        'kubernetesDashboard.logins', [
            'ngMaterial',
            'ngMessages',
            'ngResource',
            'ui.router',
        ])
    .config(stateConfig)
    .factory('kdloginStatus', loginStatus);

/**
 * 检查登录状态
 *
 * @ngInject
 */
function loginStatus($state, $cookies) {
    return {
        "checkLogin": () => {
            if (!$cookies.get('login')) {
                $state.go('logins');
            }
        },
    };
};