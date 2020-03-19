import { getQcTaskDetailUrl } from 'views/qualityManagement/qcTask/utils';
import { toSOPTemplateDetail, toSOPTaskDetail } from 'views/knowledgeManagement/flowEngine/utils/navigation';
import eventTypes from './eventTypes';

/*
 * 如果返回的url需要带query参数 使用以下结构返回
 * {
 *   pathname: '/example',
 *   search: '?search=1',
 * }
 */

export const getNextPageUrl = (message, urlParams) => {
  if (!message) {
    global.log.error('getNextPageUrl函数需要message参数');
  }
  const { category, entityType, entityId, code, entityCode } = message;
  if (typeof category !== 'number' && !entityType && !code && !entityId) {
    global.log.error('getNextPageUrl函数需要message参数中至少有以下一种：code、entityType、category、entityId');
  }
  if (category === 10) {
    return null;
  }
  if (entityId || entityCode) {
    if (category === 31) {
      return `/bom/mbom/${entityId}/detail`;
    }
    if (category >= 40 && category <= 47) {
      return `/qualityManagement/qcTask/detail/${entityId}`;
    }
    if (category >= 61 && category <= 62) {
      if (entityType === 'receiveTask') {
        return `/logistics/receipt-task/detail/${entityId}`;
      }
      return `/logistics/send-task/detail/${entityId}`;
    }
    if (category === 70 || category === 217) {
      return `/cooperate/purchaseOrders/${entityId}/detail`;
    }
    if (category === 104) {
      return `cooperate/prodTasks/detail/${entityId}`;
    }
    // 批记录审批
    if (category >= 219 && category <= 221) {
      return `/cooperate/projects/${encodeURIComponent(entityCode)}/detail`;
    }
    if (category === 223) {
      return `/cooperate/purchaseLists/${entityCode}/detail/${entityId}`;
    }
    if (category <= 203 && category >= 202) {
      return `/cooperate/projects/${encodeURIComponent(entityId)}/detail`;
    }
    // 214：erp导入计划工单通知
    if ((category <= 210 && category >= 208) || category === 214) {
      return `/cooperate/plannedTicket/detail/${encodeURIComponent(entityCode)}`;
    }
    // 待审核任务
    if (category === 211) {
      return {
        pathname: '/cooperate/taskSchedule',
        search: `?tabKey=audit&taskCode=${entityCode}`,
      };
    }
    // 生产检/首检完成 点击跳转至质检报告详情
    if (category === 310) {
      return `/qualityManagement/qcReportAudit/detail/${entityId}`;
    }
    // 审核通过的任务
    if (category === 212) {
      return {
        pathname: '/cooperate/taskSchedule',
        search: `?tabKey=distributed&taskCode=${entityCode}`,
      };
    }
    // 审核不通过的任务
    if (category === 213) {
      return {
        pathname: '/cooperate/taskSchedule',
        search: `?tabKey=undistributed&taskCode=${entityCode}`,
      };
    }
    // 称量
    if (category === 800) {
      return `/weighingManagement/weighingTask/detail/${entityId}`;
    }
    // sop
    if (category === 1000 || category === 1001 || category === 1004 || category === 1008) {
      return toSOPTaskDetail(entityId);
    }
    // 物料审核预警通知
    if (category === 905 || category === 906) {
      return `/bom/materials/${entityId}/detail`;
    }
    if (entityType === 'equipment_repairTask') {
      return `/equipmentMaintenance/repairTask/detail/${entityId}`;
    }
    if (entityType === 'equipment_checkTask') {
      return `/equipmentMaintenance/checkTask/detail/${entityId}`;
    }
    if (entityType === 'equipment_maintainTask') {
      return `/equipmentMaintenance/maintenanceTask/detail/${entityId}`;
    }
    if (entityType === 'process_routing') {
      return `/bom/processRoute/${entityId}/detail`;
    }
  }
  if (category === 1003) {
    return toSOPTemplateDetail(message.templateId);
  }
  if (entityType === 'projectCreated') {
    return entityCode ? `/cooperate/projects/${encodeURIComponent(entityCode)}/detail` : null;
  }
  if (entityType === 'Task') {
    const { planId } = urlParams;
    return `/cooperate/plans/prod/${planId}/createTask`;
  }
  if (entityType === 'Plan') {
    const { planId } = urlParams;
    switch (code) {
      case eventTypes.UN_ASSIGN_PROD_TASK.value:
      case eventTypes.UN_ASSIGN_QC_TASK.value:
        return `/cooperate/plans/prod/${planId}/createTask`;
      default:
        return null;
    }
  }
  if (entityType === 'QcTask') {
    const { planId } = urlParams;
    return `/cooperate/plans/prod/${planId}/createTask`;
  }
  if (category === 311 || category === 312) {
    return getQcTaskDetailUrl(entityCode);
  }
  return null;
};

export default 'dummy';
