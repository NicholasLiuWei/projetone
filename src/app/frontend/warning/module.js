import stateConfig from './stateconfig';

export default angular
    .module(
        "kubernetesDashboard.warning", [
            'ngMaterial',
            'ngResource',
            'ui.router',
            'ngMessages',
        ])
    .config(stateConfig)
    .factory("kdAlertResource", alertResource)
    .factory("kdEmailResource", emailResource);

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
function alertResource($resource) {
    return $resource('alert/alerts');
};

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
function emailResource($resource) {
    return $resource('alert/email');
};