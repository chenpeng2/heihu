import React from 'react';
import { FormItem } from 'components';
import _ from 'lodash';

type Props = {
  visible: Boolean,
  workOrders: String,
};

/** 全部计划工单 */
const WorkOrderItem = (props: Props) => {
  const { visible, workOrders } = props;
  if (!visible) return null;

  const style = { wordBreak: 'break-all' };
  return (
    <FormItem label="全部计划工单">
      <div style={style}>{workOrders}</div>
    </FormItem>
  );
};

export default WorkOrderItem;
