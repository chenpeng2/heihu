import React, { Fragment } from 'react';
import _ from 'lodash';
import BigJs from 'big.js';

import {
  Radio,
  Icon,
  openModal,
  message,
  Input,
  Select,
  DatePicker,
  Popover,
  Form,
  FormItem,
  Button,
  InputNumber,
} from 'components';
import { closeModal } from 'components/modal';
import SearchSelect from 'src/components/select/searchSelect';
import { amountValidator } from 'components/form';
import moment, { formatToUnix, diff, formatUnixMoment, formatUnix } from 'utils/time';
import WorkstationAndAreaSelect from 'src/components/select/workstationAndAreaSelect';
import {
  queryInjectWorkOrderDetail,
  createInjectTask,
  updateInjectTask,
  queryInjectTimeSlot,
  checkMouldUnit,
} from 'src/services/schedule';
import UserOrUserGroupSelect from 'src/containers/user/userOrUserGroupSelect';
import { arrayIsEmpty } from 'utils/array';
import {
  saveScheduleTaskWorkerType,
  saveScheduleTaskWorkingTimeUnit,
  getScheduleWorkingTimeUnit,
} from 'src/containers/project/utils';
import { START_WHEN_PRE_PROCESS_STOP, START_WHEN_PRE_PROCESS_START } from 'containers/mBom/base/constant';
import { replaceSign } from 'constants';
import SubWorkOrderTable from './subWorkOrderTable';
import ConflictModal from './conflictModal';

const RadioGroup = Radio.Group;
const Option = Select.Option;
const hintStyle = {
  marginLeft: 138,
  color: 'rgba(0, 0, 0, 0.4)',
  marginTop: -10,
};
const width = 370;

function range(start, end) {
  const result = [];
  for (let i = start; i < end; i += 1) {
    result.push(i);
  }
  return result;
}

type propsType = {
  router: any,
  form: any,
  projectCode: String,
  processCode: String,
  workOrderCode: String,
  outputMaterialCode: String,
  processSeq: String,
  startTime: Date,
  endTime: Date,
  workstation: String,
  type: String,
  id: String,
  isModal: boolean,
};

class BaseForm extends React.Component<propsType> {
  state = {
    inputMaterials: null,
    outputMaterial: null,
    workstations: [],
    mouldUnits: [],
    amountProductPlanned: 0,
  };

  async componentDidMount() {
    await this.fetchData();
  }

  getDisabledTime = current => {
    if (current && current.isSame(moment(), 'day')) {
      return {
        disabledHours: () => range(0, moment().hour() + (moment().minute() ? 1 : 0)),
      };
    }
    return {};
  };

  getFormValue = () => {
    let res;
    this.props.form.validateFields({ force: true }, async (err, values) => {
      if (err) {
        return;
      }
      res = _.cloneDeep(values);
    });
    return res;
  };

