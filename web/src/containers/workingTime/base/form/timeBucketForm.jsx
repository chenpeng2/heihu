import React, { Component } from 'react';
import _ from 'lodash';

import { withForm, Table, Button, Icon, FormItem } from 'src/components';
import { primary } from 'src/styles/color';
import { replaceSign } from 'src/constants';
import moment from 'src/utils/time';

import { getTotalTime } from '../../utils';
import TimePicker from './timePicker';

// 用于format这个form传出的数据,传出的数据中存在null值
export const formatValueWithEmptyTime = value => {
  if (!value) return null;

  const res = [];
  const { keys } = value || {};

  if (Array.isArray(keys)) {
    keys.forEach((key, index) => {
      const startTime = value[`startTime_${key}`];
      const endTime = value[`endTime_${key}`];

      res.push({
        startTime: {
          hour: startTime && startTime.hour ? startTime.hour : null,
          minute: startTime && startTime.minute ? startTime.minute : null,
        },
        endTime: {
          hour: endTime && endTime.hour ? endTime.hour : null,
          minute: endTime && endTime.minute ? endTime.minute : null,
        },
        seq: index + 1,
      });
    });
  }

  return res;
};

let uuid = 0;

type Props = {
  style: {},
  form: {
    setFieldsValue: () => {},
    setFieldsInitialValue: () => {},
    validateFieldsAndScroll: () => {},
  },
  value: [],
};

class TimeBucketForm extends Component {
  props: Props;
  state = {};

  componentDidMount() {
    this.setFormValue(this.props.value);
  }

  // componentWillReceiveProps(nextProps) {
  //   const { value: valueNow } = this.props;
  //   const { value: valueNext } = nextProps;
  //   if (!_.isEqual(valueNext, valueNow)) {
  //     this.setFormValue(valueNext);
  //   }
  // }

  setFormValue = values => {
    const _keys = [];
    const _value = {};

    values.forEach(item => {
      const { startTime, endTime, seq } = item;
      _keys.push(seq);
      _value[`startTime_${seq}`] = startTime;
      _value[`endTime_${seq}`] = endTime;
    });
    _value.keys = _keys;

    uuid = _keys.reduce((preValue, curValue) => { return preValue > curValue ? preValue : curValue; }) + 1;

    this.setState(_value, () => {
      this.props.form.setFieldsValue(_value);
    });
  };

  addItem = () => {
    const { form } = this.props;

    const keys = form.getFieldValue('keys') || [];
    const nextKeys = keys.concat(uuid);

    uuid += 1;

    form.setFieldsValue({
      keys: nextKeys,
    });
  };

  removeItem = k => {
    const { form } = this.props;

    const keys = form.getFieldValue('keys');
    // if (keys.length === 1) {
    //   return;
    // }

    form.setFieldsValue({
      keys: keys.filter(key => key !== k),
    });
  };

  // 获取序号
  getSeq = key => {
    // 找到当前key的index并且加一就是序号
    const { form } = this.props;

    const { getFieldValue } = form;
    const keys = getFieldValue('keys');

    if (!Array.isArray(keys)) return 0;
    const index =
      keys.findIndex(item => {
        return item === key;
      }) || 0;

    return Number(index) + 1;
  };

  // 判断是否可以删除
  getDeleteOperationAuth = () => {
    // 找到当前key的index并且加一就是序号
    const { form } = this.props;

    const { getFieldValue } = form;
    const keys = getFieldValue('keys');

    if (Array.isArray(keys) && keys.length > 1) return true;
    return false;
  };

