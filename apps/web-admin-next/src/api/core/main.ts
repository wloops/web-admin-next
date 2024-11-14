// import type { RouteRecordStringComponent } from '@vben/types';

import { requestClient } from '#/api/request';

/**
 * main 通用请求
 */
export async function mainApi(data: any) {
  return requestClient.post<any>('/main', data);
}
