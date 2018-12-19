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
func AlertsHandler(w http.ResponseWriter, r *http.Request) {
	s.alertsHandler(w,r)
}

// alertmanager webhook
func (s *AlertStore) alertsHandler(w http.ResponseWriter, r *http.Request) {
        log.Println("alertsHandler begin")
        switch r.Method {
        case http.MethodGet:
                log.Println("alertsHandler GET")
                s.getHandler(w, r)
        case http.MethodPost:
                log.Println("alertsHandler POST")
                s.postHandler(w, r)
        default:
                http.Error(w, "unsupported HTTP method", 400)
        }
}

// alerts get
func (s *AlertStore) getHandler(w http.ResponseWriter, r *http.Request) {
	log.Println("alert enter getHandler!")
	u, _ := url.Parse(r.URL.String())
	queryParams := u.Query()
	log.Println(queryParams["itemsPerPage"])
	log.Println(queryParams["page"])
	itemsPerPage, _ := strconv.Atoi(queryParams["itemsPerPage"][0])
	page, _ := strconv.Atoi(queryParams["page"][0])
	var p  = AlertPageIndex{
		itemsPerPage : itemsPerPage,
		page : page,
	}
	/*dec := json.NewDecoder(r.Body)
	defer r.Body.Close()
	if err := dec.Decode(&p); err != nil {
		log.Printf("error decoding message: %v", err)
		http.Error(w, "invalid request body", 400)
		return
	}*/

        enc := json.NewEncoder(w)
        w.Header().Set("Content-Type", "application/json")

        s.Lock()
        defer s.Unlock()

	mess, err := queryDBMessages(p)
	if err != nil {
		log.Fatal("getHandler queryDBMessages error!", err)
		return
	}
        //log.Printf("getHandler message: %v\n", *s)
        //log.Printf("getHandler message s.alerts: %v\n", s.alerts)
        if err := enc.Encode(mess); err != nil {
        //if err := enc.Encode(*s); err != nil {
                log.Printf("error encoding messages: %v", err)
		return
        }
}

// alerts post
func (s *AlertStore) postHandler(w http.ResponseWriter, r *http.Request) {
	log.Printf("enter alert postHandler!")
        dec := json.NewDecoder(r.Body)
        defer r.Body.Close()

        var m HookMessage
        if err := dec.Decode(&m); err != nil {
                log.Printf("error decoding message: %v", err)
                http.Error(w, "invalid request body", 400)
                return
        }

        s.Lock()
        defer s.Unlock()

	//write to DB
	var buf []byte
	var err error
	if buf, err = json.Marshal(m); err != nil {
		log.Fatal("json marshal error:", err)
	}
	err = writeDB(string(buf))
	log.Printf("write context: %s", string(buf))
	if err != nil {
		log.Printf("Failed to write alert messages to influxdb!", string(buf))
		return
	}
	log.Printf("after alert postHandler writeDB!")

        //s.alerts = make([]*HookMessage)
        /*s.alerts = append(s.alerts, &m)*/
        //log.Printf("alertsHandler POST, HookMessage=%v\n", m)
        sendChan <- &m

        /*if len(s.alerts) > s.capacity {
                a := s.alerts
                _, a = a[0], a[1:]
                s.alerts = a
        }*/
}

// GetAlertsNumHandler get alerts number history
func GetAlertsNumHandler(w http.ResponseWriter, r *http.Request) {
	s.getAlertsNumHandler(w,r)
}

// get alerts number history
func (s *AlertStore) getAlertsNumHandler(w http.ResponseWriter, r *http.Request) {
        enc := json.NewEncoder(w)
        w.Header().Set("Content-Type", "application/json")

        s.Lock()
        defer s.Unlock()

	count, err := countDB()
	if err != nil {
		log.Fatal("getAlertsNumHandler countDB error!", err)
		return
	}
	n.AlertsNum = count

	/*s.AlertsNum = 0
	n.AlertsNum = 0
	for i:=0; i<len(s.alerts);i++ {
		s.AlertsNum += len(s.alerts[i].Alerts)
	}
        n.AlertsNum = s.AlertsNum*/
        if err := enc.Encode(n); err != nil {
                log.Printf("error encoding messages: %v", err)
        }
        log.Printf("get alerts number %d", n.AlertsNum)
}

// ClearAlertsHandler clear alerts history
func ClearAlertsHandler(w http.ResponseWriter, r *http.Request) {
	s.clearAlertsHandler(w,r)
}

// clear alerts history
func (s *AlertStore) clearAlertsHandler(w http.ResponseWriter, r *http.Request) {
        enc := json.NewEncoder(w)
        w.Header().Set("Content-Type", "application/json")

        s.Lock()
        defer s.Unlock()
	_, err := queryDB("delete from node_alert")
	if err != nil {
		log.Fatal("clearAlertsHandler queryDB error!")
		return
	}
        s.AlertsNum=0
        n.AlertsNum=0
        //log.Printf("get alerts %v", s.alerts)
        s.alerts=[]*HookMessage{}

        if err := enc.Encode(s.alerts); err != nil {
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
func EmailHandler(w http.ResponseWriter, r *http.Request){
	e.emailHandler(w,r)
}

// add email handler
func AddEmailHandler(w http.ResponseWriter, r *http.Request){
	e.addEmailHandler(w,r)
}


