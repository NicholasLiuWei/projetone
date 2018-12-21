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
        let resource = this.resource_('/alert/email');
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
        this.toastr["success"]('修改成功');
        this.state_.reload();
    }

    /**
     * @param {!angular.$http.Response} err
     * @private
     */
    onChangeEmailError_(err) {
        // this.log_.error(err);
        // this.mdDialog_.hide();
        this.toastr["error"]('修改失败,请重试');
    }

    /**
     * add email dialog
     * @export
     */
    addEmailDialog() {
        this.emailService.showChangeEmailDialog();
    }
};