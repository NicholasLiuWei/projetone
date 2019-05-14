export class cephclusterController {
    /**
     * @ngInject
     */
    constructor($filter, kdCephclusterResource, cephclusterChart1, cephclusterChart2, cephclusterChart3, cephclusterChart4, cephclusterChart5,
        cephclusterChart6, cephclusterChart7, cephclusterChart8, cephclusterChart9, cephclusterChart10, cephclusterChart11,
        cephclusterChart12, cephclusterChart13, cephclusterChart14, cephclusterChart15_1, cephclusterChart15_2, cephclusterChart15_3, cephclusterChart16_1, cephclusterChart16_2, cephclusterChart17_2, cephclusterChart17_1,
        cephclusterChart18_1, cephclusterChart18_2, cephclusterChart18_3, cephclusterChart19_1, cephclusterChart19_2, cephclusterChart19_3, cephclusterChart19_4, cephclusterChart19_5, cephclusterChart19_6,
        cephclusterChart20_1, cephclusterChart20_2, cephclusterChart20_3, cephclusterChart20_4, cephclusterChart21, cephclusterChart22, cephclusterChart23, cephclusterChart24

    ) {

        /** @export */
        this.persistentVolumeListResource = kdCephclusterResource;

        /** @export */
        this.cephclusterChart1 = cephclusterChart1;

        /** @export */
        this.cephclusterChart2 = cephclusterChart2;

        /** @export */
        this.cephclusterChart3 = cephclusterChart3;

        /** @export */
        this.cephclusterChart4 = cephclusterChart4;

        /** @export */
        this.cephclusterChart5 = cephclusterChart5;

        /** @export */
        this.cephclusterChart6 = cephclusterChart6;

        /** @export */
        this.cephclusterChart7 = cephclusterChart7;


        /** @export */
        this.cephclusterChart8 = cephclusterChart8;

        /** @export */
        this.cephclusterChart9 = cephclusterChart9;

        /** @export */
        this.cephclusterChart10 = cephclusterChart10;

        /** @export */
        this.cephclusterChart11 = cephclusterChart11;

        /** @export */
        this.cephclusterChart12 = cephclusterChart12;

        /** @export */
        this.cephclusterChart13 = cephclusterChart13;

        /** @export */
        this.cephclusterChart14 = cephclusterChart14;

        /** @export */
        this.cephclusterChart15_1 = cephclusterChart15_1;

        /** @export */
        this.cephclusterChart15_2 = cephclusterChart15_2;

        /** @export */
        this.cephclusterChart15_3 = cephclusterChart15_3;

        /** @export */
        this.cephclusterChart16_1 = cephclusterChart16_1;

        /** @export */
        this.cephclusterChart16_2 = cephclusterChart16_2;

        /** @export */
        this.cephclusterChart17_1 = cephclusterChart17_1;

        /** @export */
        this.cephclusterChart17_2 = cephclusterChart17_2;

        /** @export */
        this.cephclusterChart18_1 = cephclusterChart18_1;

        /** @export */
        this.cephclusterChart18_2 = cephclusterChart18_2;

        /** @export */
        this.cephclusterChart18_3 = cephclusterChart18_3;

        /** @export */
        this.cephclusterChart19_1 = cephclusterChart19_1;

        /** @export */
        this.cephclusterChart19_2 = cephclusterChart19_2;

        /** @export */
        this.cephclusterChart19_3 = cephclusterChart19_3;

        /** @export */
        this.cephclusterChart19_4 = cephclusterChart19_4;

        /** @export */
        this.cephclusterChart19_5 = cephclusterChart19_5;

        /** @export */
        this.cephclusterChart19_6 = cephclusterChart19_6;

        /** @export */
        this.cephclusterChart20_1 = cephclusterChart20_1;

        /** @export */
        this.cephclusterChart20_2 = cephclusterChart20_2;

        /** @export */
        this.cephclusterChart20_3 = cephclusterChart20_3;

        /** @export */
        this.cephclusterChart20_4 = cephclusterChart20_4;

        /** @export */
        this.cephclusterChart21 = cephclusterChart21;

        /** @export */
        this.cephclusterChart22 = cephclusterChart22;

        /** @export */
        this.cephclusterChart23 = cephclusterChart23;

        /** @export */
        this.cephclusterChart24 = cephclusterChart24;


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
    }

    $onInit() {
    }
    $onDestroy() {

    }

}