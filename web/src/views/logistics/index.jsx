import React from 'react';
import Loadable from 'react-loadable';
import { Redirect } from 'react-router-dom';
import { loading } from 'components';

const ReceiveBrokenLog = Loadable({ loader: () => import('./brokenLog/ReceiveBrokenLog'), loading });
const BrokenLog = Loadable({ loader: () => import('./brokenLog/BrokenLog'), loading });

const route = [
  {
    path: '/logistics',
    breadcrumbName: '出入厂物流',
    render: () => <Redirect to="/logistics/receipt-config" />,
    routes: [
      {
        path: '/logistics/receipt-config',
        breadcrumbName: '收货配置',
        component: Loadable({ loader: () => import('./receiptConfig/receiptConfig'), loading }),
        routes: [
          {
            path: '/logistics/receipt-config/pick-plan/create',
            breadcrumbName: '创建分拣计划',
            component: Loadable({ loader: () => import('./receiptConfig/pickPlan'), loading }),
          },
          {
            path: '/logistics/receipt-config/pick-plan/edit/:id',
            breadcrumbName: '编辑分拣计划',
            component: Loadable({ loader: () => import('./receiptConfig/pickPlan'), loading }),
          },
          {
            path: '/logistics/receipt-config/check-item/create/:type',
            breadcrumbName: '新建收货检查方案',
            component: Loadable({ loader: () => import('./receiptConfig/CheckItem'), loading }),
          },
          {
            path: '/logistics/receipt-config/check-item/edit/:type/:id',
            breadcrumbName: '编辑收货检查方案',
            component: Loadable({ loader: () => import('./receiptConfig/CheckItem'), loading }),
          },
        ],
      },
      {
        path: '/logistics/send-config',
        breadcrumbName: '发运配置',
        component: Loadable({ loader: () => import('./sendConfig/sendConfig'), loading }),
        routes: [
          {
            path: '/logistics/send-config/check-item/create/:type',
            breadcrumbName: '新建发运检查方案',
            component: Loadable({ loader: () => import('./receiptConfig/CheckItem'), loading }),
          },
          {
            path: '/logistics/send-config/check-item/edit/:type/:id',
            breadcrumbName: '编辑发运检查方案',
            component: Loadable({ loader: () => import('./receiptConfig/CheckItem'), loading }),
          },
        ],
      },
      {
        path: '/logistics/send-task',
        breadcrumbName: '发运任务',
        component: Loadable({ loader: () => import('./sendTask/sendTaskList'), loading }),
        routes: [
          {
            path: '/logistics/send-task/create',
            breadcrumbName: '创建发运任务',
            component: Loadable({ loader: () => import('./sendTask/createSendTask'), loading }),
          },
          {
            path: '/logistics/send-task/import-list/detail/:id',
            breadcrumbName: '导入记录详情',
            component: Loadable({ loader: () => import('./sendTask/ImportDetail'), loading }),
          },
          {
            path: '/logistics/send-task/import-list',
            breadcrumbName: '导入记录',
            component: Loadable({ loader: () => import('./sendTask/ImportList'), loading }),
          },
          {
            path: '/logistics/send-task/edit/:id',
            breadcrumbName: '编辑发运任务',
            component: Loadable({ loader: () => import('./sendTask/editSendTask'), loading }),
          },
          {
            path: '/logistics/send-task/detail/:id',
            breadcrumbName: '发运详情',
            component: Loadable({ loader: () => import('./sendTask/sendTaskDetail'), loading }),
            routes: [
              {
                path: '/logistics/send-task/detail/:id/check-detail/:checkId',
                breadcrumbName: '详情',
                component: Loadable({ loader: () => import('./receiptTask/CheckListDetail'), loading }),
              },
            ],
          },
          {
            path: '/logistics/send-task/history/:type/:searchMaterialCode/:searchStorageId/:searchTaskId',
            breadcrumbName: '操作记录',
            component: Loadable({ loader: () => import('./receiptTask/receiptTaskHistory'), loading }),
          },
        ],
      },
      {
        path: '/logistics/receipt-task',
        breadcrumbName: '收货任务',
        component: Loadable({ loader: () => import('./receiptTask/receiptTaskList'), loading }),
        routes: [
          {
            path: '/logistics/receipt-task/edit/:id',
            breadcrumbName: '编辑收货任务',
            component: Loadable({ loader: () => import('./receiptTask/EditReceiptTask'), loading }),
          },
          {
            path: '/logistics/receipt-task/detail/:id',
            breadcrumbName: '收货任务详情',
            component: Loadable({ loader: () => import('./receiptTask/receiptTaskDetail'), loading }),
            routes: [
              {
                path: '/logistics/receipt-task/detail/:id/check-detail/:checkId',
                breadcrumbName: '详情',
                component: Loadable({ loader: () => import('./receiptTask/CheckListDetail'), loading }),
              },
            ],
          },
          {
            path: '/logistics/receipt-task/history/:type/:searchMaterialCode/:searchStorageId/:searchTaskId',
            breadcrumbName: '操作记录',
            component: Loadable({ loader: () => import('./receiptTask/receiptTaskHistory'), loading }),
          },
          {
            path: '/logistics/receipt-task/create',
            breadcrumbName: '创建收货任务',
            component: Loadable({ loader: () => import('./receiptTask/createReceiptTask'), loading }),
          },
        ],
      },
      {
        path: '/logistics/receipt-broken-log',
        breadcrumbName: '收货破损',
        render: props => <ReceiveBrokenLog type="receipt" {...props} />,
      },
      {
        path: '/logistics/send-broken-log',
        breadcrumbName: '发运破损',
        render: props => <BrokenLog type="send" {...props} />,
      },
      {
        path: '/logistics/receipt-datagram',
        breadcrumbName: '收货物料统计报表',
        component: Loadable({ loader: () => import('./datagram/ReceiptDatagram'), loading }),
      },
      {
        path: '/logistics/pick-statistics-datagram',
        breadcrumbName: '分拣统计报表',
        component: Loadable({ loader: () => import('./datagram/PickStatistics'), loading }),
      },
    ],
  },
];

export default route;
