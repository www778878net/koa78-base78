import { randomUUID } from "crypto";

export default class LogEntry {
  basic: BasicInfo = new BasicInfo();
  event: EventInfo = new EventInfo();
  error: ErrorInfo = new ErrorInfo();
  http: HttpInfo = new HttpInfo();
  trace: TraceInfo = new TraceInfo();
  additionalProperties: { [key: string]: any } = {};

  constructor(init?: Partial<LogEntry>) {
    Object.assign(this, init);
  }

  public toJson(): string {
    const jsonObj = this.flattenObject(this);
    
    // 如果 basic.message 是对象,将其转换为字符串
    if (typeof this.basic.message === 'object' && this.basic.message !== null) {
      jsonObj.message = JSON.stringify(this.basic.message);
    }

    return JSON.stringify(jsonObj);
  }

  private flattenObject(obj: any): any {
    const flattened: any = {};
    Object.keys(obj).forEach(key => {
      if (key === 'additionalProperties') {
        Object.assign(flattened, obj[key]);
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        Object.assign(flattened, this.flattenObject(obj[key]));
      } else if (obj[key] !== null && obj[key] !== undefined && (obj[key] !== '' || typeof obj[key] === 'number')) {
        flattened[key.toLowerCase()] = obj[key]; // 不再转换为字符串
      }
    });
    return flattened;
  }

  addProperty(key: string, value: any): void {
    this.additionalProperties[key] = value;
  }
}

export class BasicInfo {
  summary?: string;
  logLevelNumber: number = 0;
  timestamp?: Date = new Date();
  logLevel?: string;
  message?: any;
  hostName?: string;
  serviceName?: string;
  serviceMenu?: string;
  serviceObj?: string;
  serviceFun?: string;
  userId?: string;
  userName?: string;
  logIndex?: string;
}

export class EventInfo {
  eventId: string = randomUUID();
  eventKind?: string;
  eventCategory?: string;
  eventAction?: string;
  eventOutcome?: string;
  eventDuration?: number;
  transactionId?: string;
}

export class ErrorInfo {

  errorType?: string;
  errorMessage?: string;
  errorStackTrace?: string;
}

export class HttpInfo {
  httpRequestMethod?: string;
  httpRequestBodyContent?: string;
  httpResponseStatusCode?: number;
  urlOriginal?: string;
}

export class TraceInfo {
  traceId?: string;
  spanId?: string;
}