
package user

import (
	"github.com/kubernetes/dashboard/src/app/backend/api"
)


const(
	UserConfigMapPrefix="thinkuser-"
	UserConfigMapRole="thinkuser"
)

type ErrResponse struct{
	ErrCode int   `json:"errcode"`
	ErrMsg  string  `json:"errmsg"`
}
var ErrUserNotExist =ErrResponse{50001,"user not exist"}
var ErrUserAlreadyExist=ErrResponse{50002,"user already exist"}
var ErrPasswordNotCorrect=ErrResponse{50003,"password not correct"}
var ErrPasswordIsNull=ErrResponse{50004,"password is null"}
var StatusOK=ErrResponse{0,"ok"}

var K8sGetUserErr=ErrResponse{51001,"k8s get user error"}
var K8sCreateUserErr=ErrResponse{51002,"k8s create user error"}
var K8sUpdateUserErr=ErrResponse{51003,"k8s get user error"}
var K8sDeleteUserErr=ErrResponse{51004,"k8s delete user error"}


type UserList struct {
	ListMeta	api.ListMeta	`json:"listMeta"`
	Items		[]UserSpec		`json:"items"`
}

type UserSpec struct {
	Username 	string 	`json:"username"`
	Password 	string 	`json:"password"`
	Email 		string 	`json:"email"`
	IsAdmin 	bool 	`json:"isadmin"`
}

type LoginSpec struct {
	// Username is the username for basic authentication to the kubernetes cluster.
	Username string `json:"username"`
	// Password is the password for basic authentication to the kubernetes cluster.
	Password string `json:"password"`
}



type ListUser struct{
	ListMeta int `json:"listMeta"`
	Items   []UserSpec `json:"items"`
}


type RespData struct{
	ErrResponse
	Data interface{}
}

