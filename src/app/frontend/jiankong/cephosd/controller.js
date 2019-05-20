export class cephosdController {
    /**
     * @ngInject
     */
    constructor() {
        //  this.$watch= $watch;
        this.chartUrlOption = 'osd.0'

        /** @export */
        this.cephosdChart1 = `api/v1/query_range?query=ceph_osd_up%7Bosd%3D%22${this.chartUrlOption}%22%7D`;

        /** @export */
        this.cephosdChart2 = `api/v1/query_range?query=ceph_osd_in%7Bosd%3D%22${this.chartUrlOption}%22%7D`;

        /** @export */
        this.cephosdChart3 = `api/v1/query_range?query=ceph_osds`;

        /** @export */
        this.cephosdChart4 = `api/v1/query_range?query=ceph_osd_pgs%7Bosd%3D~%22${this.chartUrlOption}%22%7D`;

        /** @export */
        this.cephosdChart4_1 = `api/v1/query_range?query=avg(ceph_osd_pgs)`;

        /** @export */
        this.cephosdChart5 = `api/v1/query_range?query=ceph_osd_utilization%7Bosd%3D%22${this.chartUrlOption}%22%7D`;

        /** @export */
        this.cephosdChart6 = `api/v1/query_range?query=ceph_osd_utilization%7Bosd%3D%22${this.chartUrlOption}%22%7D`;

        /** @export */
        this.cephosdChart7 = `api/v1/query_range?query=ceph_osd_perf_apply_latency_seconds%7Bosd%3D~%22${this.chartUrlOption}%22%7D`;

        /** @export */
        this.cephosdChart7_1 = `api/v1/query_range?query=ceph_osd_perf_commit_latency_seconds%7Bosd%3D~%22${this.chartUrlOption}%22%7D`;

        /** @export */
        this.cephosdChart8 = `api/v1/query_range?query=ceph_osd_avail_bytes%7Bosd%3D~%22${this.chartUrlOption}%22%7D`;

        /** @export */
        this.cephosdChart8_1 = `api/v1/query_range?query=ceph_osd_used_bytes%7Bosd%3D~%22${this.chartUrlOption}%22%7D`;

        /** @export */
        this.cephosdChart9 = `api/v1/query_range?query=ceph_osd_variance%7Bosd%3D~%22${this.chartUrlOption}%22%7D`;

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


        this.changeOpt = function() {
            this.cephosdChart1 = `api/v1/query_range?query=ceph_osd_up%7Bosd%3D%22${this.chartUrlOption}%22%7D`;
            this.cephosdChart2 = `api/v1/query_range?query=ceph_osd_in%7Bosd%3D%22${this.chartUrlOption}%22%7D`;
            this.cephosdChart3 = `api/v1/query_range?query=ceph_osds`;
            this.cephosdChart4 = `api/v1/query_range?query=ceph_osd_pgs%7Bosd%3D~%22${this.chartUrlOption}%22%7D`;
            this.cephosdChart4_1 = `api/v1/query_range?query=avg(ceph_osd_pgs)`;
            this.cephosdChart5 = `api/v1/query_range?query=ceph_osd_utilization%7Bosd%3D%22${this.chartUrlOption}%22%7D`;
            this.cephosdChart6 = `api/v1/query_range?query=ceph_osd_utilization%7Bosd%3D%22${this.chartUrlOption}%22%7D`;
            this.cephosdChart7 = `api/v1/query_range?query=ceph_osd_perf_apply_latency_seconds%7Bosd%3D~%22${this.chartUrlOption}%22%7D`;
            this.cephosdChart7_1 = `api/v1/query_range?query=ceph_osd_perf_commit_latency_seconds%7Bosd%3D~%22${this.chartUrlOption}%22%7D`;
            this.cephosdChart8 = `api/v1/query_range?query=ceph_osd_avail_bytes%7Bosd%3D~%22${this.chartUrlOption}%22%7D`;
            this.cephosdChart8_1 = `api/v1/query_range?query=ceph_osd_used_bytes%7Bosd%3D~%22${this.chartUrlOption}%22%7D`;
            this.cephosdChart9 = `api/v1/query_range?query=ceph_osd_variance%7Bosd%3D~%22${this.chartUrlOption}%22%7D`;
        }

        /** @export */
        this.tipFormatK = (params) => {
            console.log(params)
            let html = '';
            html += params[0]["axisValueLabel"];
            html += '<br/>';
            for (let i = 0; i < params.length; i++) {
                html += params[i]["marker"] + params[i]["seriesName"] + ' : ' + Number(params[i].value[1]).toFixed(2);
                i != params.length ? html += '<br/>' : html += '';
            }
            return html;
        }

        /** @export */
        this.tipFormatKms = (params) => {
            console.log(params)
            let html = '';
            html += params[0]["axisValueLabel"];
            html += '<br/>';
            for (let i = 0; i < params.length; i++) {
                html += params[i]["marker"] + params[i]["seriesName"] + ' : ' + Number(params[i].value[1]).toFixed(0) + "ms";
                i != params.length ? html += '<br/>' : html += '';
            }
            return html;
        }

        /** @export */
        this.tipFormatKgb = (params) => {
            console.log(params)
            let html = '';
            html += params[0]["axisValueLabel"];
            html += '<br/>';
            for (let i = 0; i < params.length; i++) {
                html += params[i]["marker"] + params[i]["seriesName"] + ' : ' + Number(params[i].value[1]).toFixed(0) + "GB";
                i != params.length ? html += '<br/>' : html += '';
            }
            return html;
        }

        // this.$watch('chartUrlOption',function(){
        //     alert(111)  
        //   })

    }

}