import request from '@/utils/request'

export function fetchHistoryDataList (token, itemIds, timeFrom, timeTill) {
  const data = {
    "jsonrpc": "2.0",
    "method": "history.get",
    "params": {
      "output": "extend",
      "history": 0,
      "itemids": itemIds,
      "sortfield": "itemid",
      "sortorder": "DESC",
      "time_from":1543640400,
      "time_till":1543647600,
      "limit": 100000
    },
    "auth": token,
    "id": 6
  }
  return request({
    url: 'http://172.16.199.24/zabbix/api_jsonrpc.php',
    method: 'post',
    data
  })
}
