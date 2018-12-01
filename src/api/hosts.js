import request from '@/utils/request'

export function fetchList(token) {
  const data = {
    "jsonrpc": "2.0",
    "method": "host.get",
    "params": {
      "output": [
        "hostid",
        "host"
      ],
      "selectInterfaces": [
        "interfaceid",
        "ip"
      ]
    },
    "auth": token,
    "id": 4
  }
  return request({
    url: 'http://172.16.199.24/zabbix/api_jsonrpc.php',
    method: 'post',
    data
  })
}
