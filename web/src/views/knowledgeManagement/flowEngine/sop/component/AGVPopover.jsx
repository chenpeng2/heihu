import React from 'react';
import { Popover, Icon, SimpleTable } from 'components';
import { primary } from 'styles/color';

const columns = [
  { title: '业务流程', dataIndex: 'flow', key: 'flow' },
  { title: '添加物料方式', dataIndex: 'method', key: 'method' },
  { title: '选择产出控件', dataIndex: 'hold', key: 'hold' },
  { title: '选择终点', dataIndex: 'destination', key: 'destination' },
];
const dataSource = [
  {
    flow: '称量工位的操作工呼叫 AGV 小车过来，把称量产出的物料运送至混合线边仓',
    method: '选择二维码',
    hold: '否',
    destination: '是',
  },
  {
    flow: '称量工位的操作工呼叫 AGV 小车过来，把称量产出的物料运送至中间品仓',
    method: '选择二维码',
    hold: '否',
    destination: '是',
  },
  {
    flow: '混合工位的操作工呼叫 AGV 小车过来，把混合产出的物料运送至中间品仓',
    method: '选择二维码',
    hold: '否',
    destination: '是',
  },
  {
    flow: '制粒工位的操作工呼叫 AGV 小车把制粒需要的投入物料运送过来',
    method: '选择物料数量',
    hold: '否',
    destination: '否',
  },
  {
    flow: '制粒工位的操作工呼叫 AGV 小车过来，把制粒产出的物料经地磅运送至中间品仓',
    method: '选择物料数量',
    hold: '是',
    destination: '是',
  },
  {
    flow: '包装工位的操作工呼叫 AGV 小车把包装需要的投入物料运送过来',
    method: '选择物料数量',
    hold: '否',
    destination: '否',
  },
];

const AGVPopover = ({ style, className }) => {
  return (
    <Popover content={<SimpleTable columns={columns} dataSource={dataSource} pagination={false} />}>
      <Icon type="info-circle" style={{ color: primary, ...style }} className={className} />
    </Popover>
  );
};

export default AGVPopover;
