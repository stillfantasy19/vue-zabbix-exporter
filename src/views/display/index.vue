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
          <span>{{scope.row.min}}%</span>
        </template>
      </el-table-column>
      <el-table-column width="110px" align="center" label="Avg">
        <template slot-scope="scope">
          <span>{{scope.row.avg}}%</span>
        </template>
      </el-table-column>
      <el-table-column width="110px" align="center" label="Max">
        <template slot-scope="scope">
          <span>{{scope.row.max}}%</span>
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
        <span>{{scope.row.cpuUseRate}}%</span>
        </template>
      </el-table-column>
      <el-table-column width="110px" align="center" label="内存使用率">
        <template slot-scope="scope">
          <span>{{scope.row.memoryUseRate}}%</span>
        </template>
      </el-table-column>
      <el-table-column width="110px" align="center" label="磁盘iowait">
        <template slot-scope="scope">
          <span>{{scope.row.ioWaitRate}}%</span>
        </template>
      </el-table-column>
      <el-table-column width="110px" align="center" label="网络吞吐量">
        <template slot-scope="scope">
          <span>{{scope.row.netPv}}</span>
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
        console.log(graphList)
        for (; i < graphList.length; i++) {
          if (graphList[i].name === 'CPU utilization') {
            j = 0
            for (; j < graphList[i].items.length; j++) {
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
                graphList[i].items[j].total = 0
                graphList[i].items[j].totalCount = 0
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
        }
        if (cpuUtilizationItems.length <= 0) {
          this.listLoading = false
          return
        }
        fetchHistoryDataList(store.getters.token, cpuUtilizationItems, new Date(this.listQuery.startTime).getTime() / 1000, new Date(this.listQuery.endTime).getTime() / 1000).then(response => {
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
            }
          }
          this.listSummary = listSummary
          this.listLoading = false
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
        const filterVal = ['hostIp', 'cpuUseRate', 'memoryUseRate', 'ioWaitRate', 'netPv']
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
          return v[j] + '%'
        }
        return v[j]
      }))
    }
  }
}
</script>
