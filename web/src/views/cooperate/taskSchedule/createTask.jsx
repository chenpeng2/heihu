import * as React from 'react';
import _ from 'lodash';
import BigJs from 'big.js';

import {
  Radio,
  withForm,
  openModal,
  message,
  Input,
  Select,
  DatePicker,
  Link,
  Form,
  FormItem,
  Button,
  InputNumber,
  Popover,
  Icon,
} from 'components';
import { closeModal } from 'components/modal';
import SearchSelect from 'components/select/searchSelect';
import { amountValidator } from 'components/form';
import { getConfigCapacityConstraint } from 'utils/organizationConfig';
import moment, { formatToUnix, diff, formatUnixMoment, formatUnix } from 'utils/time';
import { arrayIsEmpty } from 'utils/array';
import WorkstationAndAreaSelect from 'components/select/workstationAndAreaSelect';
import { queryWorkOrderProcessDetail, createTask, queryTimeSlot } from 'services/schedule';
import { queryDefWorkstations } from 'src/services/workstation';
import UserOrUserGroupSelect from 'containers/user/userOrUserGroupSelect';
import {
  saveScheduleTaskWorkerType,
  saveScheduleTaskWorkingTimeUnit,
  getScheduleWorkingTimeUnit,
} from 'containers/project/utils';
import { START_WHEN_PRE_PROCESS_STOP, START_WHEN_PRE_PROCESS_START } from 'containers/mBom/base/constant';
import { replaceSign, PLAN_TICKET_NORMAL } from 'constants';

import ConflictAlert from './conflictAlert';

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

const baseFormItemStyle = { width: 370 };

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

