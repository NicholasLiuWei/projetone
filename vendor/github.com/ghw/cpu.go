package ghw

import (
	"fmt"
)

type ProcessorId uint32

type ProcessorCore struct {
	Id                ProcessorId
	Index             int
	NumThreads        uint32
	LogicalProcessors []ProcessorId
}

func (c *ProcessorCore) String() string {
	return fmt.Sprintf(
		"processor core #%d (%d threads), logical processors %v",
		c.Index,
		c.NumThreads,
		c.LogicalProcessors,
	)
}

type Processor struct {
	Id           ProcessorId
	NumCores     uint32
	NumThreads   uint32
	Vendor       string
	Model        string
	Capabilities []string
	Cores        []*ProcessorCore
}

type ArmProcessor struct {
	NumCores     uint32
	Model        string
	Capabilities string
}

func (ap *ArmProcessor) String() string {
     return fmt.Sprintf("%d %s cores, with flags %s",
       ap.NumCores, ap.Model, ap.Capabilities)
}

func (p *Processor) HasCapability(find string) bool {
	for _, c := range p.Capabilities {
		if c == find {
			return true
		}
	}
	return false
}

func (p *Processor) String() string {
	ncs := "cores"
	if p.NumCores == 1 {
		ncs = "core"
	}
	nts := "threads"
	if p.NumThreads == 1 {
		nts = "thread"
	}
	return fmt.Sprintf(
		"physical package #%d (%d %s, %d hardware %s)",
		p.Id,
		p.NumCores,
		ncs,
		p.NumThreads,
		nts,
	)
}

type CPUInfo struct {
	TotalCores   uint32
	TotalThreads uint32
	Processors   []*Processor
}

func ArmCPU() (*ArmProcessor, error) {
   return fillArmProcessor()
}

func CPU() (*CPUInfo, error) {
	info := &CPUInfo{}
	err := cpuFillInfo(info)
	if err != nil {
		return nil, err
	}
	return info, nil
}

func (i *CPUInfo) String() string {
	nps := "packages"
	if len(i.Processors) == 1 {
		nps = "package"
	}
	ncs := "cores"
	if i.TotalCores == 1 {
		ncs = "core"
	}
	nts := "threads"
	if i.TotalThreads == 1 {
		nts = "thread"
	}
	return fmt.Sprintf(
		"cpu (%d physical %s, %d %s, %d hardware %s)",
		len(i.Processors),
		nps,
		i.TotalCores,
		ncs,
		i.TotalThreads,
		nts,
	)
}
