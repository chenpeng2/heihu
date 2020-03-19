import _ from 'lodash';
import { arrayIsEmpty } from 'utils/array';
import { getAuditConfig } from 'containers/plannedTicket/util';
import { newline } from 'utils/string';
import { getWorkOrderCustomProperty } from 'services/cooperate/plannedTicket';

export const GET_IMPORT_TEMPLATE = async () => {
  const { taskAuditConfig, workOrderAuditConfig } = getAuditConfig();
  const res = await getWorkOrderCustomProperty({ size: 1000 });
  const fields = _.get(res, 'data.data');
  const customFields = !arrayIsEmpty(fields) ? fields.map(e => e.name) : [];
  const workOrderAuditTitles = ['计划工单审批人'];
  const taskAuditTitles = [
    '任务审批人类型1（填写用户/用户组）',
    '计划生产任务审批人1（多个用户时，中文顿号分隔）',
    '任务审批人类型2',
    '计划生产任务审批人2',
    '任务审批人类型3',
    '计划生产任务审批人3',
    '任务审批人类型4',
    '计划生产任务审批人4',
    '任务审批人类型5',
    '计划生产任务审批人5',
  ];
  let titles = [
    '父计划工单编号',
    '计划工单类型',
    '计划工单编号',
    '订单编号',
    '产出物料编号',
    '数量',
    '成品批次生成方式',
    '成品批次',
    '父工单工序序号',
    '计划员',
    '生产主管',
    '优先级',
    '计划开始时间（xxxx-xx-xx）',
    '计划结束时间（xxxx-xx-xx）',
  ];
  if (workOrderAuditConfig === 'true') {
    titles = titles.concat(workOrderAuditTitles);
  }
  if (taskAuditConfig === 'true') {
    titles = titles.concat(taskAuditTitles);
  }
  titles = titles.concat(['备注', '工艺路线编号', '物料清单版本号', '生产BOM版本号']);
  titles = titles.concat(customFields);
  return {
    remark: `填写说明${newline}
    计划工单类型：必填，请填写1或2，1代表面向库存，2代表面向销售订单${newline}
    成品批次生成方式：非必填，若填写，请填写1或2，1代表手工输入，2代表按规则生成${newline}
    成品批次：非必填，若成品批次生成方式为1，请填写成品批次；若为2，请填写启用中的成品批次规则名称${newline}
    请勿删除该行，可隐藏`,
    titles,
    name: '计划工单导入模板',
  };
};

export default 'dummy';
