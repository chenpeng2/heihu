import React from 'react';
import Loadable from 'react-loadable';
import { Redirect } from 'react-router-dom';
import { loading } from 'components';

import { MaterialDetail, MaterialEdit, MaterialOperationHistory } from 'src/containers/stock/material';
import ProdTaskDetail from 'src/containers/task/produceTask/detail/prodTaskDetail';
import BlankingTaskDetail from 'src/containers/task/produceTask/detail/blankingTaskDetail';
import {
  PlannedTicketOperationLog,
  PlannedTicketImportDetail,
  PlannedTicketImportLog,
  CreatePlannedTicket,
  PlannedTicketDetail,
  EditPlannedTicket,
  CreateSonPlannedTicket,
  EditBaitingWorkOrder,
  EditSonPlannedTicket,
  BaitingWorkOrderDetail,
  AuditPlannedTicket,
} from 'containers/plannedTicket';

const FilterForDeliverTraceLoadable = Loadable({ loader: () => import('./trace/deliverTrace/filter'), loading });
const DeliverTraceListLoadable = Loadable({
  loader: () => import('./trace/deliverTrace/list/deliverTraceList'),
  loading,
});
const RecordDetailLoadable = Loadable({
  loader: () => import('src/containers/task/produceTask/detail/recordDetail'),
  loading,
});
const CreateNestTaskForPurchaseOrder = Loadable({
  loader: () => import('./purchaseOrder/createNestTaskForPurchaseOrder/Index.jsx'),
  loading,
});

