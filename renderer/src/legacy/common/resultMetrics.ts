// Benchmark 指标 -> MUI Chip 颜色的统一映射。
// HistoryTab（单 session）与 History 页面（全局）共用，避免阈值逻辑重复、口径不一致。

export type MetricColor = 'success' | 'primary' | 'warning' | 'error' | 'default';

const SUCCESS_RATIO_THRESHOLDS = {
  EXCELLENT: 98, // >= 98%: green
  GOOD: 95, // >= 95%: blue
  WARNING: 80 // >= 80%: yellow, < 80%: red
};

const P50_LATENCY_THRESHOLDS = {
  EXCELLENT: 100, // <= 100ms: green
  GOOD: 200, // <= 200ms: blue
  WARNING: 500 // <= 500ms: yellow, > 500ms: red
};

const P95_LATENCY_THRESHOLDS = {
  EXCELLENT: 500, // <= 500ms: green
  GOOD: 1000, // <= 1000ms: blue
  WARNING: 2000 // <= 2000ms: yellow, > 2000ms: red
};

export const getSuccessRatioColor = (value: number): MetricColor => {
  if (value < 0) return 'default';
  if (value >= SUCCESS_RATIO_THRESHOLDS.EXCELLENT) return 'success';
  if (value >= SUCCESS_RATIO_THRESHOLDS.GOOD) return 'primary';
  if (value >= SUCCESS_RATIO_THRESHOLDS.WARNING) return 'warning';
  return 'error';
};

export const getP50LatencyColor = (value: number): MetricColor => {
  if (value < 0) return 'default';
  if (value <= P50_LATENCY_THRESHOLDS.EXCELLENT) return 'success';
  if (value <= P50_LATENCY_THRESHOLDS.GOOD) return 'primary';
  if (value <= P50_LATENCY_THRESHOLDS.WARNING) return 'warning';
  return 'error';
};

export const getP95LatencyColor = (value: number): MetricColor => {
  if (value < 0) return 'default';
  if (value <= P95_LATENCY_THRESHOLDS.EXCELLENT) return 'success';
  if (value <= P95_LATENCY_THRESHOLDS.GOOD) return 'primary';
  if (value <= P95_LATENCY_THRESHOLDS.WARNING) return 'warning';
  return 'error';
};
