<template>
  <div class="app-container">
    <div class="filter-container">
      <el-select clearable @change='handleHostsOptions' style="width: 200px" class="filter-item" v-model="listQuery.hostgroupid" placeholder="服务器分组">
        <el-option v-for="item in hostGroupOptions" :key="item.groupid" :label="item.name" :value="item.groupid">
        </el-option>
      </el-select>
      <el-select clearable class="filter-item" style="width: 450px" v-model="listQuery.hostids" multiple placeholder="服务器">
        <el-option v-for="item in  hostsOptions" :key="item.hostid" :label="item.interfaces[0].ip" :value="item.hostid">
        </el-option>
      </el-select>
      <el-date-picker
        class="filter-item"
        style="width: 200px"
        v-model="listQuery.startTime"
        type="datetime"
        placeholder="选择开始时间"
        align="right"
        :picker-options="pickerOptions">
      </el-date-picker>
      <el-date-picker
        class="filter-item"
        style="width: 200px"
        v-model="listQuery.endTime"
        type="datetime"
        placeholder="选择结束时间"
        align="right"
        :picker-options="pickerOptions">
      </el-date-picker>
      <el-button class="filter-item" type="primary" v-waves icon="el-icon-search" @click="handleFilter">{{$t('table.search')}}</el-button>
      <el-button class="filter-item" type="primary" :loading="downloadLoading" v-waves icon="el-icon-download" @click="handleDownload">{{$t('table.export')}}</el-button>
    </div>

    <el-table :key='tableKey' :data="list" v-loading="listLoading" border fit highlight-current-row
      style="width: 100%;min-height:200px;">
      <el-table-column min-width="100px" label="Host Name">
        <template slot-scope="scope">
          <span>{{scope.row.hostName}}({{scope.row.hostIp}})</span>
        </template>
      </el-table-column>
      <el-table-column min-width="100px" label="Items">
        <template slot-scope="scope">
          <span>{{scope.row.name}}</span>
        </template>
      </el-table-column>
      <el-table-column width="110px" align="center" label="Min">
        <template slot-scope="scope">
          <span v-if="scope.row.showMin">{{scope.row.showMin}}</span>
          <span v-if="!scope.row.showMin">{{scope.row.min}}{{scope.row.unit}}</span>
        </template>
      </el-table-column>
      <el-table-column width="110px" align="center" label="Avg">
        <template slot-scope="scope">
          <span v-if="scope.row.showAvg">{{scope.row.showAvg}}</span>
          <span v-if="!scope.row.showAvg">{{scope.row.avg}}{{scope.row.unit}}</span>
        </template>
      </el-table-column>
      <el-table-column width="110px" align="center" label="Max">
        <template slot-scope="scope">
          <span v-if="scope.row.showMax">{{scope.row.showMax}}</span>
          <span v-if="!scope.row.showMax">{{scope.row.max}}{{scope.row.unit}}</span>
        </template>
      </el-table-column>
    </el-table>
    <el-table :key='tableKey' :data="listSummary" v-loading="listLoading" border fit highlight-current-row
              style="margin-top:20px;width: 100%;min-height:200px;">
      <el-table-column min-width="100px" label="Host Name">
        <template slot-scope="scope">
          <span>{{scope.row.hostName}}({{scope.row.hostIp}})</span>
        </template>
      </el-table-column>
      <el-table-column width="110px" align="center" label="CPU使用率">
        <template slot-scope="scope">
        <span>{{scope.row.cpuUseRate}}{{scope.row.unit}}</span>
        </template>
      </el-table-column>
      <el-table-column width="110px" align="center" label="内存使用率">
        <template slot-scope="scope">
          <span>{{scope.row.memoryUseRate}}{{scope.row.memoryUseRateUnit}}</span>
        </template>
      </el-table-column>
      <el-table-column width="110px" align="center" label="磁盘iowait">
        <template slot-scope="scope">
          <span>{{scope.row.ioWaitRate}}{{scope.row.unit}}</span>
        </template>
      </el-table-column>
      <el-table-column width="110px" align="center" label="网络吞吐量">
        <template slot-scope="scope">
          <span>{{scope.row.traffic}}{{scope.row.trafficUnit}}</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { fetchHostGroupList, fetchHostList } from '@/api/hosts'
import { fetchGraphList } from '@/api/graph'
import { fetchHistoryDataList } from '@/api/history'
import store from '@/store'
import waves from '@/directive/waves' // 水波纹指令
import { parseTime } from '@/utils'