  fetchData = async () => {
    const {
      form: { getFieldValue, setFieldsValue },
      startTime,
      endTime,
      workstation: dropWorkstation,
      processSeq,
      task,
      workOrderCode,
      form,
      initialValue,
    } = this.props;
    // if (workstation) {
    //   setFieldsValue({ workStationId: { label: workstation.name, key: `WORKSTATION-${workstation.id}` } });
    // }
    const {
      data: { data },
    } = await queryInjectWorkOrderDetail({ code: workOrderCode });
    const { mouldUnits = [], workstations, children } = data;
    if (task) {
      const {
        workOrderCode,
        workstationId,
        workstationName,
        subTasks,
        startTime: startTimePlanned,
        endTime: endTimePlanned,
        executors: operators,
        timeUnit: workingTimeUnit,
        mouldUnit,
      } = task;
      const _startTime = startTime || startTimePlanned;
      const _endTime = endTime || endTimePlanned;
      form.setFieldsValue({
        amounts: subTasks.map(e => ({
          planAmount: e.amount,
          workOrderCode: e.workOrderCode,
        })),
        mouldUnit,
        workOrderCode,
        locked: status === 'LOCKED',
        workstationId: dropWorkstation
          ? { value: `WORKSTATION-${dropWorkstation.id}`, labe: dropWorkstation.name }
          : { value: `WORKSTATION-${workstationId}`, label: workstationName },
        startTimePlanned: _startTime && formatUnixMoment(_startTime),
        endTimePlanned: _endTime && formatUnixMoment(_endTime),
        operatorType: !arrayIsEmpty(operators) ? 'user' : 'userGroup',
        operatorIds: !arrayIsEmpty(operators) ? operators.map(e => ({ label: e.name, key: e.id })) : undefined,
        workingTimeUnit,
      });
      this.setState({
        selectedMouldUnit: Array.isArray(mouldUnits) && mouldUnits.find(e => e.id === _.get(mouldUnit, 'id')),
        mouldUnits,
        data: data.children.map((e, index) => ({
          ...task.subTasks[index],
          ...e,
        })),
      });
      await this.fetchTimeSlotAndSetState({
        workingTimeUnit,
        startTimePlanned: _startTime,
        endTimePlanned: _endTime,
        workstationId,
        mouldUnit,
      });
    } else {
      this.setState({ data: children, mouldUnits });
    }
    // const {
    //   defaultTimeSlot: {
    //     amount,
    //     // workstationId,
    //     workingTime,
    //     startTime: _startTime,
    //     productionTime,
    //     endTime: _endTime,
    //     conflict,
    //     availableTime,
    //   },
    // } = data;
    // const amountNotPlanned = amount;
    // const suggestWorkstation = data.workstations && data.workstations.find(e => e.id === workstationId);
    // setTimeout(() => {
    //   setFieldsValue({
    //     amountProductPlanned: amountNotPlanned || null,
    //   });
    // });
    // const workingTimeUnit = getScheduleWorkingTimeUnit() || getFieldValue('workingTimeUnit');
    const value = {
      ...initialValue,
      workOrderCode,
      // process: { label: `${data.processCode}/${data.processName}`, key: data.processSeq },
      // workstationId: {
      //   value: `WORKSTATION-${workstationId}`,
      //   label: suggestWorkstation ? suggestWorkstation.name : '',
      // },
      // startTimePlanned: formatUnixMoment(_startTime),
      // endTimePlanned: _endTime && formatUnixMoment(_endTime),
      // workingTime: undefined,
      // workingTimeUnit,
    };
    // if (workingTime) {
    //   if (workingTimeUnit === 'h') {
    //     value.workingTime = new BigJs(workingTime)
    //       .div(60 * 60 * 1000)
    //       .round(6)
    //       .valueOf();
    //   } else if (workingTimeUnit === 'd') {
    //     value.workingTime = new BigJs(workingTime)
    //       .div(24 * 60 * 60 * 1000)
    //       .round(6)
    //       .valueOf();
    //   } else {
    //     value.workingTime = new BigJs(workingTime)
    //       .div(60 * 1000)
    //       .round(6)
    //       .valueOf();
    //   }
    // }
    setFieldsValue(value);
    // const { startTimeConflicts, endTimeConflicts } = this.formatConflicts(conflict);
    this.setState({
      //   availableTime,
      //   amountNotPlanned,
      //   workingTime,
      //   productionTime,
      //   startTimeConflicts,
      //   endTimeConflicts,
      workstations,
    });
  };

