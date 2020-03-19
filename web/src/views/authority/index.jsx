import React from 'react';
import Loadable from 'react-loadable';
import { Redirect } from 'react-router-dom';
import { Route, loading } from 'components';

const router = [
  {
    path: '/authority',
    breadcrumbName: '权限管理',
    render: () => <Redirect to="/authority/users" />,
    routes: [
      {
        path: '/authority/users',
        breadcrumbName: '用户管理',
        component: Loadable({ loader: () => import('./users/list/usersList'), loading }),
        routes: [
          {
            path: '/authority/users/add-user',
            breadcrumbName: '新增用户',
            component: Loadable({ loader: () => import('./users/addUser'), loading }),
          },
          {
            path: '/authority/users/user-edit/:id',
            breadcrumbName: '编辑用户',
            component: Loadable({ loader: () => import('./users/editUser'), loading }),
          },
          {
            path: '/authority/users/user-detail/:id',
            breadcrumbName: '用户详情',
            component: Loadable({ loader: () => import('./users/userDetail'), loading }),
            routes: [
              {
                path: '/authority/users/user-detail/:id/operation-log',
                breadcrumbName: '操作记录',
                component: Loadable({ loader: () => import('./users/operationLog'), loading }),
              },
            ],
          },
        ],
      },
      {
        path: '/authority/usergroup',
        breadcrumbName: '用户组管理',
        component: Loadable({ loader: () => import('./userGroup/userGroupList'), loading }),
      },
      {
        path: '/authority/roles',
        breadcrumbName: '角色',
        component: Loadable({ loader: () => import('./roles/list/roleList'), loading }),
      },
    ],
  },
];

export default router;
