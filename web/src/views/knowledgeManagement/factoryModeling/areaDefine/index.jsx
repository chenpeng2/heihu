import React from 'react';
import Loadable from 'react-loadable';
import { Route, loading } from 'components';
import { getProdLineDetailRoute } from '../prodLine';
import { getWorkshopDetailRoute } from '../workshop';
import { getWorkstationDetailRoute } from '../workstation';

const workshopDetailRoute = getWorkshopDetailRoute('/area-define');
const prodLineDetailRoute = getProdLineDetailRoute('/area-define');
const workstationDetailRoute = getWorkstationDetailRoute('/area-define');

export default ({
  path: '/knowledgeManagement/area-define',
  breadcrumbName: '区域定义',
  component: Loadable({ loader: () => import('./areaDefineList'), loading }),
  routes: [
    workshopDetailRoute,
    prodLineDetailRoute,
    workstationDetailRoute,
  ],
});
