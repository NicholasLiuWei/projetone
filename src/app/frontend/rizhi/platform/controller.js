export class platformController {
    /**
     * @ngInject
     */
    // constructor(platformList, kdStorageResource) {

    //     /** @export */
    //     this.platformList = platformList;

    //     /** @export */
    //     this.platformListResource = kdStorageResource;
    // }
    /**
     * @ngInject
     */
    constructor($resource, toastr, kdPlatFormResource) {
            /** @export */
            this.resource = $resource;

            /** @export */
            this.toastr = toastr;

            /** @export */
            this.kdPlatFormResource = kdPlatFormResource;

            /** @export */
            this.data = {
                "listMeta": { "totalItems": 0 },
                "platForms": []
            };
        }
        /**
         * @export
         */
    getData() {
        // let resource = this.resource('log/platform');
        this.kdPlatFormResource.query((res) => {
            this.data = {
                "listMeta": { "totalItems": res.length },
                "platForms": res
            }
            console.log(this.data);
        }, (err) => {
            this.toastr["error"]("请求出错");
        })
    }

    $onInit() {
        this.getData();
    }
}