// 统一的后端 API 配置。
//
// 之前代码里后端地址散落在各处且互相矛盾：登录/注册走 localhost:3000，
// 登出/修改资料却走云端地址，benchmark 又走 localhost:3000。这会导致同一套
// 认证打到不同服务器。这里集中管理，只需改这一个常量即可切换环境。
export const API_BASE_URL = 'http://localhost:3000';

// 拼接 API 路径的小工具，避免出现重复或缺失的斜杠。
export const apiUrl = (path: string): string => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};
