import * as React from 'react';
import {
  withForm,
  openModal,
  Radio,
  message,
  Input,
  Select,
  DatePicker,
  Link,
  Form,
  FormItem,
  Button,
  InputNumber,
} from 'components';
import moment from 'moment';
import _ from 'lodash';
import BigJs from 'big.js';
import { closeModal } from 'src/components/modal';
import { amountValidator } from 'components/form';
import { getConfigCapacityConstraint } from 'utils/organizationConfig';
import WorkstationAndAreaSelect from 'src/components/select/workstationAndAreaSelect';
import { formatToUnix, formatUnix, formatUnixMoment } from 'utils/time';
import { getTaskDetail, updateTask, queryWorkOrderProcessDetail, queryTimeSlot } from 'src/services/schedule';
import { queryDefWorkstations } from 'services/workstation';
import { getTransferApplyFromTask } from 'services/cooperate/materialRequest';
import UserOrUserGroupSelect from 'src/containers/user/userOrUserGroupSelect';
import { START_WHEN_PRE_PROCESS_STOP, START_WHEN_PRE_PROCESS_START } from 'containers/mBom/base/constant';
import { arrayIsEmpty, arrayRemoveDuplicates } from 'utils/array';
import { replaceSign, PLAN_TICKET_NORMAL } from 'constants';
import ConflictAlert from './conflictAlert';

const AntModal = openModal.AntModal;
const Option = Select.Option;
const width = 370;
const RadioGroup = Radio.Group;
const hintStyle = {
  marginLeft: 138,
  color: 'rgba(0, 0, 0, 0.4)',
  marginTop: -10,
};
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
  taskCode: String,
  projectCode: String,
  processCode: String,
  outputMaterialCode: String,
  processSeq: String,
  startTime: Date,
  endTime: Date,
  workstation: String,
  type: String,
  id: String,
  onCancel: () => {},
  isModal: boolean,
};

