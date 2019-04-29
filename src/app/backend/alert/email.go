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
        "github.com/emicklei/go-restful"
        clientapi "github.com/kubernetes/dashboard/src/app/backend/client/api"
        "k8s.io/apimachinery/pkg/labels"
        metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
        //"k8s.io/kubernetes/pkg/apis/core/pods"
)

var ErrNoEmailConfigs = errors.New("invalid email config")

type (
	// email store
        emailStore struct{
                sync.Mutex           `json:"-"`
                EmailName string     `json:"email,omitempty"`
                EmailConfig []string `json:"emailConfig,omitempty"`
                ClientFactory clientapi.ClientManager
        }
)

// email instance
var e = &emailStore{
		EmailName: "",
	}

func InitEmailStore(cf clientapi.ClientManager){
        e.ClientFactory = cf
}


// email handler
func (email *emailStore) emailHandler(req *restful.Request, resp *restful.Response) {
        log.Println("emailHandler begin")
        switch req.Request.Method {
        case http.MethodGet:
                log.Println("emailHandler GET")
                email.getHandler(req, resp)
        case http.MethodPost:
                log.Println("emailHandler POST")
                email.postHandler(req, resp)
        default:
                http.Error(resp.ResponseWriter, "unsupported HTTP method", 400)
        }
}

const SEPERATOR = "\n    html: '{{ template \"email.k8s.html\" . }}'\n    headers: { Subject: \"[!!!] 报警邮件\" }\n"

// email get
func (email *emailStore) getHandler(req *restful.Request, resp *restful.Response) {
        enc := json.NewEncoder(resp.ResponseWriter)
        resp.ResponseWriter.Header().Set("Content-Type", "application/json")

        email.Lock()
        defer email.Unlock()
        
        emailString,err := getConfigMap("monitoring","alertmanager", "config.yml", req)
        //log.Printf("configmap=%v\n",emailString)
        if err!=nil {
                log.Printf("error get configmap messages: %v", err)
                return
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
func (email *emailStore) postHandler(req *restful.Request, resp *restful.Response) {
        dec := json.NewDecoder(req.Request.Body)
        defer req.Request.Body.Close()

        email.Lock()
        defer email.Unlock()

        if err := dec.Decode(&e); err != nil {
                log.Printf("error decoding message: %v", err)
                http.Error(resp.ResponseWriter, "invalid request body", 400)
                return
        }

        log.Printf("emailHandler POST, emailName=%v\n", e.EmailName)

        // update alertmanager ConfigMap for email
        if err := updateConfigMap("delete","alertmanager","monitoring","config.yml",e.EmailName, req); err!=nil {
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

        k8sClient, err := email.ClientFactory.Client(req)
        label := labels.SelectorFromSet(labels.Set(map[string]string{"app": "alertmanager"}))
        pod, err := k8sClient.CoreV1().Pods("monitoring").List(metav1.ListOptions{LabelSelector: label.String()})
        if err != nil || len(pod.Items) == 0 {
                log.Println("reload alertmanager get pod failed")
                return
        }
        for i:=0; i<len(pod.Items); i++ {
                log.Println("reload alertmanager delete pod: ", pod.Items[i].ObjectMeta.Name )
                err = k8sClient.CoreV1().Pods("monitoring").Delete(pod.Items[i].ObjectMeta.Name, &metav1.DeleteOptions{})
                if err != nil {
                        log.Println("reload alertmanager delete pod failed", err)
                        return
                }
        }


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


// add email handler
func (email *emailStore) addEmailHandler(req *restful.Request, resp *restful.Response) {
        log.Println("addEmailHandler begin")
        dec := json.NewDecoder(req.Request.Body)
        defer req.Request.Body.Close()

        email.Lock()
        defer email.Unlock()

        if err := dec.Decode(&e); err != nil {
                log.Printf("error decoding message: %v", err)
                http.Error(resp.ResponseWriter, "invalid request body", 400)
                return
        }

        log.Printf("addEmailHandler POST, emailName=%v\n", e.EmailName)

        // update alertmanager ConfigMap for email
        if err := updateConfigMap("add","alertmanager","monitoring","config.yml",e.EmailName, req); err!=nil {
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


