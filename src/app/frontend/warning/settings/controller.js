/**
 * Controller for the warninglist view. The view shows waringlist.
 *
 * @final
 */
export class warningSetController {
    /**
     * @ngInject
     */
    constructor(emailList, toastr, $resource, kdEmailService, $state) {
        /** @export */
        this.emailList = emailList;
        // console.log(emailList);

        this.toastr = toastr;

        this.resource_ = $resource;

        this.emailService = kdEmailService;

        this.state_ = $state;

        this.i18n = i18n;
    }

    /** 
     * delete email
     * @export
     */
    delete(email) {
        // console.log(email);
        let obj = {
            "email": email,
        };
        let resource = this.resource_('alert/email');
        resource.save(
            obj, this.onChangeEmailSuccess_.bind(this),
            this.onChangeEmailError_.bind(this));
    }

    /**
     * @private
     */
    onChangeEmailSuccess_() {
        // this.log_.info(`Successfully added repository`);
        // this.mdDialog_.hide();
        this.toastr["success"](this.i18n.MSG_DELETE_EMAIL_SUCCESS);
        this.state_.reload();
    }

    /**
     * @param {!angular.$http.Response} err
     * @private
     */
    onChangeEmailError_(err) {
        // this.log_.error(err);
        // this.mdDialog_.hide();
        this.toastr["error"](this.i18n.MSG_DELETE_EMAIL_ERROR);
    }

    /**
     * add email dialog
     * @export
     */
    addEmailDialog() {
        this.emailService.showChangeEmailDialog();
    }
};

const i18n = {
    /** @export {string} @desc email删除成功 */
    MSG_DELETE_EMAIL_SUCCESS: goog.getMsg(`删除成功`),
    /** @export {string} @desc email删除失败 */
    MSG_DELETE_EMAIL_ERROR: goog.getMsg(`删除失败,请重试`),
};