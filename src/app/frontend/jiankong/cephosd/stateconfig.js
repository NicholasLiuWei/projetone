import { breadcrumbsConfig } from 'common/components/breadcrumbs/breadcrumbs_service';

import { stateName as storageName, stateUrl } from './state';
import { cephosdController } from './controller';
import { stateName as parentState } from '../state';

/**
 * Configures states for the pv.
 * @type {!ui.router.StateConfig}
 */
export const cephosdConfig = {
    url: stateUrl,
    parent: parentState,
    resolve: {
        // "cephpoolChart1": cephpoolChart1,
        // "cephpoolChart1_1": cephpoolChart1_1,
        // "cephpoolChart1_2": cephpoolChart1_2,
        // "cephpoolChart1_3": cephpoolChart1_3,
        // "cephpoolChart2": cephpoolChart2,
        // "cephpoolChart3_1": cephpoolChart3_1,
        // "cephpoolChart3_2": cephpoolChart3_2,
        // "cephpoolChart4_1": cephpoolChart4_1,
        // "cephpoolChart4_2": cephpoolChart4_2,
        // "cephpoolChart5_1": cephpoolChart5_1,
        // "cephpoolChart5_2": cephpoolChart5_2,
    },
    views: {
        '': {
            controller:cephosdController,
            controllerAs: '$ctrl',
            templateUrl: 'jiankong/cephosd/cephosd.html',
        },
    },
    data: {
        [breadcrumbsConfig]: {
            'label': 'cephosd',
        },
    },
}


/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
function cephpoolChart1($resource) {
    return $resource('api/v1/query_range?query=ceph_pool_available_bytes%7Bpool%3D~%22cephfs_data%22%7D');
}

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
function cephpoolChart1_1($resource) {
    return $resource('api/v1/query_range?query=ceph_pool_used_bytes%7Bpool%3D~%22cephfs_data%22%7D');
}

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
function cephpoolChart1_2($resource) {
    return $resource('api/v1/query_range?query=ceph_pool_used_bytes%7Bpool%3D~%22cephfs_data%22%7D%20%2B%20ceph_pool_available_bytes%7Bpool%3D~%22cephfs_data%22%7D');
}


/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
function cephpoolChart1_3($resource) {
    return $resource('api/v1/query_range?query=ceph_pool_raw_used_bytes%7Bpool%3D~%22cephfs_data%22%7D');
}

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
function cephpoolChart2($resource) {
    return $resource('api/v1/query_range?query=%20ceph_pool_used_bytes%7Bpool%3D%22cephfs_data%22%7D%20%2F%20(ceph_pool_available_bytes%7Bpool%3D%22cephfs_data%22%7D%20%2B%20ceph_pool_used_bytes%7Bpool%3D%22cephfs_data%22%7D)');
}


/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
function cephpoolChart3_1($resource) {
    return $resource('api/v1/query_range?query=ceph_pool_objects_total%7Bpool%3D~%22cephfs_data%22%7D');
}


/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
function cephpoolChart3_2($resource) {
    return $resource('api/v1/query_range?query=ceph_pool_dirty_objects_total%7Bpool%3D~%22cephfs_data%22%7D');
}


/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
function cephpoolChart4_1($resource) {
    return $resource('api/v1/query_range?query=irate(ceph_pool_read_total%7Bpool%3D~%22cephfs_data%22%7D%5B3m%5D)');
}

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
function cephpoolChart4_2($resource) {
    return $resource('api/v1/query_range?query=irate(ceph_pool_write_total%7Bpool%3D~%22cephfs_data%22%7D%5B3m%5D)');
}


/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
 function cephpoolChart5_1($resource) {
    return $resource('api/v1/query_range?query=irate(ceph_pool_read_bytes_total%7Bpool%3D~%22cephfs_data%22%7D%5B3m%5D)');
}

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
 function cephpoolChart5_2($resource) {
    return $resource('api/v1/query_range?query=irate(ceph_pool_write_bytes_total%7Bpool%3D~%22cephfs_data%22%7D%5B3m%5D)');
}
