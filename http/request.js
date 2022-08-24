let timer;
// 此vm参数为页面的实例，可以通过它引用vuex中的变量
module.exports = () => {
  // 初始化请求配置
  uni.$u.http.setConfig((config) => {
    /* config 为默认全局配置*/
    config.baseURL = 'https://www.flyfang.cn/api'; /* 根域名 */
    return config
  })
  // 请求拦截
  uni.$u.http.interceptors.request.use((config) => { // 可使用async await 做异步操作
    // 初始化请求拦截器时，会执行此方法，此时data为undefined，赋予默认{}
    config.data = config.data || {}
    // 根据custom参数中配置的是否需要token，添加对应的请求头
    return config
  }, config => { // 可使用async await 做异步操作
    return Promise.reject(config)
  })
  // 响应拦截
  uni.$u.http.interceptors.response.use((response) => {
    const data = response.data
    return data
  }, (response) => {
    if (response.statusCode == 403) {
      uni.$u.toast('暂无权限访问')
      return
    }
    if (response.statusCode == 500) {
      uni.$u.toast('服务器开小差了')
      console.log("错误代码：500=>", response.data)
      return Promise.reject(response)
    }
    if (response.statusCode == 400) {
      console.log("错误代码：400=>", response.data.message)
      uni.$u.toast(response.data.message)
      return Promise.reject(response)
    }
  })
}
