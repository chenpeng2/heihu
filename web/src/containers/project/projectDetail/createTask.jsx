import * as React from 'react';
import {
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
} from 'components';
import WorkstationAndAreaSelect from 'src/components/select/workstationAndAreaSelect';
import moment from 'moment';
import _ from 'lodash';
import { closeModal } from 'components/modal';
import { amountValidator } from 'components/form';
import { round } from 'utils/number';
import { stringEllipsis2 } from 'utils/string';
import { formatToUnix, formatUnix } from 'utils/time';
import { createProduceTask } from 'src/services/cooperate/productOrder';
import { queryWorkstationItems } from 'src/services/workstation';
import { queryProdTaskSchedule, queryProdTaskStartTime } from 'src/services/cooperate/prodTask';
import { queryCapacityItem } from 'src/services/knowledgeBase';
import { getWorkgroupDetail } from 'src/services/auth/workgroup';

import UserOrUserGroupSelect from '../../user/userOrUserGroupSelect';
import ConflictAlert from './conflictAlert';
import { saveScheduleTaskWorkerType } from '../utils';

const Option = Select.Option;
const width = 370;
type propsType = {
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

  fetchData = async () => {
    const {
      form: { setFieldsValue },
      startTime,
      endTime,
      workstation,
      projectCode,
      processSeq,
    } = this.props;
    if (startTime && endTime) {
      setFieldsValue({ time: [startTime, endTime] });
    }
    if (workstation) {
      setFieldsValue({ workStationId: { label: workstation.name, key: workstation.id } });
    }
    const {
      data: { data },
    } = await queryProdTaskSchedule({ projectCode, processSeq });
    this.setState({ data });
    const { amountPlanned, amountCreated, mbomMaterialCode } = data;
    const amountNotPlanned = amountPlanned - (amountCreated || 0) < 0 ? 0 : amountPlanned - (amountCreated || 0);
    const {
      data: { data: workstations },
    } = await queryWorkstationItems(data.workstation.map(e => e.id), { status: 1 });
    data.workstations = workstations;
    setTimeout(() => {
      setFieldsValue({
        amountProductPlanned: amountNotPlanned,
      });
    });
    setFieldsValue({
      projectCode: data.projectCode,
      process: { label: `${data.processCode}/${data.processName}`, key: data.processSeq },
    });
    this.setState({
      amountNotPlanned,
      inputMaterials:
        data.inputMaterials &&
        data.inputMaterials.map(node => ({
          ...node,
          material: {
            ...node.material,
            // code: node.material.code.replace(/\./g, '$'),
          },
        })),
      outputMaterial: data.outputMaterial,
      workstations: data.workstations,

      // 用来做工位和执行人或判断
      operatorsForCheck: null,
      operatorGroupForCheck: null,
      workStationIdForCheck: data.workstations,
    });
  };

  submit = () => {
    this.props.form.validateFields({ force: true }, async (err, values) => {
      if (err) {
        return;
      }
      console.log(values);
      const { projectCode, processSeq, onSuccess } = this.props;
      const { outputMaterial, inputMaterials } = this.state;
      const {
        startTimePlanned,
        endTimePlanned,
        amountProductPlanned,
        workStationId,
        operatorGroupId,
        operatorIds,
        operatorType,
      } = values;

      let _operatorIds = Array.isArray(operatorIds) ? operatorIds.map(i => i.key) : null;
      if (operatorGroupId) {
        const workgroupDetail = await getWorkgroupDetail(operatorGroupId.key);
        const members = _.get(workgroupDetail, 'data.data.members');
        _operatorIds = Array.isArray(members) ? members.map(i => i.id) : operatorIds;
      }

      // 格式化上传数据
      const submitValue = {
        workStationId: workStationId ? (workStationId.value || '').split('-')[1] : null,
        inputMaterials: null,
        operatorGroupId: operatorGroupId ? operatorGroupId.key : null,
        operatorIds: _operatorIds,
      };
      submitValue.startTimePlanned = formatToUnix(startTimePlanned.set({ second: 0, millisecond: 0 }));
      submitValue.endTimePlanned = formatToUnix(endTimePlanned.set({ second: 0, millisecond: 0 }));
      console.log(amountProductPlanned);
      if (outputMaterial) {
        // if has output materials
        submitValue.outputMaterialCode = _.get(outputMaterial, 'material.code');
        submitValue.amountProductPlanned = parseFloat(amountProductPlanned.toFixed(6));
      }
      if (inputMaterials) {
        // if no output and input
        submitValue.inputMaterials = inputMaterials.map(({ material }) => {
          console.log(values[material.code]);
          return {
            materialCode: material.code,
            materialName: material.name,
            unit: material.unit,
            amountPlanned: parseFloat(values[material.code.replace(/\./g, '$')].toFixed(6)),
          };
        });
      }

      this.setState({ submiting: true });
      const { data } = await createProduceTask({ projectCode, processSeq, ...submitValue }).finally(e => {
        this.setState({ submiting: false });
      });

      // 将执行人类型的选择保存在本地
      saveScheduleTaskWorkerType(operatorType);

      if (data.statusCode === 302) {
        openModal({
          children: (
            <ConflictAlert
              task={data.data && data.data.length && data.data[0]}
              onOk={async () => {
                await createProduceTask({ projectCode, processSeq, ...submitValue, force: true });
                message.success('创建任务成功');
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
        message.success('创建任务成功');
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
    const { form, type, isModal, processSeq } = this.props;
    const { getFieldDecorator, getFieldValue, setFieldsValue } = form;
    const { inputMaterials, outputMaterial, workstations, capacity, amountNotPlanned } = this.state;
    const { timeInterval, timeUnit, amount, unit } = capacity || {};
    const options = workstations.map(wk => <Option value={wk.id}>{wk.name}</Option>);

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
                        { validator: amountValidator(10e6, 0) },
                      ],
                      initialValue:
                        outputMaterial &&
                        round(getFieldValue('amountProductPlanned') * (amount / outputMaterial.amount), 6),
                    })(<InputNumber disabled={!!outputMaterial} style={{ width: 84, marginLeft: 10 }} />)}
                    <Input disabled value={stringEllipsis2(material.unit, 4)} style={{ width: 66, marginLeft: 10 }} />
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
                {outputMaterial.material ? (
                  <Input
                    disabled
                    value={stringEllipsis2(outputMaterial.material && outputMaterial.material.unit, 4)}
                    style={{ width: 66, marginLeft: 10 }}
                  />
                ) : null}
              </FormItem>
            )}
          </React.Fragment>
          <FormItem label="工位">
            {getFieldDecorator('workStationId', {
              rules: [{ required: true, message: '工位必填' }],
              onChange: async value => {
                this.setState(
                  {
                    workStationIdForCheck: value,
                  },
                  () => {
                    form.validateFields(['operatorIds', 'operatorGroupId'], { force: true });
                  },
                );

                const { data, outputMaterial } = this.state;
                const { value: workstationValue } = getFieldValue('workstationId') || {};
                const [type, workstationId] = (workstationValue || '').split('-');
                if (!workstationId) {
                  this.setState({ capacity: undefined });
                  form.resetFields(['endTimePlanned']);
                  return;
                }
                const workstation = workstations.find(e => e.id === Number(workstationId));
                const { mbomMaterialCode, mbomVersion, processCode, processRouteCode } = data;
                const amountProductPlanned = getFieldValue('amountProductPlanned');
                const {
                  data: { data: startTimeUnix },
                } = await queryProdTaskStartTime({ workstationId });
                // 有工艺路线的话 就不传mbomMaterialCode
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
                const startTime =
                  workstation && workstation.toManyTask === 1 ? moment() : moment(formatUnix(startTimeUnix));
                this.setState({ capacity });
                if (capacity && amountProductPlanned) {
                  const endTime = this.calcEndTime(amountProductPlanned, startTime, capacity);
                  form.setFieldsValue({ endTimePlanned: endTime });
                } else {
                  form.resetFields(['endTimePlanned']);
                }
                form.setFieldsValue({ startTimePlanned: startTime });
              },
            })(
              <WorkstationAndAreaSelect labelInValue onlyWorkstations options={workstations} style={{ width: 276 }} />,
              // <Select allowClear labelInValue style={{ width: 276 }}> {options}
              // </Select>,
            )}
            <Link style={{ marginLeft: 10 }} onClick={() => window.open('/dashboard/workstationSchedule', '_blank')}>
              查看工位状态
            </Link>
          </FormItem>
          <FormItem label="执行人">
            <UserOrUserGroupSelect
              form={form}
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
                const amountProductPlanned = getFieldValue('amountProductPlanned');
                if (capacity && amountProductPlanned) {
                  const endTime = this.calcEndTime(amountProductPlanned, startTime, capacity);
                  form.setFieldsValue({ endTimePlanned: endTime });
                }
              },
            })(
              <DatePicker
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
                disabledDate={current => {
                  const startTime = moment(getFieldValue('startTimePlanned'));
                  if (startTime) {
                    return current && current.valueOf() <= startTime.startOf('day');
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
      </div>
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
  });
}

export default CreateProduceTask;
