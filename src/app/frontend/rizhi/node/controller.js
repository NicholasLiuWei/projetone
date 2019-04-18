export class nodeController {
    /**
     * @ngInject
     */
    constructor($resource, kdLogNodeResource) {
        /** @export */
        this.resource = $resource;

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
            console.log(err)
        })
    }

    $onInit() {
        this.getData();
    }
}