const router = [
  {
    path: '/cooperate',
    breadcrumbName: '生产管理',
    render: () => <Redirect to="/cooperate/projects" />,
    routes: [
      {
        path: '/cooperate/plannedTicket',
        breadcrumbName: '计划工单',
        component: Loadable({ loader: () => import('./plannedTicket/list'), loading }),
        render: () => <Redirect to="/cooperate/plannedTicket" />,
        routes: [
          {
            path: '/cooperate/plannedTicket/create',
            breadcrumbName: '创建',
            component: CreatePlannedTicket,
          },
          {
            path: '/cooperate/plannedTicket/:id/createSonPlannedTicket',
            breadcrumbName: '创建子计划工单',
            component: CreateSonPlannedTicket,
          },
          {
            path: '/cooperate/plannedTicket/baiting/detail/:id',
            breadcrumbName: '详情',
            component: BaitingWorkOrderDetail,
            routes: [
              {
                path: '/cooperate/plannedTicket/baiting/detail/:id/logs/operate',
                breadcrumbName: '操作记录',
                component: PlannedTicketOperationLog,
              },
              {
                path: '/cooperate/plannedTicket/baiting/detail/:id/edit',
                breadcrumbName: '编辑',
                component: EditBaitingWorkOrder,
              },
            ],
          },
          {
            path: '/cooperate/plannedTicket/injectionMouldingChild/detail/:id',
            breadcrumbName: '详情',
            component: Loadable({
              loader: () => import('containers/plannedTicket/detail/InjectionMouldingChildWorkOrderDetail'),
              loading,
            }),
          },
          {
            path: '/cooperate/plannedTicket/injectionMoulding/detail/:id',
            breadcrumbName: '详情',
            component: Loadable({
              loader: () => import('containers/plannedTicket/detail/InjectionMouldingWorkOrderDetail'),
              loading,
            }),
            routes: [
              {
                path: '/cooperate/plannedTicket/injectionMoulding/detail/:id/logs/operate/:plannedTicketCategory',
                breadcrumbName: '操作记录',
                component: PlannedTicketOperationLog,
              },
              {
                path: '/cooperate/plannedTicket/injectionMoulding/detail/:id/edit',
                breadcrumbName: '编辑',
                component: Loadable({
                  loader: () => import('containers/plannedTicket/edit/EditInjectionMoulding'),
                  loading,
                }),
              },
            ],
          },
          {
            path: '/cooperate/plannedTicket/detail/:id',
            breadcrumbName: '详情',
            component: PlannedTicketDetail,
            routes: [
              {
                path: '/cooperate/plannedTicket/detail/:id/edit',
                breadcrumbName: '编辑',
                component: EditPlannedTicket,
              },
              {
                path: '/cooperate/plannedTicket/detail/:id/editSubPlannedTicket',
                breadcrumbName: '编辑',
                component: EditSonPlannedTicket,
              },
              {
                path: '/cooperate/plannedTicket/detail/:id/logs/operate',
                breadcrumbName: '操作记录',
                component: PlannedTicketOperationLog,
              },
            ],
          },
          {
            path: '/cooperate/plannedTicket/audit/:id',
            breadcrumbName: '审批计划工单',
            component: AuditPlannedTicket,
          },
          {
            path: '/cooperate/plannedTicket/logs/import',
            breadcrumbName: '导入日志',
            component: PlannedTicketImportLog,
            routes: [
              {
                path: '/cooperate/plannedTicket/logs/import/:id',
                breadcrumbName: '导入日志详情',
                component: PlannedTicketImportDetail,
              },
            ],
          },
        ],
      },
      {
        path: '/cooperate/taskSchedule',
        breadcrumbName: '排程',
        component: Loadable({ loader: () => import('./taskSchedule'), loading }),
        routes: [
          {
            path: '/cooperate/taskSchedule/createTransferApply',
            breadcrumbName: '批量创建转移申请',
            component: Loadable({
              loader: () => import('../stock/transferApply/createTransferApplyForTaskSchedule'),
              loading,
            }),
          },
          {
            path: '/cooperate/taskSchedule/createTransferApplySingle',
            breadcrumbName: '创建转移申请',
            component: Loadable({
              loader: () => import('../stock/transferApply/createTransferApplySingle'),
              loading,
            }),
          },
          {
            path: '/cooperate/taskSchedule/process-log-list',
            breadcrumbName: '排程日志',
            component: Loadable({ loader: () => import('./taskSchedule/processLog/LogList'), loading }),
            routes: [
              {
                path: '/cooperate/taskSchedule/process-log-list/detail/:id',
                breadcrumbName: '日志详情',
                component: Loadable({ loader: () => import('./taskSchedule/processLog/LogDetail'), loading }),
              },
            ],
          },
          {
            path: '/cooperate/taskSchedule/distributeTaskLogList',
            breadcrumbName: '下发日志',
            component: Loadable({ loader: () => import('./taskSchedule/distributeTaskLog/list'), loading }),
            routes: [
              {
                path: '/cooperate/taskSchedule/distributeTaskLogList/detail/:id',
                breadcrumbName: '日志详情',
                component: Loadable({ loader: () => import('./taskSchedule/distributeTaskLog/detail'), loading }),
              },
            ],
          },
          {
            path: '/cooperate/taskSchedule/revokeTaskLogList',
            breadcrumbName: '撤回日志',
            component: Loadable({ loader: () => import('./taskSchedule/revokeTaskLog/list'), loading }),
            routes: [
              {
                path: '/cooperate/taskSchedule/revokeTaskLogList/detail/:id',
                breadcrumbName: '日志详情',
                component: Loadable({ loader: () => import('./taskSchedule/revokeTaskLog/detail'), loading }),
              },
            ],
          },
          {
            path: '/cooperate/taskSchedule/audit-list',
            breadcrumbName: '任务审批操作日志',
            component: Loadable({ loader: () => import('./taskSchedule/auditLog/list'), loading }),
          },
        ],
      },
      {
        path: '/cooperate/projects',
        breadcrumbName: '项目',
        component: Loadable({ loader: () => import('./project/list/projectList'), loading }),
        routes: [
          {
            path: '/cooperate/projects/create',
            breadcrumbName: '创建项目',
            component: Loadable({
              loader: () => import('src/containers/project/createProject/createProject'),
              loading,
            }),
          },
          {
            path: '/cooperate/projects/:projectCode/createSonProject',
            breadcrumbName: '创建子项目',
            component: Loadable({ loader: () => import('src/containers/project/createSonProject'), loading }),
          },
          {
            path: '/cooperate/projects/:projectCode/edit',
            breadcrumbName: '编辑项目',
            component: Loadable({ loader: () => import('src/containers/project/editProject/editProject'), loading }),
          },
          {
            path: '/cooperate/projects/:projectCode/editSonProject',
            breadcrumbName: '编辑子项目',
            component: Loadable({ loader: () => import('src/containers/project/editSonProject'), loading }),
          },
          {
            path: '/cooperate/projects/loglist',
            breadcrumbName: '导入日志',
            component: Loadable({ loader: () => import('./project/import/loglist'), loading }),
            routes: [
              {
                path: '/cooperate/projects/loglist/logdetail/:id',
                breadcrumbName: '日志详情',
                component: Loadable({ loader: () => import('./project/import/logDetail'), loading }),
              },
            ],
          },
          {
            path: '/cooperate/projects/:projectCode/detail',
            breadcrumbName: '项目详情页',
            component: Loadable({
              loader: () => import('src/containers/project/projectDetail/projectDetail'),
              loading,
            }),
            routes: [
              {
                path: '/cooperate/projects/:projectCode/detail/operationHistory',
                breadcrumbName: '操作记录',
                component: Loadable({
                  loader: () => import('./project/operationHistory/projectOperationHistory'),
                  loading,
                }),
              },
            ],
          },
          {
            path: '/cooperate/projects/injection-moulding-project/:projectCode/detail',
            breadcrumbName: '注塑项目详情页',
            component: Loadable({
              loader: () => import('./project/InjectMouldingProject/ProjectDetail'),
              loading,
            }),
            routes: [
              {
                path: '/cooperate/projects/injection-moulding-project/:projectCode/detail/operationHistory',
                breadcrumbName: '操作记录',
                component: Loadable({
                  loader: () => import('./project/operationHistory/InjectionMoldProjectOperationHistory'),
                  loading,
                }),
              },
            ],
          },
        ],
      },
      {
        path: '/cooperate/blankingTasks',
        breadcrumbName: '下料任务',
        component: Loadable({
          loader: () => import('./blankingTask/list'),
          loading,
        }),
        routes: [
          {
            path: '/cooperate/blankingTasks/editTask/:id',
            breadcrumbName: '编辑下料任务',
            component: Loadable({ loader: () => import('./blankingTask/edit/editTask'), loading }),
          },
          // {
          //   path: '/cooperate/prodTasks/:materialId/qrCodeDetail',
          //   breadcrumbName: '二维码详情',
          //   component: Loadable({ loader: () => import('src/views/stock/qrCodeDetail'), loading }),
          // },
          {
            path: '/cooperate/blankingTasks/detail/:taskId',
            breadcrumbName: '下料任务详情',
            component: BlankingTaskDetail,
            routes: [
              {
                path: '/cooperate/blankingTasks/detail/:taskId/log',
                breadcrumbName: '操作记录',
                component: Loadable({
                  loader: () => import('src/containers/task/produceTask/detail/prodTaskOperationLog'),
                  loading,
                }),
              },
              {
                path: '/cooperate/blankingTasks/detail/:taskId/holdRecordDetail/:recordId',
                breadcrumbName: '合格产出记录详情',
                component: RecordDetailLoadable,
              },
              {
                path: '/cooperate/blankingTasks/detail/:taskId/useRecordDetail/:recordId',
                breadcrumbName: '合格投产记录详情',
                component: RecordDetailLoadable,
              },
              {
                path: '/cooperate/blankingTasks/detail/:taskId/unqualifiedHoldRecordDetail/:recordId',
                breadcrumbName: '不合格产出记录详情',
                component: RecordDetailLoadable,
              },
              {
                path: '/cooperate/blankingTasks/detail/:taskId/unqualifiedUseRecordDetail/:recordId',
                breadcrumbName: '不合格投产记录详情',
                component: RecordDetailLoadable,
              },
            ],
          },
        ],
      },
      {
        path: '/cooperate/prodTasks',
        breadcrumbName: '生产任务',
        component: Loadable({
          loader: () => import('./prodTask/list'),
          loading,
        }),
        routes: [
          {
            path: '/cooperate/prodTasks/editTask/:id',
            breadcrumbName: '编辑生产任务',
            component: Loadable({ loader: () => import('./prodTask/edit/editTask'), loading }),
          },
          {
            path: '/cooperate/prodTasks/:materialId/qrCodeDetail',
            breadcrumbName: '二维码详情',
            component: Loadable({ loader: () => import('src/views/stock/qrCodeDetail'), loading }),
          },
          {
            path: '/cooperate/prodTasks/detail/:taskId',
            breadcrumbName: '生产任务详情',
            component: ProdTaskDetail,
            routes: [
              {
                path: '/cooperate/prodTasks/detail/:taskId/log',
                breadcrumbName: '操作记录',
                component: Loadable({
                  loader: () => import('src/containers/task/produceTask/detail/prodTaskOperationLog'),
                  loading,
                }),
              },
              {
                path: '/cooperate/prodTasks/detail/:taskId/holdRecordDetail/:recordId',
                breadcrumbName: '合格产出记录详情',
                component: RecordDetailLoadable,
              },
              {
                path: '/cooperate/prodTasks/detail/:taskId/useRecordDetail/:recordId',
                breadcrumbName: '合格投产记录详情',
                component: RecordDetailLoadable,
              },
              {
                path: '/cooperate/prodTasks/detail/:taskId/unqualifiedHoldRecordDetail/:recordId',
                breadcrumbName: '不合格产出记录详情',
                component: RecordDetailLoadable,
              },
              {
                path: '/cooperate/prodTasks/detail/:taskId/unqualifiedUseRecordDetail/:recordId',
                breadcrumbName: '不合格投产记录详情',
                component: RecordDetailLoadable,
              },
              {
                path: '/cooperate/prodTasks/detail/:taskId/byProductUnqualifiedOutputRecordDetail/:recordId',
                breadcrumbName: '不合格副产出记录详情',
                component: RecordDetailLoadable,
              },
              {
                path: '/cooperate/prodTasks/detail/:taskId/byProductOutputRecordDetail/:recordId',
                breadcrumbName: '合格副产出记录详情',
                component: RecordDetailLoadable,
              },
            ],
          },
        ],
      },
      {
        path: '/cooperate/inject-mold-tasks',
        breadcrumbName: '合并任务',
        component: Loadable({
          loader: () => import('./injectMoldTask/list'),
          loading,
        }),
        routes: [
          {
            path: '/cooperate/inject-mold-tasks/detail/:taskId',
            breadcrumbName: '任务详情',
            component: Loadable({
              loader: () => import('./injectMoldTask/detail'),
              loading,
            }),
            routes: [
              {
                path: '/cooperate/inject-mold-tasks/detail/:taskId/log',
                breadcrumbName: '操作记录',
                component: Loadable({
                  loader: () => import('views/cooperate/injectMoldTask/history'),
                  loading,
                }),
              },
            ],
          },
        ],
      },
      {
        path: '/cooperate/SOPTask',
        breadcrumbName: 'SOP任务',
        component: Loadable({
          loader: () => import('src/views/knowledgeManagement/flowEngine/sop/SOPTask/SOPTaskList'),
          loading,
        }),
        routes: [
          {
            path: '/cooperate/SOPTask/detail/:taskId',
            breadcrumbName: 'SOP任务详情',
            component: Loadable({
              loader: () => import('src/views/knowledgeManagement/flowEngine/sop/SOPTask/SOPTaskDetail'),
              loading,
            }),
            routes: [
              {
                path: '/cooperate/SOPTask/detail/:taskId/log',
                breadcrumbName: 'SOP任务操作记录',
                component: Loadable({
                  loader: () => import('src/views/knowledgeManagement/flowEngine/sop/SOPTask/SOPTaskLog'),
                  loading,
                }),
              },
              {
                path: '/cooperate/SOPTask/detail/:taskId/record-result',
                breadcrumbName: 'SOP',
                component: Loadable({
                  loader: () => import('src/views/knowledgeManagement/flowEngine/sop/SOPTask/SOPTaskRecordResult'),
                  loading,
                }),
              },
            ],
          },
        ],
      },
      {
        path: '/cooperate/prodReports',
        breadcrumbName: '生产进度报表',
        component: Loadable({ loader: () => import('./prodReports/list/prodReportsList'), loading }),
      },
      {
        path: '/cooperate/productionRecords',
        breadcrumbName: '产量统计报表',
        component: Loadable({ loader: () => import('./productionRecord/list/productionRecordsTab'), loading }),
      },
      {
        path: '/cooperate/productionCapacityRecords',
        breadcrumbName: '产能报表',
        component: Loadable({ loader: () => import('./productionRecord/list/productionCapacityRecords'), loading }),
      },
      {
        path: '/cooperate/production-work-time-records',
        breadcrumbName: '生产工时报表',
        component: Loadable({ loader: () => import('./productionRecord/workTimeRecords/List'), loading }),
      },
      {
        path: '/cooperate/production-input-material-records',
        breadcrumbName: '生产投产物料统计报表',
        component: Loadable({
          loader: () => import('./productionRecord/InputMaterialRecords/InputMaterialRecords'),
          loading,
        }),
      },
      {
        path: '/cooperate/production-defect-report',
        breadcrumbName: '生产次品报表',
        component: Loadable({
          loader: () => import('./productionRecord/defectReport'),
          loading,
        }),
      },
      {
        path: '/cooperate/deliverTrace',
        breadcrumbName: '出厂追溯',
        render: props => (
          <FilterForDeliverTraceLoadable>
            <DeliverTraceListLoadable {...props} />
          </FilterForDeliverTraceLoadable>
        ),
        routes: [
          {
            path: '/cooperate/deliverTrace/:materialId/qrCodeDetail',
            breadcrumbName: '二维码详情',
            component: Loadable({ loader: () => import('src/views/stock/qrCodeDetail'), loading }),
          },
          {
            path: '/cooperate/deliverTrace/:materialCode/detail',
            breadcrumbName: '物料详情',
            component: MaterialDetail,
            routes: [
              {
                path: '/cooperate/deliverTrace/:materialCode/detail/edit',
                breadcrumbName: '编辑物料',
                component: MaterialEdit,
              },
              {
                path: '/cooperate/deliverTrace/:materialCode/detail/operationHistory',
                breadcrumbName: '操作记录',
                component: MaterialOperationHistory,
              },
            ],
          },
        ],
      },
      {
        path: '/cooperate/purchaseLists',
        breadcrumbName: '$procure_order$',
        component: Loadable({ loader: () => import('./purchase_list/purchase_list_list'), loading }),
        routes: [
          {
            path: '/cooperate/purchaseLists/create',
            breadcrumbName: '创建$procure_order$',
            component: Loadable({ loader: () => import('./purchase_list/create'), loading }),
          },
          {
            path: '/cooperate/purchaseLists/:code/update',
            breadcrumbName: '更新$procure_order$',
            component: Loadable({ loader: () => import('./purchase_list/update'), loading }),
          },
          {
            path: '/cooperate/purchaseLists/:code/edit',
            breadcrumbName: '编辑$procure_order$',
            component: Loadable({ loader: () => import('./purchase_list/edit_purchase_list'), loading }),
          },
          {
            path: '/cooperate/purchaseLists/import',
            breadcrumbName: '导入日志',
            component: Loadable({ loader: () => import('./purchase_list/importHistory'), loading }),
            routes: [
              {
                path: '/cooperate/purchaseLists/import/:importId',
                breadcrumbName: '详情',
                component: Loadable({ loader: () => import('./purchase_list/importDetail'), loading }),
              },
            ],
          },
          {
            path: '/cooperate/purchaseLists/:code/detail/:id',
            breadcrumbName: '$procure_order$详情',
            component: Loadable({ loader: () => import('./purchase_list/purchase_list_detail'), loading }),
            routes: [
              {
                path: '/cooperate/purchaseLists/:code/detail/:id/operationHistory',
                breadcrumbName: '操作记录',
                component: Loadable({
                  loader: () => import('./purchase_list/purchase_list_operation_history'),
                  loading,
                }),
              },
              {
                path: '/cooperate/purchaseLists/:code/detail/:id/incoming',
                breadcrumbName: '入厂',
                component: Loadable({
                  loader: () => import('./purchase_list/incoming'),
                  loading,
                }),
              },
              {
                path: '/cooperate/purchaseLists/:code/detail/:id/admitRecord',
                breadcrumbName: '入厂记录',
                component: Loadable({
                  loader: () => import('./purchase_list/admitRecord'),
                  loading,
                }),
              },
            ],
          },
        ],
      },
      {
        path: '/cooperate/purchaseOrders',
        breadcrumbName: '销售订单',
        component: Loadable({ loader: () => import('./purchaseOrder/list'), loading }),
        routes: [
          {
            path: '/cooperate/purchaseOrders/create',
            breadcrumbName: '创建销售订单',
            component: Loadable({ loader: () => import('./purchaseOrder/create'), loading }),
          },
          {
            path: '/cooperate/purchaseOrders/:id/edit',
            breadcrumbName: '编辑销售订单',
            component: Loadable({ loader: () => import('./purchaseOrder/edit'), loading }),
          },
          {
            path: '/cooperate/purchaseOrders/:id/detail',
            breadcrumbName: '销售订单详情',
            component: Loadable({ loader: () => import('./purchaseOrder/detail'), loading }),
            routes: [
              {
                path: '/cooperate/purchaseOrders/:id/detail/logs/operation',
                breadcrumbName: '操作记录',
                component: Loadable({
                  loader: () => import('./purchaseOrder/logs/operationLog'),
                  loading,
                }),
              },
            ],
          },
          {
            path: '/cooperate/purchaseOrders/:purchaseOrderId/createNestTask',
            breadcrumbName: '创建嵌套任务',
            component: CreateNestTaskForPurchaseOrder,
          },
          {
            path: '/cooperate/purchaseOrders/logs/import',
            breadcrumbName: '导入日志',
            component: Loadable({
              loader: () => import('./purchaseOrder/logs/importLog'),
              loading,
            }),
            routes: [
              {
                path: '/cooperate/purchaseOrders/logs/import/:id',
                breadcrumbName: '导入日志详情',
                component: Loadable({
                  loader: () => import('./purchaseOrder/logs/importDetail'),
                  loading,
                }),
              },
            ],
          },
        ],
      },
      {
        path: '/cooperate/materialRequest',
        breadcrumbName: '物料请求',
        component: Loadable({ loader: () => import('./materialRequest/list'), loading }),
        routes: [
          {
            path: '/cooperate/materialRequest/create',
            breadcrumbName: '创建物料请求',
            component: Loadable({ loader: () => import('./materialRequest/create'), loading }),
          },
          {
            path: '/cooperate/materialRequest/:id/edit',
            breadcrumbName: '编辑物料请求',
            component: Loadable({ loader: () => import('./materialRequest/edit'), loading }),
          },
          {
            path: '/cooperate/materialRequest/:id/detail',
            breadcrumbName: '物料请求详情',
            component: Loadable({ loader: () => import('./materialRequest/detail'), loading }),
          },
        ],
      },
    ],
  },
];

export default router;
