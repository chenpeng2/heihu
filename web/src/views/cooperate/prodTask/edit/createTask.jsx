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
import _ from 'lodash';
import PropTypes from 'prop-types';
import { closeModal } from 'src/components/modal';
import { amountValidator } from 'src/components/form';
import { round } from 'src/utils/number';
import { stringEllipsis2 } from 'src/utils/string';
import { formatToUnix } from 'src/utils/time';
import SearchSelect from 'src/components/select/searchSelect';
import ConflictAlert from 'views/cooperate/taskSchedule/conflictAlert';
import { getProjectProcess, createProduceTask } from 'src/services/cooperate/productOrder';
import { replaceSign } from '../../../../constants';

const Option = Select.Option;
const width = 370;
const RangePicker = DatePicker.RangePicker;
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
    } = await getProjectProcess({ projectCode, processSeq });
    const { amountPlanned, amountCreated } = data;
    setTimeout(() => {
      setFieldsValue({
        amountProductPlanned: amountPlanned - amountCreated < 0 ? 0 : amountPlanned - amountCreated,
      });
    });
    setFieldsValue({
      projectCode: data.projectCode,
      process: { label: data.processName, key: data.processSeq },
    });
    this.setState({
      inputMaterials:
        data.inputMaterials &&
        data.inputMaterials.map(node => ({
          ...node,
          material: {
            ...node.material,
            code: node.material.code.replace(/\./g, '$'),
          },
        })),
      outputMaterial: data.outputMaterial,
      workstations: data.workstations,
    });
  };

  submit = () => {
    this.props.form.validateFields({ force: true }, async (err, values) => {
      if (err) {
        return;
      }
      const { projectCode, processSeq, onSuccess, isModal } = this.props;
      const { outputMaterial, inputMaterials } = this.state;
      const { time, amountProductPlanned, workStationId, assignedWorkerIds } = values;
      const wkids = assignedWorkerIds && assignedWorkerIds.map(node => node.key);
      const submitValue = {
        workStationId: workStationId && workStationId.key,
        operatorIds: wkids && wkids.length > 0 ? wkids : null,
        assignedWorkerIds: wkids && wkids.length > 0 ? wkids : null,
        inputMaterials: null,
      };
      submitValue.startTimePlanned = formatToUnix(time[0].set({ second: 0, millisecond: 0 }));
      submitValue.endTimePlanned = formatToUnix(time[1].set({ second: 0, millisecond: 0 }));
      if (outputMaterial) {
        // if has output materials
        submitValue.outputMaterialCode = _.get(outputMaterial, 'material.code');
        submitValue.amountProductPlanned = parseFloat(amountProductPlanned.toFixed(6));
      }
      if (inputMaterials) {
        // if no output and input
        submitValue.inputMaterials = inputMaterials.map(({ material }) => {
          return {
            materialCode: material.code.replace(/\$/, '.'),
            materialName: material.name,
            unit: material.unitName,
            amountPlanned: parseFloat(values[material.code].toFixed(6)),
          };
        });
      }
      this.setState({ submiting: true });
      const { data } = await createProduceTask({ projectCode, processSeq, ...submitValue });
      this.setState({ submiting: false });
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

  render() {
    const { form, type, isModal } = this.props;
    const { getFieldDecorator, getFieldValue, setFieldsValue } = form;
    const { changeChineseToLocale } = this.context;
    const { inputMaterials, outputMaterial, workstations } = this.state;
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
                    {getFieldDecorator(material.code, {
                      rules: [
                        { required: true, message: '投入物料数量不能为空' },
                        { validator: amountValidator(10e6, 0) },
                      ],
                      initialValue:
                        outputMaterial &&
                        round(getFieldValue('amountProductPlanned') * (amount / outputMaterial.amount), 6),
                    })(<InputNumber disabled={!!outputMaterial} style={{ width: 84, marginLeft: 10 }} />)}
                    <Input
                      disabled
                      value={stringEllipsis2(material.unit || replaceSign, 4)}
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
                    onChange={value => {
                      if (Array.isArray(inputMaterials)) {
                        inputMaterials.forEach(({ material, amount }) => {
                          setFieldsValue({
                            [material.code]: round(value * (amount / outputMaterial.amount), 6),
                          });
                        });
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
              rules: [
                {
                  validator: (rule, value, cb) => {
                    const assignedWorkerIds = getFieldValue('assignedWorkerIds');
                    if (Array.isArray(assignedWorkerIds) && assignedWorkerIds.length === 0 && !value) {
                      cb(changeChineseToLocale('工位和执行人必选一个'));
                    } else if (!value && !getFieldValue('assignedWorkerIds')) {
                      cb(changeChineseToLocale('工位和执行人必选一个'));
                    }
                    cb();
                  },
                },
              ],
            })(
              <Select allowClear labelInValue style={{ width: 276 }}>
                {options}
              </Select>,
            )}
            <Link style={{ marginLeft: 10 }} onClick={() => window.open('/dashboard/workstationSchedule', '_blank')}>
              查看工位状态
            </Link>
          </FormItem>
          <FormItem label="执行人">
            {getFieldDecorator('assignedWorkerIds', {
              rules: [
                {
                  validator: (rule, value, cb) => {
                    if (Array.isArray(value) && value.length === 0 && !getFieldValue('workStationId')) {
                      cb(changeChineseToLocale('工位和执行人必选一个'));
                    } else if (!value && !getFieldValue('workStationId')) {
                      cb(changeChineseToLocale('工位和执行人必选一个'));
                    }
                    cb();
                  },
                },
              ],
            })(<SearchSelect style={{ width }} type="account" mode="multiple" />)}
          </FormItem>
          <FormItem label="计划开始结束时间">
            {getFieldDecorator('time', {
              rules: [{ required: true, message: '计划时间不能为空' }],
            })(<RangePicker style={{ width }} showTime format="YYYY-MM-DD HH:mm:ss" />)}
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

CreateProduceTaskBase.contextTypes = {
  changeChineseToLocale: PropTypes.func,
};

const CreateBase = withForm({}, CreateProduceTaskBase);
function CreateProduceTask({ projectCode, processSeq, ...rest }, callback) {
  const { onSuccess } = callback || {};
  openModal({
    children: <CreateBase projectCode={projectCode} processSeq={processSeq} {...rest} onSuccess={onSuccess} />,
    title: '创建生产任务',
    footer: null,
  });
}

export default CreateProduceTask;