  fetchTimeSlotAndSetState = async ({
    workingTime: _workingTime,
    workingTimeUnit,
    startTimePlanned,
    workstationId,
    endTimePlanned,
    mouldUnit,
  }) => {
    const { workOrderCode, processSeq, form } = this.props;
    const { workstations } = this.state;
    // 没有工位 表示获取推荐工位
    if (startTimePlanned && (endTimePlanned || _workingTime) && workstationId) {
      let time;
      if (_workingTime) {
        if (workingTimeUnit === 'h') {
          time = _workingTime * 60 * 60 * 1000;
        } else if (workingTimeUnit === 'd') {
          time = _workingTime * 24 * 60 * 60 * 1000;
        } else {
          time = _workingTime * 60 * 1000;
        }
      }
      const {
        data: { data },
      } = await queryInjectTimeSlot({
        code: workOrderCode,
        body: {
          startTime: startTimePlanned && formatToUnix(startTimePlanned),
          workingTime: time,
          endTime: endTimePlanned && formatToUnix(endTimePlanned),
          workstationId,
          mouldUnit: mouldUnit && mouldUnit.id ? mouldUnit : undefined,
        },
      });
      const {
        startTime,
        endTime,
        workingTime,
        productionTime,
        conflict,
        availableTime,
        workstationId: suggestWorkstationId,
      } = data;
      const suggestWorkstation = workstations && workstations.find(e => e.id === suggestWorkstationId);
      const value = {
        startTimePlanned: startTime && formatUnixMoment(startTime),
        endTimePlanned: endTime && formatUnixMoment(endTime),
        workingTime: undefined,
      };
      if (workingTime) {
        if (form.getFieldValue('workingTimeUnit') === 'h') {
          value.workingTime = new BigJs(workingTime)
            .div(60 * 60 * 1000)
            .round(6)
            .valueOf();
        } else if (form.getFieldValue('workingTimeUnit') === 'd') {
          value.workingTime = new BigJs(workingTime)
            .div(24 * 60 * 60 * 1000)
            .round(6)
            .valueOf();
        } else {
          value.workingTime = new BigJs(workingTime)
            .div(60 * 1000)
            .round(6)
            .valueOf();
        }
      }
      if (suggestWorkstation) {
        value.workstationId = {
          value: `WORKSTATION-${suggestWorkstation.id}`,
          label: suggestWorkstation.name,
        };
      }
      const { startTimeConflicts, endTimeConflicts } = this.formatConflicts(conflict);
      setTimeout(() => form.setFieldsValue(value));
      this.setState({ workingTime, productionTime, startTimeConflicts, endTimeConflicts, availableTime });
    } else {
      this.setState({ workingTime: undefined, productionTime: undefined });
    }
  };

  formatConflicts = conflict => {
    return {
      startTimeConflicts: conflict.filter(
        e => e.conflict === 'PRE_PROCESS_CONFLICTED' || e.conflict === 'START_TIME_CONFLICTED',
      ),
      endTimeConflicts: conflict.filter(
        e =>
          e.conflict === 'SCHEDULE_CONFLICTED' ||
          e.conflict === 'POST_PROCESS_CONFLICTED' ||
          e.conflict === 'END_TIME_CONFLICTED',
      ),
    };
  };

  submitData = async submitValue => {
    const { onSuccess, workOrderCode } = this.props;
    this.setState({ submiting: true });
    if (this.props.edit) {
      const { data: res } = await updateInjectTask({ taskCode: this.props.task.taskCode, ...submitValue }).finally(
        e => {
          this.setState({ submiting: false });
        },
      );
      message.success('编辑任务成功');
      if (typeof onSuccess === 'function') {
        onSuccess(res);
        closeModal();
      } else {
        closeModal();
      }
    } else {
      const { data: res } = await createInjectTask({ workOrderCode, ...submitValue }).finally(e => {
        this.setState({ submiting: false });
      });
      message.success('创建任务成功');
      if (typeof onSuccess === 'function') {
        onSuccess(res);
        closeModal();
      } else {
        closeModal();
      }
    }
  };

  submit = async () => {
    this.props.form.validateFields({ force: true }, async (err, values) => {
      if (err) {
        return;
      }
      const { processCode, processSeq, onSuccess, workOrderCode } = this.props;
      const { data } = this.state;
      const category = _.get(data, 'category');
      const {
        startTimePlanned,
        endTimePlanned,
        amounts,
        workstationId,
        locked,
        operatorIds,
        operatorGroupId,
        workingTime,
        workingTimeUnit,
        mouldUnit,
        sourceWarehouseCode,
      } = values;
      const submitValue = {
        workstationId: workstationId && workstationId.value.split('-')[1],
        amounts: amounts.map(e => ({
          ...e,
          planAmount: parseFloat(e.planAmount.toFixed(6)),
        })),
        locked,
        mouldUnit: mouldUnit && mouldUnit.id ? mouldUnit : undefined,
        operatorGroupId: operatorGroupId ? operatorGroupId.key : null,
        executorIds: Array.isArray(operatorIds) ? operatorIds.map(i => i && i.key) : null,
        sourceWarehouseCode: sourceWarehouseCode && sourceWarehouseCode.key,
      };
      if (workingTimeUnit === 'h') {
        submitValue.workingTime = new BigJs(workingTime).times(60 * 60 * 1000).valueOf();
      } else if (workingTimeUnit === 'm') {
        submitValue.workingTime = new BigJs(workingTime).times(60 * 1000).valueOf();
      } else if (workingTimeUnit === 'd') {
        submitValue.workingTime = new BigJs(workingTime).times(24 * 60 * 60 * 1000).valueOf();
      }
      submitValue.planBeginTime = formatToUnix(startTimePlanned.set({ second: 0, millisecond: 0 }));
      submitValue.planEndTime = formatToUnix(endTimePlanned.set({ second: 0, millisecond: 0 }));
      submitValue.timeUnit = workingTimeUnit;
      // 将执行人类型的选择保存在本地
      saveScheduleTaskWorkingTimeUnit(workingTimeUnit);

      if (mouldUnit && mouldUnit.id) {
        const {
          data: { data },
        } = await checkMouldUnit({
          id: mouldUnit.id,
          startTime: submitValue.planBeginTime,
          endTime: submitValue.planEndTime,
          taskCode: this.props.edit ? this.props.task.taskCode : undefined,
        });
        if (data && data.conflict === 'MOULD_UNIT_CONFLICTED') {
          openModal({
            children: <ConflictModal data={data.detail} />,
            onOk: () => this.submitData(submitValue),
          });
          return;
        }
      }
      this.submitData(submitValue);
    });
  };

