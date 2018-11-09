/**
 * Created by huimi on 17-7-18.
 * @final
 */


export class PasswordController {
    /**
     * @ngInject
     */
    constructor($resource, $cookies, $state, $rootScope, kdHistoryService, toastr) {
        this.$resource = $resource;
        this.cookies = $cookies;
        this.state = $state;
        this.kdHistoryService = kdHistoryService;
        this.rootScope = $rootScope;
        this.toastr = toastr;
        /** @export */
        this.username = 'admin';
        /** @export */
        this.oldpassword = '';
        /** @export */
        this.newpassword = '';
        /** @export 用户名或密码错误提示*/
        this.showtip = false;
        /** @export {!angular.FormController}*/
        this.form;
    }
    $onInit() {
            console.log(this.cookies.get('login'));
            if (this.cookies.get('login') != 'true') {
                if (this.rootScope.hasOwnProperty('usermes')) {
                    if (!this.rootScope["usermes"].hasOwnProperty('username')) {
                        this.state.go('logins');
                    }
                } else {
                    this.state.go('logins');
                }
            }
        }
        /**
         * 取消修改密码
         * @export
         */
    cancle() {
            this.kdHistoryService.back();
        }
        /**
         * 登录状态检查
         * @export
         */
    islogin() {
            return this.cookies.get('login');
        }
        /**
         * password
         * @export
         */
    password() {
        if (this.form.$valid) {
            // if (this.cookies.get('login') != true) {
            //     this.oldpassword = '';
            // }
            let data = {
                "user": "admin",
                "curpasswd": window["sha1"](this.oldpassword),
                "newpasswd": window["sha1"](this.newpassword),
            };
            let setword = this.$resource('setauthfp', {}, { save: { method: 'POST' } });
            setword.save(data).$promise.then((res) => {
                switch (res["Stat"]) {
                    case "SET_AUTHPF_ABNORMAL":
                        /** @type {string} @desc 集群异常 Cluster anomaly*/
                        let MSG_password_jiqun_error = goog.getMsg('集群异常');
                        alert(MSG_password_jiqun_error);
                        break;
                    case "SET_AUTHPF_AUTHERROR":
                        this.showtip = true;
                        break;
                    case "SET_AUTHPF_OK":
                        if (this.oldpassword === '') {
                            this.cookies.put('login', true);
                            this.cookies.put('username', this.username);
                            /** @type {string} @desc 管理员 Admin*/
                            let MSG_username = goog.getMsg('管理员');
                            /** @export */
                            this.rootScope.usermes = {
                                "username": this.username,
                                "usertype": MSG_username,
                            };
                        };
                        /** @type {string} @desc 密码修改成功 Change Password OK*/
                        let MSG_change_passwd_good = goog.getMsg('密码修改成功');
                        this.toastr["success"](MSG_change_passwd_good, 0, {
                            closeButton: true,
                            timeOut: 10000
                        });
                        this.state.go('chrome.home');
                }
            }, () => {
                /** @type {string} @desc 设置失败重试 Setting failure retry*/
                let MSG_set_error = goog.getMsg('设置失败重试');
                alert(MSG_set_error);
            });
        }
    }
}