import React from 'react';
import { openModal, SimpleTable, Icon } from 'components';
import { format } from 'utils/time';
import { checkDistributeTasks, checkInjectDistributeTasks } from 'services/schedule';
import { alertYellow } from 'styles/color';

const checkDistributedTask = async props => {
  const { codes, callback, isInject, handleLoading } = props;
  const checkApi = isInject ? checkInjectDistributeTasks : checkDistributeTasks;
  const {
    data: { data },
  } = await checkApi(codes);
  if (data.length === 0) {
    callback();
    return;
  }
  handleLoading(false);
  const columns = [
    { title: '计划生产任务编号', dataIndex: 'taskCode', key: 'taskCode' },
    { title: '工单编号', dataIndex: 'workOrderCode', key: 'workOrderCode' },
    {
      title: '任务计划时间',
      dataIndex: 'startTime',
      key: 'startTime',
      render: (startTime, { endTime }) => `${format(startTime)} - ${format(endTime)}`,
    },
    {
      title: '工单计划时间',
      dataIndex: 'planBeginTime',
      key: 'plan',
      render: (planBeginTime, { planEndTime }) => `${format(planBeginTime)}-${format(planEndTime)}`,

    },
  ];
  openModal({
    title: (
      <p>
        <Icon type="exclamation-circle" style={{ color: alertYellow }} /> 计划时间超出工单计划时间
      </p>
    ),
    children: (
      <div>
        <p style={{ margin: '10px 20px' }}>以下计划生产任务的计划时间超出工单计划时间,请确认是否继续下发?</p>
        <SimpleTable columns={columns} dataSource={data} pagination={false} />
      </div>
    ),
    onOk: () => {
      handleLoading(true);
      callback();
    },
  });
};

export default checkDistributedTask;
