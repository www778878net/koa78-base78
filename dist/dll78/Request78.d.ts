export default class Request78 {
    constructor();
    doreq_multipart(url: any, data?: string, headers?: string, method?: string, code?: string): Promise<unknown>;
    /**
   * 强自定义
   * @param url
   * @param code
   */
    doreq(url: any, data?: {}, headers?: string, method?: string, code?: string): Promise<unknown>;
    /**
   * 直接用httpreq也行 简化GET方法这样也行
   * @param url
   * @param code
   * @returns {Promise<string>}
   */
    get(url: any, code?: string): Promise<unknown>;
    /**
  * 简易调用方法
  * @param url
  * @param data
  * @param method
  * @param code
  * @returns {Promise<string>}
  */
    httpreq(url: any, data?: string, method?: string, code?: string): Promise<unknown>;
}