class EditProduceTaskBase extends React.Component<propsType> {
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
      form: { setFieldsValue },
      taskCode,
      workstation: dropWorkstation,
      startTime,
      endTime,
    } = this.props;
    const {
      data: { data },
    } = await getTaskDetail(taskCode);

    const {
      workOrderCode,
      projectCode,
      processSeq,
      taskDispatchType,
      executors: operators,
      operatorGroup,
      planAmount: amountProductPlanned,
      workstationId,
      workstationName,
      timeUnit,
      planBeginTime: startTimePlanned,
      planEndTime: endTimePlanned,
      status,
    } = data;
    const {
      data: {
        data: _data,
        data: { processCode, processName, workstations },
      },
    } = await queryWorkOrderProcessDetail({
      code: workOrderCode,
      seq: processSeq,
    });
    this.setState({
      data: _data,
    });
    const {
      startTime: _startTime,
      endTime: _endTime,
      productionTime,
      workingTime,
      conflict,
      availableTime,
      availableAmount,
    } = await this.fetchTimeSlotAndSetState({
      startTimePlanned: startTime || startTimePlanned,
      endTimePlanned: endTime || endTimePlanned,
      amount: amountProductPlanned,
      workstationId: dropWorkstation ? dropWorkstation.id : workstationId,
      workOrderCode,
      processSeq,
    });
    let _workingTime;
    let _workingTimeUnit;
    if (timeUnit) {
      _workingTimeUnit = timeUnit;
      if (timeUnit === 'd') {
        _workingTime = workingTime / (24 * 60 * 60 * 1000);
      } else if (timeUnit === 'h') {
        _workingTime = workingTime / (60 * 60 * 1000);
      } else if (timeUnit === 'm') {
        _workingTime = workingTime / (60 * 1000);
      }
    } else if (workingTime % (24 * 60 * 60 * 1000) === 0) {
      _workingTime = workingTime / (24 * 60 * 60 * 1000);
      _workingTimeUnit = 'd';
    } else if (workingTime % (60 * 60 * 1000) === 0) {
      _workingTime = workingTime / (60 * 60 * 1000);
      _workingTimeUnit = 'h';
    } else if (workingTime % (60 * 1000) === 0) {
      _workingTime = workingTime / (60 * 1000);
      _workingTimeUnit = 'm';
    }
    const conflicts = this.formatConflicts(conflict);
    this.setState(
      {
        ...conflicts,
        productionTime,
        workingTime,
        taskDispatchType,
        workstations,
        workOrderCode,
        availableTime,
        processSeq,
        availableAmount,
      },
      () => {
        setFieldsValue({
          workOrderCode,
          amountProductPlanned,
          locked: status === 'LOCKED',
          workstationId: dropWorkstation
            ? { value: `WORKSTATION-${dropWorkstation.id}`, label: dropWorkstation.name }
            : { value: `WORKSTATION-${workstationId}`, label: workstationName },
          startTimePlanned: _startTime && formatUnixMoment(_startTime),
          endTimePlanned: _endTime && formatUnixMoment(_endTime),
          operatorType: Array.isArray(operators) && operators.length ? 'user' : 'userGroup',
          operatorIds: Array.isArray(operators)
            ? operators.map(i => {
                const { id, name } = i || {};
                return { label: name, key: id };
              })
            : [],
          workingTime: _workingTime,
          workingTimeUnit: _workingTimeUnit,
          operatorGroupId: operatorGroup ? { label: operatorGroup.name, key: operatorGroup.id } : null,
          projectCode,
          process: { label: processName, key: processSeq },
        });
      },
    );
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

  fetchTimeSlotAndSetState = async ({
    startTimePlanned,
    workingTime: _workingTime,
    workingTimeUnit,
    amount,
    workstationId,
    endTimePlanned,
    workOrderCode: _workOrderCode,
    processSeq: _processSeq,
  }) => {
    const { form, taskCode } = this.props;
    const { workstations } = this.state;
    const { workOrderCode, processSeq } = this.state;
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
        code: _workOrderCode || workOrderCode,
        seq: _processSeq || processSeq,
        body: {
          amount,
          taskCode,
          workingTime: time,
          startTime: startTimePlanned && formatToUnix(startTimePlanned),
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
        availableAmount,
      } = data;
      const conflicts = this.formatConflicts(conflict);
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
      form.setFieldsValue(value);
      this.setState({ workingTime, productionTime, availableAmount, ...conflicts });
      return data;
    }
    this.setState({ workingTime: undefined, productionTime: undefined });
  };

  handleBeforeSubmit = async () => {
    // const { taskCode, onSuccess } = this.props;
    // const {
    //   data: { data: materialRequest },
    // } = await getTransferApplyFromTask([taskCode], { status: 1 });
    // if (!arrayIsEmpty(materialRequest)) {
    //   const codes = arrayRemoveDuplicates(materialRequest.map(({ code }) => code)).join('，');
    //   AntModal.confirm({
    //     title: '确定保存？',
    //     content: `该任务关联以下转移申请：${codes},保存后会重新创建转移申请并占用库存，存在占用失败的风险，确定保存这个任务吗？`,
    //     okText: '保存',
    //     cancelText: '暂不保存',
    //     onOk: this.submit,
    //   });
    //   return;
    // }
    this.submit();
  };

  submit = () => {
    this.props.form.validateFields({ force: true }, async (err, values) => {
      if (err) {
        return;
      }
      const { data } = this.state;
      const { taskCode, onSuccess } = this.props;
      const configCapacityConstraint = getConfigCapacityConstraint();
      const category = _.get(data, 'category');
      const {
        startTimePlanned,
        endTimePlanned,
        amountProductPlanned,
        workstationId,
        locked,
        operatorGroupId,
        operatorIds,
        workingTime,
        workingTimeUnit,
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
      const { data: res } = await updateTask({ taskCode, ...submitValue }).finally(e => {
        this.setState({ submiting: false });
      });
      const context = this;
      if (res.statusCode === 302) {
        openModal({
          children: (
            <ConflictAlert
              task={res.data && res.data.length && res.data[0]}
              onOk={async () => {
                context.setState({ submiting: true });
                await updateTask({ taskCode, ...submitValue, force: true }).finally(e => {
                  context.setState({ submiting: false });
                });
                message.success('编辑任务成功');
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
        message.success('编辑任务成功');
        if (onSuccess) {
          onSuccess(res);
        }
        closeModal();
      }
    });
  };

  render() {
    const { form, type, isModal, processSeq, onCancel, id } = this.props;
    const { getFieldDecorator, getFieldValue, setFieldsValue } = form;
    const {
      data,
      productionTime,
      workingTime,
      workstations,
      startTimeConflicts,
      endTimeConflicts,
      capacityConstraintConflicts,
      availableTime,
      availableAmount,
    } = this.state;
    const configCapacityConstraint = getConfigCapacityConstraint();
    const category = _.get(data, 'category');
    const workOrderMaterial = category === 1 ? _.get(data, 'workOrderOutMaterial') : _.get(data, 'workOrderInMaterial');
    const material = _.get(data, 'outputMaterial.material');

    getFieldDecorator('id', { initialValue: id });

    return (
      <React.Fragment>
        <div>
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
              <FormItem label="工序产出物料">
                <span>{material ? `${material.code}/${material.name}` : replaceSign}</span>
              </FormItem>
            ) : null}
            <FormItem label="工序">
              {getFieldDecorator('process')(<Select disabled style={{ width }} labelInValue />)}
            </FormItem>
            {data && data.successionTime ? (
              <div style={hintStyle}>
                {data.successionMode === START_WHEN_PRE_PROCESS_STOP ? '前道工序最晚结束时间' : '前道工序最早开始时间'}
                ：{formatUnix(data.successionTime)}
              </div>
            ) : null}
            <React.Fragment>
              <FormItem label={category === 1 ? '计划产出数量' : '计划投入物料'}>
                {getFieldDecorator('amountProductPlanned', {
                  rules: [
                    { required: true, message: '产出物料数量不能为空' },
                    { validator: amountValidator(10e6, { value: 0, equal: false, message: '数量必须大于0' }) },
                  ],
                })(
                  <InputNumber
                    style={{ width: 84 }}
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
                        workstationId,
                        workingTime,
                        workingTimeUnit,
                      });
                    }}
                  />,
                )}
                {typeof availableAmount === 'number' ? (
                  <span style={{ marginLeft: 10, color: '#8C8C8C' }}>
                    最大可下发数量为{availableAmount} {material ? material.unitName : replaceSign}
                  </span>
                ) : null}
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
                <WorkstationAndAreaSelect
                  labelInValue
                  onlyWorkstations
                  options={workstations}
                  style={{ width: 276 }}
                />,
              )}
            </FormItem>
            {availableTime ? <div style={hintStyle}>{`最早空闲时间：${formatUnix(availableTime)}`}</div> : null}
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
                onChange: startTimePlanned => {
                  if (startTimePlanned) {
                    startTimePlanned.set({ second: 0, millisecond: 0 });
                  }
                  const { value: workstation } = getFieldValue('workstationId') || {};
                  const [type, workstationId] = (workstation || '').split('-');
                  const amount = getFieldValue('amountProductPlanned');
                  form.resetFields(['endTimePlanned', 'workingTime']);
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
                  showTime={configCapacityConstraint ? undefined : { format: 'HH:mm' }}
                  format={configCapacityConstraint ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm'}
                />,
              )}
            </FormItem>
            <div
              style={{
                marginTop:
                  (startTimeConflicts && startTimeConflicts.length) ||
                  (capacityConstraintConflicts && capacityConstraintConflicts.length) ||
                  (productionTime !== null && productionTime !== undefined)
                    ? -10
                    : 0,
              }}
            />
            {startTimeConflicts && startTimeConflicts.length
              ? startTimeConflicts.map((c, index) => <div style={{ marginLeft: 150, color: '#8C8C8C' }}>{c.desc}</div>)
              : null}
            {capacityConstraintConflicts && capacityConstraintConflicts.length ? (
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
                    endTimePlanned.set({ second: 0, millisecond: 0 });
                    const { value: workstation } = getFieldValue('workstationId') || {};
                    const [type, workstationId] = (workstation || '').split('-');
                    const amount = getFieldValue('amountProductPlanned');
                    const startTimePlanned = getFieldValue('startTimePlanned');
                    this.fetchTimeSlotAndSetState({ startTimePlanned, workstationId, amount, endTimePlanned });
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
                    showTime={{ format: 'HH:mm' }}
                    format="YYYY-MM-DD HH:mm"
                  />,
                )}
              </FormItem>
            )}
            {!configCapacityConstraint && endTimeConflicts && endTimeConflicts.length
              ? endTimeConflicts.map((c, index) => (
                  <div style={{ marginLeft: 150, marginTop: !index ? -10 : 0, color: '#8C8C8C' }}>{c.desc}</div>
                ))
              : null}
            <FormItem label="是否锁定">
              {getFieldDecorator('locked', {
                rules: [{ required: true, message: '是否锁定必填' }],
                initialValue: false,
              })(<RadioGroup options={[{ label: '是', value: true }, { label: '否', value: false }]} />)}
            </FormItem>
          </Form>
        </div>
        <div style={{ marginLeft: type === 'edit' ? 120 : 183, position: 'absolute', bottom: 25 }}>
          <Button
            type="default"
            style={{ width: 114 }}
            onClick={() => {
              if (onCancel) {
                onCancel();
              }
              closeModal();
            }}
          >
            取消
          </Button>
          <Button
            disabled={this.state.submiting}
            style={{ width: 114, marginLeft: 60 }}
            onClick={this.handleBeforeSubmit}
          >
            保存
          </Button>
        </div>
      </React.Fragment>
    );
  }
}
const CreateBase = withForm({}, EditProduceTaskBase);
function EditProduceTask({ projectCode, processSeq, ...rest }, callback, option) {
  const { onSuccess } = callback || {};
  openModal({
    children: <CreateBase projectCode={projectCode} processSeq={processSeq} {...rest} onSuccess={onSuccess} />,
    title: '编辑排程',
    footer: null,
    innerContainerStyle: { marginBottom: 80 },
    ...option,
  });
}

export default EditProduceTask;
