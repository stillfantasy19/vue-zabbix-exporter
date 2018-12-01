<template>
  <el-table :data="list" style="width: 100%;padding-top: 15px;">
    <el-table-column label="Host ID" min-width="100">
      <template slot-scope="scope">
        {{scope.row.hostid}}
      </template>
    </el-table-column>
    <el-table-column label="Host Name" min-width="100">
      <template slot-scope="scope">
        {{scope.row.host}}
      </template>
    </el-table-column>
    <el-table-column label="Host IP" min-width="100" align="center">
      <template slot-scope="scope">
        {{scope.row.interfaces[0].ip}}
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import { fetchList } from '@/api/hosts'
import store from '@/store'

export default {
  data() {
    return {
      list: null
    }
  },
  filters: {
    statusFilter(status) {
      const statusMap = {
        success: 'success',
        pending: 'danger'
      }
      return statusMap[status]
    },
    orderNoFilter(str) {
      return str.substring(0, 30)
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      fetchList(store.getters.token).then(response => {
        console.log(response.data);
        this.list = response.data.result
      })
    }
  }
}
</script>
