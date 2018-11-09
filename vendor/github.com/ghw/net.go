package ghw

import (
	"fmt"
	"strings"
)

type NIC struct {
	Name            string
	BusType         string
	Driver          string
	MacAddress      string
	Model           string
	Vendor          string
	IsVirtual       bool
	Speed           string
	EnabledFeatures []string
}

func (n *NIC) String() string {
	vendorStr := ""
	if n.Vendor != "" {
		vendorStr = " [" + strings.TrimSpace(n.Vendor) + "]"
	}
	modelStr := ""
	if n.Model != "" {
		modelStr = " - " + strings.TrimSpace(n.Model)
	}
	isVirtualStr := ""
	if n.IsVirtual {
		isVirtualStr = " (virtual)"
	}
	return fmt.Sprintf(
		"NIC %s %s(driver) %s%s%s",
		n.Name,
		n.Driver,
		vendorStr,
		modelStr,
		isVirtualStr,
	)
}

type NetworkInfo struct {
	NICs []*NIC
}

func Network() (*NetworkInfo, error) {
	info := &NetworkInfo{}
	err := netFillInfo(info)
	if err != nil {
		return nil, err
	}
	return info, nil
}

func (i *NetworkInfo) String() string {
	return fmt.Sprintf(
		"net (%d NICs)",
		len(i.NICs),
	)
}