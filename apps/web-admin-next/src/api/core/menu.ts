import { requestClient } from '#/api/request';

/**
 * 获取用户所有菜单
 */
// export async function getAllMenusApi() {
//   return requestClient.get<RouteRecordStringComponent[]>('/menu/all');
// }
export async function getMenuGroupApi(data: any) {
  return requestClient.post<any>('/getMenuGrp', data);
}
export async function getSubMenuApi(data: any) {
  return requestClient.post<any>('/genSubMenu', data);
}
export async function getVirtualMenuApi(data: any) {
  return requestClient.post<any>('/genVirtualMenu', data);
}