  handleMouldUnitChange = async mouldUnit => {
    const {
      form: { getFieldValue },
    } = this.props;
    const { value: workstation } = getFieldValue('workstationId') || {};
    const [type, workstationId] = (workstation || '').split('-');
    const startTimePlanned = getFieldValue('startTimePlanned');
    // const endTimePlanned = getFieldValue('endTimePlanned');
    const workingTime = getFieldValue('workingTime');
    const workingTimeUnit = getFieldValue('workingTimeUnit');
    await this.fetchTimeSlotAndSetState({
      workstationId,
      startTimePlanned,
      workingTime,
      workingTimeUnit,
      mouldUnit,
    });
  };

  render() {
    const { form, type, onCancel, footer } = this.props;
    const { getFieldDecorator, getFieldValue, setFieldsValue } = form;
    const {
      productionTime,
      startTimeConflicts,
      endTimeConflicts,
      workstations,
      data,
      mouldUnits,
      selectedMouldUnit,
    } = this.state;

    const workOrderMaterialRequested = _.get(data, 'workOrderMaterialRequested');

    return (
      <React.Fragment>
        <Form>
          <FormItem label="注塑工单编号">
            {getFieldDecorator('workOrderCode')(<Input disabled style={{ width }} />)}
          </FormItem>
          <FormItem label={'计划产出数量'}>
            <SubWorkOrderTable form={form} data={data} />
          </FormItem>
          {/* <FormItem label="工序">
            {getFieldDecorator('process')(<Select disabled style={{ width }} labelInValue />)}
          </FormItem> */}
          {data && data.successionTime ? (
            <div style={hintStyle}>
              {data.successionMode === START_WHEN_PRE_PROCESS_STOP ? '前道工序最晚结束时间' : '前道工序最早开始时间'}：
              {formatUnix(data.successionTime)}
            </div>
          ) : null}
          {mouldUnits ? (
            <Fragment>
              <FormItem label="模具">
                {getFieldDecorator('mouldUnit.id', {
                  rules: [{ required: true, message: '模具不能为空' }],
                  onChange: async (value, option) => {
                    if (!value) {
                      this.setState({ selectedMouldUnit: undefined });
                      return;
                    }
                    this.setState({ selectedMouldUnit: option.props.data });
                    const mouldUnit = getFieldValue('mouldUnit') || {};
                    mouldUnit.id = value;
                    await this.handleMouldUnitChange(mouldUnit);
                  },
                })(
                  <Select allowClear style={{ width: 276 }}>
                    {mouldUnits.map(tooling => {
                      const { id, name } = tooling || {};
                      return (
                        <Option data={tooling} value={id}>
                          {name}
                        </Option>
                      );
                    })}
                  </Select>,
                )}
              </FormItem>
              <FormItem label="需要上模">
                {getFieldDecorator('mouldUnit.needUpTime', {
                  rules: [{ required: true, message: '需要上模必填' }],
                  initialValue: true,
                  onChange: async value => {
                    const mouldUnit = getFieldValue('mouldUnit') || {};
                    mouldUnit.needUpTime = value.target.value;
                    await this.handleMouldUnitChange(mouldUnit);
                  },
                })(<RadioGroup options={[{ label: '是', value: true }, { label: '否', value: false }]} />)}
                {selectedMouldUnit && (
                  <span style={{ color: 'rgba(0, 0, 0, 0.4)' }}>上模时间：{selectedMouldUnit.upTime}分钟</span>
                )}
              </FormItem>
              <FormItem label="需要调机">
                {getFieldDecorator('mouldUnit.needPrepareTime', {
                  rules: [{ required: true, message: '需要调机必填' }],
                  initialValue: true,
                  onChange: async value => {
                    const mouldUnit = getFieldValue('mouldUnit') || {};
                    mouldUnit.needPrepareTime = value.target.value;
                    await this.handleMouldUnitChange(mouldUnit);
                  },
                })(<RadioGroup options={[{ label: '是', value: true }, { label: '否', value: false }]} />)}
                {selectedMouldUnit && (
                  <span style={{ color: 'rgba(0, 0, 0, 0.4)' }}>调机时间：{selectedMouldUnit.prepareTime}分钟</span>
                )}
              </FormItem>
              <FormItem label="需要下模">
                {getFieldDecorator('mouldUnit.needDownTime', {
                  rules: [{ required: true, message: '需要下模必填' }],
                  initialValue: true,
                  onChange: async value => {
                    const mouldUnit = getFieldValue('mouldUnit') || {};
                    mouldUnit.needDownTime = value.target.value;
                    await this.handleMouldUnitChange(mouldUnit);
                  },
                })(<RadioGroup options={[{ label: '是', value: true }, { label: '否', value: false }]} />)}
                {selectedMouldUnit && (
                  <span style={{ color: 'rgba(0, 0, 0, 0.4)' }}>下模时间：{selectedMouldUnit.downTime}分钟</span>
                )}
              </FormItem>
            </Fragment>
          ) : null}
          <FormItem label="工位">
            {getFieldDecorator('workstationId', {
              rules: [{ required: true, message: '工位不能为空' }],
              onChange: async value => {
                const { value: _workstation } = value || {};
                if (!_workstation) {
                  return;
                }
                const [type, workstationId] = _workstation.split('-');
                const startTimePlanned = getFieldValue('startTimePlanned');
                const endTimePlanned = getFieldValue('endTimePlanned');
                const mouldUnit = getFieldValue('mouldUnit');
                const workingTime = getFieldValue('workingTime');
                const workingTimeUnit = getFieldValue('workingTimeUnit');
                await this.fetchTimeSlotAndSetState({
                  workstationId,
                  startTimePlanned,
                  endTimePlanned: mouldUnits ? undefined : endTimePlanned,
                  workingTime,
                  workingTimeUnit,
                  mouldUnit,
                });
              },
            })(
              <WorkstationAndAreaSelect labelInValue onlyWorkstations options={workstations} style={{ width: 276 }} />,
              // <Select allowClear labelInValue style={{ width: 276 }}>
              //   {options}
              // </Select>,
            )}
          </FormItem>
          {/* {availableTime ? <div style={hintStyle}>{`最早空闲时间：${formatUnix(availableTime)}`}</div> : null} */}
          {/* 下料工单执行人必填 */}
          <FormItem label="执行人">
            <UserOrUserGroupSelect form={form} />
          </FormItem>
          <FormItem label="计划开始时间">
            {getFieldDecorator('startTimePlanned', {
              rules: [
                { required: true, message: '计划开始时间不能为空' },
                {
                  validator: (rule, value, cb) => {
                    const endTime = getFieldValue('endTimePlanned');
                    if (value && endTime && !moment(value).isBefore(endTime)) {
                      cb('结束时间不可早于开始时间');
                      return;
                    }
                    cb();
                  },
                },
              ],
              onChange: async startTimePlanned => {
                if (startTimePlanned) {
                  startTimePlanned.set({ second: 0, millisecond: 0 });
                }
                const { value: workstation } = getFieldValue('workstationId') || {};
                const [type, workstationId] = (workstation || '').split('-');
                const mouldUnit = getFieldValue('mouldUnit');
                form.resetFields(['endTimePlanned', 'workingTime']);
                // 加了推荐以后再打开
                // if (startTimePlanned) {
                //   this.fetchTimeSlotAndSetState({ startTimePlanned, workstationId, mouldUnit });
                // }
              },
            })(
              <DatePicker
                disabledDate={current => {
                  return current && current.valueOf() < moment().startOf('day');
                }}
                disabledTime={this.getDisabledTime}
                style={{ width }}
                showToday={false}
                showTime={{ format: 'HH:mm' }}
                format="YYYY-MM-DD HH:mm"
              />,
            )}
          </FormItem>
          {startTimeConflicts && startTimeConflicts.length
            ? startTimeConflicts.map((c, index) => (
                <div style={{ marginLeft: 150, marginTop: !index ? -10 : 0, color: '#8C8C8C' }}>{c.desc}</div>
              ))
            : null}
          {productionTime !== null && productionTime !== undefined ? (
            <div style={{ marginLeft: 150, color: '#8C8C8C' }}>
              预计生产
              {new BigJs(productionTime)
                .div(60 * 60 * 1000)
                .round(1)
                .valueOf()}
              小时
            </div>
          ) : null}
          <FormItem label={'计划工作时长'}>
            {getFieldDecorator('workingTime', {
              rules: [{ required: true, message: '时间必填' }, { validator: amountValidator() }],
            })(
              <InputNumber
                onBlur={async () => {
                  const workingTime = getFieldValue('workingTime');
                  const { value: workstation } = getFieldValue('workstationId') || {};
                  const [type, workstationId] = (workstation || '').split('-');
                  const workingTimeUnit = getFieldValue('workingTimeUnit');
                  const mouldUnit = getFieldValue('mouldUnit');
                  const startTimePlanned = getFieldValue('startTimePlanned');
                  if (workingTime) {
                    this.fetchTimeSlotAndSetState({
                      workingTime,
                      startTimePlanned,
                      workstationId,
                      mouldUnit,
                      workingTimeUnit,
                    });
                  }
                }}
              />,
            )}{' '}
            {getFieldDecorator('workingTimeUnit', {
              initialValue: 'm',
              onChange: workingTimeUnit => {
                const oldWorkingTime = getFieldValue('workingTime');
                const oldWorkingTimeUnit = getFieldValue('workingTimeUnit');
                let workingTime = oldWorkingTime;
                if (!workingTime) {
                  return;
                }
                if (oldWorkingTimeUnit === 'm' && workingTimeUnit === 'h') {
                  workingTime = new BigJs(workingTime)
                    .div(60)
                    .round(6)
                    .valueOf();
                } else if (oldWorkingTimeUnit === 'h' && workingTimeUnit === 'm') {
                  workingTime = new BigJs(workingTime)
                    .times(60)
                    .round(6)
                    .valueOf();
                } else if (oldWorkingTimeUnit === 'h' && workingTimeUnit === 'd') {
                  workingTime = new BigJs(workingTime)
                    .div(24)
                    .round(6)
                    .valueOf();
                } else if (oldWorkingTimeUnit === 'd' && workingTimeUnit === 'h') {
                  workingTime = new BigJs(workingTime)
                    .times(24)
                    .round(6)
                    .valueOf();
                } else if (oldWorkingTimeUnit === 'd' && workingTimeUnit === 'm') {
                  workingTime = new BigJs(workingTime)
                    .times(60 * 24)
                    .round(6)
                    .valueOf();
                } else if (oldWorkingTimeUnit === 'm' && workingTimeUnit === 'd') {
                  workingTime = new BigJs(workingTime)
                    .div(60 * 24)
                    .round(6)
                    .valueOf();
                }
                setFieldsValue({ workingTime });
              },
            })(
              <Select style={{ width: 100 }}>
                <Option value={'d'}>天</Option>
                <Option value={'h'}>小时</Option>
                <Option value={'m'}>分钟</Option>
              </Select>,
            )}
          </FormItem>
          <FormItem label="计划结束时间">
            {getFieldDecorator('endTimePlanned', {
              onChange: endTimePlanned => {
                if (endTimePlanned) {
                  endTimePlanned.set({ second: 0, millisecond: 0 });
                }
                const { value: workstation } = getFieldValue('workstationId') || {};
                const [type, workstationId] = (workstation || '').split('-');
                const startTimePlanned = getFieldValue('startTimePlanned');
                const mouldUnit = getFieldValue('mouldUnit');
                if (diff(endTimePlanned, startTimePlanned) > 0) {
                  this.fetchTimeSlotAndSetState({ startTimePlanned, workstationId, endTimePlanned, mouldUnit });
                }
              },
              rules: [
                { required: true, message: '计划结束时间不能为空' },
                {
                  validator: (rule, value, cb) => {
                    const startTime = getFieldValue('startTimePlanned');
                    if (value && startTime && !moment(value).isAfter(startTime)) {
                      cb('结束时间不可早于开始时间');
                      return;
                    }
                    cb();
                  },
                },
              ],
            })(
              <DatePicker
                disabled={mouldUnits}
                disabledDate={current => {
                  const startTime = moment(getFieldValue('startTimePlanned'));
                  if (startTime) {
                    return current && current.valueOf() < startTime.startOf('day');
                  }
                  return current && current.valueOf() < moment().startOf('day');
                }}
                disabledTime={this.getDisabledTime}
                style={{ width }}
                showToday={false}
                showTime={{ format: 'HH:mm' }}
                format="YYYY-MM-DD HH:mm"
              />,
            )}
          </FormItem>
          {endTimeConflicts && endTimeConflicts.length
            ? endTimeConflicts.map(c => (
                <div style={{ marginLeft: 150, marginTop: -10, color: '#8C8C8C' }}>{c.desc}</div>
              ))
            : null}
          <FormItem label="是否锁定">
            {getFieldDecorator('locked', {
              rules: [{ required: true, message: '是否锁定必填' }],
              initialValue: false,
            })(<RadioGroup options={[{ label: '是', value: true }, { label: '否', value: false }]} />)}
          </FormItem>
          {!this.props.edit && (
            <FormItem
              label={
                <span>
                  占用库存
                  <Popover
                    content={
                      <div>
                        <Icon type="exclamation-circle-o" color={'rgba(0, 0, 0, 0.4)'} style={{ margin: '0 5px' }} />
                        勾选校验库存后，会依次校验指定仓库库存中的数量是否满足该工序的需求，不满足的工序不会进行排程
                      </div>
                    }
                  >
                    <Icon type="exclamation-circle-o" color={'rgba(0, 0, 0, 0.4'} style={{ margin: '0 5px' }} />
                  </Popover>
                </span>
              }
            >
              {getFieldDecorator('isCheckStorage', {
                rules: [{ required: true, message: '校验库存不能为空' }],
                initialValue: false,
              })(
                <RadioGroup disabled={workOrderMaterialRequested} style={{ width }}>
                  <Radio value>是</Radio>
                  <Radio value={false}>否</Radio>
                </RadioGroup>,
              )}
            </FormItem>
          )}
          {!this.props.edit && getFieldValue('isCheckStorage') && (
            <FormItem
              label={
                <span>
                  占用仓库
                  <Popover
                    content={
                      <div>
                        <Icon type="exclamation-circle" color={'rgba(0, 0, 0, 0.4)'} style={{ margin: '0 5px' }} />
                        优先占用物料上配置的默认存储仓库，如果没有配置则占用此次选择的仓库
                      </div>
                    }
                  >
                    <Icon type="exclamation-circle-o" color={'rgba(0, 0, 0, 0.4'} style={{ margin: '0 5px' }} />
                  </Popover>
                </span>
              }
            >
              {getFieldDecorator('sourceWarehouseCode', {
                rules: [{ required: true, message: '占用仓库不能为空' }],
              })(<SearchSelect type="wareHouseWithCode" style={{ width }} />)}
            </FormItem>
          )}
        </Form>
        {footer || (
          <div style={{ position: 'absolute', bottom: 25, marginLeft: type === 'edit' ? 120 : 183 }}>
            <Button
              type="default"
              style={{ width: 114 }}
              onClick={() => {
                if (typeof onCancel === 'function') onCancel();
                closeModal();
              }}
            >
              取消
            </Button>
            <Button disabled={this.state.submiting} style={{ width: 114, marginLeft: 60 }} onClick={this.submit}>
              保存
            </Button>
          </div>
        )}
      </React.Fragment>
    );
  }
}
export default BaseForm;
