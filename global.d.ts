import { ElectronAPI } from '@electron-toolkit/preload';
import type { Request, Result } from './renderer/src/legacy/model';

declare global {
  // 传给 loadtester 的运行配置：RunTab 的各项配置 + 本次会话要压测的请求列表。
  // 不直接 intersect RunTabConfig，因为它的索引签名只允许 string|number|undefined，
  // 会与 requests: Request[] 冲突。这里用兼容的索引签名单独描述。
  interface LoadTestConfig {
    serverUrl?: string;
    mode?: 'concurrency' | 'rate';
    testDuration?: number;
    concurrencyNumber?: number;
    totalRequests?: number;
    requestsPerSecond?: number;
    requests: Request[];
    [key: string]: string | number | Request[] | undefined;
  }

  // 主进程通过 contextBridge 暴露给渲染进程的 API 形状，preload 与渲染进程共享。
  interface KaskadeApi {
    // 读取本地 datafile.json；仅在已登录时由渲染进程调用。
    readDataFile: () => Promise<string>;
    // 写回本地 datafile.json；仅在已登录时由渲染进程调用。
    writeDataFile: (data: string) => void;
    // 运行一次压测并返回结果。
    runLoadTest: (config: LoadTestConfig) => Promise<Result>;
  }

  interface Window {
    electron: ElectronAPI;
    api: KaskadeApi;
  }
}
