package handler

//storage_info
type StorageInfo struct {
	StorageStatus     interface{} `json:"storageStatus"`
	StorageUseRate    interface{} `json:"storageUseRate"`
	StorageTotal      interface{} `json:"storageTotal"`
	StorageAvailable  interface{} `json:"storageAvailable"`
	StorageUsed       interface{} `json:"storageUsed"`
	StorageReadBytes  interface{} `json:"storageReadBytes"`
	StorageReadOps    interface{} `json:"storageReadOps"`
	StorageWriteBytes interface{} `json:"storageWriteBytes"`
	StorageWriteOps   interface{} `json:"storageWriteOps"`
}

//useRate
type UseRateInfo struct {
	CpuUseRate    interface{} `json:"cpuUseRate"`
	MemoryUseRate interface{} `json:"memoryUseRate"`
}

//BseInfo
type BaseInfo struct {
	Cpu    []ResultData `json:"cpu"`
	Memory []ResultData `json:"memory"`
}


//storage_status
type CephRespInt struct {
	Status string   `json:"status"`
	Data   CephDataInt`json:"data"`
}

type CephDataInt struct {
	Result []CephResultInt `json:"result"`
}

type CephResultInt struct {
	Value []interface{} `json:"value"`
}



type CephRespFloat struct {
	Status string        `json:"status"`
	Data   CephDataFloat `json:"data"`
}

type CephDataFloat struct {
	Result []CephResultFloat `json:"result"`
}
type CephResultFloat struct {
	Value []interface{} `json:"value"`
}


//range date
type RangeResp struct {
	Status string      `json:"status"`
	Data   RangeResult `json:"data"`
}

type RangeResult struct {
	ResultType string       `json:"resultType"`
	Result     []ResultData `json:"result"`
}


type ResultData struct {
	Metric Metric     `json:"metric"`
	Values [][]interface{} `json:"values"`
}

type Metric struct {
	Name     string `json:"__name__,omitempty"`
	Alias    string `json:"alias",omitempty`
	Cluster  string `json:"cluster,omitempty"`
	Instance string `json:"instance,omitempty"`
	Job      string `json:"job,omitempty"`
}
