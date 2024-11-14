<script lang="ts" setup>
import type { VbenFormProps } from '#/adapter/form';

import { ref } from 'vue';
import { useRoute } from 'vue-router';

import { Button } from 'ant-design-vue';

import { useVbenVxeGrid, type VxeGridProps } from '#/adapter/vxe-table';
import { mainApi } from '#/api';
// 获取当前路由对象
const route = useRoute();
const pageList = ref<any>([]); // 数据列表
const columnsList = ref<any>([]); // 表头

async function initPage(currentPage?: number, pageSize?: number) {
  const params: any = route.meta.menuParams;
  params.pageNum = currentPage || 1;
  params.numPerPage = pageSize || 20;
  delete params.otherProperties;
  const data = await mainApi(params);
  pageList.value = {
    items: data[0].list,
    total: Number(data[0].totalRecNum),
  };
  columnsList.value = data[1].sqlFlag.map((item: any) => {
    return {
      field: item.queryFldName,
      title: item.fldAlais,
      width: '',
      // type: item.otherProperties.textType,
      // formatter: item.type === 'date' ? 'formatDateTime' : undefined,
    };
  });
  columnsList.value.unshift({
    field: 'id',
    title: '',
    width: 50,
    type: 'checkbox',
  });

  // console.log('main data^', data);
}

await initPage();

interface RowType {
  category: string;
  color: string;
  id: string;
  price: string;
  productName: string;
  releaseDate: string;
}

interface PageQuery {
  currentPage: number;
  pageSize: number;
}
const formOptions: VbenFormProps = {
  // 默认展开
  collapsed: true,
  schema: [
    {
      component: 'Input',
      defaultValue: '1',
      fieldName: 'category',
      label: 'Category',
    },
    {
      component: 'Input',
      fieldName: 'productName',
      label: 'ProductName',
    },
    {
      component: 'Input',
      fieldName: 'price',
      label: 'Price',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          {
            label: 'Color1',
            value: '1',
          },
          {
            label: 'Color2',
            value: '2',
          },
        ],
        placeholder: '请选择',
      },
      fieldName: 'color',
      label: 'Color',
    },
    {
      component: 'DatePicker',
      fieldName: 'datePicker',
      label: 'Date',
    },
  ],
  // 控制表单是否显示折叠按钮
  showCollapseButton: true,
  // 按下回车时是否提交表单
  submitOnEnter: false,
};

const gridOptions: VxeGridProps<RowType> = {
  checkboxConfig: {
    highlight: true,
    labelField: 'name',
  },
  columns: columnsList.value || [
    { title: '序号', type: 'seq', width: 50 },
    { align: 'left', title: 'Name', type: 'checkbox', width: 100 },
    { field: 'project_name', title: '项目/产品名称' },
    { field: 'color', title: 'Color' },
    { field: 'productName', title: 'Product Name' },
    { field: 'price', title: 'Price' },
    { field: 'releaseDate', formatter: 'formatDateTime', title: 'DateTime' },
  ],
  exportConfig: {},
  height: 'auto',
  keepSource: true,
  proxyConfig: {
    ajax: {
      query: async ({ page }: { page: PageQuery }) => {
        // console.log('query', page);
        await initPage(page.currentPage, page.pageSize);
        return pageList.value;
      },
    },
  },
  toolbarConfig: {
    custom: true,
    export: true,
    // import: true,
    refresh: true,
    zoom: true,
    slots: {
      buttons: 'toolbar-buttons',
    },
    // tools: [
    //   { name: '新增', code: 'add', status: 'primary' },
    //   { name: '删除', code: 'del', status: 'error' },
    //   { name: '保存', code: 'save', status: 'success' },
    // ],
  },
};

const [Grid, gridApi] = useVbenVxeGrid({
  gridOptions,
  formOptions,
});
</script>

<template>
  <Page auto-content-height>
    <Grid table-title="" table-title-help="提示">
      <template #buttons>
        <Button class="mr-2" type="primary" @click="() => gridApi.query()">
          刷新当前页面
        </Button>
        <Button type="primary" @click="() => gridApi.reload()">
          刷新并返回第一页
        </Button>
      </template>
    </Grid>
  </Page>
</template>
