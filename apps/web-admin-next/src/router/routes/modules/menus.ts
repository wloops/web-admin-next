// import { ref } from 'vue';

import { getMenuGroupApi, getSubMenuApi, getVirtualMenuApi } from '#/api';

function chineseToBase64(text: string): string {
  // 将中文文本编码为 UTF-8 字节
  const encoder = new TextEncoder();
  const utf8Bytes = encoder.encode(text);

  // 将字节数组转换为 Base64 编码
  let binaryString = '';
  utf8Bytes.forEach((byte) => {
    binaryString += String.fromCodePoint(byte);
  });
  const base64String = btoa(binaryString);

  return base64String;
}

// 假设这些是你的接口实现
const getMenuGroup = async (): Promise<any> => {
  // 实现获取第一层菜单的逻辑
  const data = {};
  let resp = await getMenuGroupApi(data);

  // console.log('getMenuGroupApi', resp);
  if (Array.isArray(resp) && resp.length > 0) {
    resp = resp.map((item: any) => {
      return {
        name: item.menuGrpName,
        path: `/${chineseToBase64(item.menuName)}`,
        component: 'BasicLayout',
        meta: {
          title: item.menuName,
          menuParams: { ...item },
        },
        // resId: item.resId,
        children: [],
      };
    });
  }
  // 如果resp不是数组，返回空数组
  if (!Array.isArray(resp) && resp.statusCode === 301) {
    resp = [];
  }
  return resp;
};

const getSubMenu = async (menuGrpName: string): Promise<any> => {
  // 实现获取第二层菜单的逻辑
  const data = {
    menuGrpName,
  };
  let resp = await getSubMenuApi(data);
  // console.log('getSubMenuApi', resp);
  if (resp.length > 0) {
    resp = resp.map((item: any) => {
      return {
        name: item.itemName,
        path: `/${chineseToBase64(item.itemName)}`,
        component: '/main/index',
        meta: {
          title: item.itemName,
          tblAlias: item.tblAlias,
          keepAlive: true,
          menuParams: { ...item },
        },
        resId: item.resId,
        children: [],
      };
    });
  }
  return resp;
};

const getVirtualMenu = async (tblAlias: string): Promise<any> => {
  // 实现获取第三层及以后菜单的逻辑
  const data = {
    tblAlias,
  };
  let resp = await getVirtualMenuApi(data);
  if (resp.length > 0) {
    resp = resp.map((item: any) => {
      return {
        name: item.itemName,
        path: `/${chineseToBase64(item.itemName)}`,
        component: '/main/index',
        meta: {
          title: item.itemName,
          tblAlias: item.tblAlias,
          keepAlive: true,
          menuParams: { ...item },
        },
        resId: item.resId,
        children: [],
      };
    });
  }
  return resp;
};

export function useMenu() {
  let fullMenu: any[] = [];

  const fetchMenuRecursively = async (menu: any) => {
    if (menu.resId === 990) {
      const nextLevelMenu = await getVirtualMenu(menu.meta.tblAlias);
      menu.children = nextLevelMenu;
      for (const subMenu of nextLevelMenu) {
        await fetchMenuRecursively(subMenu);
      }
    }
  };

  const getFullMenu = async () => {
    const firstLevelMenu = await getMenuGroup();
    // console.log('firstLevelMenu', firstLevelMenu);
    if (!firstLevelMenu || !Array.isArray(firstLevelMenu)) {
      return [];
    }
    fullMenu = firstLevelMenu;

    for (const menu of firstLevelMenu) {
      const secondLevelMenu = await getSubMenu(menu.name);
      menu.children = secondLevelMenu;

      for (const subMenu of secondLevelMenu) {
        await fetchMenuRecursively(subMenu);
      }
    }

    const dashboard = [
      {
        component: 'BasicLayout',
        meta: {
          order: -1,
          title: 'page.dashboard.title',
        },
        name: 'Dashboard',
        path: '/',
        redirect: '/analytics',
        children: [
          {
            name: 'Analytics',
            path: '/analytics',
            component: '/dashboard/analytics/index',
            meta: {
              affixTab: true,
              title: 'page.dashboard.analytics',
            },
          },
          {
            name: 'Workspace',
            path: '/workspace',
            component: '/dashboard/workspace/index',
            meta: {
              title: 'page.dashboard.workspace',
            },
          },
        ],
      },
    ];
    const data = [...dashboard, ...fullMenu];
    // console.log('fullMenu', fullMenu);
    return data;
  };

  return {
    getFullMenu,
  };
}
