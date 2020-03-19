import * as React from 'react';
import _ from 'lodash';
import {
  withForm,
  message,
  Input,
  Select,
  DatePicker,
  Link,
  Form,
  FormItem,
  Button,
  InputNumber,
  openModal,
} from 'components';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { closeModal } from 'components/modal';
import { amountValidator } from 'components/form';
import { round } from 'utils/number';
import { stringEllipsis2 } from 'utils/string';
import moment from 'moment';
import { withRouter } from 'react-router-dom';
import WorkstationAndAreaSelect from 'src/components/select/workstationAndAreaSelect';
import { replaceSign } from 'constants';
import { formatToUnix } from 'utils/time';
import { getWorkgroupDetail } from 'src/services/auth/workgroup';
import ConflictAlert from 'views/cooperate/taskSchedule/conflictAlert';
import { getProjectProcess, updateProduceTask, produceTaskDetail } from 'src/services/cooperate/productOrder';
import UserOrUserGroupSelect from 'src/containers/user/userOrUserGroupSelect';
import { changeChineseToLocale } from 'src/utils/locale/utils';

const Option = Select.Option;
const width = 370;
const RangePicker = DatePicker.RangePicker;

type propsType = {
  form: any,
  match: {
    params: {
      id: String,
    },
  },
  router: any,
  id: String,
  isModal: boolean,
  onCancel: () => {},
  renderFooter: () => {},
};
class _EditTaskBase extends React.Component<propsType> {
  state = {
    inputMaterials: null,
    outputMaterial: null,
    workstations: [],
    amountProductPlanned: 0,
    taskDispatchType: '',
    selectUserOrUserGroup: false,
  };

  async componentDidMount() {
    await this.fetchData();
  }

  fetchData = async () => {
    const {
      form: { setFieldsValue },
      id,
      workstation: dropWorkstation,
      startTime,
      endTime,
    } = this.props;
    const {
      data: {
        data: {
          projectCode,
          processSeq,
          taskDispatchType,
          amountProductPlanned,
          workstation,
          operators,
          operatorGroup,
          createAt,
          endTimePlanned,
          inputMaterialsPlanned,
          status,
        },
      },
    } = await produceTaskDetail(id);
    const { status: prodTaskStatus } = status;
    const {
      data: {
        data: { inputMaterials, outputMaterial, processName, workstations },
      },
    } = await getProjectProcess({
      projectCode,
      processSeq,
    });
    const _workstation = dropWorkstation || workstation;

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
    this.setState({ selectUserOrUserGroup });

    this.setState(
      {
        prodTaskStatus,
        inputMaterialsPlanned,
        inputMaterials:
          inputMaterials &&
          inputMaterials.map(node => ({
            ...node,
            material: {
              ...node.material,
              code: node.material.code.replace(/\./g, '$'),
            },
          })),
        outputMaterial,
        taskDispatchType,
        workstations,
      },
      () => {
        setFieldsValue({
          amountProductPlanned,
          workStationId: _workstation ? { value: `WORKSTATION-${_workstation.id}`, label: _workstation.name } : null,
          assignedWorkerIds: operators.map(value => ({ key: value.id, label: value.name })),
          time: [moment(startTime || createAt), moment(endTime || endTimePlanned)],
        });
      },
    );
    setFieldsValue({
      projectCode,
      process: { label: processName, key: processSeq },
      operatorType: _operatorGroup ? 'userGroup' : 'user',
      operatorIds: _operatorGroup ? null : _operatorIds,
      operatorGroupId: _operatorGroup,
    });
  };

  submit = () => {
    this.props.form.validateFields({ force: true }, async (err, values) => {
      if (err) {
        return;
      }
      const { projectCode, processSeq, onSuccess, isModal, id } = this.props;
      const { outputMaterial, inputMaterials, taskDispatchType } = this.state;
      const { time, amountProductPlanned, workStationId, operatorGroupId, operatorIds } = values;

      let _operatorIds = Array.isArray(operatorIds) ? operatorIds.map(i => i.key) : null;
      if (operatorGroupId) {
        const workgroupDetail = await getWorkgroupDetail(operatorGroupId.key);
        const members = _.get(workgroupDetail, 'data.data.members');
        _operatorIds = Array.isArray(members) ? members.map(i => i.id) : operatorIds;
      }

      const submitValue = {
        workStationId: workStationId && workStationId.value.split('-')[1],
        inputMaterials: null,
        operatorGroupId: operatorGroupId ? operatorGroupId.key : null,
        operatorIds: _operatorIds,
      };
      if (taskDispatchType === 'manager') {
        submitValue.startTimePlanned = formatToUnix(time[0].set({ second: 0, millisecond: 0 }));
        submitValue.endTimePlanned = formatToUnix(time[1].set({ second: 0, millisecond: 0 }));
      }
      if (outputMaterial) {
        // if has output materials
        submitValue.outputMaterialCode = _.get(outputMaterial, 'material.code');
        submitValue.amountProductPlanned = parseFloat(amountProductPlanned.toFixed(6));
      }
      if (inputMaterials) {
        // if no output and input
        submitValue.inputMaterials = inputMaterials.map(({ material }) => ({
          materialCode: material.code.replace(/\$/, '.'),
          materialName: material.name,
          unit: material.unitName,
          amountPlanned: parseFloat(values[material.code].toFixed(6)),
        }));
      }
      this.setState({ submiting: true });
      const { data } = await updateProduceTask({ ...submitValue, id }).finally(e => {
        this.setState({ submiting: false });
      });
      if (data.statusCode === 302) {
        openModal({
          children: (
            <ConflictAlert
              task={data.data && data.data.length && data.data[0]}
              onOk={async () => {
                await updateProduceTask({ projectCode, processSeq, ...submitValue, id, force: true });
                message.success('更新任务成功');
                if (typeof onSuccess === 'function') {
                  onSuccess();
                  this.setState({ submiting: false });
                }
                if (isModal) {
                  closeModal();
                } else {
                  this.context.router.history.push(`/cooperate/prodTasks/detail/${id}`);
                }
              }}
            />
          ),
          width: 580,
          title: null,
          footer: null,
        });
      } else {
        message.success('更新任务成功');
        if (typeof onSuccess === 'function') {
          onSuccess();
        }
        if (isModal) {
          closeModal();
        } else {
          this.context.router.history.push(`/cooperate/prodTasks/detail/${id}`);
        }
      }
    });
  };

