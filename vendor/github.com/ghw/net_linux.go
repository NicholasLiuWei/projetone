// +build linux

package ghw

import (
	"io/ioutil"
	"os"
	"path/filepath"
	"strings"
)

const (
	PathSysClassNet = "/sys/class/net"
)

func netFillInfo(info *NetworkInfo) error {
	info.NICs = NICs()
	return nil
}

func NICs() []*NIC {
	nics := make([]*NIC, 0)

	files, err := ioutil.ReadDir(PathSysClassNet)
	if err != nil {
		return nics
	}

	for _, file := range files {
		filename := file.Name()
		// Ignore loopback...
		if filename == "lo" {
			continue
		}

		netPath := filepath.Join(PathSysClassNet, filename)
		//#-CK_FEATURE_MAGIC-#  tanck1 filterBondDeviceOut 20180606 "filter out bond_master"
		// add by tanck, filter regular files out for bonding master
		fd, err := os.Stat(netPath)
		if err != nil || fd.Mode().IsRegular(){
		   continue
		}

		dest, _ := os.Readlink(netPath)
		isVirtual := false
		if strings.Contains(dest, "virtual") {
		  continue
		}

		nic := &NIC{
			Name:      filename,
			IsVirtual: isVirtual,
		}

		mac := netDeviceMacAddress(filename)
		driver, model := netDeviceDriverModel(filename)
		speed := netSpeed(filename)
		nic.Speed = speed
		nic.MacAddress = mac
		nic.Driver = driver
		nic.Model = model
		nics = append(nics, nic)
	}

	return nics
}

func netDeviceMacAddress(dev string) string {
	// Instead of use udevadm, we can get the device's MAC address by examing
	// the /sys/class/net/$DEVICE/address file in sysfs. However, for devices
	// that have addr_assign_type != 0, return None since the MAC address is
	// random.
	aatPath := filepath.Join(PathSysClassNet, dev, "addr_assign_type")
	contents, err := ioutil.ReadFile(aatPath)
	if err != nil {
		return ""
	}
	if strings.TrimSpace(string(contents)) != "0" {
		return ""
	}
	addrPath := filepath.Join(PathSysClassNet, dev, "address")
	contents, err = ioutil.ReadFile(addrPath)
	if err != nil {
		return ""
	}
	return strings.TrimSpace(string(contents))
}


func netDeviceDriverModel(dev string) (string, string) {
	addrPath := filepath.Join(PathSysClassNet, dev, "device/uevent")
	contents, err := ioutil.ReadFile(addrPath)
	if err != nil {
		return "", ""
	}
	driver := ""
	model := ""
	lns := strings.Split(string(contents), "\n")
	for _, ln := range lns {
	  fs := strings.Split(ln, "=")
	  if fs[0] == "DRIVER" {
	     driver = fs[1]
	  }
	  if fs[0] == "MODALIAS" {
	     model = fs[1]
	  }
	}
	return driver, model
}

func netSpeed (dev string) (string){
	speedPath := filepath.Join(PathSysClassNet, dev, "speed")
	contents, err := ioutil.ReadFile(speedPath)
	if err != nil {
		return ""
	}
	return strings.Replace(string(contents),"\n","",-1)
}