  getColumns = () => {
    const { form } = this.props;

    const { getFieldDecorator, validateFields } = form;

    return [
      {
        title: '',
        key: 'operation',
        render: (_, key) => {
          // 只有一个选项不可以删除
          // if (!this.getDeleteOperationAuth()) return;

          return (
            <Icon
              type={'minus-circle'}
              onClick={() => {
                this.removeItem(key);
              }}
            />
          );
        },
      },
      {
        title: '序号',
        key: 'seq',
        render: (_, key) => {
          return this.getSeq(key) || replaceSign;
        },
      },
      {
        title: '开始时间',
        key: 'startTime',
        render: (_, key) => {
          return (
            <div>
              <FormItem>
                {getFieldDecorator(`startTime_${key}`, {
                  rules: [
                    {
                      validator: (rule, value, cb) => {
                        if (!value || !value.hour || !value.minute) {
                          cb('开始时间必填');
                        }

                        if (moment(value).isSameOrAfter(this.state[`endTime_${key}`])) {
                          cb('结束时间不能早于或等于开始时间');
                        }

                        cb();
                      },
                    },
                  ],
                  onChange: value => {
                    this.setState({ [`startTime_${key}`]: value }, () => {
                      validateFields([`endTime_${key}`], { force: true });
                    });
                  },
                })(<TimePicker format={'HH:mm'} minuteStep={15} />)}
              </FormItem>
            </div>
          );
        },
      },
      {
        title: '结束时间',
        key: 'endTime',
        render: (_, key) => {
          return (
            <div>
              <FormItem>
                {getFieldDecorator(`endTime_${key}`, {
                  rules: [
                    {
                      validator: (rule, value, cb) => {
                        if (!value || !value.hour || !value.minute) {
                          cb('结束时间必填');
                        }

                        if (moment(value).isSameOrBefore(this.state[`startTime_${key}`])) {
                          cb('结束时间不能早于或等于开始时间');
                        }

                        cb();
                      },
                    },
                  ],
                  onChange: value => {
                    this.setState({ [`endTime_${key}`]: value }, () => {
                      validateFields([`startTime_${key}`], { force: true });
                    });
                  },
                })(<TimePicker format={'HH:mm'} minuteStep={15} />)}
              </FormItem>
            </div>
          );
        },
      },
      {
        title: '时长',
        key: 'totalTime',
        render: (_, key) => {
          const startTime = form.getFieldValue(`startTime_${key}`);
          const endTime = form.getFieldValue(`endTime_${key}`);

          let totalTime = 0;
          if (startTime && endTime && startTime.hour && startTime.minute && endTime.hour && endTime.minute) {
            totalTime = getTotalTime([
              {
                startTime: startTime ? `${startTime.hour}:${startTime.minute}` : null,
                endTime: endTime ? `${endTime.hour}:${endTime.minute}` : null,
              },
            ]);
          }

          return totalTime;
        },
      },
    ];
  };

  validate = () => {
    let error = null;
    this.props.form.validateFieldsAndScroll((errors, value) => {
      if (errors) {
        error = errors;
        return;
      }
      const formatValue = formatValueWithEmptyTime(value);

      // 检测是否填值
      if (!formatValue || !Array.isArray(formatValue) || !formatValue.length) error = new Error('时间段必填');

      // 检测开始结束时间是否填值
      formatValue.forEach(item => {
        if (!item.startTime.hour || !item.startTime.minute) {
          error = new Error('开始时间必填');
        }
        if (!item.endTime.hour || !item.endTime.minute) {
          error = new Error('结束时间必填');
        }
      });

      // 检测结束时间是否早于开始时间
      formatValue.forEach(item => {
        if (moment(item.startTime).isSameOrAfter(item.endTime)) {
          error = new Error('结束时间不能早于或等于开始时间');
        }
      });

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
          error = new Error('请按照时间顺序依次填写时间段');
        }
      });
    });

    return error;
  };

  renderTableFooter = () => {
    return (
      <Button
        icon={'plus-circle-o'}
        type={'default'}
        onClick={this.addItem}
        style={{ border: 'none', color: primary, padding: 0 }}
      >
        增加时间段
      </Button>
    );
  };

  render() {
    const { form, style } = this.props;

    const { getFieldValue } = form;

    const keys = getFieldValue('keys');
    const columns = this.getColumns();

    return (
      <Table
        style={{ margin: 0, ...style }}
        pagination={false}
        columns={columns}
        dataSource={keys || []}
        footer={this.renderTableFooter}
      />
    );
  }
}

export default withForm(
  {
    onValuesChange: (props, value, allValue) => {
      props.onChange(formatValueWithEmptyTime(allValue));
    },
  },
  TimeBucketForm,
);
