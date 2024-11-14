// import type { Recordable, UserInfo } from '@vben/types'
import type { UserInfo } from '@vben/types';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { DEFAULT_HOME_PATH, LOGIN_PATH } from '@vben/constants';
import { resetAllStores, useAccessStore, useUserStore } from '@vben/stores';

import { notification } from 'ant-design-vue';
import { defineStore } from 'pinia';

// import { getAccessCodesApi, getUserInfoApi, loginApi, logoutApi } from '#/api';
import { type AuthApi, getUserInfoApi, loginApi, logoutApi } from '#/api';
import { $t } from '#/locales';

export const useAuthStore = defineStore('auth', () => {
  const accessStore = useAccessStore();
  const userStore = useUserStore();
  const router = useRouter();

  const loginLoading = ref(false);

  /**
   * 异步处理登录操作
   * Asynchronously handle the login process
   * @param params 登录表单数据
   */
  async function authLogin(
    params: any,
    onSuccess?: () => Promise<void> | void,
  ) {
    // 异步处理用户登录操作并获取 accessToken
    let userInfo: null | UserInfo = null;
    try {
      loginLoading.value = true;
      // const { accessToken } = await loginApi(params);
      const loginUserInfo: any = await loginApi(params);
      const accessToken =
        loginUserInfo.accessToken ||
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MCwicGFzc3dvcmQiOiIxMjM0NTYiLCJyZWFsTmFtZSI6IlZiZW4iLCJyb2xlcyI6WyJzdXBlciJdLCJ1c2VybmFtZSI6InZiZW4iLCJpYXQiOjE3MjgzMTQxOTEsImV4cCI6MTcyODkxODk5MX0.6V5RfWNjIyFOuvsAP2ezeC8WMc3abM_gLHaZvFXXsOE';
      // console.log('loginUserInfo', loginUserInfo);
      // 如果成功获取到 loginUserInfo
      if (loginUserInfo) {
        sessionStorage.setItem('loginUserInfo', JSON.stringify(loginUserInfo));
        accessStore.setAccessToken(accessToken);

        // 获取用户信息并存储到 accessStore 中
        // const [fetchUserInfoResult, accessCodes] = await Promise.all([
        //   fetchUserInfo(),
        //   getAccessCodesApi(),
        // ]);

        // userInfo = fetchUserInfoResult;
        const userAny: any = {
          id: 0,
          realName: loginUserInfo.name,
          roles: ['super'],
          username: loginUserInfo.tellerno,
        };
        userInfo = userAny;
        userStore.setUserInfo(userInfo);
        // accessStore.setAccessCodes(accessCodes);

        if (accessStore.loginExpired) {
          accessStore.setLoginExpired(false);
        } else {
          onSuccess
            ? await onSuccess?.()
            : // : await router.push(userInfo.homePath || DEFAULT_HOME_PATH);
              await router.push(DEFAULT_HOME_PATH);
        }

        if (userInfo?.realName) {
          notification.success({
            description: `${$t('authentication.loginSuccessDesc')}:${loginUserInfo?.name}`,
            duration: 3,
            message: $t('authentication.loginSuccess'),
          });
        }
      }
    } finally {
      loginLoading.value = false;
    }

    return {
      userInfo,
    };
  }

  async function logout(redirect: boolean = true) {
    try {
      let logoutData: AuthApi.LogoutParams = {
        SYSTEMKEYNAME: '',
        SYSTEMTELLERNO: '',
        isBrowserClose: '0',
      };
      let loginUserInfo: any = sessionStorage.getItem('loginUserInfo');
      if (loginUserInfo) {
        loginUserInfo = JSON.parse(loginUserInfo);
        logoutData = {
          SYSTEMKEYNAME: loginUserInfo.SYSTEMKEYNAME,
          SYSTEMTELLERNO: loginUserInfo.SYSTEMTELLERNO,
          isBrowserClose: '1',
        };
      } else {
        loginUserInfo = null; // 或者设置一个默认值
      }
      await logoutApi(logoutData);
    } catch {
      // 不做任何处理
    }
    resetAllStores();
    accessStore.setLoginExpired(false);

    // 回登录页带上当前路由地址
    await router.replace({
      path: LOGIN_PATH,
      query: redirect
        ? {
            redirect: encodeURIComponent(router.currentRoute.value.fullPath),
          }
        : {},
    });
  }

  async function fetchUserInfo() {
    let userInfo: null | UserInfo = null;
    userInfo = await getUserInfoApi();
    userStore.setUserInfo(userInfo);
    return userInfo;
  }

  function $reset() {
    loginLoading.value = false;
  }

  return {
    $reset,
    authLogin,
    fetchUserInfo,
    loginLoading,
    logout,
  };
});
