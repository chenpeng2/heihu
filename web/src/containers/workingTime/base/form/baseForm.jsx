import React, { Component } from 'react';

import { Input, withForm, Form, FormItem } from 'src/components';
import { specialCharacterValidator, checkStringLength, nullCharacterVerification } from 'src/components/form';
import moment from 'src/utils/time';

import StatusRadio from './statusRadio';
import TimeBucketForm from './timeBucketForm';
import { calcTotalTime } from '../../utils';

type Props = {
  style: {},
  form: {},
};

class BaseForm extends Component {
  props: Props;
  state: {
    totalTime: null,
  };

  getTotalTime = value => {
    if (!value) return;

    const valueAfterFormat = Array.isArray(value)
      ? value.filter(
          item =>
            item &&
            item.startTime &&
            item.startTime.hour &&
            item.startTime.minute &&
            item.endTime &&
            item.endTime.hour &&
            item.endTime.minute,
        )
      : [];
    const { hour, minute } = calcTotalTime(valueAfterFormat) || {};

    this.setState({
      totalTime: typeof hour === 'number' && typeof minute === 'number' ? `${hour}小时${minute}分钟` : null,
    });
  };

  getFormValue = () => {
    const { form } = this.props;

    let _value;

    form.validateFieldsAndScroll((error, value) => {
      if (error) return;
      if (this.timeBucketFormInst.wrappedInstance.validate()) return;
      _value = value;
    });

    return _value;
  };

  render() {
    const { totalTime } = this.state || {};
    const { form } = this.props;

    const { getFieldDecorator } = form || {};

    return (
      <div>
        <Form>
          <FormItem label={'名称'}>
            {getFieldDecorator('name', {
              rules: [
                {
                  required: true,
                  message: '名称必填',
                },
                {
                  validator: specialCharacterValidator('名称'),
                },
                {
                  validator: checkStringLength(10),
                },
                {
                  validator: nullCharacterVerification('名称'),
                },
              ],
            })(<Input style={{ width: 300 }} />)}
          </FormItem>
          <FormItem label={'状态'}>
            {getFieldDecorator('status', {
              rules: [
                {
                  required: true,
                  message: '状态必选',
                },
              ],
              initialValue: 1,
            })(<StatusRadio />)}
          </FormItem>
          <FormItem label={'时间段'}>
            {getFieldDecorator('timeBucket', {
              rules: [
                {
                  validator: (rule, value, cb) => {
                    if (!value) cb();

                    const formatValue = value;

                    // 检测是否填值
                    if (!formatValue || !Array.isArray(formatValue) || !formatValue.length) cb('时间段必填');

                    // 检测是否按照序号填值
                    const valueAfterSeq = formatValue.sort((a, b) => {
                      return a.seq - b.seq;
                    });

                    valueAfterSeq.forEach((item, index) => {
                      if (
                        index > 0 &&
                        item.startTime &&
                        item.startTime.hour &&
                        item.startTime.minute &&
                        valueAfterSeq[index - 1].endTime &&
                        valueAfterSeq[index - 1].endTime.hour &&
                        valueAfterSeq[index - 1].endTime.minute &&
                        moment(item.startTime).isSameOrBefore(valueAfterSeq[index - 1].endTime)
                      ) {
                        cb('请按照时间顺序依次填写时间段');
                      }
                    });

                    cb();
                  },
                },
              ],
              onChange: value => {
                this.getTotalTime(value);
              },
              initialValue: [
                { startTime: { hour: null, minute: null }, endTime: { hour: null, minute: null }, seq: 1 },
              ],
            })(
              <TimeBucketForm wrappedComponentRef={inst => (this.timeBucketFormInst = inst)} style={{ width: 700 }} />,
            )}
          </FormItem>
          <FormItem label={'总时长'}>
            <div>{totalTime}</div>
          </FormItem>
        </Form>
      </div>
    );
  }
}

export default withForm({}, BaseForm);
