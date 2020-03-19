import React, { Component } from 'react';
import { Icon, DetailPageHeader, Row, Col, Button } from 'components';
import { formatUnix } from 'utils/time';

const AntRow = Row.AntRow;
const AntCol = Col.AntCol;

class ConflictAlert extends Component {
  props: {
    task: {},
    onCancel: () => {},
    onOk: () => {},
  };

  state = {};

  render() {
    const { task, onCancel, onOk } = this.props;
    console.log(this.props);
    console.log(task);
    const { projectCode, processCode, processName, taskCode, amountProductPlanned, startTimePlanned, endTimePlanned, workstation } = task;
    const configs = [
      {
        key: '项目编号',
        value: projectCode,
      },
      {
        key: '工序',
        value: `${processCode}/${processName}`,
      },
      {
        key: '任务编号',
        value: taskCode,
      },
      {
        key: '计划产出物料',
        value: `${processCode}/${processName}`,
      },
      {
        key: '计划产出数量',
        value: amountProductPlanned,
      },
      {
        key: '工位',
        value: workstation.name,
      },
      {
        key: '计划时间',
        value: `${formatUnix(startTimePlanned)}-${formatUnix(endTimePlanned)}`,
      },
    ];
    return (
      <div>
        <DetailPageHeader
          icon={<Icon type="exclamation-circle" size={36} style={{ color: '#F5222D', marginRight: 20 }} />}
          style={{ padding: '20px 0 20px 0' }}
          title={<div>冲突提示！</div>}
          subtitle={<div style={{ color: '#5A5A5A' }}>与以下任务有冲突，是否插入至该任务前？</div>}
        />
        <div style={{ margin: '0 40px', padding: 20, backgroundColor: 'rgba(232, 232, 232, 0.2)', border: '1px solid #E8E8E8' }}>
          <AntRow gutter={24}>
            {configs.map(({ key, value }) => (
              <div key={key} style={{ fontSize: 14, color: 'black' }}>
                <AntCol span={8} style={{ textAlign: 'right' }}>
                  {key}
                </AntCol>
                <AntCol offset={1} span={14}>
                  {value}
                </AntCol>
              </div>
            ))}
          </AntRow>
        </div>
        <div style={{ padding: '30px 115px 40px' }}>
          <Button type="ghost" style={{ marginRight: 30 }} onClick={onCancel}>
            不插入，手动选择时间
          </Button>
          <Button onClick={onOk}>插入该任务前面</Button>
        </div>
      </div>
    );
  }
}

export default ConflictAlert;
