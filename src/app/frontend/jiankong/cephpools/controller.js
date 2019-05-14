export class cephpoolsController {
    /**
     * @ngInject
     */
    constructor() {
        //  this.$watch= $watch;
        this.chartUrlOption = 'cephfs_data'

        /** @export */
        this.cephpoolChart1 = `api/v1/query_range?query=ceph_pool_available_bytes%7Bpool%3D~%22${this.chartUrlOption}%22%7D`;

        /** @export */
        this.cephpoolChart1_1 = `api/v1/query_range?query=ceph_pool_used_bytes%7Bpool%3D~%22${this.chartUrlOption}%22%7D`;

        /** @export */
        this.cephpoolChart1_2 = `api/v1/query_range?query=ceph_pool_used_bytes%7Bpool%3D~%22${this.chartUrlOption}%22%7D%20%2B%20ceph_pool_available_bytes%7Bpool%3D~%22${this.chartUrlOption}%22%7D`;

        /** @export */
        this.cephpoolChart1_3 = `api/v1/query_range?query=ceph_pool_raw_used_bytes%7Bpool%3D~%22${this.chartUrlOption}%22%7D`;

        /** @export */
        this.cephpoolChart2 = `api/v1/query_range?query=%20ceph_pool_used_bytes%7Bpool%3D%22${this.chartUrlOption}%22%7D%20%2F%20(ceph_pool_available_bytes%7Bpool%3D%22${this.chartUrlOption}%22%7D%20%2B%20ceph_pool_used_bytes%7Bpool%3D%22${this.chartUrlOption}%22%7D)`;

        /** @export */
        this.cephpoolChart3_1 = `api/v1/query_range?query=ceph_pool_objects_total%7Bpool%3D~%22${this.chartUrlOption}%22%7D`;

        /** @export */
        this.cephpoolChart3_2 = `api/v1/query_range?query=ceph_pool_dirty_objects_total%7Bpool%3D~%22${this.chartUrlOption}%22%7D`;

        /** @export */
        this.cephpoolChart4_1 = `api/v1/query_range?query=irate(ceph_pool_read_total%7Bpool%3D~%22${this.chartUrlOption}%22%7D%5B3m%5D)`;

        /** @export */
        this.cephpoolChart4_2 = `api/v1/query_range?query=irate(ceph_pool_write_total%7Bpool%3D~%22${this.chartUrlOption}%22%7D%5B3m%5D)`;

        /** @export */
        this.cephpoolChart5_1 = `api/v1/query_range?query=irate(ceph_pool_read_bytes_total%7Bpool%3D~%22${this.chartUrlOption}%22%7D%5B3m%5D)`;

        /** @export */
        this.cephpoolChart5_2 = `api/v1/query_range?query=irate(ceph_pool_write_bytes_total%7Bpool%3D~%22${this.chartUrlOption}%22%7D%5B3m%5D)`;


        /** @export */
        this.tipFormat = (params) => {
            let html = '';
            html += params[0]["axisValueLabel"];
            html += '<br/>';
            for (let i = 0; i < params.length; i++) {
                html += params[i]["marker"] + params[i]["seriesName"] + ' : ' + params[i].value[1] + 'GB';
                i != params.length ? html += '<br/>' : html += '';
            }
            return html;
        }


        this.changeOpt = function () {
            this.cephpoolChart1 = `api/v1/query_range?query=ceph_pool_available_bytes%7Bpool%3D~%22${this.chartUrlOption}%22%7D`;
            this.cephpoolChart1_1 = `api/v1/query_range?query=ceph_pool_used_bytes%7Bpool%3D~%22${this.chartUrlOption}%22%7D`;
            this.cephpoolChart1_2 = `api/v1/query_range?query=ceph_pool_used_bytes%7Bpool%3D~%22${this.chartUrlOption}%22%7D%20%2B%20ceph_pool_available_bytes%7Bpool%3D~%22${this.chartUrlOption}%22%7D`;
            this.cephpoolChart1_3 = `api/v1/query_range?query=ceph_pool_raw_used_bytes%7Bpool%3D~%22${this.chartUrlOption}%22%7D`;
            this.cephpoolChart2 = `api/v1/query_range?query=%20ceph_pool_used_bytes%7Bpool%3D%22${this.chartUrlOption}%22%7D%20%2F%20(ceph_pool_available_bytes%7Bpool%3D%22${this.chartUrlOption}%22%7D%20%2B%20ceph_pool_used_bytes%7Bpool%3D%22${this.chartUrlOption}%22%7D)`;
            this.cephpoolChart3_1 = `api/v1/query_range?query=ceph_pool_objects_total%7Bpool%3D~%22${this.chartUrlOption}%22%7D`;
            this.cephpoolChart3_2 = `api/v1/query_range?query=ceph_pool_dirty_objects_total%7Bpool%3D~%22${this.chartUrlOption}%22%7D`;
            this.cephpoolChart4_1 = `api/v1/query_range?query=irate(ceph_pool_read_total%7Bpool%3D~%22${this.chartUrlOption}%22%7D%5B3m%5D)`;
            this.cephpoolChart4_2 = `api/v1/query_range?query=irate(ceph_pool_write_total%7Bpool%3D~%22${this.chartUrlOption}%22%7D%5B3m%5D)`;
            this.cephpoolChart5_1 = `api/v1/query_range?query=irate(ceph_pool_read_bytes_total%7Bpool%3D~%22${this.chartUrlOption}%22%7D%5B3m%5D)`;
            this.cephpoolChart5_2 = `api/v1/query_range?query=irate(ceph_pool_write_bytes_total%7Bpool%3D~%22${this.chartUrlOption}%22%7D%5B3m%5D)`;
        }

        /** @export */
        this.tipFormatK = (params) => {
            let html = '';
            html += params[0]["axisValueLabel"];
            html += '<br/>';
            for (let i = 0; i < params.length; i++) {
                html += params[i]["marker"] + params[i]["seriesName"] + ' : ' + params[i].value[1] + 'K';
                i != params.length ? html += '<br/>' : html += '';
            }
            return html;
        }

        // this.$watch('chartUrlOption',function(){
        //     alert(111)  
        //   })

    }

}