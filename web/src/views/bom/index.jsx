import React from 'react';
import Loadable from 'react-loadable';
import { Redirect } from 'react-router-dom';
import { loading } from 'components';

const router = [
  {
    path: '/bom',
    breadcrumbName: '基础数据',
    render: () => <Redirect to="/bom/materials/list" />,
    routes: [
      {
        path: '/bom/materialTypes',
        breadcrumbName: '物料类型',
        component: Loadable({ loader: () => import('./materialType/list'), loading }),
        routes: [
          {
            path: '/bom/materialTypes/create',
            breadcrumbName: '创建',
            component: Loadable({ loader: () => import('./materialType/create'), loading }),
          },
          {
            path: '/bom/materialTypes/:id/edit',
            breadcrumbName: '编辑',
            component: Loadable({ loader: () => import('./materialType/edit'), loading }),
          },
          {
            path: '/bom/materialTypes/:id/detail',
            breadcrumbName: '详情',
            component: Loadable({ loader: () => import('./materialType/detail'), loading }),
          },
        ],
      },
      {
        path: '/bom/materials',
        breadcrumbName: '物料列表',
        component: Loadable({ loader: () => import('./materials/list/list'), loading }),
        routes: [
          {
            path: '/bom/materials/logs/import',
            breadcrumbName: '导入日志',
            component: Loadable({ loader: () => import('./materials/history/materialImportHistory'), loading }),
            routes: [
              {
                path: '/bom/materials/logs/import/:importId',
                breadcrumbName: '日志详情',
                component: Loadable({ loader: () => import('./materials/history/materialImportDetail'), loading }),
              },
            ],
          },
          {
            path: '/bom/materials/create',
            breadcrumbName: '创建物料',
            component: Loadable({ loader: () => import('./materials/create'), loading }),
          },
          {
            path: '/bom/materials/:materialCode/copy',
            breadcrumbName: '复制物料',
            component: Loadable({ loader: () => import('./materials/copy/copyMaterial'), loading }),
          },
          {
            path: '/bom/materials/:materialCode/edit',
            breadcrumbName: '编辑物料',
            component: Loadable({ loader: () => import('./materials/edit/editMaterial'), loading }),
          },
          {
            path: '/bom/materials/:materialCode/detail',
            breadcrumbName: '物料详情',
            component: Loadable({ loader: () => import('./materials/detail/detail'), loading }),
            routes: [
              {
                path: '/bom/materials/:materialCode/detail/operationHistory',
                breadcrumbName: '操作记录',
                component: Loadable({ loader: () => import('./materials/history/materialOperationHistory'), loading }),
              },
            ],
          },
        ],
      },
      {
        path: '/bom/eBom',
        breadcrumbName: '物料清单',
        component: Loadable({ loader: () => import('./eBom/list/eBomList'), loading }),
        routes: [
          {
            path: '/bom/eBom/editebom/:id',
            breadcrumbName: '编辑物料清单',
            component: Loadable({ loader: () => import('./eBom/editEBom'), loading }),
          },
          {
            path: '/bom/eBom/loglist',
            breadcrumbName: '查看导入日志',
            component: Loadable({ loader: () => import('./eBom/log/LogList'), loading }),
            routes: [
              {
                path: '/bom/eBom/loglist/logdetail/:id',
                breadcrumbName: '导入日志详情',
                component: Loadable({ loader: () => import('./eBom/log/logDetail'), loading }),
              },
            ],
          },
          {
            path: '/bom/eBom/createebom',
            breadcrumbName: '创建物料清单',
            component: Loadable({ loader: () => import('./eBom/createEBom'), loading }),
          },
          {
            path: '/bom/eBom/ebomdetail/:id',
            breadcrumbName: '物料清单详情',
            component: Loadable({ loader: () => import('./eBom/eBomDetail'), loading }),
            routes: [
              {
                path: '/bom/eBom/ebomdetail/:id/editebom',
                breadcrumbName: '编辑物料清单',
                component: Loadable({ loader: () => import('./eBom/editEBom'), loading }),
              },
              {
                path: '/bom/eBom/ebomdetail/:id/operationlog/:restid',
                breadcrumbName: '操作记录',
                component: Loadable({ loader: () => import('./eBom/operationLog'), loading }),
              },
            ],
          },
        ],
      },
      {
        path: '/bom/mbom',
        breadcrumbName: '生产BOM',
        component: Loadable({ loader: () => import('./mBom/list/mBomList'), loading }),
        routes: [
          {
            path: '/bom/mbom/create',
            breadcrumbName: '创建生产BOM',
            component: Loadable({ loader: () => import('src/containers/mBom/create/createMBom'), loading }),
          },
          {
            path: '/bom/mbom/:mBomId/edit',
            breadcrumbName: '编辑生产BOM',
            component: Loadable({ loader: () => import('src/containers/mBom/edit/editMBom'), loading }),
          },
          {
            path: '/bom/mbom/:mBomId/copy',
            breadcrumbName: '复制生产BOM',
            component: Loadable({ loader: () => import('src/containers/mBom/create/createMBom'), loading }),
          },
          {
            path: '/bom/mbom/logs/import',
            breadcrumbName: '查看导入日志',
            component: Loadable({ loader: () => import('src/containers/mBom/logs/importLog'), loading }),
            routes: [
              {
                path: '/bom/mbom/logs/import/:id',
                breadcrumbName: '导入日志详情',
                component: Loadable({ loader: () => import('src/containers/mBom/logs/importLogDetail'), loading }),
              },
            ],
          },
          {
            path: '/bom/mbom/:mBomId/detail',
            breadcrumbName: '生产BOM详情',
            component: Loadable({ loader: () => import('src/containers/mBom/detail/mBomDetail'), loading }),
            routes: [
              {
                path: '/bom/mbom/:mBomId/operationHistory',
                breadcrumbName: '操作记录',
                component: Loadable({ loader: () => import('./mBom/operationHistory/mBomOperationHistory'), loading }),
              },
            ],
          },
        ],
      },
      {
        path: '/bom/processRoute',
        breadcrumbName: '工艺路线',
        component: Loadable({ loader: () => import('./processRouting/list'), loading }),
        routes: [
          {
            path: '/bom/processRoute/:id/detail',
            breadcrumbName: '工艺路线详情',
            component: Loadable({ loader: () => import('./processRouting/detail'), loading }),
            routes: [
              {
                path: '/bom/processRoute/:id/detail/operationHistory',
                breadcrumbName: '操作记录',
                component: Loadable({ loader: () => import('./processRouting/operationHistory'), loading }),
              },
            ],
          },
          {
            path: '/bom/processRoute/:id/edit',
            breadcrumbName: '编辑工艺路线',
            component: Loadable({ loader: () => import('./processRouting/edit'), loading }),
          },
          {
            path: '/bom/processRoute/create',
            breadcrumbName: '创建工艺路线',
            component: Loadable({ loader: () => import('./processRouting/create'), loading }),
          },
          {
            path: '/bom/processRoute/:id/copy',
            breadcrumbName: '复制工艺路线',
            component: Loadable({ loader: () => import('./processRouting/copy'), loading }),
          },
          {
            path: '/bom/processRoute/importHistory',
            breadcrumbName: '导入日志',
            component: Loadable({ loader: () => import('./processRouting/importHistory/importLogList'), loading }),
            routes: [
              {
                path: '/bom/processRoute/importHistory/:id/importDetail',
                breadcrumbName: '日志详情',
                component: Loadable({ loader: () => import('./processRouting/importHistory/importDetail'), loading }),
              },
            ],
          },
        ],
      },
      {
        path: '/bom/newProcess',
        breadcrumbName: '工序',
        component: Loadable({ loader: () => import('./newProcess/list'), loading }),
        routes: [
          {
            path: '/bom/newProcess/logs/import',
            breadcrumbName: '导入日志',
            component: Loadable({ loader: () => import('./newProcess/log/list'), loading }),
            routes: [
              {
                path: '/bom/newProcess/logs/import/:importId',
                breadcrumbName: '日志详情',
                component: Loadable({ loader: () => import('./newProcess/log/detail'), loading }),
              },
            ],
          },
          {
            path: '/bom/newProcess/:id/detail',
            breadcrumbName: '工序详情',
            component: Loadable({ loader: () => import('./newProcess/detail'), loading }),
            routes: [
              {
                path: '/bom/newProcess/:id/detail/operationHistory',
                breadcrumbName: '操作记录',
                component: Loadable({ loader: () => import('./newProcess/operationHistory'), loading }),
              },
            ],
          },
          {
            path: '/bom/newProcess/:id/edit',
            breadcrumbName: '编辑工序',
            component: Loadable({ loader: () => import('./newProcess/edit'), loading }),
          },
          {
            path: '/bom/newProcess/create',
            breadcrumbName: '创建工序',
            component: Loadable({ loader: () => import('./newProcess/create'), loading }),
          },
        ],
      },
    ],
  },
];

export default router;
