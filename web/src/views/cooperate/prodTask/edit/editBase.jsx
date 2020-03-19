import * as React from 'react';
import { withForm, message, Input, Select, DatePicker, Link, Form, FormItem, Button, InputNumber } from 'components';
import { closeModal } from 'components/modal';
import { amountValidator } from 'components/form';
import { round } from 'utils/number';
import moment from 'moment';
import propTypes from 'prop-types';
import { formatToUnix, formatUnix } from 'utils/time';
import SearchSelect from 'components/select/searchSelect';
import {
  getProjectProcess,
  createProduceTask,
  updateProduceTask,
  produceTaskDetail,
} from 'src/services/cooperate/productOrder';

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
class EditBase extends React.Component<propsType> {
  state = {
    inputMaterials: null,
    outputMaterial: null,
    workstations: [],
    amountProductPlanned: 0,
    taskDispatchType: '',
  };

  async componentDidMount() {
    await this.fetchData();
  }

  fetchData = async () => {
    const {
      type,
      form: { setFields, setFieldsValue, setFieldsInitialValue },
    } = this.props;
    let data;
    if (type !== 'edit') {
      data = await this.handleCreate();
      const { amountPlanned, amountCreated } = data;
      setTimeout(() => {
        setFieldsValue({
          amountProductPlanned: amountPlanned - amountCreated < 0 ? 0 : amountPlanned - amountCreated,
        });
      });
    } else {
      data = await this.handleEdit();
    }
    setFieldsValue({
      projectCode: data.projectCode,
      process: { label: data.processName, key: data.processSeq },
    });
    this.setState({
      inputMaterials: data.inputMaterials,
      outputMaterial: data.outputMaterial,
      workstations: data.workstations,
    });
  };

  handleEdit = async () => {
    const {
      id,
      form: { setFieldsValue },
    } = this.props;
    const {
      data: { data: detail },
    } = await produceTaskDetail(id);
    const {
      data: { data },
    } = await getProjectProcess({
      projectCode: detail.projectCode,
      processSeq: detail.processSeq,
    });
    this.setState(
      {
        inputMaterials: data.inputMaterials,
        outputMaterial: data.outputMaterial,
        taskDispatchType: detail.taskDispatchType,
      },
      () => {
        setFieldsValue({
          amountProductPlanned: detail.amountProductPlanned,
          workStationId: detail.workstation ? { key: detail.workstation.id, label: detail.workstation.name } : null,
          assignedWorkerIds: detail.operators.map(value => ({ key: value.id, label: value.name })),
          time: [moment(detail.createAt), moment(detail.endTimePlanned)],
        });
      },
    );
    return data;
  };

  handleCreate = async () => {
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
    return data;
  };

  submit = () => {
    this.props.form.validateFields({ force: true }, async (err, values) => {
      if (err) {
        return;
      }
      const { projectCode, processSeq, type, onSuccess, isModal } = this.props;
      const { outputMaterial, inputMaterials, taskDispatchType } = this.state;
      const { time, amountProductPlanned, workStationId, assignedWorkerIds } = values;
      const wkids = assignedWorkerIds && assignedWorkerIds.map(node => node.key);
      const submitValue = {
        workStationId: workStationId && workStationId.key,
        operatorIds: wkids && wkids.length > 0 ? wkids : null,
        assignedWorkerIds: wkids && wkids.length > 0 ? wkids : null,
        inputMaterials: null,
      };
      if (!(taskDispatchType !== 'manager' && type === 'edit')) {
        submitValue.endTimePlanned = formatToUnix(time[1]);
        submitValue.startTimePlanned = formatToUnix(time[0]);
      }
      if (outputMaterial) {
        // if has output materials
        submitValue.outputMaterialCode = outputMaterial.material.code;
        submitValue.amountProductPlanned = parseFloat(amountProductPlanned.toFixed(6));
      }
      if (inputMaterials) {
        // if no output and input
        submitValue.inputMaterials = inputMaterials.map(({ material }) => ({
          materialCode: material.code,
          materialName: material.name,
          unit: material.unitName,
          amountPlanned: parseFloat(values[material.code].toFixed(6)),
        }));
      }
      if (type === 'edit') {
        const { data } = await updateProduceTask({ ...submitValue, id: this.props.id });
        message.success('更新任务成功');
        if (isModal) {
          closeModal();
        } else {
          this.context.router.history.push(`/cooperate/prodTasks/detail/${this.props.id}`);
        }
      } else {
        const { data } = await createProduceTask({ projectCode, processSeq, ...submitValue });
        closeModal();
        if (onSuccess) {
          onSuccess();
        }
        message.success('创建任务成功');
      }
    });
  };
  render() {
    const { form, type, isModal } = this.props;
    const { getFieldDecorator, getFieldValue } = form;
    const { changeChineseToLocale } = this.context;
    const { inputMaterials, outputMaterial, workstations, taskDispatchType } = this.state;
    const hideTime = taskDispatchType !== 'manager' && type === 'edit';
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
                    <Input disabled value={material.unitName} style={{ width: 66, marginLeft: 10 }} />
                  </FormItem>
                );
              })}
            {outputMaterial && (
              <FormItem label="计划产出物料和数量">
                <Select
                  disabled
                  value={`${outputMaterial.material.code}/${outputMaterial.material.name}`}
                  style={{ width: 200 }}
                />
                {getFieldDecorator('amountProductPlanned', {
                  rules: [{ required: true, message: '产出物料数量不能为空' }, { validator: amountValidator(10e6, 0) }],
                })(<InputNumber style={{ width: 84, marginLeft: 10 }} />)}
                <Input disabled value={outputMaterial.material.unitName} style={{ width: 66, marginLeft: 10 }} />
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
          {hideTime ? null : (
            <FormItem label="计划开始结束时间">
              {getFieldDecorator('time', {
                rules: [{ required: true, message: '计划时间不能为空' }],
              })(<RangePicker style={{ width }} showTime format="YYYY-MM-DD HH:mm:ss" />)}
            </FormItem>
          )}
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
          <Button style={{ width: 114, marginLeft: 60 }} onClick={this.submit}>
            保存
          </Button>
        </div>
      </div>
    );
  }
}

EditBase.contextTypes = {
  router: propTypes.object,
  changeChineseToLocale: propTypes.func,
};

export default withForm({ showFooter: false }, EditBase);
