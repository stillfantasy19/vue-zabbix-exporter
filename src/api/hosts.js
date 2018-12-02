import request from '@/utils/request'

export function fetchHostGroupList (token) {
  const data = {
    'jsonrpc': '2.0',
    'method': 'hostgroup.get',
    'params': {
      'output': 'extend'
    },
    'auth': token,
    'id': 4
  }
  return request({
    url: process.env.BASE_API,
    method: 'post',
    data
  })
}

export function fetchHostList (token, groupId) {
  const data = {
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
  if (groupId) {
    data.params.groupids = [groupId]
  }
  return request({
    url: process.env.BASE_API,
    method: 'post',
    data
  })
}
