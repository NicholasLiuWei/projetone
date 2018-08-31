/**
 * Created by huimi on 17-7-18.
 * @final
 */


export class LoginController {
    /**
     * @ngInject
     */
    constructor($resource, $cookies, $state, $rootScope) {
            this.$resource = $resource;
            this.cookies = $cookies;
            this.rootScope = $rootScope;
            this.state = $state;
            /** @export */
            this.rootScope.usermes = {};
            /** @export */
            this.username = '';
            /** @export */
            this.password = '';
            /** @export 用户名或密码错误提示*/
            this.showtip = false;
            /** @export {!angular.FormController}*/
            this.form;
            // let rexg = '/^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,12}$/';
        }
        /**
         * login
         * @export
         */
    login() {
        if (this.form.$valid) {
            let data = {
                "user": this.username,
                "passwd": window["sha1"](this.password),
            };
            let login = this.$resource('authfp', {}, { save: { method: 'POST' } });
            login.save(data).$promise.then((res) => {
                switch (res["Stat"]) {
                    case "AUTHPF_STATUS_USERERROR":
                        this.showtip = true;
                        break;
                    case "AUTHPF_STATUS_ABNORMAL":
                        /** @type {string} @desc 集群异常 Cluster anomaly*/
                        let MSG_login_jiqun_error = goog.getMsg('集群异常');
                        alert(MSG_login_jiqun_error);
                        break;
                    case "AUTHPF_STATUS_FIRSTLOGIN":
                        this.rootScope.usermes = {
                            "username": this.username,
                            "usertype": '管理员',
                        };
                        this.state.go('password');
                        break;
                    case "AUTHPF_STATUS_ERROR":
                        this.showtip = true;
                        break;
                    case "AUTHPF_STATUS_OK":
                        this.cookies.put('login', true);
                        this.cookies.put('username', this.username);
                        /** @export */
                        this.rootScope.usermes = {
                            "username": this.username,
                            "usertype": '管理员',
                        };
                        this.state.go('chrome.home');
                }
            }, () => {
                /** @type {string} @desc 请求失败,后端服务异常 Request failure, backend service exception*/
                let MSG_login_login_error = goog.getMsg('请求失败,后端服务异常');
                alert(MSG_login_login_error);
            });
        }
    }
}