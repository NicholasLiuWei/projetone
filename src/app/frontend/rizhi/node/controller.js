export class nodeController {
    /**
     * @ngInject
     */
    constructor($resource, toastr, kdLogNodeResource) {
        /** @export */
        this.resource = $resource;

        /** @export */
        this.toastr = toastr;

        /** @export */

        this.kdLogNodeResource = kdLogNodeResource;

        /** @export */
        this.data = {
            "listMeta": { "totalItems": 0 },
            "logNodes": []
        };
    }

    /**
     * @export
     */
    getData() {
        // let resource = this.resource('log/node');
        this.kdLogNodeResource.query((res) => {
            this.data = {
                "listMeta": { "totalItems": res.length },
                "logNodes": res
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