  render() {
    const { form, isModal, onCancel, renderFooter } = this.props;
    const { changeChineseToLocale } = this.context;
    const { getFieldDecorator, getFieldValue } = form;
    const {
      selectUserOrUserGroup,
      inputMaterials,
      outputMaterial,
      workstations,
      taskDispatchType,
      inputMaterialsPlanned,
      prodTaskStatus,
    } = this.state;
    const hideTime = taskDispatchType !== 'manager';
    const options = workstations.map(wk => <Option value={wk.id}>{wk.name}</Option>);

    return (
      <div>
        <div style={{ marginLeft: 40 }}>
          <div>
            <Form>
              <FormItem label="项目编号">
                {getFieldDecorator('projectCode')(<Input disabled style={{ width }} />)}
              </FormItem>
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
                        { validator: amountValidator(10e6, 0) },
                      ],
                    })(<InputNumber style={{ width: 84, marginLeft: 10 }} disabled={prodTaskStatus !== 1} />)}
                    <Input
                      disabled
                      value={stringEllipsis2(
                        (outputMaterial.material && outputMaterial.material.unit) || replaceSign,
                        7,
                      )}
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
                  <WorkstationAndAreaSelect
                    disabled={prodTaskStatus !== 1}
                    labelInValue
                    onlyWorkstations
                    options={workstations}
                    style={{ width: 276 }}
                  />,
                )}
                {/* })(
                  <Select allowClear labelInValue style={{ width: 276 }}>
                    {options}
                  </Select>,
                )} */}
                <Link
                  style={{ marginLeft: 10 }}
                  onClick={() => window.open('/dashboard/workstationSchedule', '_blank')}
                >
                  查看工位状态
                </Link>
              </FormItem>
              <FormItem label="执行人">
                <UserOrUserGroupSelect
                  selectUserOrUserGroup={selectUserOrUserGroup}
                  form={form}
                  prodTaskStatus={prodTaskStatus}
                />
              </FormItem>
              {hideTime ? null : (
                <FormItem label="计划开始结束时间">
                  {getFieldDecorator('time', {
                    rules: [{ required: true, message: '计划时间不能为空' }],
                  })(
                    <RangePicker
                      disabled={prodTaskStatus !== 1}
                      style={{ width }}
                      showTime
                      format="YYYY-MM-DD HH:mm:ss"
                    />,
                  )}
                </FormItem>
              )}
            </Form>
            <div style={{ marginLeft: 120 }}>
              {renderFooter ? renderFooter({ onClose: closeModal }) : null}
              <Button
                type="default"
                style={{ width: 114 }}
                onClick={() => {
                  if (isModal) {
                    closeModal();
                  } else {
                    this.context.router.history.push('/cooperate/prodTasks');
                  }
                  if (onCancel) {
                    onCancel();
                  }
                }}
              >
                取消
              </Button>
              <Button disabled={this.state.submiting} style={{ width: 114, marginLeft: 60 }} onClick={this.submit}>
                保存
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

_EditTaskBase.contextTypes = {
  router: {},
  changeChineseToLocale: PropTypes.func,
};

const EditTaskBase = withForm({}, withRouter(_EditTaskBase));

function EditTask(props: any) {
  return (
    <div>
      <p style={{ margin: 20, fontSize: 14 }}>{changeChineseToLocale('编辑生产任务', props.intl)}</p>
      <div style={{ marginLeft: 40 }}>
        <EditTaskBase type="edit" id={props.match.params.id} {...props} />
      </div>
    </div>
  );
}
export function editProduceTask({ id, ...rest }, callback, option) {
  const { onSuccess } = callback || {};
  openModal({
    children: <EditTaskBase id={id} {...rest} onSuccess={onSuccess} />,
    title: '编辑生产任务',
    footer: null,
    ...option,
  });
}

export default injectIntl(EditTask);
