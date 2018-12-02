import request from '@/utils/request'

export function fetchGraphList (token, hostIds) {
  const data = {
    'jsonrpc': '2.0',
    'method': 'graph.get',
    'params': {
      'output': 'extend',
      'hostids': hostIds,
      'expandName': true,
      'sortfield': 'name',
      'selectItems': [
        'name',
        'description',
        'hostid'
      ]
    },
    'auth': token,
    'id': 6
  }
  return request({
    url: 'http://172.16.199.24/zabbix/api_jsonrpc.php',
    method: 'post',
    data
  })
}
