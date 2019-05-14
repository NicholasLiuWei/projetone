export class cephosdController {
    /**
     * @ngInject
     */
    constructor() {
        //  this.$watch= $watch;
        this.chartUrlOption = 'cephfs_data'

        /** @export */
        this.cephosdChart1 = `api/v1/query_range?query=ceph_pool_available_bytes%7Bpool%3D~%22${this.chartUrlOption}%22%7D`;

        /** @export */
        this.cephosdChart1_1 = `api/v1/query_range?query=ceph_pool_used_bytes%7Bpool%3D~%22${this.chartUrlOption}%22%7D`;

        /** @export */
        this.cephosdChart1_2 = `api/v1/query_range?query=ceph_pool_used_bytes%7Bpool%3D~%22${this.chartUrlOption}%22%7D%20%2B%20ceph_pool_available_bytes%7Bpool%3D~%22${this.chartUrlOption}%22%7D`;

        /** @export */
        this.cephosdChart1_3 = `api/v1/query_range?query=ceph_pool_raw_used_bytes%7Bpool%3D~%22${this.chartUrlOption}%22%7D`;

        /** @export */
        this.cephosdChart2 = `api/v1/query_range?query=%20ceph_pool_used_bytes%7Bpool%3D%22${this.chartUrlOption}%22%7D%20%2F%20(ceph_pool_available_bytes%7Bpool%3D%22${this.chartUrlOption}%22%7D%20%2B%20ceph_pool_used_bytes%7Bpool%3D%22${this.chartUrlOption}%22%7D)`;

        /** @export */
        this.cephosdChart3_1 = `api/v1/query_range?query=ceph_pool_objects_total%7Bpool%3D~%22${this.chartUrlOption}%22%7D`;

        /** @export */
        this.cephosdChart3_2 = `api/v1/query_range?query=ceph_pool_dirty_objects_total%7Bpool%3D~%22${this.chartUrlOption}%22%7D`;

        /** @export */
        this.cephosdChart4_1 = `api/v1/query_range?query=irate(ceph_pool_read_total%7Bpool%3D~%22${this.chartUrlOption}%22%7D%5B3m%5D)`;

        /** @export */
        this.cephosdChart4_2 = `api/v1/query_range?query=irate(ceph_pool_write_total%7Bpool%3D~%22${this.chartUrlOption}%22%7D%5B3m%5D)`;

        /** @export */
        this.cephosdChart5_1 = `api/v1/query_range?query=irate(ceph_pool_read_bytes_total%7Bpool%3D~%22${this.chartUrlOption}%22%7D%5B3m%5D)`;

        /** @export */
        this.cephosdChart5_2 = `api/v1/query_range?query=irate(ceph_pool_write_bytes_total%7Bpool%3D~%22${this.chartUrlOption}%22%7D%5B3m%5D)`;


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
            this.cephosdChart1 = `api/v1/query_range?query=ceph_pool_available_bytes%7Bpool%3D~%22${this.chartUrlOption}%22%7D`;
            this.cephosdChart1_1 = `api/v1/query_range?query=ceph_pool_used_bytes%7Bpool%3D~%22${this.chartUrlOption}%22%7D`;
            this.cephosdChart1_2 = `api/v1/query_range?query=ceph_pool_used_bytes%7Bpool%3D~%22${this.chartUrlOption}%22%7D%20%2B%20ceph_pool_available_bytes%7Bpool%3D~%22${this.chartUrlOption}%22%7D`;
            this.cephosdChart1_3 = `api/v1/query_range?query=ceph_pool_raw_used_bytes%7Bpool%3D~%22${this.chartUrlOption}%22%7D`;
            this.cephosdChart2 = `api/v1/query_range?query=%20ceph_pool_used_bytes%7Bpool%3D%22${this.chartUrlOption}%22%7D%20%2F%20(ceph_pool_available_bytes%7Bpool%3D%22${this.chartUrlOption}%22%7D%20%2B%20ceph_pool_used_bytes%7Bpool%3D%22${this.chartUrlOption}%22%7D)`;
            this.cephosdChart3_1 = `api/v1/query_range?query=ceph_pool_objects_total%7Bpool%3D~%22${this.chartUrlOption}%22%7D`;
            this.cephosdChart3_2 = `api/v1/query_range?query=ceph_pool_dirty_objects_total%7Bpool%3D~%22${this.chartUrlOption}%22%7D`;
            this.cephosdChart4_1 = `api/v1/query_range?query=irate(ceph_pool_read_total%7Bpool%3D~%22${this.chartUrlOption}%22%7D%5B3m%5D)`;
            this.cephosdChart4_2 = `api/v1/query_range?query=irate(ceph_pool_write_total%7Bpool%3D~%22${this.chartUrlOption}%22%7D%5B3m%5D)`;
            this.cephosdChart5_1 = `api/v1/query_range?query=irate(ceph_pool_read_bytes_total%7Bpool%3D~%22${this.chartUrlOption}%22%7D%5B3m%5D)`;
            this.cephosdChart5_2 = `api/v1/query_range?query=irate(ceph_pool_write_bytes_total%7Bpool%3D~%22${this.chartUrlOption}%22%7D%5B3m%5D)`;
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