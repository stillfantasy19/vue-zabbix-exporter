import request from '@/utils/request'

export function loginByUsername(username, password) {
  // const data = {
  //   username,
  //   password
  // }
  const data = {
    "id": 1,
    "jsonrpc": "2.0",
    "method": "user.login",
    "auth": null,
    "params": {
      "user":username,
      "password":password
    }
  }
  return request({
    url: 'http://172.16.199.24/zabbix/api_jsonrpc.php',
    method: 'post',
    data
  })
}

export function logout(token) {
  console.log('api/login.js logout token paramter: ' + token)
  const data = {
    "jsonrpc": "2.0",
    "method": "user.logout",
    "params": [],
    "auth": token,
    "id": 3
  }
  return request({
    url: 'http://172.16.199.24/zabbix/api_jsonrpc.php',
    method: 'post',
    data
  })
}

export function getUserInfo(token) {
  console.log('api/login.js getUserInfo token paramter: ' + token)
  const data = {
    "jsonrpc": "2.0",
    "method": "user.get",
    "params": {
      "output": "extend"
    },
    "auth": token,
    "id": 2
  }
  return request({
    url: 'http://172.16.199.24/zabbix/api_jsonrpc.php',
    method: 'post',
    data
  })
}