export default {
  name: 'display',
  directives: {
    waves
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      listSummary: null,
      listLoading: false,
      listQuery: {
        hostgroupid: undefined,
        hostids: [],
        title: undefined,
        type: undefined,
        startTime: undefined,
        endTime: undefined
      },
      hostGroupOptions: [],
      hostsOptions: [],
      downloadLoading: false,
      pickerOptions: {
        shortcuts: [{
          text: '今天',
          onClick (picker) {
            picker.$emit('pick', new Date())
          }
        }, {
          text: '昨天',
          onClick (picker) {
            const date = new Date()
            date.setTime(date.getTime() - 3600 * 1000 * 24)
            picker.$emit('pick', date)
          }
        }, {
          text: '一周前',
          onClick (picker) {
            const date = new Date()
            date.setTime(date.getTime() - 3600 * 1000 * 24 * 7)
            picker.$emit('pick', date)
          }
        }]
      }
    }
  },
  filters: {
  },
  created() {
    this.getHostGroupList()
  },
  methods: {
    getHostGroupList () {
      fetchHostGroupList(store.getters.token).then(response => {
        this.hostGroupOptions = response.data.result
      })
    },
    handleHostsOptions (hostGroupId) {
      if (!hostGroupId) {
        this.listQuery.hostids = []
        this.hostsOptions = []
        return
      }
      fetchHostList(store.getters.token, hostGroupId).then(response => {
        this.listQuery.hostids = []
        this.hostsOptions = response.data.result
      })
    },
    getList () {
      this.listLoading = true
      fetchGraphList(store.getters.token, this.listQuery.hostids).then(response => {
        let i = 0
        let j = 0
        let k = 0
        let graphList = response.data.result
        // CPU utilization: CPU idle time & CPU iowait time
        let cpuUtilizationList = []
        let cpuUtilizationItems = []
        // Network Trafic
        let networkTraficList = []
        let networkTraficItems = []
        console.log(graphList)
        for (; i < graphList.length; i++) {
          if (graphList[i].name === 'CPU utilization') {
            j = 0
            for (; j < graphList[i].items.length; j++) {
              graphList[i].items[j].total = 0
              graphList[i].items[j].totalCount = 0
              // CPU信息
              if (graphList[i].items[j].name === 'CPU idle time' ||
                graphList[i].items[j].description === 'The time the CPU has spent doing nothing.' ||
                graphList[i].items[j].name === 'CPU iowait time' ||
                graphList[i].items[j].description === 'Amount of time the CPU has been waiting for I/O to complete.') {
                if (graphList[i].items[j].description === 'The time the CPU has spent doing nothing.') {
                  graphList[i].items[j].name = 'CPU idle time'
                  graphList[i].items[j].digits = 2
                }
                if (graphList[i].items[j].description === 'Amount of time the CPU has been waiting for I/O to complete.') {
                  graphList[i].items[j].name = 'CPU iowait time'
                  graphList[i].items[j].digits = 6
                }
                cpuUtilizationList.push(graphList[i].items[j])
                cpuUtilizationItems.push(graphList[i].items[j].itemid)
                k = 0
                for (; k < this.hostsOptions.length; k++) {
                  if (this.hostsOptions[k].hostid === graphList[i].items[j].hostid) {
                    graphList[i].items[j].hostName = this.hostsOptions[k].host
                    graphList[i].items[j].hostIp = this.hostsOptions[k].interfaces[0].ip
                    break
                  }
                }
              }
            }
          }

          if (graphList[i].name === 'Network traffic on eth1' ||
              graphList[i].name === 'Network traffic on eth0' || graphList[i].name === 'Memory usage') {
            j = 0
            for (; j < graphList[i].items.length; j++) {
              graphList[i].items[j].total = 0
              graphList[i].items[j].totalCount = 0
              // Network interfaces
              if (graphList[i].items[j].name === 'Incoming network traffic on eth1' ||
                graphList[i].items[j].name === 'Outgoing network traffic on eth1' ||
                graphList[i].items[j].name === 'Incoming network traffic on eth0' ||
                graphList[i].items[j].name === 'Outgoing network traffic on eth0' ||
                graphList[i].items[j].name === 'Incoming network traffic on $1' ||
                graphList[i].items[j].name === 'Outgoing network traffic on $1' ||
                graphList[i].items[j].name === 'Incoming network traffic on $0' ||
                graphList[i].items[j].name === 'Outgoing network traffic on $0') {
                graphList[i].items[j].digits = 2 // 取两位小数

                networkTraficList.push(graphList[i].items[j])
                networkTraficItems.push(graphList[i].items[j].itemid)
                k = 0
                for (; k < this.hostsOptions.length; k++) {
                  if (this.hostsOptions[k].hostid === graphList[i].items[j].hostid) {
                    graphList[i].items[j].hostName = this.hostsOptions[k].host
                    graphList[i].items[j].hostIp = this.hostsOptions[k].interfaces[0].ip
                    break
                  }
                }
              }
              // Memory信息
              if (graphList[i].items[j].name === 'Available memory' ||
                graphList[i].items[j].name === 'Total memory') {
                graphList[i].items[j].digits = 2
                networkTraficList.push(graphList[i].items[j])
                networkTraficItems.push(graphList[i].items[j].itemid)
                k = 0
                for (; k < this.hostsOptions.length; k++) {
                  if (this.hostsOptions[k].hostid === graphList[i].items[j].hostid) {
                    graphList[i].items[j].hostName = this.hostsOptions[k].host
                    graphList[i].items[j].hostIp = this.hostsOptions[k].interfaces[0].ip
                    break
                  }
                }
              }
            }
          }
        }
        console.log(cpuUtilizationList)
        console.log(networkTraficList)
        if (cpuUtilizationItems.length <= 0) {
          this.listLoading = false
          return
        }
        fetchHistoryDataList(store.getters.token, cpuUtilizationItems, new Date(this.listQuery.startTime).getTime() / 1000, new Date(this.listQuery.endTime).getTime() / 1000, 0).then(response => {
          i = 0
          j = 0
          let historyDataList = response.data.result
          console.log(historyDataList)
          for (; i < cpuUtilizationList.length; i++) {
            j = 0
            for (; j < historyDataList.length; j++) {
              if (historyDataList[j].itemid === cpuUtilizationList[i].itemid) {
                cpuUtilizationList[i].totalCount = Number(cpuUtilizationList[i].totalCount) + 1
                cpuUtilizationList[i].total = Number(cpuUtilizationList[i].total) + Number(historyDataList[j].value)
                if (cpuUtilizationList[i].min === undefined) {
                  cpuUtilizationList[i].min = historyDataList[j].value
                } else {
                  cpuUtilizationList[i].min = Number(historyDataList[j].value) < Number(cpuUtilizationList[i].min) ? historyDataList[j].value : cpuUtilizationList[i].min
                }
                if (cpuUtilizationList[i].max === undefined) {
                  cpuUtilizationList[i].max = historyDataList[j].value
                } else {
                  cpuUtilizationList[i].max = Number(historyDataList[j].value) > Number(cpuUtilizationList[i].max) ? historyDataList[j].value : cpuUtilizationList[i].max
                }
              }
            }
            cpuUtilizationList[i].avg = Number(Number(cpuUtilizationList[i].total) / Number(cpuUtilizationList[i].totalCount)).toFixed(cpuUtilizationList[i].digits)
            cpuUtilizationList[i].max = Number(cpuUtilizationList[i].max).toFixed(cpuUtilizationList[i].digits)
            cpuUtilizationList[i].min = Number(cpuUtilizationList[i].min).toFixed(cpuUtilizationList[i].digits)
            cpuUtilizationList[i].unit = '%' // 设置数据单位
          }

          this.list = cpuUtilizationList
          i = 0
          let listSummary = []
          k = 0
          let m = 0
          for (; k < this.hostsOptions.length; k++) {
            m = 0
            for (; m < this.listQuery.hostids.length; m++) {
              if (this.listQuery.hostids[m] === this.hostsOptions[k].hostid) {
                listSummary.push({hostName: this.hostsOptions[k].host, hostIp: this.hostsOptions[k].interfaces[0].ip})
              }
            }
          }
          for (; i < cpuUtilizationList.length; i++) {
            j = 0
            for (; j < listSummary.length; j++) {
              if (cpuUtilizationList[i].name === 'CPU idle time' && cpuUtilizationList[i].hostIp === listSummary[j].hostIp) {
                listSummary[j].cpuUseRate = Number(100 - Number(cpuUtilizationList[i].avg)).toFixed(2)
              }
              if (cpuUtilizationList[i].name === 'CPU iowait time' && cpuUtilizationList[i].hostIp === listSummary[j].hostIp) {
                listSummary[j].ioWaitRate = Number(cpuUtilizationList[i].avg)
              }
              listSummary[j].unit = cpuUtilizationList[i].unit
            }
          }
          // this.listSummary = listSummary
          // this.listLoading = false
          // 获取Network traffic历史数据
          fetchHistoryDataList(store.getters.token, networkTraficItems, new Date(this.listQuery.startTime).getTime() / 1000, new Date(this.listQuery.endTime).getTime() / 1000, 3).then(response => {
            i = 0
            j = 0
            let historyDataList = response.data.result
            console.log(historyDataList)
            for (; i < networkTraficList.length; i++) {
              j = 0
              for (; j < historyDataList.length; j++) {
                if (historyDataList[j].itemid === networkTraficList[i].itemid) {
                  networkTraficList[i].totalCount = Number(networkTraficList[i].totalCount) + 1
                  networkTraficList[i].total = Number(networkTraficList[i].total) + Number(historyDataList[j].value)
                  if (networkTraficList[i].min === undefined) {
                    networkTraficList[i].min = historyDataList[j].value
                  } else {
                    networkTraficList[i].min = Number(historyDataList[j].value) < Number(networkTraficList[i].min) ? historyDataList[j].value : networkTraficList[i].min
                  }
                  if (networkTraficList[i].max === undefined) {
                    networkTraficList[i].max = historyDataList[j].value
                  } else {
                    networkTraficList[i].max = Number(historyDataList[j].value) > Number(networkTraficList[i].max) ? historyDataList[j].value : networkTraficList[i].max
                  }
                }
              }
              networkTraficList[i].avg = Number(Number(networkTraficList[i].total) / Number(networkTraficList[i].totalCount)).toFixed(networkTraficList[i].digits)
              networkTraficList[i].max = Number(networkTraficList[i].max).toFixed(networkTraficList[i].digits)
              networkTraficList[i].min = Number(networkTraficList[i].min).toFixed(networkTraficList[i].digits)
              networkTraficList[i].unit = 'bps' // 设置数据单位
              if (networkTraficList[i].name === 'Available memory' ||
                networkTraficList[i].name === 'Total memory') {
                networkTraficList[i].unit = 'B' // 设置数据单位
              }
            }
            m = 0
            for (; m < networkTraficList.length; m++) {
              if (networkTraficList[m].name === 'Available memory' ||
                networkTraficList[m].name === 'Total memory') {
                networkTraficList[m].unit = 'GB'
                networkTraficList[m].max = Number(Number(networkTraficList[m].max) / (1024*1024*1024)).toFixed(networkTraficList[m].digits)
                networkTraficList[m].min = Number(Number(networkTraficList[m].min) / (1024*1024*1024)).toFixed(networkTraficList[m].digits)
                networkTraficList[m].avg = Number(Number(networkTraficList[m].avg) / (1024*1024*1024)).toFixed(networkTraficList[m].digits)
              }
              else {
                if (Number(networkTraficList[m].max) / 1000000 > 1) {
                  networkTraficList[m].showMax = Number(Number(networkTraficList[m].max) / 1000000).toFixed(networkTraficList[m].digits) + 'Mbps'
                } else if (Number(networkTraficList[m].max) / 1000 > 1) {
                  networkTraficList[m].showMax = Number(Number(networkTraficList[m].max) / 1000).toFixed(networkTraficList[m].digits) + 'Kbps'
                }
                if (Number(networkTraficList[m].avg) / 1000000 > 1) {
                  networkTraficList[m].showAvg = Number(Number(networkTraficList[m].avg) / 1000000).toFixed(networkTraficList[m].digits) + 'Mbps'
                } else if (Number(networkTraficList[m].avg) / 1000 > 1) {
                  networkTraficList[m].showAvg = Number(Number(networkTraficList[m].avg) / 1000).toFixed(networkTraficList[m].digits) + 'Kbps'
                }
                if (Number(networkTraficList[m].min) / 1000000 > 1) {
                  networkTraficList[m].showMin = Number(Number(networkTraficList[m].avg) / 1000000).toFixed(networkTraficList[m].digits) + 'Mbps'
                } else if (Number(networkTraficList[m].min) / 1000 > 1) {
                  networkTraficList[m].showMin = Number(Number(networkTraficList[m].avg) / 1000).toFixed(networkTraficList[m].digits) + 'Kbps'
                }
              }
              this.list.push(networkTraficList[m])
            }
            i = 0
            j = 0
            for (; i < networkTraficList.length; i++) {
              j = 0
              for (; j < listSummary.length; j++) {
                if ((networkTraficList[i].name === 'Incoming network traffic on eth1' ||
                  networkTraficList[i].name === 'Incoming network traffic on eth0' ||
                  networkTraficList[i].name === 'Incoming network traffic on $1' ||
                  networkTraficList[i].name === 'Incoming network traffic on $0') && networkTraficList[i].hostIp === listSummary[j].hostIp){
                  listSummary[j].incomingTrafficShowAvg = networkTraficList[i].showAvg
                  listSummary[j].incomingTrafficAvg = Number(networkTraficList[i].avg)
                  listSummary[j].trafficUnit = networkTraficList[i].unit
                }
                if ((networkTraficList[i].name === 'Outgoing network traffic on eth1' ||
                  networkTraficList[i].name === 'Outgoing network traffic on eth0' ||
                  networkTraficList[i].name === 'Outgoing network traffic on $1' ||
                  networkTraficList[i].name === 'Outgoing network traffic on $0') && networkTraficList[i].hostIp === listSummary[j].hostIp){
                  listSummary[j].outgoingTrafficShowAvg = networkTraficList[i].showAvg
                  listSummary[j].outgoingTrafficAvg = Number(networkTraficList[i].avg)
                  listSummary[j].trafficUnit = networkTraficList[i].unit
                }
                if ((networkTraficList[i].name === 'Available memory') && networkTraficList[i].hostIp === listSummary[j].hostIp){
                  listSummary[j].availableMemory = Number(networkTraficList[i].avg)
                  listSummary[j].memoryUnit = networkTraficList[i].unit
                }
                if ((networkTraficList[i].name === 'Total memory') && networkTraficList[i].hostIp === listSummary[j].hostIp){
                  listSummary[j].totalMemory = Number(networkTraficList[i].avg)
                  listSummary[j].memoryUnit = networkTraficList[i].unit
                }
              }
            }
            console.log(listSummary)
            m = 0
            for (; m < listSummary.length; m++) {
              if (listSummary[m].totalMemory && listSummary[m].availableMemory) {
                listSummary[m].memoryUseRate = Number((listSummary[m].totalMemory - listSummary[m].availableMemory) * 100 / listSummary[m].totalMemory).toFixed(2)
                listSummary[m].memoryUseRateUnit = '%'
              }
              if (listSummary[m].incomingTrafficShowAvg && listSummary[m].outgoingTrafficShowAvg) {
                if (listSummary[m].incomingTrafficShowAvg.endsWith('Kbps') || listSummary[m].outgoingTrafficShowAvg.endsWith('Kbps')) {
                  listSummary[m].traffic = Number(Number(listSummary[m].incomingTrafficAvg/1000).toFixed(2)) + Number(Number(listSummary[m].outgoingTrafficAvg/1000).toFixed(2))
                  listSummary[m].trafficUnit = 'Kbps'
                  if (Number(listSummary[m].traffic) / 1000 > 1) {
                    listSummary[m].traffic = Number(Number(listSummary[m].traffic) / 1000).toFixed(2)
                    listSummary[m].trafficUnit = 'Mbps'
                  }
                } else {
                  listSummary[m].traffic = Number(Number(listSummary[m].incomingTrafficAvg/1000000).toFixed(2)) + Number(Number(listSummary[m].outgoingTrafficAvg/1000000).toFixed(2))
                  listSummary[m].trafficUnit = 'Mbps'
                }
              } else if (listSummary[m].incomingTrafficAvg && listSummary[m].outgoingTrafficAvg) {
                listSummary[m].traffic = Number(listSummary[m].incomingTrafficAvg + listSummary[m].outgoingTrafficAvg).toFixed(2)
              }
            }
            this.listSummary = listSummary
            this.listLoading = false
          })
        })
      })
    },
    handleFilter () {
      this.getList()
    },
    handleDownload () {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['主机名', 'CPU使用率', '内存使用率', '磁盘iowait', '网络吞吐量']
        const filterVal = ['hostIp', 'cpuUseRate', 'memoryUseRate', 'ioWaitRate', 'traffic']
        const data = this.formatJson(filterVal, this.listSummary)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'result'
        })
        this.downloadLoading = false
      })
    },
    formatJson (filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => {
        if (j.endsWith('Rate') && v[j]) {
          return v[j] + v.unit
        }
        if (j === 'traffic') {
          return v[j] + v.trafficUnit
        }
        if (!v[j]) {
          return ''
        }
        return v[j]
      }))
    }
  }
}
</script>
