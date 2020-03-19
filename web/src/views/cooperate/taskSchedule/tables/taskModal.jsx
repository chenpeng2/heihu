import React from 'react';
import { RestPagingTable, Button, Tooltip, Link } from 'components';
import { closeModal } from 'components/modal';
import { exportXlsxFile } from 'src/utils/exportFile';
import { arrayIsEmpty } from 'utils/array';
import { replaceSign } from 'constants';
import moment from 'utils/time';

import { getWorkOrderDetailPath } from '../utils';

const TaskModal = ({ data, cb }: { data: {}, cb: () => {} }) => {
  data.forEach(e => {
    const { processSeq, processCode, processName } = e;
    if (!arrayIsEmpty(e.subTasks)) {
      e.category = 3;
      e.children = e.subTasks.map(child => ({
        category: 3,
        workOrderDirect: 1,
        ...child,
        processSeq,
        processCode,
        processName,
      }));
      e.planAmount = e.subTasks.map(e => e.planAmount).join(',');
    }
  });

  return (
    <div>
      <div style={{ margin: 20 }}>
        <div style={{ marginBottom: 10 }}>{`以下${data.length}个任务下发失败：`}</div>
        <RestPagingTable
          style={{ margin: 0 }}
          pagination={false}
          dataSource={data}
          columns={[
            {
              title: '任务编号',
              maxWidth: { C: 10 },
              dataIndex: 'taskCode',
              key: 'taskCode',
              render: (taskCode, record) => <Tooltip text={taskCode || replaceSign} length={10} />,
            },
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
              title: '工序',
              maxWidth: { C: 10 },
              dataIndex: 'processName',
              key: 'processName',
              render: (processName, record) =>
                record.processSeq && processName ? `${record.processSeq}/${processName}` : replaceSign,
            },
            {
              title: '产出数量',
              maxWidth: { C: 10 },
              dataIndex: 'planAmount',
              key: 'planAmount',
              render: (planAmount, record) => <Tooltip text={planAmount || replaceSign} length={10} />,
            },
            {
              title: '失败原因',
              maxWidth: { C: 10 },
              dataIndex: 'errorMessage',
              key: 'errorMessage',
              render: (errorMessage, record) => <Tooltip text={errorMessage || replaceSign} length={10} />,
            },
          ]}
        />
        <div />
        <Button
          type="ghost"
          style={{ margin: '30px 0 30px 250px', width: 114 }}
          onClick={() => {
            const headers = ['任务编号', '工单编号', '工序', '产出数量', '失败原因'];
            const content = data.map(e =>
              ['taskCode', 'workOrderCode', 'processName', 'planAmount', 'errorMessage'].map(key => e[key]),
            );
            exportXlsxFile([headers, ...content], `下发失败记录${moment().format('YYYYMMDDHHmmss')}`);
          }}
        >
          下载到本地
        </Button>
        <Button
          style={{ margin: '30px 0 30px 40px', width: 114 }}
          onClick={() => {
            cb();
            closeModal();
          }}
        >
          确定
        </Button>
      </div>
    </div>
  );
};

export default TaskModal;
