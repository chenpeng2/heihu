import React, { Component } from 'react';
import _ from 'lodash';
import { message, withForm, Form, Popover, Icon, FormItem, DatePicker, Select, Radio, Button } from 'components';
import { amountValidator } from 'components/form';
import moment, { formatToUnix } from 'utils/time';
import { rescheduleTasks } from 'src/services/schedule';

const Option = Select.Option;
const RadioGroup = Radio.Group;

type Props = {
  form: {
    validateFields: () => {},
  },
  workstation: {},
  onSuccess: () => {},
  onCancel: () => {},
};

const baseFormItemStyle = { width: 370 };
const titleStyle = { fontSize: '14px', color: '#000' };
const contentStyle = { fontSize: '12px', color: 'rgba(0, 0, 0, 0.6)' };

class CapacityModal extends Component<Props> {
  state = {
    baseTime: moment()
      .hour(moment().hour() + 1)
      .minutes(0)
      .second(0),
  };

  submit = () => {
    this.props.form.validateFields({ force: true }, async (err, values) => {
      if (err) {
        return;
      }
      const { workstation, onCancel, onSuccess } = this.props;
      const { baseTime, ...rest } = values;
      const submitValues = {
        workstationId: workstation.id,
        baseTime: formatToUnix(baseTime),
        ...rest,
      };
      this.setState({ submiting: true });
      const { data } = await rescheduleTasks(submitValues).finally(e => {
        this.setState({ submiting: false });
      });
      message.success('优化成功');
      if (onSuccess) {
        onSuccess();
      }
      onCancel();
    });
  };

  render() {
    const { form, onCancel } = this.props;
    const { getFieldDecorator } = form;
    getFieldDecorator('processStrategy', {
      initialValue: 1,
    });

    return (
      <React.Fragment>
        <Form>
          <FormItem label="基准时间">
            {getFieldDecorator('baseTime', {
              rules: [{ required: true, message: '时间不能为空' }],
              initialValue: this.state.baseTime,
            })(
              <DatePicker
                disabledDate={current => {
                  return current && current.valueOf() < moment().startOf('day');
                }}
                style={baseFormItemStyle}
                disabledTime={this.getDisabledTime}
                showToday={false}
                showTime={{ format: 'HH:mm' }}
                format="YYYY-MM-DD HH:mm"
              />,
            )}
          </FormItem>
          <FormItem label={'工序排序方案'}>最小换型时间</FormItem>
          <FormItem label={'是否锁定'}>
            {getFieldDecorator('locked', {
              initialValue: false,
            })(
              <RadioGroup style={baseFormItemStyle}>
                <Radio value style={{ marginRight: 100 }}>
                  是
                </Radio>
                <Radio value={false}>否</Radio>
              </RadioGroup>,
            )}
          </FormItem>
          <FormItem label={'优化标准'}>
            {getFieldDecorator('workstationStrategy', {
              initialValue: 1,
            })(
              <Select>
                <Option value={1}>按动态准备时间</Option>
                <Option value={2}>按换模时间</Option>
              </Select>,
            )}
          </FormItem>
        </Form>
        <div style={{ marginLeft: 183, position: 'absolute', bottom: 30 }}>
          <Button type="default" style={{ width: 114 }} onClick={onCancel}>
            取消
          </Button>
          <Button disabled={this.state.submiting} style={{ width: 114, marginLeft: 60 }} onClick={this.submit}>
            保存
          </Button>
        </div>
      </React.Fragment>
    );
  }
}

export default withForm({}, CapacityModal);
