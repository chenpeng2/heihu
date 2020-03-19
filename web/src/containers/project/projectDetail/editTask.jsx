import * as React from 'react';
import moment from 'moment';
import _ from 'lodash';
import { closeModal } from 'components/modal';
import { amountValidator } from 'components/form';
import WorkstationAndAreaSelect from 'src/components/select/workstationAndAreaSelect';
import {
  Form,
  message,
  Link,
  Select,
  FormItem,
  InputNumber,
  Input,
  openModal,
  withForm,
  Button,
  DatePicker,
} from 'src/components';
import { round } from 'utils/number';
import { stringEllipsis2 } from 'utils/string';
import { formatToUnix, formatUnix, formatUnixMoment } from 'utils/time';
import { getProjectProcess, updateProduceTask } from 'src/services/cooperate/productOrder';
import {
  queryProdTaskSchedule,
  queryProdTaskStartTime,
  queryProdTaskDetail,
  baitingProdTask,
} from 'src/services/cooperate/prodTask';
import { queryCapacityItem } from 'src/services/knowledgeBase';
import { getWorkgroupDetail } from 'src/services/auth/workgroup';

import UserOrUserGroupSelect from '../../user/userOrUserGroupSelect';
import ConflictAlert from './conflictAlert';
import { replaceSign } from '../../../constants';

const Option = Select.Option;
const width = 370;

type propsType = {
  prodTaskStatus: Number,
  router: any,
  form: any,
  projectCode: String,
  processCode: String,
  outputMaterialCode: String,
  processSeq: String,
  startTime: Date,
  endTime: Date,
  workstation: String,
  type: String,
  id: String,
  category: Number, // (1-纯生产任务，2-下料任务)
  onCancel: () => {},
  isModal: boolean,
};

class EditProduceTaskBase extends React.Component<propsType> {
  state = {
    inputMaterials: null,
    outputMaterial: null,
    workstations: [],
    amountProductPlanned: 0,
    selectUserOrUserGroup: false,
  };

  async componentDidMount() {
    await this.fetchData();
  }

  fetchData = async () => {
    const {
      form: { setFieldsValue },
      id,
      category,
      workstation: dropWorkstation,
      startTime,
      endTime,
    } = this.props;
    let res = {};
    if (typeof category === 'number' && category === 2) {
      res = await baitingProdTask({ taskId: id });
    } else {
      res = await queryProdTaskDetail({ taskId: id });
    }
    const produceTaskDetailData = _.get(res, 'data.data');

    const {
      projectCode,
      processSeq,
      taskDispatchType,
      operators,
      operatorGroup,
      amountProductPlanned,
      workstation,
      startTimePlanned,
      endTimePlanned,
      inputMaterialsPlanned,
    } = produceTaskDetailData;

    // 执行人为用户
    const _operatorIds = Array.isArray(operators)
      ? operators.map(i => {
          const { id, name } = i || {};
          return { label: name, key: id };
        })
      : [];

    // 执行人为用户组
    const _operatorGroup = operatorGroup ? { label: operatorGroup.name, key: operatorGroup.id } : null;

    // 是否可以编辑执行人「用户和用户组」选项（如果上次没有选择任何一个用户或用户组，则放开可以编辑）
    const selectUserOrUserGroup = (_operatorIds && _operatorIds.length > 0) || _operatorGroup;
    this.setState({ data: produceTaskDetailData, selectUserOrUserGroup });

    const {
      data: {
        data: { inputMaterials, outputMaterial, processName, workstations },
      },
    } = await getProjectProcess({
      projectCode,
      processSeq,
    });
    const {
      data: {
        data: { processRouteCode, mbomMaterialCode, mbomVersion, processCode },
      },
    } = await queryProdTaskSchedule({
      projectCode,
      processSeq,
    });

    const _workstation = dropWorkstation || workstation;
    if (_workstation && _workstation.id) {
      const {
        data: { data: capacity },
      } = await queryCapacityItem({
        workstationId: _workstation.id,
        mbomMaterialCode: processRouteCode ? undefined : mbomMaterialCode,
        mbomVersion,
        processCode,
        materialCode: outputMaterial && outputMaterial.materialCode,
        nodeCode: processSeq,
        processRouteCode,
      });
      this.setState({ capacity });
    }
    this.setState(
      {
        inputMaterialsPlanned,
        inputMaterials:
          inputMaterials &&
          inputMaterials.map(node => ({
            ...node,
            material: {
              ...node.material,
            },
          })),
        outputMaterial,
        taskDispatchType,
        workstations,

        // 用来做工位和执行人或判断
        operatorsForCheck: _operatorIds,
        operatorGroupForCheck: _operatorGroup,
        workStationIdForCheck: workstations,
      },
      () => {
        setFieldsValue({
          amountProductPlanned,
          workStationId: _workstation ? { value: `WORKSTATION-${_workstation.id}`, label: _workstation.name } : null,
          startTimePlanned: startTime || (startTimePlanned ? formatUnixMoment(startTimePlanned) : null),
          endTimePlanned: endTime || (endTimePlanned ? formatUnixMoment(endTimePlanned) : null),
          operatorType: _operatorGroup ? 'userGroup' : 'user',
          operatorIds: _operatorGroup ? null : _operatorIds,
          operatorGroupId: _operatorGroup,
        });
      },
    );

    setFieldsValue({
      projectCode,
      process: { label: processName, key: processSeq },
    });
  };

