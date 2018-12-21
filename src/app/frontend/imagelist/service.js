import s2i from 'imagelist/s2i_dialog';


/**
 * image edit dialog
 *
 * @final
 */
export class ImagelistService {
    /**
     * @param {!md.$dialog} $mdDialog
     * @ngInject
     */
    constructor($mdDialog) {
        /** @private {!md.$dialog} */
        this.mdDialog_ = $mdDialog;

        /** @export */
        this.value = {}

        /** @export */
        this.show = false;
    }

    /**
     * Opens an source to image dialog. Returns a promise that is resolved/rejected when
     * user wants
     * to s2i. Nothing happens when user clicks cancel on the dialog.
     *
     * @returns {!angular.$q.Promise}
     */
    showS2IDialog(image) {
        return s2i(this.mdDialog_, image);
    }
}