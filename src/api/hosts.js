import request from '@/utils/request'

export function fetchHostGroupList (token) {
  const data = {
    'jsonrpc': '2.0',
    'method': 'hostgroup.get',
    'params': {
      'output': 'extend',
      'filter': {
        'name': [
          'Zabbix servers',
          'Linux servers'
        ]
      }
    },
    'auth': token,
    'id': 4
  }
  return request({
    url: 'http://172.16.199.24/zabbix/api_jsonrpc.php',
    method: 'post',
    data
  })
}

export function fetchHostList (token, groupId) {
  const data = {
    'groupids': groupId,
    'jsonrpc': '2.0',
    'method': 'host.get',
    'params': {
      'output': [
        'hostid',
        'host'
      ],
      'selectInterfaces': [
        'interfaceid',
        'ip'
      ]
    },
    'auth': token,
    'id': 5
  }
  return request({
    url: 'http://172.16.199.24/zabbix/api_jsonrpc.php',
    method: 'post',
    data
  })
}
