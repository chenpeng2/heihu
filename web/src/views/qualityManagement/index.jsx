import React from 'react';
import { Redirect } from 'react-router-dom';
import Loadable from 'react-loadable';
import { loading } from 'components';
import { QCPLAN_BASE_URL } from './navigation';

const router = [
  {
    path: '/qualityManagement',
    breadcrumbName: '质量管理',
    render: () => <Redirect to="/qualityManagement/qcTask/list" />,
    routes: [
      {
        path: QCPLAN_BASE_URL,
        breadcrumbName: '质检计划',
        component: Loadable({ loader: () => import('./qcPlan/list'), loading }),
        routes: [
          {
            path: `${QCPLAN_BASE_URL}/create`,
            breadcrumbName: '创建质检计划',
            component: Loadable({ loader: () => import('./qcPlan/create'), loading }),
          },
          {
            path: `${QCPLAN_BASE_URL}/edit/:code`,
            breadcrumbName: '编辑质检计划',
            component: Loadable({ loader: () => import('./qcPlan/edit'), loading }),
          },
        ],
      },
      {
        path: '/qualityManagement/qcTask',
        breadcrumbName: '质检任务',
        component: Loadable({ loader: () => import('./qcTask'), loading }),
        routes: [
          {
            path: '/qualityManagement/qcTask/create',
            breadcrumbName: '创建质检任务',
            component: Loadable({ loader: () => import('./qcTask/create/createQcTask'), loading }),
          },
          {
            path: '/qualityManagement/qcTask/detail/:id',
            breadcrumbName: '详情',
            component: Loadable({ loader: () => import('./qcTask/detail/qcTaskDetail'), loading }),
            routes: [
              {
                path: '/qualityManagement/qcTask/detail/:id/operationLog',
                breadcrumbName: '操作记录',
                component: Loadable({ loader: () => import('./qcTask/records/operationLog'), loading }),
              },
            ],
          },
        ],
      },
      {
        path: '/qualityManagement/qcReportAudit',
        breadcrumbName: '质检报告审核',
        component: Loadable({ loader: () => import('./qcReportAudit/list'), loading }),
        routes: [
          {
            path: '/qualityManagement/qcReportAudit/detail/:id',
            breadcrumbName: '质检任务详情',
            component: Loadable({ loader: () => import('./qcTask/detail/qcTaskDetail'), loading }),
          },
        ],
      },
      {
        path: '/qualityManagement/createRepeatQcAudit',
        breadcrumbName: '复检创建审核',
        component: Loadable({ loader: () => import('./createRepeatQcAudit/list'), loading }),
        routes: [
          {
            path: '/qualityManagement/createRepeatQcAudit/detail/:id',
            breadcrumbName: '质检任务详情',
            component: Loadable({ loader: () => import('./qcTask/detail/qcTaskDetail'), loading }),
          },
        ],
      },
      {
        path: '/qualityManagement/produce-project-quality-chart',
        breadcrumbName: '项目质量报表',
        component: Loadable({ loader: () => import('./qualityReportForm/projectQualityForm'), loading }),
      },
      {
        path: '/qualityManagement/produce-qc-task-chart',
        breadcrumbName: '质检任务报表',
        component: Loadable({ loader: () => import('./qualityReportForm/produceQcReportForm'), loading }),
      },
      {
        path: '/qualityManagement/inbound-qc-task-chart',
        breadcrumbName: '质检任务报表',
        component: Loadable({ loader: () => import('./inboundChart/QcTaskChart'), loading }),
      },
      {
        path: '/qualityManagement/inbound-fraction-chart',
        breadcrumbName: '来料不良报表',
        component: Loadable({ loader: () => import('./inboundChart/FractionChart'), loading }),
      },
    ],
  },
];

export default router;
