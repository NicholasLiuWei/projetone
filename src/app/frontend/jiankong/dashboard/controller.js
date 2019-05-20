export class dashboardController {
    /**
     * @ngInject
     */
    constructor() {
        /** @export */
        this.chartUrlOption = "^.*$";

        /** @export */
        this.dashboardChart1 = `api/v1/query_range?query=sum%20(rate%20(container_network_receive_bytes_total%7Bkubernetes_io_hostname=~"${this.chartUrlOption}"}[1m]))`;

        /** @export */
        this.dashboardChart1_1 = `api/v1/query_range?query=-%20sum%20(rate%20(container_network_transmit_bytes_total%7Bkubernetes_io_hostname=~"${this.chartUrlOption}"}[1m]))`;

        /** @export */
        this.dashboardChart2 = `api/v1/query_range?query=sum%20(container_memory_working_set_bytes%7Bid%3D%22%2F%22%2Ckubernetes_io_hostname=~"${this.chartUrlOption}"})%20%2F%20sum%20(machine_memory_bytes%7Bkubernetes_io_hostname=~"${this.chartUrlOption}"}) * 100`;

        /** @export */
        this.dashboardChart2_used = `api/v1/query_range?query=sum%20(container_memory_working_set_bytes%7Bid%3D%22%2F%22%2Ckubernetes_io_hostname=~"${this.chartUrlOption}"})`;

        /** @export */
        this.dashboardChart2_total = `api/v1/query_range?query=sum%20(machine_memory_bytes%7Bkubernetes_io_hostname=~"${this.chartUrlOption}"})`;

        /** @export */
        this.dashboardChart2_1 = `api/v1/query_range?query=sum%20(rate%20(container_cpu_usage_seconds_total%7Bid%3D%22%2F%22%2Ckubernetes_io_hostname=~"${this.chartUrlOption}"}[1m]))`;

        /** @export */
        this.dashboardChart2_1_used = `api/v1/query_range?query=sum%20(rate%20(container_cpu_usage_seconds_total%7Bid%3D%22%2F%22%2Ckubernetes_io_hostname=~"${this.chartUrlOption}"}[1m]))`;

        /** @export */
        this.dashboardChart2_1_total = `api/v1/query_range?query=sum%20(machine_cpu_cores%7Bkubernetes_io_hostname=~"${this.chartUrlOption}"})`;

        /** @export */
        this.dashboardChart2_2 = `api/v1/query_range?query=sum%20(rate%20(container_cpu_usage_seconds_total%7Bid%3D%22%2F%22%2Ckubernetes_io_hostname=~"${this.chartUrlOption}"}[1m]))%20%2F%20sum%20(machine_cpu_cores%7Bkubernetes_io_hostname=~"${this.chartUrlOption}"}) * 100`;

        /** @export */
        this.dashboardChart2_2_used = `api/v1/query_range?query=sum%20(container_fs_usage_bytes%7Bdevice%3D~%22%5E%2Fdev%2F%5Bsv%5Dd%5Ba-z%5D%5B1-9%5D%24%22%2Cid%3D%22%2F%22%2Ckubernetes_io_hostname=~"${this.chartUrlOption}"})`;

        /** @export */
        this.dashboardChart2_2_total = `api/v1/query_range?query=sum%20(container_fs_limit_bytes%7Bdevice%3D~%22%5E%2Fdev%2F%5Bsv%5Dd%5Ba-z%5D%5B1-9%5D%24%22%2Cid%3D%22%2F%22%2Ckubernetes_io_hostname=~"${this.chartUrlOption}"})`;

        /** @export */
        this.dashboardChart3 = `api/v1/query_range?query=sum%20(rate%20(container_cpu_usage_seconds_total%7Bimage!%3D%22%22%2Cname%3D~%22%5Ek8s_.*%22%2Ckubernetes_io_hostname=~"${this.chartUrlOption}"}[1m]))%20by%20(pod_name)`;

        /** @export */
        this.dashboardChart4 = `api/v1/query_range?query=sum%20(container_memory_working_set_bytes%7Bimage!%3D%22%22%2Cname%3D~%22%5Ek8s_.*%22%2Ckubernetes_io_hostname=~"${this.chartUrlOption}"})%20by%20(pod_name)`;

        this.changeOpt = function() {
            this.dashboardChart1 = `api/v1/query_range?query=sum%20(rate%20(container_network_receive_bytes_total%7Bkubernetes_io_hostname=~"${this.chartUrlOption}"}[1m]))`;
            this.dashboardChart1_1 = `api/v1/query_range?query=-%20sum%20(rate%20(container_network_transmit_bytes_total%7Bkubernetes_io_hostname=~"${this.chartUrlOption}"}[1m]))`;
            this.dashboardChart2 = `api/v1/query_range?query=sum%20(container_memory_working_set_bytes%7Bid%3D%22%2F%22%2Ckubernetes_io_hostname=~"${this.chartUrlOption}"})%20%2F%20sum%20(machine_memory_bytes%7Bkubernetes_io_hostname=~"${this.chartUrlOption}"}) * 100`;
            this.dashboardChart2_used = `api/v1/query_range?query=sum%20(container_memory_working_set_bytes%7Bid%3D%22%2F%22%2Ckubernetes_io_hostname=~"${this.chartUrlOption}"})`;
            this.dashboardChart2_total = `api/v1/query_range?query=sum%20(machine_memory_bytes%7Bkubernetes_io_hostname=~"${this.chartUrlOption}"})`;
            this.dashboardChart2_1 = `api/v1/query_range?query=sum%20(rate%20(container_cpu_usage_seconds_total%7Bid%3D%22%2F%22%2Ckubernetes_io_hostname=~"${this.chartUrlOption}"}[1m]))`;
            this.dashboardChart2_1_used = `api/v1/query_range?query=sum%20(rate%20(container_cpu_usage_seconds_total%7Bid%3D%22%2F%22%2Ckubernetes_io_hostname=~"${this.chartUrlOption}"}[1m]))`;
            this.dashboardChart2_1_total = `api/v1/query_range?query=sum%20(machine_cpu_cores%7Bkubernetes_io_hostname=~"${this.chartUrlOption}"})`;
            this.dashboardChart2_2 = `api/v1/query_range?query=sum%20(rate%20(container_cpu_usage_seconds_total%7Bid%3D%22%2F%22%2Ckubernetes_io_hostname=~"${this.chartUrlOption}"}[1m]))%20%2F%20sum%20(machine_cpu_cores%7Bkubernetes_io_hostname=~"${this.chartUrlOption}"}) * 100`;
            this.dashboardChart2_2_used = `api/v1/query_range?query=sum%20(container_fs_usage_bytes%7Bdevice%3D~%22%5E%2Fdev%2F%5Bsv%5Dd%5Ba-z%5D%5B1-9%5D%24%22%2Cid%3D%22%2F%22%2Ckubernetes_io_hostname=~"${this.chartUrlOption}"})`;
            this.dashboardChart2_2_total = `api/v1/query_range?query=sum%20(container_fs_limit_bytes%7Bdevice%3D~%22%5E%2Fdev%2F%5Bsv%5Dd%5Ba-z%5D%5B1-9%5D%24%22%2Cid%3D%22%2F%22%2Ckubernetes_io_hostname=~"${this.chartUrlOption}"})`;
            this.dashboardChart3 = `api/v1/query_range?query=sum%20(rate%20(container_cpu_usage_seconds_total%7Bimage!%3D%22%22%2Cname%3D~%22%5Ek8s_.*%22%2Ckubernetes_io_hostname=~"${this.chartUrlOption}"}[1m]))%20by%20(pod_name)`;
            this.dashboardChart4 = `api/v1/query_range?query=sum%20(container_memory_working_set_bytes%7Bimage!%3D%22%22%2Cname%3D~%22%5Ek8s_.*%22%2Ckubernetes_io_hostname=~"${this.chartUrlOption}"})%20by%20(pod_name)`;
        }

        // /** @export */
        // this.persistentVolumeListResource = kdCephclusterResource;

        // /** @export */
        // this.cephclusterChart1 = cephclusterChart1;

        // /** @export */
        // this.cephclusterChart1_1 = cephclusterChart1_1;

        // /** @export */
        // this.cephclusterChart2 = cephclusterChart2;

        // /** @export */
        // this.cephclusterChart2_used = cephclusterChart2_used;

        // /** @export */
        // this.cephclusterChart2_total = cephclusterChart2_total;

        // /** @export */
        // this.cephclusterChart2_1 = cephclusterChart2_1;

        // /** @export */
        // this.cephclusterChart2_1_used = cephclusterChart2_1_used;

        // /** @export */
        // this.cephclusterChart2_1_total = cephclusterChart2_1_total;

        // /** @export */
        // this.cephclusterChart2_2 = cephclusterChart2_2;

        // /** @export */
        // this.cephclusterChart2_2_used = cephclusterChart2_2_used;

        // /** @export */
        // this.cephclusterChart2_2_total = cephclusterChart2_2_total;

        // /** @export */
        // this.cephclusterChart3 = cephclusterChart3;

        /** @export */
        this.tipFormatGb = (params) => {
            let html = '';
            html += params[0]["axisValueLabel"];
            html += '<br/>';
            for (let i = 0; i < params.length; i++) {
                html += params[i]["marker"] + params[i]["seriesName"] + ' : ' + params[i].value[1] + 'GiB';
                i != params.length ? html += '<br/>' : html += '';
            }
            return html;
        }

        /** @export */
        this.tipFormatMb = (params) => {
            let html = '';
            html += params[0]["axisValueLabel"];
            html += '<br/>';
            for (let i = 0; i < params.length; i++) {
                html += params[i]["marker"] + params[i]["seriesName"] + ' : ' + params[i].value[1] + 'MB/s';
                i != params.length ? html += '<br/>' : html += '';
            }
            return html;
        }


        /** @export */
        this.tipFormatKb = (params) => {
            let html = '';
            html += params[0]["axisValueLabel"];
            html += '<br/>';
            for (let i = 0; i < params.length; i++) {
                html += params[i]["marker"] + params[i]["seriesName"] + ' : ' + params[i].value[1] + 'KB/s';
                i != params.length ? html += '<br/>' : html += '';
            }
            return html;
        }

        /** @export */
        this.tipFormatPodsGb = (params) => {
            let html = '';
            html += params[0]["axisValueLabel"];
            html += '<br/>';
            for (let i = 0; i < params.length; i++) {
                html += params[i]["marker"] + params[i]["seriesName"] + ' : ' + params[i].value[1];
                i != params.length ? html += '<br/>' : html += '';
            }
            return html;
        }

        /** @export */
        this.tipFormatPodsMb = (params) => {
            let html = '';
            html += params[0]["axisValueLabel"];
            html += '<br/>';
            for (let i = 0; i < params.length; i++) {
                html += params[i]["marker"] + params[i]["seriesName"] + ' : ' + params[i].value[1] + 'MB';
                i != params.length ? html += '<br/>' : html += '';
            }
            return html;
        }
    }

    $onInit() {}
    $onDestroy() {

    }

}