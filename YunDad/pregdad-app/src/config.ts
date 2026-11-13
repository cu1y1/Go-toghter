/**
 * API 基础地址配置
 *
 * - 真机/自定义调试：EXPO_PUBLIC_API_URL=http://<局域网IP>:3000
 * - iOS 模拟器默认 localhost 可直连本机服务
 * - Android 模拟器需 EXPO_PUBLIC_API_URL=http://10.0.2.2:3000（10.0.2.2=宿主机）
 * - 生产打包前必须设置 EXPO_PUBLIC_API_URL 为正式域名
 */
export const API_BASE_URL: string = (() => {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL
  if (fromEnv) return fromEnv.replace(/\/+$/, '')
  if (__DEV__) return 'http://localhost:3000'
  // 生产未配置时显式暴露问题，而不是静默打空
  console.warn('[config] EXPO_PUBLIC_API_URL 未设置，生产包接口将不可用')
  return ''
})()