class CreateProduceTaskBase extends React.Component<propsType> {
  state = {
    inputMaterials: null,
    outputMaterial: null,
    workstations: [],
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

  fetchData = async () => {
    const {
      form: { getFieldValue, setFieldsValue },
      startTime,
      endTime,
      workstation,
      processSeq,
      workOrderCode,
    } = this.props;
    if (startTime && endTime) {
      setFieldsValue({ time: [startTime, endTime] });
    }
    if (workstation) {
      setFieldsValue({ workstationId: { label: workstation.name, key: `WORKSTATION-${workstation.id}` } });
    }
    const {
      data: { data },
    } = await queryWorkOrderProcessDetail({ code: workOrderCode, seq: processSeq });
    this.setState({ data });
    const {
      defaultTimeSlot: {
        amount,
        workstationId,
        workingTime,
        startTime: _startTime,
        productionTime,
        endTime: _endTime,
        conflict,
        availableTime,
      },
    } = data;
    const amountNotPlanned = amount;
    const suggestWorkstation = data.workstations && data.workstations.find(e => e.id === workstationId);
    if (suggestWorkstation && !arrayIsEmpty(suggestWorkstation.workers)) {
      const operatorIds = suggestWorkstation.workers
        .filter(e => e.job === 'OP')
        .map(e => ({ key: e.id, label: e.name }));
      if (!arrayIsEmpty(operatorIds)) {
        setFieldsValue({ operatorType: 'user', operatorIds });
      }
    }

    setTimeout(() => {
      setFieldsValue({
        amountProductPlanned: amountNotPlanned || null,
      });
    });
    const workingTimeUnit = getScheduleWorkingTimeUnit() || getFieldValue('workingTimeUnit');
    const value = {
      workOrderCode,
      process: { label: `${data.processCode}/${data.processName}`, key: data.processSeq },
      workstationId: {
        value: `WORKSTATION-${workstationId}`,
        label: suggestWorkstation ? suggestWorkstation.name : '',
      },
      startTimePlanned: formatUnixMoment(_startTime),
      endTimePlanned: _endTime && formatUnixMoment(_endTime),
      workingTime: undefined,
      workingTimeUnit,
    };
    if (workingTime) {
      if (workingTimeUnit === 'h') {
        value.workingTime = new BigJs(workingTime)
          .div(60 * 60 * 1000)
          .round(6)
          .valueOf();
      } else if (workingTimeUnit === 'd') {
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
    setFieldsValue(value);
    const conflicts = this.formatConflicts(conflict);
    this.setState({
      availableTime,
      amountNotPlanned,
      workingTime,
      productionTime,
      ...conflicts,
      workstations: data.workstations,
    });
  };

  fetchTimeSlotAndSetState = async ({
    workingTime: _workingTime,
    workingTimeUnit,
    startTimePlanned,
    amount,
    workstationId,
    endTimePlanned,
  }) => {
    const { workOrderCode, processSeq, form } = this.props;
    const { workstations } = this.state;
    // 没有工位 表示获取推荐工位
    if (typeof amount === 'number') {
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
      } = await queryTimeSlot({
        code: workOrderCode,
        seq: processSeq,
        body: {
          amount,
          startTime: startTimePlanned && formatToUnix(startTimePlanned),
          workingTime: time,
          endTime: endTimePlanned && formatToUnix(endTimePlanned),
          workstationId,
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
      const conflicts = this.formatConflicts(conflict);
      setTimeout(() => form.setFieldsValue(value));
      this.setState({
        workingTime,
        productionTime,
        ...conflicts,
        availableTime,
      });
    } else {
      this.setState({ workingTime: undefined, productionTime: undefined });
    }
  };

  formatConflicts = conflict => {
    return {
      startTimeConflicts: conflict.filter(
        e => e.conflict === 'PRE_PROCESS_CONFLICTED' || e.conflict === 'START_TIME_CONFLICTED',
      ),
      capacityConstraintConflicts: conflict.filter(e => e.conflict === 'CAPACITY_CONSTRAINT_CONFLICTED'),
      endTimeConflicts: conflict.filter(
        e =>
          e.conflict === 'SCHEDULE_CONFLICTED' ||
          e.conflict === 'POST_PROCESS_CONFLICTED' ||
          e.conflict === 'END_TIME_CONFLICTED',
      ),
    };
  };

  submit = () => {
    this.props.form.validateFields({ force: true }, async (err, values) => {
      if (err) {
        return;
      }
      const { processCode, processSeq, onSuccess, workOrderCode } = this.props;
      const configCapacityConstraint = getConfigCapacityConstraint();
      const { data } = this.state;
      const category = _.get(data, 'category');
      const {
        startTimePlanned,
        endTimePlanned,
        amountProductPlanned,
        workstationId,
        locked,
        operatorGroupId,
        operatorIds,
        operatorType,
        workingTime,
        workingTimeUnit,
        sourceWarehouseCode,
      } = values;
      if (category !== PLAN_TICKET_NORMAL && !operatorGroupId && arrayIsEmpty(operatorIds)) {
        message.error('下料工单执行人必填！');
        return;
      }
      const submitValue = {
        workstationId: workstationId && workstationId.value.split('-')[1],
        planAmount: parseFloat(amountProductPlanned.toFixed(6)),
        operatorGroupId: operatorGroupId ? operatorGroupId.key : null,
        executorIds: Array.isArray(operatorIds) ? operatorIds.map(i => i && i.key) : null,
        sourceWarehouseCode: sourceWarehouseCode && sourceWarehouseCode.key,
        locked,
      };
      submitValue.planBeginTime = formatToUnix(startTimePlanned.set({ second: 0, millisecond: 0 }));
      if (!configCapacityConstraint) {
        if (workingTimeUnit === 'h') {
          submitValue.workingTime = new BigJs(workingTime).times(60 * 60 * 1000).valueOf();
        } else if (workingTimeUnit === 'm') {
          submitValue.workingTime = new BigJs(workingTime).times(60 * 1000).valueOf();
        } else if (workingTimeUnit === 'd') {
          submitValue.workingTime = new BigJs(workingTime).times(24 * 60 * 60 * 1000).valueOf();
        }
        submitValue.planEndTime = formatToUnix(endTimePlanned.set({ second: 0, millisecond: 0 }));
        submitValue.timeUnit = workingTimeUnit;
      }
      this.setState({ submiting: true });
      const { data: res } = await createTask({ workOrderCode, processSeq, ...submitValue }).finally(e => {
        this.setState({ submiting: false });
      });
      const context = this;
      // 将执行人类型的选择保存在本地
      saveScheduleTaskWorkerType(operatorType);
      saveScheduleTaskWorkingTimeUnit(workingTimeUnit);

      if (res.statusCode === 302) {
        openModal({
          children: (
            <ConflictAlert
              task={res.data && res.data.length && res.data[0]}
              onOk={async () => {
                context.setState({ submiting: true });
                await createTask({ workOrderCode, processCode, processSeq, ...submitValue, force: true }).finally(e => {
                  context.setState({ submiting: false });
                });
                message.success('创建任务成功');
                closeModal();
                if (onSuccess) {
                  onSuccess(res);
                }
              }}
            />
          ),
          width: 580,
          title: null,
          footer: null,
        });
      } else {
        message.success('创建任务成功');
        if (onSuccess) {
          onSuccess(res);
        } else {
          closeModal();
        }
      }
    });
  };

  render() {
    const { form, type, isModal } = this.props;
    const { getFieldDecorator, getFieldValue, setFieldsValue } = form;
    const {
      productionTime,
      startTimeConflicts,
      endTimeConflicts,
      capacityConstraintConflicts,
      workstations,
      data,
      availableTime,
    } = this.state;
    const configCapacityConstraint = getConfigCapacityConstraint();
    const category = _.get(data, 'category');
    const workOrderMaterial = category === 1 ? _.get(data, 'workOrderOutMaterial') : _.get(data, 'workOrderInMaterial');
    const material = _.get(data, 'outputMaterial.material');
    const workOrderMaterialRequested = _.get(data, 'workOrderMaterialRequested');

    return (
      <React.Fragment>
        <Form>
          <FormItem label="工单编号">
            {getFieldDecorator('workOrderCode')(<Input disabled style={{ width }} />)}
          </FormItem>
          <FormItem label={category === 1 ? '工单产出物料' : '工单投入物料'}>
            <span>
              {Array.isArray(workOrderMaterial) && workOrderMaterial.length
                ? workOrderMaterial.map(e => `${e.code}/${e.name}`).join(',')
                : replaceSign}
            </span>
          </FormItem>
          {category === 1 ? (
            <FormItem label={'工序产出物料'}>
              <span>{material ? `${material.code}/${material.name}` : replaceSign}</span>
            </FormItem>
          ) : null}
          <FormItem label="工序">
            {getFieldDecorator('process')(<Select disabled style={{ width }} labelInValue />)}
          </FormItem>
          {data && data.successionTime ? (
            <div style={hintStyle}>
              {data.successionMode === START_WHEN_PRE_PROCESS_STOP ? '前道工序最晚结束时间' : '前道工序最早开始时间'}：
              {formatUnix(data.successionTime)}
            </div>
          ) : null}
          <React.Fragment>
            <FormItem label={category === 1 ? '计划产出数量' : '计划投入数量'}>
              {getFieldDecorator('amountProductPlanned', {
                rules: [
                  { required: true, message: '产出物料数量不能为空' },
                  { validator: amountValidator(10e6, { value: 0, equal: false, message: '数量必须大于0' }) },
                ],
              })(
                <InputNumber
                  style={{ width: 150 }}
                  onBlur={async () => {
                    const amount = getFieldValue('amountProductPlanned');
                    const { value: workstation } = getFieldValue('workstationId') || {};
                    const [type, workstationId] = (workstation || '').split('-');
                    const workingTimeUnit = getFieldValue('workingTimeUnit');
                    const workingTime = getFieldValue('workingTime');
                    const startTimePlanned = getFieldValue('startTimePlanned');
                    const endTimePlanned = getFieldValue('endTimePlanned');
                    this.fetchTimeSlotAndSetState({
                      amount,
                      startTimePlanned,
                      endTimePlanned,
                      workingTime,
                      workstationId,
                      workingTimeUnit,
                    });
                  }}
                />,
              )}
            </FormItem>
          </React.Fragment>
          <FormItem label="工位">
            {getFieldDecorator('workstationId', {
              rules: [{ required: true, message: '工位不能为空' }],
              onChange: async value => {
                const { value: _workstation } = value || {};
                if (!_workstation) {
                  return;
                }
                const [type, workstationId] = _workstation.split('-');
                const amount = getFieldValue('amountProductPlanned');
                const {
                  data: { data },
                } = await queryDefWorkstations({ ids: workstationId });
                const workstation = data[0];
                if (workstation && !arrayIsEmpty(workstation.workers)) {
                  const operatorIds = workstation.workers
                    .filter(e => e.job === 'OP')
                    .map(e => ({ key: e.id, label: e.name }));
                  if (!arrayIsEmpty(operatorIds)) {
                    form.setFieldsValue({ operatorType: 'user', operatorIds });
                  }
                }
                await this.fetchTimeSlotAndSetState({ workstationId, amount });
              },
            })(
              <WorkstationAndAreaSelect labelInValue onlyWorkstations options={workstations} style={{ width: 276 }} />,
            )}
          </FormItem>
          {availableTime ? <div style={hintStyle}>{`最早空闲时间：${formatUnix(availableTime)}`}</div> : null}
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
                form.resetFields(['endTimePlanned', 'workingTime']);
                const amount = getFieldValue('amountProductPlanned');
                if (startTimePlanned) {
                  this.fetchTimeSlotAndSetState({ startTimePlanned, workstationId, amount });
                }
              },
            })(
              <DatePicker
                disabledDate={current => {
                  return current && current.valueOf() < moment().startOf('day');
                }}
                disabledTime={this.getDisabledTime}
                style={{ width }}
                showToday={false}
                showTime={configCapacityConstraint ? undefined : { format: 'HH:mm' }}
                format={configCapacityConstraint ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm'}
              />,
            )}
          </FormItem>
          <div
            style={{
              marginTop:
                !arrayIsEmpty(startTimeConflicts) ||
                !arrayIsEmpty(capacityConstraintConflicts) ||
                (productionTime !== null && productionTime !== undefined)
                  ? -10
                  : 0,
            }}
          />
          {!arrayIsEmpty(startTimeConflicts)
            ? startTimeConflicts.map((c, index) => <div style={{ marginLeft: 150, color: '#8C8C8C' }}>{c.desc}</div>)
            : null}
          {!arrayIsEmpty(capacityConstraintConflicts) ? (
            <div style={{ marginLeft: 150, color: '#8C8C8C' }}>{capacityConstraintConflicts[0].desc}</div>
          ) : null}
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
          {configCapacityConstraint ? null : (
            <FormItem label={'计划工作时长'}>
              {getFieldDecorator('workingTime', {
                rules: [{ required: true, message: '时间必填' }, { validator: amountValidator() }],
              })(
                <InputNumber
                  disabled={configCapacityConstraint}
                  onBlur={async () => {
                    const workingTime = getFieldValue('workingTime');
                    const { value: workstation } = getFieldValue('workstationId') || {};
                    const [type, workstationId] = (workstation || '').split('-');
                    const amount = getFieldValue('amountProductPlanned');
                    const workingTimeUnit = getFieldValue('workingTimeUnit');
                    const startTimePlanned = getFieldValue('startTimePlanned');
                    if (workingTime) {
                      this.fetchTimeSlotAndSetState({
                        workingTime,
                        startTimePlanned,
                        workstationId,
                        amount,
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
                <Select disabled={configCapacityConstraint} style={{ width: 100 }}>
                  <Option value={'d'}>天</Option>
                  <Option value={'h'}>小时</Option>
                  <Option value={'m'}>分钟</Option>
                </Select>,
              )}
            </FormItem>
          )}
          {configCapacityConstraint ? null : (
            <FormItem label="计划结束时间">
              {getFieldDecorator('endTimePlanned', {
                onChange: endTimePlanned => {
                  if (endTimePlanned) {
                    endTimePlanned.set({ second: 0, millisecond: 0 });
                  }
                  const { value: workstation } = getFieldValue('workstationId') || {};
                  const [type, workstationId] = (workstation || '').split('-');
                  const amount = getFieldValue('amountProductPlanned');
                  const startTimePlanned = getFieldValue('startTimePlanned');
                  if (diff(endTimePlanned, startTimePlanned) > 0) {
                    this.fetchTimeSlotAndSetState({ startTimePlanned, workstationId, amount, endTimePlanned });
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
                  disabled={configCapacityConstraint}
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
          )}
          {!configCapacityConstraint && endTimeConflicts && endTimeConflicts.length
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
              <RadioGroup disabled={workOrderMaterialRequested} style={baseFormItemStyle}>
                <Radio value>是</Radio>
                <Radio value={false}>否</Radio>
              </RadioGroup>,
            )}
          </FormItem>
          {getFieldValue('isCheckStorage') && (
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
              })(<SearchSelect type="wareHouseWithCode" style={baseFormItemStyle} />)}
            </FormItem>
          )}
        </Form>
        <div style={{ position: 'absolute', bottom: 25, marginLeft: type === 'edit' ? 120 : 183 }}>
          <Button
            type="default"
            style={{ width: 114 }}
            onClick={
              type === 'edit'
                ? isModal
                  ? () => closeModal()
                  : () => this.context.router.history.push('/cooperate/prodTasks')
                : closeModal
            }
          >
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
const CreateBase = withForm({}, CreateProduceTaskBase);
function CreateProduceTask({ projectCode, processSeq, ...rest }, callback) {
  const { onSuccess } = callback || {};
  openModal({
    children: <CreateBase projectCode={projectCode} processSeq={processSeq} {...rest} onSuccess={onSuccess} />,
    title: '创建排程',
    footer: null,
    innerContainerStyle: { marginBottom: 80 },
  });
}

export default CreateProduceTask;
