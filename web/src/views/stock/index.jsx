import React from 'react';
import Loadable from 'react-loadable';
import { Redirect } from 'react-router-dom';
import { loading } from 'components';

import { MaterialDetail, MaterialEdit, MaterialOperationHistory } from 'containers/stock/material';

const FilterForLgVinitRecordListLoadable = Loadable({ loader: () => import('./vinitRecord/filter'), loading });
const LgVinitRecordListLoadable = Loadable({ loader: () => import('./vinitRecord/list/vinitRecordList'), loading });

const FilterForPurchaseOrderSummaryLoadable = Loadable({
  loader: () => import('./purchaseOrderSummary/filter'),
  loading,
});
const PurchaseOrderSummaryLoadable = Loadable({
  loader: () => import('./purchaseOrderSummary/list/purchaseOrderSummary'),
  loading,
});

const materialRoute = [
  {
    path: '/stock/deliverLgTransfers/:materialCode/detail',
    breadcrumbName: '物料详情',
    component: MaterialDetail,
    routes: [
      {
        path: '/stock/deliverLgTransfers/:materialCode/detail/edit',
        breadcrumbName: '编辑物料',
        component: MaterialEdit,
      },
      {
        path: '/stock/deliverLgTransfers/:materialCode/detail/operationHistory',
        breadcrumbName: '操作记录',
        component: MaterialOperationHistory,
      },
    ],
  },
  {
    path: '/stock/deliverLgTransfers/:materialId/qrCodeDetail',
    breadcrumbName: '二维码详情',
    component: Loadable({ loader: () => import('src/views/stock/qrCodeDetail'), loading }),
  },
];

