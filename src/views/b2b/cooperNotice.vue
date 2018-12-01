<template>
  <notice-detail :is-edit='false'></notice-detail>
</template>

<script>
import NoticeDetail from './components/NoticeDetail'

export default {
  name: 'createForm',
  components: { NoticeDetail }
}
</script>
