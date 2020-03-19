import React from 'react';
import { Table, Button, Tooltip, Link } from 'components';
import { closeModal } from 'components/modal';
import { exportXlsxFile } from 'src/utils/exportFile';
import { arrayIsEmpty } from 'utils/array';
import { replaceSign } from 'constants';
import moment, { formatDateTime } from 'utils/time';

import { getWorkOrderDetailPath } from '../../utils';

const TaskModal = ({ data, cb }: { data: {}, cb: () => {} }) => {
  return (
    <div>
      <div style={{ margin: 20 }}>
        <div style={{ marginBottom: 10 }}>模具的使用时间与以后时间冲突，确定保存吗</div>
        <Table
          style={{ margin: 0 }}
          pagination={false}
          dataSource={data}
          columns={[
            {
              title: '工单编号',
              maxWidth: { C: 10 },
              dataIndex: 'workOrderCode',
              key: 'workOrderCode',
              render: (workOrderCode, record) => (
                <Link onClick={() => window.open(getWorkOrderDetailPath(record))}>
                  <Tooltip text={`${workOrderCode || replaceSign}`} length={10} />
                </Link>
              ),
            },
            {
              title: '任务编号',
              maxWidth: { C: 10 },
              dataIndex: 'taskCode',
              key: 'taskCode',
              render: (taskCode, record) => <Tooltip text={taskCode || replaceSign} length={10} />,
            },
            {
              title: '计划时间',
              maxWidth: { C: 10 },
              dataIndex: 'planTime',
              key: 'planTime',
              render: (data, record) => `${formatDateTime(record.startTime)} ～ ${formatDateTime(record.endTime)}`,
            },
          ]}
        />
      </div>
    </div>
  );
};

export default TaskModal;
