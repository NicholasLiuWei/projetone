
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
var ErrUserNameIsNull=ErrResponse{50005,"username is null"}
var StatusOK=ErrResponse{0,"ok"}



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
	ListMeta ListMeta `json:"listMeta"`
	Items   []UserSpec `json:"items"`
}


type RespData struct{
	ErrResponse
	Data interface{}
}

type ListMeta struct{
 TotalItems int `json:"totalItems"`
}


type ChgPasswordSpec struct {
	Username 	string 	`json:"username"`
	Password 	string 	`json:"password"`
	NewPassword string  `json:"newPassword"`
}