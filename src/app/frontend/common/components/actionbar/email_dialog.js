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

import ChangeEmailDialogController from './email_controller';

/**
 * Opens update add repository dialog.
 * @param {!md.$dialog} mdDialog
 * @return {!angular.$q.Promise}
 */
export default function showChangeEmailDialogControllerDialog(mdDialog) {
    return mdDialog.show({
        controller: ChangeEmailDialogController,
        controllerAs: 'ctrl',
        clickOutsideToClose: false,
        templateUrl: 'common/components/actionbar/email.html',
        locals: {},
    });
}