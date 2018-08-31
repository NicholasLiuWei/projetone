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

import showChangeEmailDialog from './email_dialog';

/**
 * Opens email change dialog.
 *
 * @final
 */
export class EmailService {
    /**
     * @param {!md.$dialog} $mdDialog
     * @param {!../../resource/verber_service.VerberService} kdResourceVerberService
     * @ngInject
     */
    constructor($mdDialog, kdResourceVerberService) {
        /** @private {!md.$dialog} */
        this.mdDialog_ = $mdDialog;

        /** @private {!../../resource/verber_service.VerberService}*/
        this.kdResourceVerberService_ = kdResourceVerberService;
    }

    /**
     * Opens an update repository add dialog. Returns a promise that is resolved/rejected when
     * user wants
     * to add a repository. Nothing happens when user clicks cancel on the dialog.
     *
     * @returns {!angular.$q.Promise}
     */
    showChangeEmailDialog() {
        return showChangeEmailDialog(this.mdDialog_);
    }
}