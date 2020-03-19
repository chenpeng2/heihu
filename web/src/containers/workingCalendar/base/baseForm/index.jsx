import React, { Component } from 'react';
import _ from 'lodash';

import { message, Radio, Form, FormItem, withForm, InputNumber } from 'src/components';
import WorkstationAndAreaSelect from 'src/components/select/workstationAndAreaSelect';
import DatePicker from 'src/components/datePicker/separateDateRangePicker';
import { amountValidator } from 'src/components/form';
import moment from 'src/utils/time';
import { replaceSign } from 'src/constants';
import { queryWorkstation } from 'src/services/workstation';
import DateSelect from './dateSelect';
import WorkingTimeSelect from './workingTimeSelect';
import { AVAILABLE_DATE_TYPE, WORKINGDAY, STATUS_DISPLAY } from '../../constant';

const RadioGroup = Radio.Group;
const INPUT_WIDTH = 400;

type Props = {
  style: {},
  form: any,
  initialValue: any,
  isEditing: false,
};

class BaseForm extends Component {
  props: Props;
  state = {
    hideAvailableDateRange: false,
    disableIsWorkingDay: false,
  };

  componentDidMount() {
    const { initialValue } = this.props;

    if (!initialValue) {
      const _initialValue = {
        availableDate: { type: 1, date: undefined },
      };

      this.setInitialValue(_initialValue);
    } else {
      this.setInitialValue(initialValue);
    }
  }

  componentWillReceiveProps(nextProps) {
    const { initialValue: nowValue } = this.props;
    const { initialValue: nextValue } = nextProps;

    if (nextValue && !_.isEqual(nowValue, nextValue)) {
      console.log(nextValue);
      this.setInitialValue(nextValue);
    }
  }

  setInitialValue = initialValue => {
    const { form } = this.props;
    const setFieldsValue = _.get(form, 'setFieldsValue');

    const { availableDate } = initialValue;

    if (
      availableDate &&
      (AVAILABLE_DATE_TYPE[availableDate.type].type === 'holiday' ||
        AVAILABLE_DATE_TYPE[availableDate.type].type === 'specified')
    ) {
      this.setState({ hideAvailableDateRange: true }, () => {
        setFieldsValue(initialValue);
      });
    } else {
      this.setState({ hideAvailableDateRange: false }, () => {
        setFieldsValue(initialValue);
      });
    }
  };

  getFormValue = async () => {
    const { form } = this.props;
    let _value = null;

    let _workstations = [];
    const productionLineIds = [];
    const workshopIds = [];

    form.validateFieldsAndScroll((errors, value) => {
      if (!errors) {
        _value = value;
        const { workstations } = value;

        workstations.forEach(value => {
          console.log(value);
          const [type, id] = value.value.split('-');
          const TYPE_MAP = {
            WORKSHOP: 'workshopId',
            PRODUCTION_LINE: 'productionLineId',
          };
          if (type === 'WORKSTATION') {
            _workstations.push(id);
          } else if (type === 'WORKSHOP') {
            workshopIds.push(id);
          } else if (type === 'PRODUCTION_LINE') {
            productionLineIds.push(id);
          }
        });
      }
    });
    if (productionLineIds.length || workshopIds.length) {
      const {
        data: { data },
      } = await queryWorkstation({
        productionLineIds: productionLineIds.length ? productionLineIds.join(',') : undefined,
        workshopIds: workshopIds.length ? workshopIds.join(',') : undefined,
        status: 1,
      });
      _workstations = _workstations.concat(data.map(e => e.id));
      if (!_workstations.length) {
        message.error('所选区域或产线下没有工位!');
        return null;
      }
    }

    if (_value) {
      _value.workstations = _workstations;
    }

    return _value;
  };

