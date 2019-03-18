package alert

import(
	"github.com/spf13/pflag"
        "encoding/json"
	"sync"
	"time"
	"net/http"
	"golang.org/x/net/websocket"
	"log"
	"strconv"
	influxdbclient "github.com/influxdata/influxdb/client/v2"
	"net/url"
	"github.com/emicklei/go-restful"
)

var(
	capacity = pflag.Int("cap", 100, "capacity of the simple alerts store")
)

// alertmanager webhook
type (

        // Timestamp is a helper for (un)marhalling time
        Timestamp time.Time

        // HookMessage is the message we receive from Alertmanager
        HookMessage struct {
                Version           string            `json:"version"`
                GroupKey          string            `json:"groupKey"`
                Status            string            `json:"status"`
                Receiver          string            `json:"receiver"`
                GroupLabels       map[string]string `json:"groupLabels"`
                CommonLabels      map[string]string `json:"commonLabels"`
                CommonAnnotations map[string]string `json:"commonAnnotations"`
                ExternalURL       string            `json:"externalURL"`
                Alerts            []Alert           `json:"alerts"`
        }

        // Alert is a single alert.
        Alert struct {
                Labels      map[string]string `json:"labels"`
                Annotations map[string]string `json:"annotations"`
                StartsAt    string            `json:"startsAt,omitempty"`
                EndsAt      string            `json:"EndsAt,omitempty"`
        }

        // just an example alert store. in a real hook, you would do something useful
        AlertStore struct {
                sync.Mutex
		client influxdbclient.Client
                capacity int
                alerts   []*HookMessage
                AlertsNum int `json:"alertsnum"`
        }

        // alert num
        AlertNum struct{
                AlertsNum int `json:"alertsnum"`
        }

	// alert Request index
	AlertPageIndex struct {
		itemsPerPage int
		page         int
	}

	InfluxAlert struct {
		InfluxdbIndex     string            `json: influxdbIndex`
		UserProcessed     string            `json:"userProcessed"`
		GroupLabels       map[string]string `json:"groupLabels"`
		Status            string            `json:"status"`
		Receiver          string            `json:"receiver"`
		Alerts            Alert             `json:"alerts"`
	}

	DashboardPages struct {
		TotalItems        int               `json:"totalItems"`
	}

	DashboardAlert struct {
		Alerts            []InfluxAlert     `json:"alerts"`
		ListMeta          DashboardPages    `json:"listMeta"`
	}
)

// add alertmanager webhook
var s = &AlertStore{
        capacity: *capacity,
}

var sendChan chan *HookMessage = make(chan *HookMessage)
var users  map[*websocket.Conn]string

func init() {
	users = make(map[*websocket.Conn]string)
}

// add alerts num object
var n = &AlertNum{
        AlertsNum: 0,
}

// AlertsHandler webhook
//func AlertsHandler(w http.ResponseWriter, r *http.Request) {
func AlertsHandler(req *restful.Request, resp *restful.Response) {
	s.alertsHandler(req,resp)
}

// alertmanager webhook
//func (s *AlertStore) alertsHandler(w http.ResponseWriter, r *http.Request) {
func (s *AlertStore) alertsHandler(req *restful.Request, resp *restful.Response) {
        log.Println("alertsHandler begin")
        switch req.Request.Method {
        case http.MethodGet:
                log.Println("alertsHandler GET")
                s.getHandler(resp.ResponseWriter, req.Request)
        case http.MethodPost:
                log.Println("alertsHandler POST")
                s.postHandler(resp.ResponseWriter, req.Request)
        default:
                http.Error(resp.ResponseWriter, "unsupported HTTP method", 400)
        }
}

// alerts get
func (s *AlertStore) getHandler(w http.ResponseWriter, r *http.Request) {
	//log.Println("alert enter getHandler!")
	u, _ := url.Parse(r.URL.String())
	queryParams := u.Query()
	//log.Println(queryParams["itemsPerPage"])
	//log.Println(queryParams["page"])
	itemsPerPage, _ := strconv.Atoi(queryParams["itemsPerPage"][0])
	page, _ := strconv.Atoi(queryParams["page"][0])
	var p  = AlertPageIndex{
		itemsPerPage : itemsPerPage,
		page : page,
	}

	//log.Println("getHandler before encoder.")
        enc := json.NewEncoder(w)
        w.Header().Set("Content-Type", "application/json")

	mess, err := queryDBMessages(p)
	if err != nil {
		log.Fatal("getHandler queryDBMessages error!", err)
		return
	}

        if err := enc.Encode(mess); err != nil {
                log.Printf("error encoding messages: %v", err)
		return
        }
}

