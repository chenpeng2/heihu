import React, { Component } from 'react';

import { errorRed, primary, blue } from 'src/styles/color';
import { Badge, Radio } from 'src/components';

const RadioGroup = Radio.Group;
const MyBadge = Badge.MyBadge;

const STATUS_VALUE = {
  applied: JSON.stringify({ status: 1, code: 'applied', statusDisplay: '已申请' }),
  aborted: JSON.stringify({ status: 3, code: 'aborted', statusDisplay: '已取消' }),
  done: JSON.stringify({ status: 2, code: 'done', statusDisplay: '已完成' }),
  created: JSON.stringify({ status: 4, code: 'created', statusDisplay: '新建' }),
};

type Props = {
  type: string,
  value: {},
  status_value: {}
};

class Status_Display extends Component {
  props: Props;
  state = {};

  render() {
    const { value, type, status_value, ...rest } = this.props;
    const { code, statusDisplay } = status_value || {};

    if (type === 'edit') {
      return (
        <RadioGroup defaultValue={value} {...rest}>
          <Radio value={STATUS_VALUE.applied} >已申请</Radio>
          <Radio value={STATUS_VALUE.aborted} >已取消</Radio>
        </RadioGroup>
      );
    }

    if (type === 'update') {
       return (
        <RadioGroup defaultValue={value} {...rest}>
          <Radio value={STATUS_VALUE.applied} >已申请</Radio>
          <Radio value={STATUS_VALUE.done} >已完成</Radio>
        </RadioGroup>
       );
    }

    return <MyBadge color={code === 'applied' ? primary : code === 'created' ? blue : errorRed} text={statusDisplay} {...rest} />;
  }
}

export default Status_Display;
