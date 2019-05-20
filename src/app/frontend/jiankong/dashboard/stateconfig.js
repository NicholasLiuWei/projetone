import { breadcrumbsConfig } from 'common/components/breadcrumbs/breadcrumbs_service';

import { stateName as storageName, stateUrl } from './state';
import { dashboardController } from './controller';
import { stateName as parentState } from '../state';

/**
 * Configures states for the pv.
 * @type {!ui.router.StateConfig}
 */
export const dashboardConfig = {
    url: stateUrl,
    parent: parentState,
    resolve: {
        // "cephclusterChart1": cephclusterChart1,
        // "cephclusterChart1_1": cephclusterChart1_1,
        // "cephclusterChart2": cephclusterChart2,
        // "cephclusterChart2_used": cephclusterChart2_used,
        // "cephclusterChart2_total": cephclusterChart2_total,
        // "cephclusterChart2_1": cephclusterChart2_1,
        // "cephclusterChart2_1_used": cephclusterChart2_1_used,
        // "cephclusterChart2_1_total": cephclusterChart2_1_total,
        // "cephclusterChart2_2": cephclusterChart2_2,
        // "cephclusterChart2_2_used": cephclusterChart2_2_used,
        // "cephclusterChart2_2_total": cephclusterChart2_2_total,
        // "cephclusterChart3": cephclusterChart3,
    },
    views: {
        '': {
            controller: dashboardController,
            controllerAs: '$ctrl',
            templateUrl: 'jiankong/dashboard/dashboard.html',
        },
    },
    data: {
        [breadcrumbsConfig]: {
            'label': 'dashboard',
        },
    },
}


// /**
//  * @param {!angular.$resource} $resource
//  * @return {!angular.Resource}
//  * @ngInject
//  */
// function cephclusterChart1($resource) {
//     return $resource('api/v1/query_range?query=sum%20(rate%20(container_network_receive_bytes_total%7Bkubernetes_io_hostname=~"^.*$"}[1m]))');
// }

// /**
//  * @param {!angular.$resource} $resource
//  * @return {!angular.Resource}
//  * @ngInject
//  */
// function cephclusterChart1_1($resource) {
//     return $resource('api/v1/query_range?query=-%20sum%20(rate%20(container_network_transmit_bytes_total%7Bkubernetes_io_hostname%3D~%22%5E.*%24%22%7D%5B1m%5D))');
// }

// /**
//  * @param {!angular.$resource} $resource
//  * @return {!angular.Resource}
//  * @ngInject
//  */
// function cephclusterChart2($resource) {
//     return $resource('api/v1/query_range?query=sum%20(container_memory_working_set_bytes%7Bid%3D%22%2F%22%2Ckubernetes_io_hostname%3D~%22%5E.*%24%22%7D)%20%2F%20sum%20(machine_memory_bytes%7Bkubernetes_io_hostname%3D~%22%5E.*%24%22%7D)%20*%20100');
// }

// /**
//  * @param {!angular.$resource} $resource
//  * @return {!angular.Resource}
//  * @ngInject
//  */
// function cephclusterChart2_used($resource) {
//     return $resource('api/v1/query_range?query=sum%20(container_memory_working_set_bytes%7Bid%3D%22%2F%22%2Ckubernetes_io_hostname%3D~%22%5E.*%24%22%7D)');
// }

// /**
//  * @param {!angular.$resource} $resource
//  * @return {!angular.Resource}
//  * @ngInject
//  */
// function cephclusterChart2_total($resource) {
//     return $resource('api/v1/query_range?query=sum%20(machine_memory_bytes%7Bkubernetes_io_hostname%3D~%22%5E.*%24%22%7D)');
// }

// /**
//  * @param {!angular.$resource} $resource
//  * @return {!angular.Resource}
//  * @ngInject
//  */
// function cephclusterChart2_1_used($resource) {
//     return $resource('api/v1/query_range?query=sum%20(rate%20(container_cpu_usage_seconds_total%7Bid%3D%22%2F%22%2Ckubernetes_io_hostname%3D~%22%5E.*%24%22%7D%5B1m%5D))');
// }

// /**
//  * @param {!angular.$resource} $resource
//  * @return {!angular.Resource}
//  * @ngInject
//  */
// function cephclusterChart2_1_total($resource) {
//     return $resource('api/v1/query_range?query=sum%20(machine_cpu_cores%7Bkubernetes_io_hostname%3D~%22%5E.*%24%22%7D)');
// }

// /**
//  * @param {!angular.$resource} $resource
//  * @return {!angular.Resource}
//  * @ngInject
//  */
// function cephclusterChart2_2_used($resource) {
//     return $resource('api/v1/query_range?query=sum%20(container_fs_usage_bytes%7Bdevice%3D~%22%5E%2Fdev%2F%5Bsv%5Dd%5Ba-z%5D%5B1-9%5D%24%22%2Cid%3D%22%2F%22%2Ckubernetes_io_hostname%3D~%22%5E.*%24%22%7D)');
// }

// /**
//  * @param {!angular.$resource} $resource
//  * @return {!angular.Resource}
//  * @ngInject
//  */
// function cephclusterChart2_2_total($resource) {
//     return $resource('api/v1/query_range?query=sum%20(container_fs_limit_bytes%7Bdevice%3D~%22%5E%2Fdev%2F%5Bsv%5Dd%5Ba-z%5D%5B1-9%5D%24%22%2Cid%3D%22%2F%22%2Ckubernetes_io_hostname%3D~%22%5E.*%24%22%7D)');
// }

// /**
//  * @param {!angular.$resource} $resource
//  * @return {!angular.Resource}
//  * @ngInject
//  */
// function cephclusterChart2_1($resource) {
//     return $resource('api/v1/query_range?query=sum%20(rate%20(container_cpu_usage_seconds_total%7Bid%3D%22%2F%22%2Ckubernetes_io_hostname%3D~%22%5E.*%24%22%7D%5B1m%5D))');
// }

// /**
//  * @param {!angular.$resource} $resource
//  * @return {!angular.Resource}
//  * @ngInject
//  */
// function cephclusterChart2_2($resource) {
//     return $resource('api/v1/query_range?query=sum%20(rate%20(container_cpu_usage_seconds_total%7Bid%3D%22%2F%22%2Ckubernetes_io_hostname%3D~%22%5E.*%24%22%7D%5B1m%5D))%20%2F%20sum%20(machine_cpu_cores%7Bkubernetes_io_hostname%3D~%22%5E.*%24%22%7D)%20*%20100');
// }

// /**
//  * @param {!angular.$resource} $resource
//  * @return {!angular.Resource}
//  * @ngInject
//  */
// function cephclusterChart3($resource) {
//     return $resource('api/v1/query_range?query=sum%20(rate%20(container_cpu_usage_seconds_total%7Bimage!%3D%22%22%2Cname%3D~%22%5Ek8s_.*%22%2Ckubernetes_io_hostname%3D~%22%5E.*%24%22%7D%5B1m%5D))%20by%20(pod_name)');
// }