// alerts post
func (s *AlertStore) postHandler(w http.ResponseWriter, r *http.Request) {
	//log.Printf("enter alert postHandler!")
        dec := json.NewDecoder(r.Body)
        defer r.Body.Close()

        var m HookMessage
        if err := dec.Decode(&m); err != nil {
                log.Printf("error decoding message: %v", err)
                http.Error(w, "invalid request body", 400)
                return
        }

	//write to DB
	var buf []byte
	var err error
	var influxAlert = InfluxAlert{
		InfluxdbIndex: "",
		UserProcessed: "false",
		GroupLabels  : m.GroupLabels,
		Status       : m.Status,
		Receiver     : m.Receiver,
	}
	//log.Println("alert post len: ", len(m.Alerts), m)
	for i := 0; i < len(m.Alerts); i++ {
		//log.Println("start process alert message index: ", i, m.Alerts[i])
		influxAlert.Alerts = m.Alerts[i]
		if buf, err = json.Marshal(influxAlert); err != nil {
			log.Fatal("json marshal error:", err)
		}
		err = writeDB(string(buf), time.Now())
		//log.Printf("write context: %s", string(buf))
		if err != nil {
			log.Printf("Failed to write alert messages to influxdb!", string(buf))
			return
		}
		//log.Printf("after alert postHandler writeDB!")
	}

	log.Println("write messages to alert channel!")
        sendChan <- &m
}

// GetAlertsNumHandler get alerts number history
//func GetAlertsNumHandler(w http.ResponseWriter, r *http.Request) {
func GetAlertsNumHandler(req *restful.Request, resp *restful.Response) {
	s.getAlertsNumHandler(resp.ResponseWriter,req.Request)
}

//func UpdateAlertsHandler(w http.ResponseWriter, r *http.Request) {
func UpdateAlertsHandler(req *restful.Request, resp *restful.Response) {
	dec := json.NewDecoder(req.Request.Body)
	defer req.Request.Body.Close()

	var m InfluxAlert
	if err := dec.Decode(&m); err != nil {
		log.Printf("error decoding message: %v", err)
		http.Error(resp.ResponseWriter, "invalid request body", 400)
		return
	}
	if err := updateDB(m); err != nil {
		log.Printf("error updateDB, err: %v", err)
		return
	}
}

//func DelAlertsHandler(w http.ResponseWriter, r *http.Request) {
func DelAlertsHandler(req *restful.Request, resp *restful.Response) {
	dec := json.NewDecoder(req.Request.Body)
	defer req.Request.Body.Close()

	var m []InfluxAlert
	if err := dec.Decode(&m); err != nil {
		log.Printf("error decoding message: %v", err)
		http.Error(resp.ResponseWriter, "invalid request body", 400)
		return
	}
	if err := deleteDB(m); err != nil {
		log.Printf("error deleteBD, err: %v", err)
		return
	}
}

// get alerts number history
func (s *AlertStore) getAlertsNumHandler(w http.ResponseWriter, r *http.Request) {
        enc := json.NewEncoder(w)
        w.Header().Set("Content-Type", "application/json")

	count, err := countDB()
	if err != nil {
		log.Fatal("getAlertsNumHandler countDB error!", err)
		return
	}
	n.AlertsNum = count

        if err := enc.Encode(n); err != nil {
                log.Printf("error encoding messages: %v", err)
        }
        log.Printf("get alerts number %d", n.AlertsNum)
}

// ClearAlertsHandler clear alerts history
func ClearAlertsHandler(req *restful.Request, resp *restful.Response) {
	s.clearAlertsHandler(resp.ResponseWriter,req.Request)
}

// clear alerts history
func (s *AlertStore) clearAlertsHandler(w http.ResponseWriter, r *http.Request) {
        enc := json.NewEncoder(w)
        w.Header().Set("Content-Type", "application/json")

	_, err := queryDB("delete from node_alert")
	if err != nil {
		log.Fatal("clearAlertsHandler queryDB error!")
		return
	}
        s.AlertsNum=0
        n.AlertsNum=0
        s.alerts=[]*HookMessage{}

        if err := enc.Encode(HookMessage{}); err != nil {
                log.Printf("error encoding messages: %v", err)
        }
        log.Printf("get alerts number %d", n.AlertsNum)
}



// alert Handler
func AlertHandler(ws *websocket.Conn) {
      defer func(){
              if err:=ws.Close();err!=nil{
                      log.Println("Websocket could not be closed", err.Error())
              }
              //close(sendChan)
      }()
      log.Println("begin websocket")
      if ws==nil {
              log.Println("websocket conn closed.")
      }

	// check if reconnect 
	if _,ok := users[ws]; !ok {
		users[ws] = "connect"
	}

      log.Println("alertsHandler send begin")
      var message *HookMessage
      for {
                //time.Sleep(1*time.Second)
                //tNow := time.Now()
                //timeNow := tNow.Format("2006-01-02 15:04:05")
                //var message string =  "aaaaaa"+timeNow
                message = <-sendChan

		// send all clients
		for conn,_ := range users {
			err := websocket.JSON.Send(conn, message)
			if err!=nil {
				log.Println("send message failure")
				// remove error conn
				delete(users, conn)
			}
		}

		log.Printf("send message=%v\n",message)
                log.Println("send message finished")
      }
}

func RegisterInfluxdbClient(client influxdbclient.Client) {
	s.client = client
}

// email handler
func EmailHandler(req *restful.Request, resp *restful.Response){
	e.emailHandler(req, resp)
}

// add email handler
func AddEmailHandler(req *restful.Request, resp *restful.Response){
	e.addEmailHandler(req, resp)
}


