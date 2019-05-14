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
        "cephclusterChart1": cephclusterChart1,
        "cephclusterChart2": cephclusterChart2,
        "cephclusterChart3": cephclusterChart3,
        "cephclusterChart4": cephclusterChart4, 
        "cephclusterChart5": cephclusterChart5, 
        "cephclusterChart6": cephclusterChart6, 
        "cephclusterChart7": cephclusterChart7, 
        "cephclusterChart8": cephclusterChart8, 
        "cephclusterChart9": cephclusterChart9,
        "cephclusterChart10": cephclusterChart10,
        "cephclusterChart11": cephclusterChart11,
        "cephclusterChart12": cephclusterChart12,
        "cephclusterChart13": cephclusterChart13,
        "cephclusterChart14": cephclusterChart14,
        "cephclusterChart15_1": cephclusterChart15_1,
        "cephclusterChart15_2": cephclusterChart15_2,
        "cephclusterChart15_3": cephclusterChart15_3,
        "cephclusterChart16_1": cephclusterChart16_1,
        "cephclusterChart16_2": cephclusterChart16_2,
        "cephclusterChart17_1": cephclusterChart17_1,
        "cephclusterChart17_2": cephclusterChart17_2,
        "cephclusterChart18_1": cephclusterChart18_1,
        "cephclusterChart18_2": cephclusterChart18_2,
        "cephclusterChart18_3": cephclusterChart18_3,
        "cephclusterChart19_1": cephclusterChart19_1,
        "cephclusterChart19_2": cephclusterChart19_2,
        "cephclusterChart19_3": cephclusterChart19_3,
        "cephclusterChart19_4": cephclusterChart19_4,
        "cephclusterChart19_5": cephclusterChart19_5,
        "cephclusterChart19_6": cephclusterChart19_6,
        "cephclusterChart20_1": cephclusterChart20_1,
        "cephclusterChart20_2": cephclusterChart20_2,
        "cephclusterChart20_3": cephclusterChart20_3,
        "cephclusterChart20_4": cephclusterChart20_4,
        "cephclusterChart21": cephclusterChart21,
        "cephclusterChart22": cephclusterChart22,
        "cephclusterChart23": cephclusterChart23,
        "cephclusterChart24": cephclusterChart24,
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


/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
function cephclusterChart1($resource) {
    return $resource('api/v1/query_range?query=ceph_health_status');
}

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
function cephclusterChart2($resource) {
    return $resource('api/v1/query_range?query=ceph_monitor_quorum_count');
}

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
function cephclusterChart3($resource) {
    return $resource('api/v1/query_range?query=count(ceph_pool_available_bytes)');
}

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
function cephclusterChart4($resource) {
    return $resource('api/v1/query_range?query=ceph_cluster_capacity_bytes');
}

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
function cephclusterChart5($resource) {
    return $resource('api/v1/query_range?query=ceph_cluster_used_bytes');
}

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
function cephclusterChart6($resource) {
    return $resource('api/v1/query_range?query=ceph_cluster_available_bytes%2Fceph_cluster_capacity_bytes');
}

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
function cephclusterChart7($resource) {
    return $resource('api/v1/query_range?query=ceph_osds_in');
}

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
function cephclusterChart8($resource) {
    return $resource('api/v1/query_range?query=ceph_osds%20-%20ceph_osds_in');
}

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
function cephclusterChart9($resource) {
    return $resource('api/v1/query_range?query=sum(ceph_osd_up)');
}


/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
function cephclusterChart10($resource) {
    return $resource('api/v1/query_range?query=ceph_osds_down');
}

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
function cephclusterChart11($resource) {
    return $resource('api/v1/query_range?query=avg(ceph_osd_pgs)');
}

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
function cephclusterChart12($resource) {
    return $resource('api/v1/query_range?query=avg(ceph_osd_perf_apply_latency_seconds)');
}

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
function cephclusterChart13($resource) {
    return $resource('api/v1/query_range?query=avg(ceph_osd_perf_commit_latency_seconds)');
}

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
function cephclusterChart14($resource) {
    return $resource('api/v1/query_range?query=avg(ceph_monitor_latency_seconds)');
}

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
function cephclusterChart15_1($resource) {
    return $resource('api/v1/query_range?query=ceph_cluster_available_bytes');
}                 
/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
function cephclusterChart15_2($resource) {
    return $resource('api/v1/query_range?query=ceph_cluster_used_bytes');
}  
/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
function cephclusterChart15_3($resource) {
    return $resource('api/v1/query_range?query=ceph_cluster_capacity_bytes');
}




/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
function cephclusterChart16_1($resource) {
    return $resource('api/v1/query_range?query=ceph_client_io_write_ops');
}

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
function cephclusterChart16_2($resource) {
    return $resource('api/v1/query_range?query=ceph_client_io_read_ops');
}

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
function cephclusterChart17_1($resource) {
    return $resource('api/v1/query_range?query=ceph_client_io_write_bytes');
}

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
function cephclusterChart17_2($resource) {
    return $resource('api/v1/query_range?query=ceph_client_io_read_bytes');
}

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
function cephclusterChart18_1($resource) {
    return $resource('api/v1/query_range?query=ceph_cluster_objects');
}

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
function cephclusterChart18_2($resource) {
    return $resource('api/v1/query_range?query=ceph_degraded_objects');
}

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
function cephclusterChart18_3($resource) {
    return $resource('api/v1/query_range?query=ceph_misplaced_objects');
}


/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
function cephclusterChart19_1($resource) {
    return $resource('api/v1/query_range?query=sum(ceph_osd_pgs)');
}

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
function cephclusterChart19_2($resource) {
    return $resource('api/v1/query_range?query=ceph_degraded_pgs');
}

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
function cephclusterChart19_3($resource) {
    return $resource('api/v1/query_range?query=ceph_stale_pgs');
}


/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
function cephclusterChart19_4($resource) {
    return $resource('api/v1/query_range?query=ceph_unclean_pgs');
}


/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
function cephclusterChart19_5($resource) {
    return $resource('api/v1/query_range?query=ceph_undersized_pgs');
}

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
function cephclusterChart19_6($resource) {
    return $resource('api/v1/query_range?query=ceph_stuck_degraded_pgs%20%2B%20ceph_stuck_stale_pgs%20%2B%20ceph_stuck_unclean_pgs%20%2B%20ceph_stuck_undersized_pgs');
}



/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
function cephclusterChart20_1($resource) {
    return $resource('api/v1/query_range?query=ceph_stuck_degraded_pgs');
}

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
function cephclusterChart20_2($resource) {
    return $resource('api/v1/query_range?query=ceph_stuck_stale_pgs');
}


/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
function cephclusterChart20_3($resource) {
    return $resource('api/v1/query_range?query=ceph_stuck_unclean_pgs');
}


/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
function cephclusterChart20_4($resource) {
    return $resource('api/v1/query_range?query=ceph_stuck_undersized_pgs');
}

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
function cephclusterChart21($resource) {
    return $resource('api/v1/query_range?query=ceph_recovery_io_bytes');
}

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
function cephclusterChart22($resource) {
    return $resource('api/v1/query_range?query=ceph_recovery_io_keys');
}


/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
function cephclusterChart23($resource) {
    return $resource('api/v1/query_range?query=ceph_recovery_io_objects');
}


/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
function cephclusterChart24($resource) {
    return $resource('api/v1/query_range?query=ceph_health_status');
}