  submit = () => {
    this.props.form.validateFields({ force: true }, async (err, values) => {
      if (err) {
        return;
      }
      const { projectCode, processSeq, onSuccess } = this.props;
      const { outputMaterial, inputMaterials } = this.state;
      const {
        id,
        startTimePlanned,
        endTimePlanned,
        amountProductPlanned,
        workStationId,
        operatorGroupId,
        operatorIds,
      } = values;

      let _operatorIds = Array.isArray(operatorIds) ? operatorIds.map(i => i.key) : null;
      if (operatorGroupId) {
        const workgroupDetail = await getWorkgroupDetail(operatorGroupId.key);
        const members = _.get(workgroupDetail, 'data.data.members');
        _operatorIds = Array.isArray(members) ? members.map(i => i.id) : operatorIds;
      }

      const submitValue = {
        id,
        workStationId: workStationId ? (workStationId.value || '').split('-')[1] : null,
        inputMaterials: null,
        operatorGroupId: operatorGroupId ? operatorGroupId.key : null,
        operatorIds: _operatorIds,
      };
      submitValue.startTimePlanned = formatToUnix(startTimePlanned.set({ second: 0, millisecond: 0 }));
      submitValue.endTimePlanned = formatToUnix(endTimePlanned.set({ second: 0, millisecond: 0 }));
      if (outputMaterial) {
        // if has output materials
        submitValue.outputMaterialCode = _.get(outputMaterial, 'material.code');
        submitValue.amountProductPlanned = parseFloat(amountProductPlanned.toFixed(6));
      }
      if (inputMaterials) {
        // if no output and input
        submitValue.inputMaterials = inputMaterials.map(({ material }) => {
          return {
            materialCode: material.code,
            materialName: material.name,
            unit: material.unit,
            amountPlanned: parseFloat(values[material.code.replace(/\./g, '$')].toFixed(6)),
          };
        });
      }

      this.setState({ submiting: true });

      const { data } = await updateProduceTask({ projectCode, processSeq, ...submitValue }).finally(e => {
        this.setState({ submiting: false });
      });

      if (data.statusCode === 302) {
        openModal({
          children: (
            <ConflictAlert
              task={data.data && data.data.length && data.data[0]}
              onOk={async () => {
                await updateProduceTask({ projectCode, processSeq, ...submitValue, force: true }).finally(e => {
                  this.setState({ submiting: false });
                });
                message.success('编辑任务成功');
                closeModal();
                if (onSuccess) {
                  onSuccess();
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
          onSuccess();
        }
        closeModal();
      }
    });
  };

  calcEndTime = (amountPlanned, startTime, capacity) => {
    const { timeInterval, timeUnit, amount } = capacity || {};
    const deltaTime = (amountPlanned / amount) * timeInterval;
    let endTime;
    if (!timeUnit || !startTime) {
      return startTime;
    }
    if (timeUnit === 'minute') {
      endTime = moment(startTime).add(deltaTime, 'm');
    } else if (timeUnit === 'hour') {
      endTime = moment(startTime).add(deltaTime, 'h');
    } else if (timeUnit === 'second') {
      endTime = moment(startTime).add(deltaTime, 's');
    } else {
      throw new Error('未知的时间单位');
    }
    return endTime;
  };

  translateTimeInterval = time => {
    let res;
    if (!time) {
      return null;
    }
    if (time === 'minute') {
      res = '分钟';
    } else if (time === 'hour') {
      res = '小时';
    } else if (time === 'second') {
      res = '秒';
    } else {
      throw new Error('未知的时间单位');
    }
    return res;
  };

  render() {
    const { form, type, processSeq, onCancel, id, prodTaskStatus } = this.props;
    const { getFieldDecorator, getFieldValue, setFieldsValue } = form;
    const {
      inputMaterials,
      outputMaterial,
      workstations,
      capacity,
      inputMaterialsPlanned,
      selectUserOrUserGroup,
    } = this.state;
    const { timeInterval, timeUnit, amount, unit } = capacity || {};
    const options = workstations.map(wk => <Option value={wk.id}>{wk.name}</Option>);
    getFieldDecorator('id', { initialValue: id });

    return (
      <div>
        <Form>
          <FormItem label="项目编号">{getFieldDecorator('projectCode')(<Input disabled style={{ width }} />)}</FormItem>
          <FormItem label="工序">
            {getFieldDecorator('process')(<Select disabled style={{ width }} labelInValue />)}
          </FormItem>
          <React.Fragment>
            {inputMaterials &&
              inputMaterials.map(({ material, amount }, index) => {
                return (
                  <FormItem label={index === 0 ? '计划投入物料和数量' : ' '}>
                    <Select disabled value={`${material.code}/${material.name}`} style={{ width: 200 }} />
                    {getFieldDecorator(material.code.replace(/\./g, '$'), {
                      rules: [
                        { required: true, message: '投入物料数量不能为空' },
                        { validator: amountValidator(10e6, { value: 0, equal: false, message: '数量必须大于0' }) },
                      ],
                      initialValue: outputMaterial
                        ? round(getFieldValue('amountProductPlanned') * (amount / outputMaterial.amount), 6)
                        : _.get(_.keyBy(inputMaterialsPlanned, 'materialCode'), `${material.code}.amount`),
                    })(<InputNumber disabled={!!outputMaterial} style={{ width: 84, marginLeft: 10 }} />)}
                    <Input
                      disabled
                      value={stringEllipsis2(material.unit, 4) || replaceSign}
                      style={{ width: 66, marginLeft: 10 }}
                    />
                  </FormItem>
                );
              })}
            {outputMaterial && (
              <FormItem label="计划产出物料和数量">
                <Select
                  disabled
                  value={
                    outputMaterial.material
                      ? `${outputMaterial.material.code}/${outputMaterial.material.name}`
                      : `${outputMaterial.materialCode}/${outputMaterial.materialCode}`
                  }
                  style={{ width: 200 }}
                />
                {getFieldDecorator('amountProductPlanned', {
                  rules: [
                    { required: true, message: '产出物料数量不能为空' },
                    { validator: amountValidator(10e6, { value: 0, equal: false, message: '数量必须大于0' }) },
                  ],
                })(
                  <InputNumber
                    style={{ width: 84, marginLeft: 10 }}
                    disabled={prodTaskStatus !== 1}
                    onChange={value => {
                      if (Array.isArray(inputMaterials)) {
                        inputMaterials.forEach(({ material, amount }) => {
                          setFieldsValue({
                            [material.code]: round(value * (amount / outputMaterial.amount), 6),
                          });
                        });
                      }
                      const { capacity } = this.state;
                      const startTimePlanned = getFieldValue('startTimePlanned');
                      if (capacity) {
                        const endTime = this.calcEndTime(value, startTimePlanned, capacity);
                        form.setFieldsValue({ endTimePlanned: endTime });
                      }
                    }}
                  />,
                )}
                <Input
                  disabled
                  value={stringEllipsis2((outputMaterial.material && outputMaterial.material.unit) || replaceSign, 4)}
                  style={{ width: 66, marginLeft: 10 }}
                />
              </FormItem>
            )}
          </React.Fragment>
          <FormItem label="工位">
            {getFieldDecorator('workStationId', {
              rules: [{ required: true, message: '工位必填!' }],
              onChange: async value => {
                const { value: workstationValue } = getFieldValue('workstationId') || {};
                const [type, workstationId] = (workstationValue || '').split('-');
                this.setState(
                  {
                    workStationIdForCheck: workstationId,
                  },
                  () => {
                    form.validateFields(['operatorIds', 'operatorGroupId'], { force: true });
                  },
                );

                if (!workstationId) {
                  this.setState({ capacity: undefined });
                  form.resetFields(['endTimePlanned']);
                  return;
                }

                const { data, outputMaterial } = this.state;
                const { mbomMaterialCode, mbomVersion, processCode, processRouteCode } = data;
                const amountProductPlanned = getFieldValue('amountProductPlanned');
                const {
                  data: { data: startTimeUnix },
                } = await queryProdTaskStartTime({ workstationId });

                const {
                  data: { data: capacity },
                } = await queryCapacityItem({
                  workstationId,
                  mbomMaterialCode: processRouteCode ? undefined : mbomMaterialCode,
                  mbomVersion,
                  processCode,
                  materialCode: outputMaterial && outputMaterial.materialCode,
                  nodeCode: processSeq,
                  processRouteCode,
                });
                const startTime = moment(formatUnix(startTimeUnix));
                this.setState({ capacity });
                if (capacity) {
                  const endTime = this.calcEndTime(amountProductPlanned, startTime, capacity);
                  form.setFieldsValue({ endTimePlanned: endTime });
                } else {
                  form.resetFields(['endTimePlanned']);
                }
                form.setFieldsValue({ startTimePlanned: startTime });
              },
            })(
              <WorkstationAndAreaSelect
                disabled={prodTaskStatus !== 1}
                labelInValue
                onlyWorkstations
                options={workstations}
                style={{ width: 276 }}
              />,
            )}
            {/* })(
              <Select allowClear labelInValue style={{ width: 276 }}> {options}
              </Select>,
            )} */}
            <Link style={{ marginLeft: 10 }} onClick={() => window.open('/dashboard/workstationSchedule', '_blank')}>
              查看工位状态
            </Link>
          </FormItem>
          <FormItem label="执行人">
            <UserOrUserGroupSelect
              selectUserOrUserGroup={selectUserOrUserGroup}
              form={form}
              prodTaskStatus={prodTaskStatus}
              extraOnChangeForType={() => {
                this.setState(
                  {
                    operatorGroupForCheck: null,
                    operatorsForCheck: null,
                  },
                  () => {
                    form.validateFields(['workStationId'], { force: true });
                  },
                );
              }}
              extraOnchangeForOperatorGroup={v => {
                this.setState(
                  {
                    operatorGroupForCheck: v,
                  },
                  () => {
                    form.validateFields(['workStationId'], { force: true });
                  },
                );
              }}
              extraOnchangeForOperators={v => {
                this.setState(
                  {
                    operatorsForCheck: v,
                  },
                  () => {
                    form.validateFields(['workStationId'], { force: true });
                  },
                );
              }}
            />
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
              onChange: startTime => {
                startTime.set({ second: 0, millisecond: 0 });
                const { capacity } = this.state;
                if (capacity) {
                  const amountProductPlanned = getFieldValue('amountProductPlanned');
                  const endTime = this.calcEndTime(amountProductPlanned, startTime, capacity);
                  form.setFieldsValue({ endTimePlanned: endTime });
                }
              },
            })(
              <DatePicker
                disabled={prodTaskStatus !== 1}
                disabledDate={current => {
                  return current && current.valueOf() < moment().startOf('day');
                }}
                style={{ width }}
                showTime={{ format: 'HH:mm' }}
                format="YYYY-MM-DD HH:mm"
              />,
            )}
            <span style={{ position: 'absolute', left: 400, width: 200 }}>
              {capacity && `每${timeInterval}${this.translateTimeInterval(timeUnit)}生产${amount}${unit}`}
            </span>
          </FormItem>
          <FormItem label="计划结束时间">
            {getFieldDecorator('endTimePlanned', {
              onChange: endTime => {
                endTime.set({ second: 0, millisecond: 0 });
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
                disabled={prodTaskStatus !== 1}
                disabledDate={current => {
                  const startTime = moment(getFieldValue('startTimePlanned'));
                  if (startTime) {
                    return current && current.valueOf() < startTime.startOf('day');
                  }
                  return current && current.valueOf() < moment().startOf('day');
                }}
                style={{ width }}
                showTime={{ format: 'HH:mm' }}
                format="YYYY-MM-DD HH:mm"
              />,
            )}
          </FormItem>
        </Form>
        <div style={{ marginLeft: type === 'edit' ? 120 : 183 }}>
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
          <Button disabled={this.state.submiting} style={{ width: 114, marginLeft: 60 }} onClick={this.submit}>
            保存
          </Button>
        </div>
      </div>
    );
  }
}

const CreateBase = withForm({}, EditProduceTaskBase);

function EditProduceTask({ projectCode, processSeq, prodTaskStatus, ...rest }, callback, option) {
  const { onSuccess } = callback || {};
  openModal({
    children: (
      <CreateBase
        prodTaskStatus={prodTaskStatus}
        projectCode={projectCode}
        processSeq={processSeq}
        {...rest}
        onSuccess={onSuccess}
      />
    ),
    title: '编辑排程',
    footer: null,
    ...option,
  });
}

export default EditProduceTask;
