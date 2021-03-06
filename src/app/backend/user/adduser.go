// Copyright 2017 The Kubernetes Authors.
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

package user

import (
	namespace2 "github.com/kubernetes/dashboard/src/app/backend/resource/namespace"
	"github.com/kubernetes/dashboard/src/app/backend/settings/api"
	"k8s.io/api/core/v1"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	"log"
)

func HandleCreatUser(client kubernetes.Interface, user *UserSpec) ErrResponse {
	userName := UserConfigMapPrefix + user.Username
	//if exists
	ConfigMap, err := client.CoreV1().ConfigMaps(api.SettingsConfigMapNamespace).Get(userName, metaV1.GetOptions{})
	if err == nil && ConfigMap != nil {
		log.Println(err)
		return ErrUserAlreadyExist
	}
	NameSpaceSpec := &namespace2.NamespaceSpec{
		Name: user.Username,
	}
	err = namespace2.CreateNamespace(NameSpaceSpec, client)
	log.Println("CreateNamespace ...")
	if err != nil {
		return ErrResponse{51888, err.Error()}
	}
	UserConfig := &v1.ConfigMap{
		TypeMeta: metaV1.TypeMeta{
			Kind:       api.ConfigMapKindName,
			APIVersion: api.ConfigMapAPIVersion,
		},
		ObjectMeta: metaV1.ObjectMeta{
			Name:      userName,
			Namespace: api.SettingsConfigMapNamespace,
			Labels:    map[string]string{"role": UserConfigMapRole},
		},
		Data: map[string]string{
			"username": user.Username,
			"password": user.Password,
			"email":    user.Email,
			"isAdmin":  FormatBool(user.IsAdmin)},
	}
	_, err = client.CoreV1().ConfigMaps(api.SettingsConfigMapNamespace).Create(UserConfig)
	log.Println("CreateUser ...")
	if err != nil {
		return ErrResponse{51666, err.Error()}
	}
	return ErrResponse{0, "ok"}
}

func FormatBool(b bool) string {
	if b {
		return "true"
	}
	return "false"
}
