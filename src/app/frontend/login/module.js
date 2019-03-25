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
    .factory('kdloginUser', loginUser)
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

/**
 * 检查登录用户
 *
 * @ngInject
 */
function loginUser($state, $cookies, $stateParams) {
    return {
        "checkUser": () => {
            let user = $cookies.get('username');
            let namespace = $stateParams.namespace;
            if (user == "admin") {
                user = "_all";
            }
            if (namespace != user) {
                if (user == "_all") {
                    $state.go($state.current.name, { "namespace": user });
                } else {
                    $state.go($state.current.name, { "namespace": user });
                }
            }
        },
    };
};