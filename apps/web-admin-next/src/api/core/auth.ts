import { baseRequestClient, requestClient } from '#/api/request';

export namespace AuthApi {
  /** 登录接口参数 */
  export interface LoginParams {
    password: string;
    userID: string;
    keySvrName: string;
  }
  /** 退出登录接口参数 */
  export interface LogoutParams {
    SYSTEMKEYNAME: string;
    SYSTEMTELLERNO: string;
    isBrowserClose: string;
  }

  /** 登录接口返回值 */
  export interface LoginResult {
    accessToken: object;
  }

  export interface RefreshTokenResult {
    data: string;
    status: number;
  }
}

/**
 * 登录
 */
export async function loginApi(data: AuthApi.LoginParams) {
  return requestClient.post<AuthApi.LoginResult>('/loginEvlation', data);
}

/**
 * 刷新accessToken
 */
export async function refreshTokenApi() {
  return baseRequestClient.post<AuthApi.RefreshTokenResult>('/auth/refresh', {
    withCredentials: true,
  });
}

/**
 * 退出登录
 */
export async function logoutApi(params: any) {
  // 拼接参数
  const paramsStr = new URLSearchParams(params).toString();
  return requestClient.get<any>(`/logout?${paramsStr}`);
  // return baseRequestClient.post('/auth/logout', {
  //   withCredentials: true,
  // });
}

/**
 * 获取用户权限码
 */
export async function getAccessCodesApi() {
  // return requestClient.get<string[]>('/auth/codes');
  return [];
}
