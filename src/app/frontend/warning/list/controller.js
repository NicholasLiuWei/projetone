/**
 * Controller for the warninglist view. The view shows waringlist.
 *
 * @final
 */
export class warningListController {
    /**
     * @ngInject
     */
    constructor($state, toastr, alertList, $mdDialog, $interpolate, $resource, $q, $timeout, kdAlertResource) {
        /** @export */
        this.alertList = alertList;
        // for (let i = 0; i < alertList.length; i++) {
        //     this.alertList["alert"] = this.alertList["alert"].concat(alertList[i]["alerts"]);
        // }
        // this.alertList["listMeta"]["totalItems"] = this.alertList["alert"].length;
        /** @export seleted alert */
        this.selected = [];

        this.mdDialog = $mdDialog;

        /** @export */
        this.i18n = i18n;

        this.interpolate_ = $interpolate;

        this.resource = $resource;

        this.$q = $q;

        this.$timeout = $timeout;

        this.alertResource = kdAlertResource;

        this.toastr = toastr;

        this.state = $state;
    }

    /**
     * get time string
     * @export
     */
    getTime(time) {
        return new Date(time).toLocaleString();
    }

    /**
     * checkbox xuanze
     * @param {string} item
     */
    toggle(item) {
        var idx = this.selected.indexOf(item);
        if (idx > -1) {
            this.selected.splice(idx, 1);
        } else {
            this.selected.push(item);
        }
    };

    /**
     * @export
     * @param {string} item
     */
    exists(item) {
        return this.selected.indexOf(item) > -1;
    };

    /**
     * is all selected
     */
    isIndeterminate() {
        return (this.selected.length !== 0 &&
            this.selected.length !== this.alertList["alerts"].length);
    };

    /**
     * @export
     * check status
     */
    isChecked() {
        return this.selected.length === this.alertList["alerts"].length;
    };

    /**
     * @export
     * check all 
     */
    toggleAll() {
        if (this.selected.length === this.alertList["alerts"].length) {
            this.selected = [];
        } else if (this.selected.length === 0 || this.selected.length > 0) {
            this.selected = this.alertList["alerts"].slice(0);
        }
    };

    /**
     * @export
     * delete alert
     */
    deleteAlert(ev) {
        let filter = this.interpolate_(`{{number | number}}`);
        /** @type {string} @desc 删除告警提示*/
        let MSG_DELETE_ALERT_CONTENT =
            goog.getMsg('确定删除{$number}条告警吗？', { 'number': filter({ 'number': this.selected.length }) });
        let confirm = this.mdDialog.confirm()
            .title(this.i18n.MSG_DELETE_ALERT_TITLE)
            .textContent(MSG_DELETE_ALERT_CONTENT)
            .ariaLabel('Lucky day')
            .targetEvent(ev)
            .ok(this.i18n.MSG_DELETE_ALERT_OK)
            .cancel(this.i18n.MSG_DELETE_ALERT_CENCEl);

        this.mdDialog.show(confirm).then(() => {
            let a = this.resource('alert/alertsdelete');
            a.save(this.selected, (res) => {
                this.toastr["success"]("删除成功");
                this.state.reload();
            }, () => {
                this.toastr["success"]("删除失败");
            })
        }, function() {

        });
    }

    /**
     * @export
     */
    getwarn(warn) {
        let a = this.resource('alert/alertsupdate', {}, { method: 'POST' });
        a.save(warn, () => {
            this.state.reload();
        }, () => {

        })
    }
}

const i18n = {
    /** @export {string} @desc 删除告警 */
    MSG_DELETE_ALERT_TITLE: goog.getMsg('删除告警'),
    /** @export {string} @desc 确定 */
    MSG_DELETE_ALERT_OK: goog.getMsg(`确定`),
    /** @export {string} @desc 取消 */
    MSG_DELETE_ALERT_CENCEl: goog.getMsg(`取消`),
};