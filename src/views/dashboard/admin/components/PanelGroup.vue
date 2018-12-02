<template>
  <el-row class="panel-group" :gutter="40">
    <el-col :xs="12" :sm="12" :lg="12" class="card-panel-col" v-for="(server, index) in list" :key="server.hostid">
      <div :class="cardPanelClass(index)" @click="handleClick(index)">
        <div :class="iconContainerClass(index)">
          <svg-icon icon-class="server" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">{{server.host}}</div>
          <div class="card-panel-num">{{server.interfaces[0].ip}}</div>
        </div>
      </div>
    </el-col>
  </el-row>
</template>

<script>
import CountTo from 'vue-count-to'
import { fetchList } from '@/api/hosts'
import store from '@/store'

export default {
  components: {
    CountTo
  },
  data() {
    return {
      list: null
    }
  },
  created() {
    this.fetchData()
  },
  computed: {
    cardPanelClass () {
      return function (index) {
        if (index === undefined) {
          index = 0
        }
        const checked = this.list[index].checked
        console.log('card-panel' + (checked ? ' checked' : ''))
        return 'card-panel' + (checked ? ' checked' : '')
      }
    },
    iconContainerClass () {
      return function (index) {
        if (index === undefined) {
          index = 0
        }
        index = index % 4
        return 'card-panel-icon-wrapper icon-server' + (index + 1)
      }
    }
  },
  methods: {
    fetchData () {
      fetchList(store.getters.token).then(response => {
        console.log(response.data)
        this.list = response.data.result
      })
    },
    handleClick (index) {
      console.log(this.list)
      let checked = this.list[index].checked
      if (!checked) {
        checked = false
      }
      checked = !checked
      this.list[index].checked = checked
      console.log(this.list)
    },
    handleSetLineChartData (type) {
      this.$emit('handleSetLineChartData', type)
    }
  },
  // 监听list数据变化
  watch: {
    list: {
      deep: true, // 深度监听
      handler: function (newVal, oldVal) {
        console.log(newVal)
      }
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.panel-group {
  margin-top: 18px;
  .card-panel-col{
    margin-bottom: 32px;
  }
  .card-panel {
    height: 108px;
    cursor: pointer;
    font-size: 12px;
    position: relative;
    overflow: hidden;
    color: #666;
    background: #fff;
    box-shadow: 4px 4px 40px rgba(0, 0, 0, .05);
    border-color: rgba(0, 0, 0, .05);
    .checked {
      .card-panel-icon-wrapper {
        color: #fff;
      }
      .icon-server1 {
         background: #40c9c6;
      }
      .icon-server2 {
        background: #36a3f7;
      }
      .icon-server3 {
        background: #f4516c;
      }
      .icon-server4 {
        background: #34bfa3
      }
    }
    .icon-server1 {
      color: #40c9c6;
    }
    .icon-server2 {
      color: #36a3f7;
    }
    .icon-server3 {
      color: #f4516c;
    }
    .icon-server4 {
      color: #34bfa3
    }
    .card-panel-icon-wrapper {
      float: left;
      margin: 14px 0 0 14px;
      padding: 16px;
      transition: all 0.38s ease-out;
      border-radius: 6px;
    }
    .card-panel-icon {
      float: left;
      font-size: 48px;
    }
    .card-panel-description {
      float: right;
      font-weight: bold;
      margin: 26px;
      margin-left: 0px;
      .card-panel-text {
        line-height: 18px;
        color: rgba(0, 0, 0, 0.45);
        font-size: 16px;
        margin-bottom: 12px;
      }
      .card-panel-num {
        font-size: 20px;
      }
    }
  }
}
</style>
