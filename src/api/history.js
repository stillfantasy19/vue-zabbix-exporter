import request from '@/utils/request'

export function fetchHistoryDataList (token, itemIds, timeFrom, timeTill) {
  console.log('timeFrom:' + timeFrom)
  console.log('timeTill:' + timeTill)
  const data = {
    "jsonrpc": "2.0",
    "method": "history.get",
    "params": {
      "output": "extend",
      "history": 0,
      "itemids": itemIds,
      "sortfield": "itemid",
      "sortorder": "DESC",
      "time_from":timeFrom,
      "time_till":timeTill,
      "limit": 100000
    },
    "auth": token,
    "id": 6
  }
  return request({
    url: process.env.BASE_API,
    method: 'post',
    data
  })
}
