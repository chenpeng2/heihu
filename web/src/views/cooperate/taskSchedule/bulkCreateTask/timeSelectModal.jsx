import React, { Component } from 'react';
import { DatePicker, withForm, Button } from 'components';
import moment from 'utils/time';

function range(start, end) {
  const result = [];
  for (let i = start; i < end; i += 1) {
    result.push(i);
  }
  return result;
}

class TimeSelectModal extends Component {
  props: {
    form: {},
    onOk: () => {},
    onCancel: () => {},
  };
  state = {};

  getDisabledTime = current => {
    if (current && current.isSame(moment(), 'day')) {
      return {
        disabledHours: () => range(0, moment().hour() + (moment().minute() ? 1 : 0)),
      };
    }
    return {};
  };

  render() {
    const { onOk, form, onCancel } = this.props;
    const { getFieldDecorator } = form;
    return (
      <div>
        <div style={{ margin: '5px 20px', padding: 30 }}>
          {getFieldDecorator('time', {
            rules: [{ required: true, message: '时间不能为空' }],
          })(
            <DatePicker
              disabledDate={current => {
                return current && current.valueOf() < moment().startOf('day');
              }}
              disabledTime={this.getDisabledTime}
              style={{ width: 300 }}
              showToday={false}
              showTime={{ format: 'HH:mm' }}
              format="YYYY-MM-DD HH:mm"
            />,
          )}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', padding: 20 }}>
          <Button style={{ width: 100 }} type="ghost" onClick={() => onCancel()}>
            取消
          </Button>
          <Button style={{ width: 100, marginLeft: 40 }} onClick={() => onOk(form.getFieldsValue())}>
            确定
          </Button>
        </div>
      </div>
    );
  }
}

export default withForm({}, TimeSelectModal);