  render() {
    const { form, isEditing, initialValue } = this.props;
    const { hideAvailableDateRange, disableIsWorkingDay } = this.state;
    const { getFieldDecorator } = form;

    return (
      <Form>
        <FormItem label={'适合工位'}>
          {getFieldDecorator('workstations', {
            rules: [
              {
                required: true,
                message: '工位必选',
              },
            ],
          })(<WorkstationAndAreaSelect treeCheckable style={{ width: INPUT_WIDTH }} />)}
        </FormItem>
        <FormItem label={'适用日期'}>
          {getFieldDecorator('availableDate', {
            rules: [
              {
                required: true,
                message: '日期必选',
              },
              {
                validator: (rule, value, cb) => {
                  const { type, date } = value;
                  // 适用日期必填
                  if (!date && AVAILABLE_DATE_TYPE[type].type !== 'holiday') {
                    cb('适用日期必填');
                  }

                  if (AVAILABLE_DATE_TYPE[type].type === 'specified') {
                    const _arr = date ? date.split(',') : [];

                    // 指定日期需要有格式的判断
                    let formatValid = true;
                    _arr.forEach(value => {
                      // 基本格式
                      const reg = /^[\d]{4}\-[\d]{1,2}-[\d]{1,2}$/;
                      if (!reg.test(value)) formatValid = false;

                      // 日期合法性
                      const res = moment(value).format('YYYY-MM-DD');
                      if (res === 'Invalid date') formatValid = false;
                    });

                    if (!formatValid) {
                      cb('日期格式不合法');
                    }

                    // 日期不可重复的判断
                    let repeatValid = true;
                    _arr.forEach((value, index) => {
                      _arr.forEach((item, anotherIndex) => {
                        if (index !== anotherIndex && value === item) repeatValid = false;
                      });
                    });

                    if (!repeatValid) {
                      cb('日期不可重复');
                    }

                    // 日期存在的判断
                    if (!moment(date, 'YYYY-MM-DD').isValid()) {
                      cb('日期不存在');
                    }
                  }

                  cb();
                },
              },
            ],
            onChange: value => {
              const type = value && value.type;

              if (AVAILABLE_DATE_TYPE[type] && AVAILABLE_DATE_TYPE[type].type === 'specified') {
                this.setState({ hideAvailableDateRange: true, disableIsWorkingDay: false });
                return;
              }

              if (AVAILABLE_DATE_TYPE[type] && AVAILABLE_DATE_TYPE[type].type === 'holiday') {
                this.setState({ disableIsWorkingDay: true, hideAvailableDateRange: true }, () => {
                  form.setFieldsValue({ workingDay: 0 });
                });
                return;
              }

              this.setState({ disableIsWorkingDay: false, hideAvailableDateRange: false });
            },
          })(<DateSelect />)}
        </FormItem>
        {hideAvailableDateRange ? null : (
          <FormItem label={'适用时期范围'}>
            {getFieldDecorator('availableDateRange', {
              rules: [
                {
                  validator: (rule, value, cb) => {
                    const { startTime, endTime } = value || {};

                    if (moment(startTime).isAfter(endTime)) {
                      cb('开始时间不可以晚于结束时间');
                      return;
                    }
                    cb();
                  },
                },
              ],
            })(<DatePicker />)}
          </FormItem>
        )}
        <FormItem label={'是否工作日'}>
          {getFieldDecorator('workingDay', {
            rules: [
              {
                required: true,
                message: '是否工作日必选',
              },
            ],
          })(
            <RadioGroup disabled={disableIsWorkingDay}>
              {Object.entries(WORKINGDAY).map(([value, label]) => {
                return (
                  <Radio style={{ marginRight: 100 }} value={Number(value)}>
                    {label}
                  </Radio>
                );
              })}
            </RadioGroup>,
          )}
        </FormItem>
        {form.getFieldValue('workingDay') === 0 ? null : (
          <FormItem label={'工作时间'}>
            {getFieldDecorator('workingTime', {
              rules: [
                {
                  required: true,
                  message: '工作时间必填',
                },
              ],
            })(<WorkingTimeSelect style={{ width: INPUT_WIDTH }} />)}
          </FormItem>
        )}
        <FormItem label={'优先级'}>
          {getFieldDecorator('priority', {
            rules: [
              {
                required: true,
                message: '优先级必填',
              },
              {
                validator: amountValidator(null, 0, 'integer'),
              },
            ],
          })(<InputNumber style={{ width: INPUT_WIDTH }} />)}
        </FormItem>
        <FormItem label={'状态'}>
          {!isEditing
            ? getFieldDecorator('status', {
                rules: [
                  {
                    required: true,
                    message: '状态必选',
                  },
                ],
              })(
                <RadioGroup>
                  {Object.entries(STATUS_DISPLAY).map(([value, label]) => {
                    return <Radio style={{ marginRight: 100 }} value={Number(value)}>{`${label}中`}</Radio>;
                  })}
                </RadioGroup>,
              )
            : initialValue
            ? `${STATUS_DISPLAY[initialValue.status]}中`
            : replaceSign}
        </FormItem>
      </Form>
    );
  }
}

export default withForm({}, BaseForm);

export const formatValue = value => {
  if (!value) return null;

  const { status, workstations, workingTime, priority, workingDay, availableDate, availableDateRange } = value || {};

  let _availableDateValue = [];

  // 合适日期格式化
  const { type, date } = availableDate || {};
  if (type && AVAILABLE_DATE_TYPE[type] && AVAILABLE_DATE_TYPE[type].type === 'specified') {
    const _arr = date.split(',');
    _availableDateValue = _arr.map(value => moment(value).format('YYYY-MM-DD'));
  }
  if (
    type &&
    AVAILABLE_DATE_TYPE[type] &&
    (AVAILABLE_DATE_TYPE[type].type === 'week' || AVAILABLE_DATE_TYPE[type].type === 'month')
  ) {
    _availableDateValue = date;
  }

  const res = {
    status: Number(status),
    priority: Number(priority),
    workingDay: Number(workingDay),
    workstationIds: workstations,
    operatingHourId: workingTime ? workingTime.key : null,
    availableDateType: availableDate ? Number(type) : null,
    availableDateValue: _availableDateValue,
    startTime: availableDateRange ? Date.parse(availableDateRange.startTime) : null,
    endTime: availableDateRange ? Date.parse(availableDateRange.endTime) : null,
  };

  return res;
};
