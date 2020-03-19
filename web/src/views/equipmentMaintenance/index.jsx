import React from 'react';
import Loadable from 'react-loadable';
import { Redirect } from 'react-router-dom';
import { loading } from 'components';

import TaskReport from 'containers/task/base/taskReport';

const DeviceDetailLoadable = Loadable({ loader: () => import('./device/deviceDetail'), loading });

const deviceModuleRoute = path => ({
  path: `${path}/detail/module/:moduleId`,
  breadcrumbName: '设备组件详情',
  render: (props: { match: any }) => <DeviceDetailLoadable id={props.match.params.moduleId} type="module" {...props} />,
  routes: [
    {
      path: `${path}/detail/module/:moduleId/edit/:type/:id`,
      breadcrumbName: '编辑设备组件',
      component: Loadable({ loader: () => import('./device/editDevice'), loading }),
    },
    {
      path: `${path}/detail/module/:moduleId/devicelog/:type/:id`,
      breadcrumbName: '设备组件日志',
      component: Loadable({ loader: () => import('./device/deviceLog'), loading }),
    },
    {
      path: `${path}/detail/module/:moduleId/sparePartsChangeLog/:id`,
      breadcrumbName: '组件更换日志',
      component: Loadable({ loader: () => import('./device/sparePartsChangeLog'), loading }),
    },
  ],
});

