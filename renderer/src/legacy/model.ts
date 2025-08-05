export interface PercentileStats {
    average: number;
    mean: number;
    stddev: number;
    min: number;
    max: number;
    total: number;
    p0_001: number;
    p0_01: number;
    p0_1: number;
    p1: number;
    p2_5: number;
    p10: number;
    p25: number;
    p50: number;
    p75: number;
    p90: number;
    p97_5: number;
    p99: number;
    p99_9: number;
    p99_99: number;
    p99_999: number;
}

export interface LatencyStats {
    [requestName: string]: PercentileStats;
}

export interface ThroughputStats {
    [requestName: string]: PercentileStats;
}

export interface Result {
    latencyStats: LatencyStats;
    requestThroughputStats: ThroughputStats | PercentileStats;
    byteThroughputStats: ThroughputStats | PercentileStats;
    averagRequestThroughput: number;
    averageByteThroughput: number;
}

export interface HistoryEntry {
    timestamp: number;
    testDuration: number;
    concurrentUsers: number;
    targetThroughput: number;
    numOfWorkers: number;
    result: Result;
}

export type History = HistoryEntry[];

export interface Request {
    "requestId": number,
    "requestName": string,
    "url": string,
    "method": 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    "headers"?: Record<string, string>
}

export interface Session {
    "sessionId": number,
    "sessionName": string
    "overview": string,
    "createdBy": string,
    "createdOn": number,
    "lastModified": number,
    "servers": string[],
    "requests": Request[],
    "history": History[]
}

export interface State {
    datafile: Session[],
    configFile?: Session,
    runTabConfig: any
}