const router = [
  {
    path: '/stock',
    breadcrumbName: '物料管理',
    render: () => <Redirect to="/stock/qrCode" />,
    routes: [
      {
        path: '/stock/deliveryRequest',
        breadcrumbName: '发运申请',
        component: Loadable({ loader: () => import('./deliveryRequest/list'), loading }),
        routes: [
          {
            path: '/stock/deliveryRequest/create',
            breadcrumbName: '创建',
            component: Loadable({ loader: () => import('./deliveryRequest/create'), loading }),
          },
          {
            path: '/stock/deliveryRequest/:id/edit',
            breadcrumbName: '编辑',
            component: Loadable({ loader: () => import('./deliveryRequest/edit'), loading }),
          },
        ],
      },
      {
        path: '/stock/initLgTransfers',
        breadcrumbName: '入厂记录',
        render: props => (
          <FilterForLgVinitRecordListLoadable>
            <LgVinitRecordListLoadable {...props} />
          </FilterForLgVinitRecordListLoadable>
        ),
        routes: materialRoute,
      },
      {
        path: '/stock/deliverLgTransfers',
        breadcrumbName: '出厂记录',
        component: Loadable({ loader: () => import('./lgDeliverRecord'), loading }),
        routes: materialRoute,
      },
      {
        path: '/stock/materialRecords-purchaseOrderSummary',
        breadcrumbName: '订单交货报表',
        render: props => (
          <FilterForPurchaseOrderSummaryLoadable>
            <PurchaseOrderSummaryLoadable {...props} />
          </FilterForPurchaseOrderSummaryLoadable>
        ),
      },
      {
        path: '/stock/inventory',
        breadcrumbName: '库存查询',
        component: Loadable({ loader: () => import('./inventory/list'), loading }),
      },
      {
        path: '/stock/qrCode',
        breadcrumbName: '二维码查询',
        component: Loadable({ loader: () => import('./qrCodeQuery/list'), loading }),
        routes: [
          {
            path: '/stock/qrCode/dataExport',
            breadcrumbName: '数据导出',
            component: Loadable({ loader: () => import('src/containers/qrCodeQuery/list/exportByWarehouse'), loading }),
          },
          {
            path: '/stock/qrCode/importLog',
            breadcrumbName: '二维码导入日志',
            component: Loadable({ loader: () => import('./qrCodeQuery/importLog'), loading }),
            routes: [
              {
                path: '/stock/qrCode/importLog/:importId/detail',
                breadcrumbName: '日志详情',
                component: Loadable({ loader: () => import('./qrCodeQuery/importLogDetail'), loading }),
              },
            ],
          },
        ],
      },
      {
        path: '/stock/storageAdjustRecord',
        breadcrumbName: '事务记录',
        component: Loadable({ loader: () => import('./storageAdjustRecord/list'), loading }),
        routes: [
          {
            path: '/stock/storageAdjustRecord/:id/detail',
            breadcrumbName: '事务记录详情',
            component: Loadable({ loader: () => import('./storageAdjustRecord/detail/index'), loading }),
          },
          {
            path: '/stock/storageAdjustRecord/:materialId/qrCodeDetail',
            breadcrumbName: '二维码详情',
            component: Loadable({ loader: () => import('src/views/stock/qrCodeDetail'), loading }),
          },
        ],
      },
      {
        path: '/stock/productBatchCodeRule',
        breadcrumbName: '成品批号规则',
        component: Loadable({ loader: () => import('./productBatchCodeRule/list'), loading }),
        routes: [
          {
            path: '/stock/productBatchCodeRule/:code/detail',
            breadcrumbName: '成品批号规则详情',
            component: Loadable({ loader: () => import('./productBatchCodeRule/detail'), loading }),
            routes: [
              {
                path: '/stock/productBatchCodeRule/:code/detail/operationHistory',
                breadcrumbName: '操作记录',
                component: Loadable({ loader: () => import('./productBatchCodeRule/operationHistory'), loading }),
              },
            ],
          },
          {
            path: '/stock/productBatchCodeRule/:code/edit',
            breadcrumbName: '编辑批号规则详情',
            component: Loadable({ loader: () => import('./productBatchCodeRule/edit'), loading }),
          },
          {
            path: '/stock/productBatchCodeRule/create',
            breadcrumbName: '创建成品批号规则',
            component: Loadable({ loader: () => import('./productBatchCodeRule/create'), loading }),
          },
        ],
      },
      {
        path: '/stock/stockCheckRecord',
        breadcrumbName: '盘点记录',
        component: Loadable({ loader: () => import('./stockCheckRecord/list'), loading }),
        routes: [
          {
            path: '/stock/stockCheckRecord/dataExport',
            breadcrumbName: '数据导出',
            component: Loadable({ loader: () => import('src/containers/stockCheckRecord/list/export'), loading }),
          },
        ],
      },
      {
        path: '/stock/material-trace',
        breadcrumbName: '物料追溯',
        component: Loadable({ loader: () => import('./materialTrace'), loading }),
        routes: [
          {
            path: '/stock/material-trace/:materialId/qrCodeDetail',
            breadcrumbName: '二维码详情',
            component: Loadable({ loader: () => import('src/views/stock/qrCodeDetail'), loading }),
            routes: [
              {
                path: '/stock/material-trace/:materialId/qrCodeDetail/useRecordDetail/:recordId',
                breadcrumbName: '投产记录详情',
                component: Loadable({
                  loader: () => import('src/containers/task/produceTask/detail/recordDetail'),
                  loading,
                }),
              },
            ],
          },
        ],
      },
      {
        path: '/stock/materialTransferRecordList',
        breadcrumbName: '转移记录',
        component: Loadable({ loader: () => import('./materialTransferRecord/list'), loading }),
        routes: [
          {
            path: '/stock/materialTransferRecordList/:materialId/qrCodeDetail',
            breadcrumbName: '二维码详情',
            component: Loadable({ loader: () => import('src/views/stock/qrCodeDetail'), loading }),
          },
        ],
      },
      {
        path: '/stock/transferApply',
        breadcrumbName: '转移申请',
        component: Loadable({ loader: () => import('./transferApply/list/list'), loading }),
        routes: [
          {
            path: '/stock/transferApply/create',
            breadcrumbName: '创建转移申请',
            component: Loadable({ loader: () => import('./transferApply/create'), loading }),
          },
          {
            path: '/stock/transferApply/:id/edit',
            breadcrumbName: '编辑转移申请',
            component: Loadable({ loader: () => import('./transferApply/edit'), loading }),
          },
          {
            path: '/stock/transferApply/merge',
            breadcrumbName: '合并转移申请',
            component: Loadable({ loader: () => import('./transferApply/mergeTransferApply/Index.jsx'), loading }),
          },
        ],
      },
      {
        path: '/stock/splitRecord',
        breadcrumbName: '拆分记录',
        component: Loadable({ loader: () => import('./splitRecord/list/index'), loading }),
        routes: [
          {
            path: '/stock/splitRecord/:id/detail',
            breadcrumbName: '拆分记录详情',
            component: Loadable({ loader: () => import('./splitRecord/detail'), loading }),
          },
        ],
      },
      {
        path: '/stock/inboundOrder',
        breadcrumbName: '入库单',
        component: Loadable({ loader: () => import('./inboundOrder'), loading }),
        routes: [
          {
            path: '/stock/inboundOrder/create',
            breadcrumbName: '创建入库单',
            component: Loadable({ loader: () => import('./inboundOrder/create'), loading }),
          },
          {
            path: '/stock/inboundOrder/edit',
            breadcrumbName: '编辑入库单',
            component: Loadable({ loader: () => import('./inboundOrder/edit'), loading }),
          },
          {
            path: '/stock/inboundOrder/detail',
            breadcrumbName: '入库单详情',
            component: Loadable({ loader: () => import('./inboundOrder/detail'), loading }),
          },
          {
            path: '/stock/inboundOrder/importLog',
            breadcrumbName: '导入日志',
            component: Loadable({ loader: () => import('./inboundOrder/importLog/index'), loading }),
            routes: [
              {
                path: '/stock/inboundOrder/importLog/detail',
                breadcrumbName: '日志详情',
                component: Loadable({ loader: () => import('./inboundOrder/importLog/importLogDetail'), loading }),
              },
            ],
          },
        ],
      },
      {
        path: '/stock/materialCollectReport',
        breadcrumbName: '物料汇总报表',
        component: Loadable({ loader: () => import('./materialCollectReport/index'), loading }),
      },
      {
        path: '/stock/withdrawRecord',
        breadcrumbName: '退料记录',
        component: Loadable({ loader: () => import('./withdrawRecord/list/index'), loading }),
      },
      {
        path: '/stock/qrCodeMergeRecords',
        breadcrumbName: '合并记录',
        component: Loadable({ loader: () => import('./qrCodeMergeRecords/list/index.jsx'), loading }),
        routes: [
          {
            path: '/stock/qrCodeMergeRecords/:id/detail',
            breadcrumbName: '合并记录详情',
            component: Loadable({ loader: () => import('./qrCodeMergeRecords/detail/index.jsx'), loading }),
          },
          {
            path: '/stock/qrCodeMergeRecords/qrCodeDetail/:materialId',
            breadcrumbName: '二维码详情',
            component: Loadable({ loader: () => import('src/views/stock/qrCodeDetail'), loading }),
          },
        ],
      },
      {
        path: '/stock/monitor',
        breadcrumbName: '监控台',
        component: Loadable({ loader: () => import('./monitorCenter/list/Index.jsx'), loading }),
        routes: [
          {
            path: '/stock/monitor/:id/:warehouseCode/detail',
            breadcrumbName: '监控详情',
            component: Loadable({ loader: () => import('./monitorCenter/detailTable/Index.jsx'), loading }),
          },
          {
            path: '/stock/monitor/qrCodeDetail/:materialId',
            breadcrumbName: '二维码详情',
            component: Loadable({ loader: () => import('src/views/stock/qrCodeDetail'), loading }),
          },
        ],
      },
    ],
  },
];

export default router;
