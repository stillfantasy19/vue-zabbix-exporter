<template>
  <notice-detail :is-edit='true'></notice-detail>
</template>

<script>
import NoticeDetail from './components/NoticeDetail'

export default {
  name: 'editForm',
  components: { NoticeDetail }
}
</script>