const router = [
  {
    path: '/equipmentMaintenance',
    breadcrumbName: '设备维护',
    render: () => <Redirect to="/equipmentMaintenance/repairTask" />,
    routes: [
      {
        path: '/equipmentMaintenance/equipOverview',
        breadcrumbName: '设备概览',
        component: Loadable({ loader: () => import('./equipOverview'), loading }),
      },
      {
        path: '/equipmentMaintenance/tooling',
        breadcrumbName: '模具管理',
        component: Loadable({ loader: () => import('./tooling'), loading }),
        routes: [
          {
            path: '/equipmentMaintenance/tooling/create',
            breadcrumbName: '创建模具',
            component: Loadable({ loader: () => import('./tooling/create'), loading }),
          },
          {
            path: '/equipmentMaintenance/tooling/edit',
            breadcrumbName: '编辑模具',
            component: Loadable({ loader: () => import('./tooling/edit'), loading }),
          },
          {
            path: '/equipmentMaintenance/tooling/detail',
            breadcrumbName: '模具详情',
            component: Loadable({ loader: () => import('./tooling/detail'), loading }),
          },
          {
            path: '/equipmentMaintenance/tooling/importLog',
            breadcrumbName: '导入日志',
            component: Loadable({ loader: () => import('./tooling/importLog/index'), loading }),
            routes: [
              {
                path: '/equipmentMaintenance/tooling/importLog/detail',
                breadcrumbName: '日志详情',
                component: Loadable({ loader: () => import('./tooling/importLog/importLogDetail'), loading }),
              },
            ],
          },
        ],
      },
      {
        path: '/equipmentMaintenance/repairTask',
        breadcrumbName: '维修任务',
        component: Loadable({ loader: () => import('./repairTask'), loading }),
        routes: [
          {
            path: '/equipmentMaintenance/repairTask/create',
            breadcrumbName: '创建任务',
            component: Loadable({ loader: () => import('src/containers/task/repairTask/createRepairTask'), loading }),
          },
          {
            path: '/equipmentMaintenance/repairTask/detail/:taskCode',
            breadcrumbName: '任务详情',
            component: Loadable({ loader: () => import('src/containers/task/repairTask/repairTaskDetail'), loading }),
            routes: [
              {
                path: '/equipmentMaintenance/repairTask/detail/:taskCode/report/:subTaskCode',
                breadcrumbName: '任务报告',
                component: TaskReport,
              },
            ],
          },
        ],
      },
      {
        path: '/equipmentMaintenance/maintenanceTask',
        breadcrumbName: '保养任务',
        component: Loadable({ loader: () => import('./maintenanceTask'), loading }),
        routes: [
          {
            path: '/equipmentMaintenance/maintenanceTask/create',
            breadcrumbName: '创建任务',
            component: Loadable({
              loader: () => import('src/containers/task/maintenanceTask/createMaintenanceTask'),
              loading,
            }),
          },
          {
            path: '/equipmentMaintenance/maintenanceTask/edit/:taskCode',
            breadcrumbName: '编辑任务',
            component: Loadable({
              loader: () => import('src/containers/task/maintenanceTask/editMaintenanceTask'),
              loading,
            }),
          },
          {
            path: '/equipmentMaintenance/maintenanceTask/detail/:taskCode',
            breadcrumbName: '任务详情',
            component: Loadable({
              loader: () => import('src/containers/task/maintenanceTask/maintenanceTaskDetail'),
              loading,
            }),
            routes: [
              {
                path: '/equipmentMaintenance/maintenanceTask/detail/:taskCode/report/:subTaskCode',
                breadcrumbName: '任务报告',
                component: TaskReport,
              },
            ],
          },
        ],
      },
      {
        path: '/equipmentMaintenance/checkTask',
        breadcrumbName: '点检任务',
        component: Loadable({ loader: () => import('./checkTask'), loading }),
        routes: [
          {
            path: '/equipmentMaintenance/checkTask/create',
            breadcrumbName: '创建任务',
            component: Loadable({ loader: () => import('src/containers/task/checkTask/createCheckTask'), loading }),
          },
          {
            path: '/equipmentMaintenance/checkTask/edit/:taskCode',
            breadcrumbName: '编辑任务',
            component: Loadable({ loader: () => import('src/containers/task/checkTask/editCheckTask'), loading }),
          },
          {
            path: '/equipmentMaintenance/checkTask/detail/:taskCode',
            breadcrumbName: '任务详情',
            component: Loadable({ loader: () => import('src/containers/task/checkTask/checkTaskDetail'), loading }),
            routes: [
              {
                path: '/equipmentMaintenance/checkTask/detail/:taskCode/report/:subTaskCode',
                breadcrumbName: '任务报告',
                component: TaskReport,
              },
            ],
          },
        ],
      },
      {
        path: '/equipmentMaintenance/device',
        breadcrumbName: '设备管理',
        component: Loadable({ loader: () => import('./device/deviceList'), loading }),
        routes: [
          {
            path: ['/equipmentMaintenance/device/detail/device/:deviceId/add', '/equipmentMaintenance/device/add'],
            breadcrumbName: '添加设备',
            component: Loadable({ loader: () => import('./device/addDevice'), loading }),
          },
          {
            path: '/equipmentMaintenance/device/devicelog/:type/:id',
            breadcrumbName: '设备日志',
            component: Loadable({ loader: () => import('./device/deviceLog'), loading }),
          },
          {
            path: '/equipmentMaintenance/device/importLog',
            breadcrumbName: '导入日志',
            component: Loadable({ loader: () => import('./device/deviceImportLog/importHistory'), loading }),
            routes: [
              {
                path: '/equipmentMaintenance/device/importLog/detail/:id',
                breadcrumbName: '日志详情',
                component: Loadable({ loader: () => import('./device/deviceImportLog/importDetail'), loading }),
              },
            ],
          },
          deviceModuleRoute('/equipmentMaintenance/device'),
          {
            path: '/equipmentMaintenance/device/detail/device/:deviceId',
            breadcrumbName: '设备详情',
            render: (props: { match: any }) => (
              <DeviceDetailLoadable type="device" id={props.match.params.deviceId} {...props} />
            ),
            routes: [
              deviceModuleRoute('/equipmentMaintenance/device/detail/device/:deviceId'),
              {
                path: '/equipmentMaintenance/device/detail/device/:deviceId/edit/:type/:id',
                breadcrumbName: '编辑设备',
                component: Loadable({ loader: () => import('./device/editDevice'), loading }),
              },
              {
                path: '/equipmentMaintenance/device/detail/device/:deviceId/devicelog/:type/:id',
                breadcrumbName: '设备日志',
                component: Loadable({ loader: () => import('./device/deviceLog'), loading }),
              },
              {
                path: '/equipmentMaintenance/device/detail/device/:deviceId/sparePartsChangeLog/:id',
                breadcrumbName: '设备更换日志',
                component: Loadable({ loader: () => import('./device/sparePartsChangeLog'), loading }),
              },
            ],
          },
        ],
      },
      {
        path: '/equipmentMaintenance/mould',
        breadcrumbName: '模具管理',
        component: Loadable({ loader: () => import('./mould/mouldList'), loading }),
        routes: [
          {
            path: '/equipmentMaintenance/mould/add',
            breadcrumbName: '创建模具',
            component: Loadable({ loader: () => import('./mould/addMould'), loading }),
          },
          {
            path: '/equipmentMaintenance/mould/mould-log/:id',
            breadcrumbName: '模具日志',
            component: Loadable({ loader: () => import('./mould/mouldLog'), loading }),
          },
          {
            path: '/equipmentMaintenance/mould/detail/:id',
            breadcrumbName: '模具详情',
            component: Loadable({ loader: () => import('./mould/mouldDetail'), loading }),
            routes: [
              {
                path: '/equipmentMaintenance/mould/detail/:id/edit/:id',
                breadcrumbName: '编辑模具',
                component: Loadable({ loader: () => import('./mould/editMould'), loading }),
              },
              {
                path: '/equipmentMaintenance/mould/detail/:id/mould-log/:id',
                breadcrumbName: '模具日志',
                component: Loadable({ loader: () => import('./mould/mouldLog'), loading }),
              },
            ],
          },
        ],
      },
    ],
  },
];

export default router;
