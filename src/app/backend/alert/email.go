package alert

import(
        "encoding/json"
	"errors"
	"io/ioutil"
	"net/url"
	"net/http"
	"sync"
	"log"
	"strings"
)

var ErrNoEmailConfigs = errors.New("invalid email config")

type (
	// email store
        emailStore struct{
                sync.Mutex           `json:"-"`
                EmailName string     `json:"email,omitempty"`
                EmailConfig []string `json:"emailConfig,omitempty"`
        }
)

// email instance
var e = &emailStore{
		EmailName: "",
	}


// email handler
func (email *emailStore) emailHandler(w http.ResponseWriter, r *http.Request) {
        log.Println("emailHandler begin")
        switch r.Method {
        case http.MethodGet:
                log.Println("emailHandler GET")
                email.getHandler(w, r)
        case http.MethodPost:
                log.Println("emailHandler POST")
                email.postHandler(w, r)
        default:
                http.Error(w, "unsupported HTTP method", 400)
        }
}

const SEPERATOR = "\n    html: '{{ template \"email.k8s.html\" . }}'\n    headers: { Subject: \"[!!!] 报警邮件\" }\n"

// email get
func (email *emailStore) getHandler(w http.ResponseWriter, r *http.Request) {
        enc := json.NewEncoder(w)
        w.Header().Set("Content-Type", "application/json")

        email.Lock()
        defer email.Unlock()

        emailString,err := getConfigMap("monitoring","alertmanager", "config.yml")
        //log.Printf("configmap=%v\n",emailString)
        if err!=nil {
                log.Printf("error get configmap messages: %v", err)
        }

        // get email name
        tmp := strings.Split(emailString, "email_configs:")
        if len(tmp) > 0{
                tmp2 := strings.Split(tmp[1],"webhook_configs:")
                tmp3 := strings.Split(tmp2[0], SEPERATOR)
                email.EmailConfig = make([]string,0)
                for _,v := range tmp3 {
                        if v=="\n" || v=="" {
                                continue
                        }
                        v = strings.TrimSpace(v)
                        if len(v)>1 && v[0]=='#'{
                                continue
                        }
                        if len(v)>7 {
                                v = v[7:len(v)-1]
                                email.EmailConfig = append(email.EmailConfig, v)
                        }
                }
        }

        //log.Printf("email message=%v\n",email.emailConfig)
        if err := enc.Encode(email.EmailConfig); err != nil {
                log.Printf("error encoding messages: %v", err)
        }
}

// email post
func (email *emailStore) postHandler(w http.ResponseWriter, r *http.Request) {
        dec := json.NewDecoder(r.Body)
        defer r.Body.Close()

        email.Lock()
        defer email.Unlock()

        if err := dec.Decode(&e); err != nil {
                log.Printf("error decoding message: %v", err)
                http.Error(w, "invalid request body", 400)
                return
        }

        log.Printf("emailHandler POST, emailName=%v\n", e.EmailName)

        // update alertmanager ConfigMap for email
        if err := updateConfigMap("alertmanager","kube-system","config.yml",e.EmailName); err!=nil {
                log.Println("update alertmanager configmap failed")
                return
        } 

        // command reload alertmanager
        //cmd := exec.Command("ls", "/")
        //cmd := exec.Command("curl", "-X", "POST", "http://alertmanager.kube-system.svc.cluster.local:9093/-/reload")
        //cmd := exec.Command("curl", "-X", "POST", "http://127.0.0.1:30903/-/reload")
        //out,err := cmd.Output()
        //if err!= nil {
        //      log.Printf("reload alertmanager config failed, err=%v\n",err)
        //        return
        //}
        //log.Printf("reload alertmanager config success, out=%v\n",out)
        body,err := httpPostForm()
        if err!=nil{
                log.Println("reload alertmanager config failed")
                return
        }
        log.Printf("reload alertmanager config success, body=%v",string(body))
}

func httpPostForm()([]byte,error){
        resp,err:=http.PostForm("http://127.0.0.1:30903/-/reload", url.Values{})
        if err!=nil {
                return nil,err
        }
        defer resp.Body.Close()
        body,err:=ioutil.ReadAll(resp.Body)
        if err!=nil{
                return nil,err
        }
        return body,nil
}


