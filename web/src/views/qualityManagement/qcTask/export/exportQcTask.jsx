import React from 'react';
import _ from 'lodash';
import { Button, message } from 'src/components';
import { exportXlsxFile } from 'src/utils/exportFile';
import { getQuery } from 'src/routes/getRouteParams';
import { formatDateTime } from 'src/utils/time';
import { showLoading } from 'src/utils/loading';
import { queryQcTaskList } from 'src/services/qualityManagement/qcTask';
import { CHECK_TYPE } from 'src/views/qualityManagement/constants';
import { replaceSign } from 'src/constants';
import { getDefect, formatData } from '../utils';
import { qcTaskStatusMap } from '../../constants';

type Props = {
  match: any,
  form: any,
  total: Number,
  loading: Boolean,
};

const ImportQcTask = (props: Props) => {
  const { total, match, form, loading } = props;

  const formatExportData = data => {
    const _data =
      data &&
      data.map(x => {
        const {
          code,
          material,
          status,
          checkType,
          createdAt,
          startTime,
          endTime,
          operatorName,
          workstation,
          task,
          checkCount, // 样品数量
          sampleDefectCount, // 抽样不合格数
          sampleDefectRate, // 抽样不合格率
          qcTotal, // 总数
          checkDefectCount, // 总不合格数
          checkDefectRate, // 总不合格率
          purchaseOrderCode,
        } = x;

        return {
          code,
          materialCode: material ? material.code : replaceSign,
          materialName: material ? material.name : replaceSign,
          status: typeof status === 'number' ? qcTaskStatusMap[status] : replaceSign,
          checkType: typeof checkType === 'number' ? CHECK_TYPE[checkType] : replaceSign,
          createdAt: createdAt ? formatDateTime(createdAt) : replaceSign,
          startTime: startTime ? formatDateTime(startTime) : replaceSign,
          endTime: endTime ? formatDateTime(endTime) : replaceSign,
          operatorName: operatorName || replaceSign,
          workstation: workstation ? workstation.name : replaceSign,
          processCode: task ? task.processCode : replaceSign,
          processName: task ? task.processName : replaceSign,
          checkCount: status !== 0 && typeof checkCount === 'number' ? checkCount : replaceSign,
          sampleDefectCount: status !== 0 && typeof sampleDefectCount === 'number' ? sampleDefectCount : replaceSign,
          sampleDefectRate: status !== 0 ? getDefect(sampleDefectRate) : replaceSign,
          qcTotal: status === 2 && typeof qcTotal === 'number' ? qcTotal : replaceSign,
          checkDefectCount: status === 2 && typeof checkDefectCount === 'number' ? checkDefectCount : replaceSign,
          checkDefectRate: status === 2 ? getDefect(checkDefectRate) : replaceSign,
          purchaseOrderCode: purchaseOrderCode || replaceSign,
          projectCode: task ? task.projectCode : replaceSign,
        };
      });

    return _data.map(x => Object.values(x));
  };

  const dataExport = async () => {
    const taskEndTime = form.getFieldValue('taskEndTime');
    if (!taskEndTime || _.isEmpty(taskEndTime)) {
      message.error('最多可以导出31天的质检数据，根据质检任务结束时间计算，请先选择质检任务结束时间。');
      return;
    }
    const one_day = 1000 * 60 * 60 * 24;
    const endTimeFrom = taskEndTime[0];
    const endTimeTill = taskEndTime[1];
    const timeRange = (endTimeTill - endTimeFrom) / one_day + 1;
    if (timeRange > 31) {
      message.error('最多可以导出31天的质检数据，根据质检任务结束时间计算，请重新选择质检任务结束时间。');
      return;
    }
    const query = formatData(getQuery(match));
    const headers = [
      '任务编号',
      '物料编码',
      '物料名称',
      '任务状态',
      '类型',
      '创建时间',
      '实际开始时间',
      '实际结束时间',
      '执行人',
      '执行工位/仓位',
      '工序编号',
      '工序名称',
      '样品数量',
      '样品不合格数',
      '抽样不合格率',
      '总数',
      '总不合格数',
      '总数不合格率',
      '订单号',
      '项目号',
    ];
    const times = Math.ceil(total / 20); // 循环次数
    showLoading(true);
    let exportData = [];
    for (let i = 0; i < times; i += 1) {
      const {
        data: { data },
      } = await queryQcTaskList({ ...query, page: 1 + i, size: 20 });
      exportData = exportData.concat(data);
    }
    showLoading(false);
    exportXlsxFile([headers, ...formatExportData(exportData)], '质检任务');
  };

  return (
    <Button icon="upload" disabled={total === 0 || loading} onClick={dataExport}>
      数据导出
    </Button>
  );
};

export default ImportQcTask;
