// Copyright 2015 Google Inc. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { actionbarViewName } from 'chrome/chrome_state';
import { deployAppStateName } from 'deploy/deploy_state';

/**
 * @final
 */
export class ActionbarComponent {
    /**
     * @param {!ui.router.$state} $state
     * @param {!./email_service.EmailService} kdEmailService
     * @ngInject
     */
    constructor($cookies, $state, $rootScope, $http, $scope, $resource, toastr, kdEmailService, $mdDialog) {
            this.$mdDialog = $mdDialog;
            /** @private {!ui.router.$state} */
            this.state_ = $state;
            /** @export {!angular.Scope}*/
            this.rootScope_ = $rootScope;
            /** @private {!angular.$resource} */
            this.resource_ = $resource;
            /** @export  */
            this.toastr = toastr;
            /** @export  */
            this.emailService_ = kdEmailService;
            /** @export */
            this.i18n = i18n();
            /** fasdfa */
            this.$http_ = $http;
            this.cookies = $cookies;


            /** @export  */
            this.$mdDialog = $mdDialog;

            /** @export  */
            this.bPasswordError = false;

            /** @export  */
            this.oResetPasswordAge = {
                "currentPassword": "",
                "newPassword": "",
                "confirmPassword": ""
            }

            document.addEventListener("click", function() {
                this.showWarning = false;
                $scope.$apply(); //这个一定要加,否则隐藏不了.  

            }.bind(this));
            /** @export */
            this.rootScope_.getwarning = (event) => {
                this.getwarning(event);
            };
            /** @export */
            this.loading = true;
            /** @export */
            this.showWarning = false;
            /** @export */
            this.warninglist = [];
            // this.conn = new WebSocket('ws://172.16.116.1:30008' + '/alert/sockjs')
            // new WebSocket('wss://172.16.30.11:6443/api/v1/namespaces/kube-system/services/https:kubernetes-dashboard:/proxy/api/sockjs', ['appProtocol']);
            this.conn = new WebSocket('wss://' + location.host + location.pathname + 'api/sockjs');
            this.conn.onopen = function(data) {
                // this.toastr.success('监控正常', 0, {
                //     closeButton: true,
                //     timeOut: 10000
                // });
            }.bind(this);
            this.conn.onmessage = function(data) {
                let mes = JSON.parse(data.data);
                for (let i = 0; i < mes["alerts"].length; i++) {
                    this.toastr["warning"](mes["alerts"][i]["annotations"]["description"], 0, {
                        closeButton: true,
                        timeOut: 0
                    });
                }
            }.bind(this);
            this.conn.onclose = function(data) {
                console.log(data);
                // console.log('close');
            };
            this.conn.onerror = function(data) {
                console.log(data);
                // console.log('error');
            };
        }
        /**
         * 退出系统
         * @export
         */
    logouts() {
            this.cookies.remove('login');
            this.cookies.remove('username');
            this.state_.go('logins');
        }
        /**
         * 退出系统
         * @export
         */
    changemima() {
            this.$mdDialog.show({
                contentElement: '#changeDialog',
                parent: angular.element(document.body),
                clickOutsideToClose: true
            });
            // this.state_.go('password');
        }
        /**
         * 用户管理
         * @export
         */
    usermanagement() {
            this.state_.go('usermanagement');
        }
        /**
         * Handles change of email using dialog.
         * @export
         */
    handleChangeEmailDialog() {
            this.emailService_.showChangeEmailDialog();
            // console.log(this.emailService_);
        }
        /**
         * 清除告警
         * @export
         */
    clearAlerts() {
            if (this.warninglist.length !== 0) {
                this.loading = true;
                let clearWarn = this.resource_('alertsclear');
                clearWarn.query().$promise.then(
                    (data) => {
                        this.loading = false;
                        // console.log(data);
                        this.rootScope_["alertsnum"] = 0;
                        this.warninglist = [];
                    },
                    (res) => {
                        alert(this.i18n.MSG_warning_clear_error);
                        // console.log(res);
                    }
                );
            }
        }
        /**
         * @return {boolean}
         * @export
         */
    hasCustomActions() {
            return !!this.state_.current.views && !!this.state_.current.views[actionbarViewName];
        }
        /**
         * @export
         */
    stopPropagation(event) {
            event = event || window.event;
            event.stopPropagation(); //阻止事件冒泡,防止隐藏  
        }
        /**
         * @export
         */
    getlocalTime(value) {
            let timestr = '';
            timestr += new Date(value).toLocaleDateString();
            timestr += '   ';
            timestr += new Date(value).toTimeString().substring(0, 8);
            return timestr;
        }
        /**
         * @export
         */
    getwarning(event) {
        if (this.showWarning) {
            this.showWarning = false;
        } else {
            this.showWarning = true;
            let warning = this.resource_('alert/alerts?page=1&itemsPerPage=10');
            warning.query((res) => {
                this.warninglist = [];
                for (let i = 0; i < res.length; i++) {
                    this.warninglist = this.warninglist.concat(res[i]["alerts"]);
                }
                // console.log(this.warninglist);
                this.loading = false;
            }, (res) => {
                alert(this.i18n.MSG_warning_BACKEND_error);
            });
        }
        event = event || window.event;
        event.stopPropagation(); //阻止事件冒泡,防止隐藏  
    }

    /**
     * @export
     */
    create() {
            this.state_.go(deployAppStateName);
        }
        /**
         * @export
         */
    logout() {
        var a = confirm('确定退出本系统吗?');
        if (a) {
            var dataa = {
                "name": this.rootScope_["mes"]["Name"],
                "namespace": this.rootScope_["mes"]["Namespace"]
            };
            //console.log(dataa);
            let resource = this.resource_('http://auth.' + this.rootScope_["mes"]["Authserver"] + '/logout');
            //let resource = this.resource_('http://'+this.rootScope_["mes"]["Authserver"]+':5012'+'/logout');
            resource.get(dataa,
                (res) => {
                    // console.log(res);
                    location.href = 'http://' + this.rootScope_["mes"]["Authserver"];
                },
                (err) => {
                    // console.log(err);
                });
        }
    }


    /**
     *@export
     */
    fChangePassword() {
            if (this.oResetPasswordAge.newPassword !== this.oResetPasswordAge.confirmPassword) {
                this.bPasswordError = true;
            } else {
                this.bPasswordError = false;
                this.$mdDialog.hide();
                document.getElementById("reset-password-id").reset()
                console.log(this.oResetPasswordAge)
            }
        }
        /**
         * @export
         */
    cancel() {
        this.$mdDialog.cancel();
    }
}

/**
 * @type {!angular.Component}
 */
export const actionbarComponent = {
    templateUrl: 'common/components/actionbar/actionbar.html',
    transclude: true,
    controller: ActionbarComponent,
};

function i18n() {
    return {
        /** @export {string} @desc 告警详情. */
        MSG_warning_desc: goog.getMsg('告警详情'),
        /** @export {string} @desc 告警类型. */
        MSG_warning_type: goog.getMsg('告警类型'),
        /** @export {string} @desc Remove failure, please try again */
        MSG_warning_clear_error: goog.getMsg('清除失败'),
        /** @export {string} @desc Backend service exception */
        MSG_warning_BACKEND_error: goog.getMsg('后端服务异常'),
    }
}