<template>
  <div class="app-container">
    <div class="filter-container">
      <el-select clearable @change='handleHostsOptions' style="width: 200px" class="filter-item" v-model="listQuery.hostgroupid" placeholder="服务器分组">
        <el-option v-for="item in hostGroupOptions" :key="item.groupid" :label="item.name" :value="item.groupid">
        </el-option>
      </el-select>
      <el-select clearable class="filter-item" style="width: 300px" v-model="listQuery.hostids" multiple placeholder="服务器">
        <el-option v-for="item in  hostsOptions" :key="item.hostid" :label="item.host" :value="item.hostid">
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
      style="width: 100%;min-height:1000px;">
      <el-table-column min-width="100px" label="Host Name">
        <template slot-scope="scope">
          <span>{{scope.row.hostName}}({{scope.row.hostIp}})</span>
        </template>
      </el-table-column>
      <el-table-column min-width="150px" label="Items">
        <template slot-scope="scope">
          <span>{{scope.row.name}}({{scope.row.description}})</span>
        </template>
      </el-table-column>
      <el-table-column width="110px" align="center" label="Min">
        <template slot-scope="scope">
          <span>{{scope.row.min}}</span>
        </template>
      </el-table-column>
      <el-table-column width="110px" align="center" label="Avg">
        <template slot-scope="scope">
          <span>{{scope.row.avg}}</span>
        </template>
      </el-table-column>
      <el-table-column width="110px" align="center" label="Max">
        <template slot-scope="scope">
          <span>{{scope.row.max}}</span>
        </template>
      </el-table-column>
      <!--<el-table-column width="110px" align="center" label="CPU使用率">-->
        <!--<template slot-scope="scope">-->
          <!--<span>{{100 - scope.row.avg}}</span>-->
        <!--</template>-->
      <!--</el-table-column>-->
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
      total: null,
      listLoading: false,
      listQuery: {
        page: 1,
        limit: 20,
        hostgroupid: undefined,
        hostids: [],
        title: undefined,
        type: undefined,
        startTime: undefined,
        endTime: undefined
      },
      hostGroupOptions: [],
      hostsOptions: [],
      statusOptions: ['published', 'draft', 'deleted'],
      temp: {
        id: undefined,
        hostgroupid: undefined,
        remark: '',
        timestamp: new Date(),
        title: '',
        type: '',
        status: 'published'
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      rules: {
        type: [{ required: true, message: 'type is required', trigger: 'change' }],
        timestamp: [{ type: 'date', required: true, message: 'timestamp is required', trigger: 'change' }],
        title: [{ required: true, message: 'title is required', trigger: 'blur' }]
      },
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
    statusFilter (status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return statusMap[status]
    }
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
        console.log(cpuUtilizationList)
        fetchHistoryDataList(store.getters.token, cpuUtilizationItems).then(response => {
          i = 0
          j = 0
          let historyDataList = response.data.result
          for (; i < cpuUtilizationList.length; i++) {
            j = 0
            for (; j < historyDataList.length; j++) {
              if (historyDataList[j].itemid === cpuUtilizationList[i].itemid) {
                cpuUtilizationList[i].totalCount = Number(cpuUtilizationList[i].totalCount ? 0 : cpuUtilizationList[i].totalCount) + 1
                cpuUtilizationList[i].total = Number(cpuUtilizationList[i].total ? 0 : Number(cpuUtilizationList[i].total)) + Number(historyDataList[j].value)
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
            // cpuUtilizationList[i].totalCount = 10
            // cpuUtilizationList[i].total = 100
            cpuUtilizationList[i].avg = Number(Number(cpuUtilizationList[i].total) / Number(cpuUtilizationList[i].totalCount)).toFixed(2)
            cpuUtilizationList[i].max = Number(cpuUtilizationList[i].max).toFixed(2)
            cpuUtilizationList[i].min = Number(cpuUtilizationList[i].min).toFixed(2)
          }
          console.log(cpuUtilizationList)
          this.listLoading = false
          this.list = cpuUtilizationList
        })
      })
    },
    handleFilter() {
      this.getList()
    },
    handleModifyStatus(row, status) {
      this.$message({
        message: '操作成功',
        type: 'success'
      })
      row.status = status
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        importance: 1,
        remark: '',
        timestamp: new Date(),
        title: '',
        status: 'published',
        type: ''
      }
    }
  }
}
</script>
