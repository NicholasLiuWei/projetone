export class storageClassController {
    /**
     * @ngInject
     */
    // constructor(storageClassList, kdStorageResource) {

    //     /** @export */
    //     this.storageClassList = storageClassList;

    //     /** @export */
    //     this.storageClassListResource = kdStorageResource;
    // }
    /**
     * @ngInject
     */
    constructor($resource, kdPlatFormResource) {

            /** @export */
            this.resource = $resource;

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
            console.log(err)
        })
    }

    $onInit() {
        this.getData();
    }
}