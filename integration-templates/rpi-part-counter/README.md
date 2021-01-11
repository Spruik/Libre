# Raspberry PI Part Counter

## Functional Description

This integration is for a hub and spoke architecture of node-red instances. At each machine (spoke), Node-red is running on a Raspberry Pi with a single digital input of part present / not present sensor. This sensor value is published to a centralized node-red which then transforms into the data structures for Libre. The centralized node-red instance is running on a server with connectivity to Libre and each machine.

## Installing

### Hub

1. Install [node-red](https://nodered.org/docs/getting-started/)
2. Install additional nodes via the [palette manager](https://nodered.org/docs/user-guide/editor/palette/manager#installing-nodes)
   1. node-red-node-smooth
   2. bigtimer
3. Import [Template](./Libre%20Template.json)
   1. Configure http request nodes with your influxdb address
4. Deploy template

### Spoke

1. Install [node-red](https://nodered.org/docs/getting-started/)
2. Add counter to i/o input node
3. Publish changes to <HUB-IP-ADDRESS>:9245

## Author

2021 - R.W.

## Changelog

Jan 11, 2021 - First Issue
