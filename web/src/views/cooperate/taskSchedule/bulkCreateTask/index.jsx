import * as React from 'react';
import _ from 'lodash';
import BigJs from 'big.js';
import {
  Popconfirm,
  Table,
  Tooltip,
  Icon,
  Radio,
  withForm,
  openModal,
  message,
  Select,
  DatePicker,
  Link,
  Button,
  InputNumber,
  SimpleTable,
} from 'components';
import { FormItem, amountValidator } from 'components/form';
import { closeModal } from 'components/modal';
import moment, { formatToUnix, diff, formatUnixMoment, formatUnix } from 'utils/time';
import WorkstationAndAreaSelect from 'components/select/workstationAndAreaSelect';
import {
  queryBulkWorkOrderProcessDetail,
  bulkManualCreateTask,
  queryTimeSlot,
  bulkQueryTimeSlot,
} from 'services/schedule';
import { queryDefWorkstations } from 'services/workstation';
import UserOrUserGroupSelect from 'containers/user/userOrUserGroupSelect';
import { getConfigCapacityConstraint } from 'utils/organizationConfig';
import { saveScheduleTaskWorkingTimeUnit, getScheduleWorkingTimeUnit } from 'containers/project/utils';
import { replaceSign } from 'constants';
import { arrayIsEmpty } from 'utils/array';
import { blacklakeGreen } from 'styles/color';
import AmountModal from './amountModal';
import WorkstationSelectModal from './workstationSelectModal';
import UserSelectModal from './userSelectModal';
import TimeSelectModal from './timeSelectModal';
import WorkingTimeSelectModal from './workingTimeSelectModal';
import styles from './styles.scss';

const RadioGroup = Radio.Group;
const Option = Select.Option;
const Popiknow = Popconfirm.Popiknow;

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

class BulkCreateProduceTaskBase extends React.Component<propsType> {
  state = {
    inputMaterials: null,
    outputMaterial: null,
    workstations: [],
    startTimeConflictsArray: [],
    endTimeConflictsArray: [],
    capacityConstraintConflictsArray: [],
    availableTimeArray: [],
    productionTimeArray: [],
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
      processes,
    } = this.props;
    const {
      data: { data },
    } = await queryBulkWorkOrderProcessDetail(processes);
    this.setState({ data });
    const values = [];
    const startTimeConflictsArray = [];
    const endTimeConflictsArray = [];
    const productionTimeArray = [];
    const availableTimeArray = [];
    const capacityConstraintConflictsArray = [];
    data.forEach((process, index) => {
      const {
        defaultTimeSlot: {
          amount,
          workstationId,
          workOrderCode,
          workingTime,
          startTime: _startTime,
          productionTime,
          endTime: _endTime,
          conflict,
          availableTime,
        },
      } = process;
      const amountNotPlanned = amount;
      const suggestWorkstation = process.workstations && process.workstations.find(e => e.id === workstationId);
      console.log(suggestWorkstation);
      const value = {
        workOrderCode,
        amountProductPlanned: amountNotPlanned || null,
        process: { label: `${data.processCode}/${data.processName}`, key: data.processSeq },
        workstationId: {
          value: `WORKSTATION-${workstationId}`,
          label: suggestWorkstation ? suggestWorkstation.name : '',
        },
        startTimePlanned: formatUnixMoment(_startTime),
        endTimePlanned: _endTime && formatUnixMoment(_endTime),
      };
      if (suggestWorkstation && !arrayIsEmpty(suggestWorkstation.workers)) {
        const operatorIds = suggestWorkstation.workers
          .filter(e => e.job === 'OP')
          .map(e => ({ key: e.id, label: e.name }));
        if (!arrayIsEmpty(operatorIds)) {
          value.operatorType = 'user';
          value.operatorIds = operatorIds;
        }
      }
      const workingTimeUnit = getScheduleWorkingTimeUnit() || getFieldValue(`values[${index}].workingTimeUnit`);
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
      value.workingTimeUnit = workingTimeUnit;
      const { startTimeConflicts, endTimeConflicts, capacityConstraintConflicts } = this.formatConflicts(conflict);
      capacityConstraintConflictsArray[index] = capacityConstraintConflicts;
      startTimeConflictsArray[index] = startTimeConflicts;
      endTimeConflictsArray[index] = endTimeConflicts;
      productionTimeArray[index] = productionTime;
      availableTimeArray[index] = availableTime;

      values.push(value);
    });
    this.setState({ startTimeConflictsArray, endTimeConflictsArray, productionTimeArray, availableTimeArray });
    setFieldsValue({ values });
  };

  fetchTimeSlotAndSetState = async (
    { workingTime: _workingTime, workingTimeUnit, startTimePlanned, amount, workstationId, endTimePlanned },
    key,
  ) => {
    const { processes, form } = this.props;
    const configCapacityConstraint = getConfigCapacityConstraint();
    const {
      data,
      startTimeConflictsArray: _startTimeConflictsArray,
      capacityConstraintConflictsArray: _capacityConstraintConflictsArray,
      endTimeConflictsArray: _endTimeConflictsArray,
      productionTimeArray: _productionTimeArray,
      availableTimeArray: _availableTimeArray,
    } = this.state;
    const startTimeConflictsArray = _startTimeConflictsArray || [];
    const capacityConstraintConflictsArray = _capacityConstraintConflictsArray || [];
    const endTimeConflictsArray = _endTimeConflictsArray || [];
    const productionTimeArray = _productionTimeArray || [];
    const availableTimeArray = _availableTimeArray || [];
    let time;
    if (!(processes && processes.length && data && data.length)) {
      return;
    }
    if (_workingTime) {
      if (workingTimeUnit === 'm') {
        time = _workingTime * 60 * 1000;
      } else if (workingTimeUnit === 'h') {
        time = _workingTime * 60 * 60 * 1000;
      } else if (workingTimeUnit === 'd') {
        time = _workingTime * 24 * 60 * 60 * 1000;
      }
    }
    const { workOrderCode, processSeq } = processes[key];
    const { workstations } = data[key];
    // 没有工位 表示获取推荐工位
    if (typeof amount === 'number') {
      const {
        data: { data },
      } = await queryTimeSlot({
        code: workOrderCode,
        seq: processSeq,
        body: {
          amount,
          startTime: startTimePlanned && formatToUnix(startTimePlanned),
          endTime: endTimePlanned && formatToUnix(endTimePlanned),
          workingTime: time,
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
      const values = [];
      values[key] = {
        startTimePlanned: formatUnixMoment(startTime),
      };
      if (!configCapacityConstraint) {
        values[key].endTimePlanned = endTime && formatUnixMoment(endTime);
        if (workingTime) {
          if (form.getFieldValue(`values[${key}].workingTimeUnit`) === 'h') {
            values[key].workingTime = new BigJs(workingTime)
              .div(60 * 60 * 1000)
              .round(6)
              .valueOf();
          } else if (form.getFieldValue(`values[${key}].workingTimeUnit`) === 'd') {
            values[key].workingTime = new BigJs(workingTime)
              .div(24 * 60 * 60 * 1000)
              .round(6)
              .valueOf();
          } else {
            values[key].workingTime = new BigJs(workingTime)
              .div(60 * 1000)
              .round(6)
              .valueOf();
          }
        } else {
          values[key].workingTime = undefined;
        }
      }
      if (suggestWorkstation) {
        values[key].workstationId = {
          value: `WORKSTATION-${suggestWorkstation.id}`,
          label: suggestWorkstation.name,
        };
      }
      const { startTimeConflicts, endTimeConflicts, capacityConstraintConflicts } = this.formatConflicts(conflict);
      startTimeConflictsArray[key] = startTimeConflicts;
      capacityConstraintConflictsArray[key] = capacityConstraintConflicts;
      endTimeConflictsArray[key] = endTimeConflicts;
      productionTimeArray[key] = productionTime;
      availableTimeArray[key] = availableTime;
      setTimeout(() => form.setFieldsValue({ values }));
      this.setState({ startTimeConflictsArray, endTimeConflictsArray, productionTimeArray, availableTimeArray });
    } else {
      startTimeConflictsArray[key] = undefined;
      endTimeConflictsArray[key] = undefined;
      productionTimeArray[key] = undefined;
      availableTimeArray[key] = undefined;
      this.setState({ startTimeConflictsArray, endTimeConflictsArray, productionTimeArray, availableTimeArray });
    }
  };

  bulkFetchTimeSlotAndSetState = async p => {
    const { form, processes } = this.props;
    const {
      data,
      startTimeConflictsArray: _startTimeConflictsArray,
      endTimeConflictsArray: _endTimeConflictsArray,
      productionTimeArray: _productionTimeArray,
      availableTimeArray: _availableTimeArray,
      capacityConstraintConflictsArray: _capacityConstraintConflictsArray,
    } = this.state;
    const configCapacityConstraint = getConfigCapacityConstraint();
    const capacityConstraintConflictsArray = _capacityConstraintConflictsArray || [];
    const startTimeConflictsArray = _startTimeConflictsArray || [];
    const endTimeConflictsArray = _endTimeConflictsArray || [];
    const productionTimeArray = _productionTimeArray || [];
    const availableTimeArray = _availableTimeArray || [];
    if (!(processes && processes.length && data && data.length)) {
      return;
    }
    const keys = [];
    const noAmountKeys = [];
    const params = p
      .filter((e, index) => {
        if (typeof e.amount === 'number') {
          keys.push(index);
          return true;
        }
        noAmountKeys.push(index);
        return false;
      })
      .map(({ workingTime: _workingTime, workingTimeUnit, ...rest }) => {
        let time;
        if (_workingTime) {
          if (workingTimeUnit === 'm') {
            time = _workingTime * 60 * 1000;
          } else if (workingTimeUnit === 'h') {
            time = _workingTime * 60 * 60 * 1000;
          } else if (workingTimeUnit === 'd') {
            time = _workingTime * 24 * 60 * 60 * 1000;
          }
        }
        return {
          ...rest,
          workingTime: time,
        };
      });
    console.log(params);

    if (params.length) {
      const {
        data: { data: res },
      } = await bulkQueryTimeSlot(params);
      const values = [];
      res.forEach((timeslot, index) => {
        const key = keys[index];
        const {
          startTime,
          endTime,
          workingTime,
          productionTime,
          conflict,
          availableTime,
          workstationId: suggestWorkstationId,
        } = timeslot;
        const { workstations } = data[key];
        const suggestWorkstation = workstations && workstations.find(e => e.id === suggestWorkstationId);
        values[key] = {
          startTimePlanned: formatUnixMoment(startTime),
        };
        console.log(startTime, endTime, configCapacityConstraint);
        if (!configCapacityConstraint) {
          values[key].endTimePlanned = endTime && formatUnixMoment(endTime);
          if (workingTime) {
            if (form.getFieldValue(`values[${key}].workingTimeUnit`) === 'h') {
              values[key].workingTime = new BigJs(workingTime)
                .div(60 * 60 * 1000)
                .round(6)
                .valueOf();
            } else if (form.getFieldValue(`values[${key}].workingTimeUnit`) === 'd') {
              values[key].workingTime = new BigJs(workingTime)
                .div(24 * 60 * 60 * 1000)
                .round(6)
                .valueOf();
            } else {
              values[key].workingTime = new BigJs(workingTime)
                .div(60 * 1000)
                .round(6)
                .valueOf();
            }
          } else {
            values[key].workingTime = undefined;
          }
        }
        if (suggestWorkstation) {
          values[key].workstationId = {
            value: `WORKSTATION-${suggestWorkstation.id}`,
            label: suggestWorkstation.name,
          };
        }
        const { startTimeConflicts, endTimeConflicts, capacityConstraintConflicts } = this.formatConflicts(conflict);
        startTimeConflictsArray[key] = startTimeConflicts;
        endTimeConflictsArray[key] = endTimeConflicts;
        capacityConstraintConflictsArray[key] = capacityConstraintConflicts;
        productionTimeArray[key] = productionTime;
        availableTimeArray[key] = availableTime;
      });
      noAmountKeys.forEach(key => {
        startTimeConflictsArray[key] = undefined;
        endTimeConflictsArray[key] = undefined;
        productionTimeArray[key] = undefined;
        availableTimeArray[key] = undefined;
      });
      console.log(values);
      this.setState({ startTimeConflictsArray, endTimeConflictsArray, productionTimeArray, availableTimeArray });
      form.setFieldsValue({ values });
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
    this.props.form.validateFields({ force: true }, async (err, v) => {
      if (err) {
        return;
      }
      const { values } = v;
      const { onSuccess, sourceWarehouseCode } = this.props;
      const { data: processes } = this.state;
      const checkWorkOrderOperatorError = [];
      const configCapacityConstraint = getConfigCapacityConstraint();
      const submitValues = values.map((value, index) => {
        const { processSeq, workOrderCode, category } = processes[index];
        const {
          startTimePlanned,
          endTimePlanned,
          amountProductPlanned,
          workstationId,
          locked,
          operatorGroupId,
          operatorIds,
          // operatorType,
          workingTime,
          workingTimeUnit,
        } = value;
        if (category === 2 && !operatorGroupId && !(Array.isArray(operatorIds) && operatorIds.length)) {
          checkWorkOrderOperatorError.push(workOrderCode);
        }
        const submitValue = {
          processSeq,
          workOrderCode,
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
          } else if (workingTimeUnit === 'd') {
            submitValue.workingTime = new BigJs(workingTime).times(24 * 60 * 60 * 1000).valueOf();
          } else if (workingTimeUnit === 'm') {
            submitValue.workingTime = new BigJs(workingTime).times(60 * 1000).valueOf();
          }
          submitValue.planEndTime = formatToUnix(endTimePlanned.set({ second: 0, millisecond: 0 }));
          submitValue.timeUnit = workingTimeUnit;
        }
        submitValue.sourceWarehouseCode = sourceWarehouseCode;
        // saveScheduleTaskWorkerType(operatorType);
        saveScheduleTaskWorkingTimeUnit(workingTimeUnit);
        return submitValue;
      });
      if (checkWorkOrderOperatorError.length) {
        message.error(`工单号${checkWorkOrderOperatorError.join(',')}为下料工单，必须填写执行人`);
        return;
      }
      this.setState({ submiting: true });
      const { data } = await bulkManualCreateTask(submitValues).finally(e => {
        this.setState({ submiting: false });
      });
      if (!arrayIsEmpty(data.data.failed)) {
        const { scheduleLog, failed } = data.data;
        openModal({
          title: (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Icon type="check-circle" style={{ color: blacklakeGreen, fontSize: 26, marginRight: 5 }} />
              <div>
                <p>自动排程完成！</p>
                <p style={{ fontSize: 12 }}>
                  成功数：{scheduleLog.successAmount}，失败数：{scheduleLog.failureAmount}
                  <a
                    style={{ marginLeft: 5 }}
                    href={`/cooperate/taskSchedule/process-log-list/detail/${scheduleLog.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    查看详情
                  </a>
                </p>
              </div>
            </div>
          ),
          children: (
            <div>
              <div style={{ margin: '10px 0' }}>以下工序因库存不足而排程失败：</div>
              <SimpleTable
                style={{ margin: 0 }}
                pagination={false}
                scroll={{ y: 200 }}
                dataSource={failed}
                columns={[
                  { title: '排程数量', dataIndex: 'amount', render: text => text || replaceSign, key: 'amount' },
                  {
                    title: '订单编号',
                    dataIndex: 'purchaseCode',
                    render: text => text || replaceSign,
                    key: 'purchaseCode',
                  },
                  {
                    title: '工单编号',
                    dataIndex: 'workOrderCode',
                    key: 'workOrderCode',
                  },
                  {
                    title: '工序',
                    dataIndex: 'processName',
                    key: 'processName',
                    render: (processName, { processSeq }) => `${processSeq || replaceSign}/${processName}`,
                  },
                  {
                    title: '产出物料',
                    dataIndex: 'outMaterialCode',
                    key: 'outMaterialCode',
                    render: (outMaterialCode, { outMaterialName }) => `${outMaterialCode}/${outMaterialName}`,
                  },
                ].map(node => ({ ...node, width: 150 }))}
              />
            </div>
          ),
          innerContainerStyle: {
            margin: 20,
          },
        });
        return;
      }
      // 将执行人类型的选择保存在本地

      // if (data.statusCode === 302) {
      //   openModal({
      //     children: (
      //       <ConflictAlert
      //         task={data.data && data.data.length && data.data[0]}
      //         onOk={async () => {
      //           context.setState({ submiting: true });
      //           await createTask({ workOrderCode, processCode, processSeq, ...submitValue, force: true }).finally(e => {
      //             context.setState({ submiting: false });
      //           });
      //           message.success('创建任务成功');
      //           closeModal();
      //           if (onSuccess) {
      //             onSuccess();
      //           }
      //         }}
      //       />
      //     ),
      //     width: 580,
      //     title: null,
      //     footer: null,
      //   });
      // } else {
      message.success('创建任务成功');
      if (onSuccess) {
        onSuccess(data);
      } else {
        closeModal();
      }
      // }
    });
  };

  getDataValue = () => {
    const { form } = this.props;
    const { data } = this.state;
    const { values } = form.getFieldsValue();
    return _.zipWith(values, data, (a, b) => ({ ...b, ...a }));
  };

  changeAllAmount = async ({ amount }) => {
    if (amount === undefined) {
      return;
    }
    const v = this.getDataValue();
    const params = v.map(
      ({ workOrderCode, processSeq, workstationId: workstation, startTimePlanned, workingTime, workingTimeUnit }) => {
        const { value: _workstation } = workstation || {};
        const [type, workstationId] = _workstation.split('-');
        return {
          workOrderCode,
          processSeq,
          amount,
          workstationId,
        };
      },
    );
    await this.bulkFetchTimeSlotAndSetState(params);
    const { form } = this.props;
    const { data } = this.state;
    const values = [];
    data.forEach((data, index) => {
      values[index] = {};
      values[index].amountProductPlanned = amount;
    });
    form.setFieldsValue({ values });
  };

  selectAllWorkstations = async workstation => {
    const v = this.getDataValue();
    const { value: _workstation } = workstation || {};
    if (!_workstation) {
      return;
    }
    const [type, workstationId] = _workstation.split('-');
    const params = v.map(({ workOrderCode, processSeq, amountProductPlanned: amount }) => ({
      workOrderCode,
      processSeq,
      amount,
      workstationId,
    }));
    await this.bulkFetchTimeSlotAndSetState(params);
    const { form } = this.props;
    const { data } = this.state;
    const values = [];
    data.forEach((data, index) => {
      values[index] = {};
      values[index].workstationId = workstation;
    });
    form.setFieldsValue({ values });
  };

  selectAllUsers = user => {
    const { form } = this.props;
    const { data } = this.state;
    const values = [];
    data.forEach((data, index) => {
      values[index] = {
        ...user,
      };
    });
    form.setFieldsValue({ values });
  };

  selectAllStartTime = async ({ time: startTimePlanned }) => {
    if (!startTimePlanned) {
      return;
    }
    startTimePlanned.set({ second: 0, millisecond: 0 });
    const v = this.getDataValue();
    const params = v.map(
      ({
        workOrderCode,
        processSeq,
        amountProductPlanned: amount,
        workstationId: workstation,
        workingTime,
        workingTimeUnit,
      }) => {
        const { value: _workstation } = workstation || {};
        const [type, workstationId] = _workstation.split('-');
        return {
          workOrderCode,
          processSeq,
          amount,
          workstationId,
          workingTime,
          workingTimeUnit,
          startTime: startTimePlanned && formatToUnix(startTimePlanned),
        };
      },
    );
    await this.bulkFetchTimeSlotAndSetState(params);
    const { form } = this.props;
    const { data } = this.state;
    const values = [];
    data.forEach((data, index) => {
      values[index] = {};
      values[index].startTimePlanned = startTimePlanned;
    });
    form.setFieldsValue({ values });
  };

  selectAllEndTime = async ({ time: endTimePlanned }) => {
    if (!endTimePlanned) {
      return;
    }
    endTimePlanned.set({ second: 0, millisecond: 0 });
    const v = this.getDataValue();
    const params = v.map(
      ({ workOrderCode, processSeq, amountProductPlanned: amount, workstationId: workstation, startTimePlanned }) => {
        const { value: _workstation } = workstation || {};
        const [type, workstationId] = _workstation.split('-');
        return {
          workOrderCode,
          processSeq,
          amount,
          workstationId,
          startTime: startTimePlanned && formatToUnix(startTimePlanned),
          endTime: endTimePlanned && formatToUnix(endTimePlanned),
        };
      },
    );
    await this.bulkFetchTimeSlotAndSetState(params);
    const { form } = this.props;
    const { data } = this.state;
    const values = [];
    data.forEach((data, index) => {
      values[index] = {};
      values[index].endTimePlanned = endTimePlanned;
    });
    form.setFieldsValue({ values });
  };

  selectAllWorkingTime = async ({ workingTime, workingTimeUnit }) => {
    if (!workingTime) {
      return;
    }
    const v = this.getDataValue();
    const params = v.map(
      ({ workOrderCode, processSeq, amountProductPlanned: amount, workstationId: workstation, startTimePlanned }) => {
        const { value: _workstation } = workstation || {};
        const [type, workstationId] = _workstation.split('-');
        return {
          workOrderCode,
          processSeq,
          workstationId,
          startTimePlanned,
          amount,
          startTime: startTimePlanned && formatToUnix(startTimePlanned),
          workingTime,
          workingTimeUnit,
        };
      },
    );
    await this.bulkFetchTimeSlotAndSetState(params);
    const { form } = this.props;
    const { data } = this.state;
    const values = [];
    data.forEach((data, index) => {
      values[index] = {
        workingTime,
        workingTimeUnit,
      };
    });
    form.setFieldsValue({ values });
  };

  getColumns = () => {
    const { keys, data } = this.state;
    const { form, type } = this.props;
    const { getFieldDecorator, getFieldValue, setFieldsValue } = form;
    const configCapacityConstraint = getConfigCapacityConstraint();
    const workstations = (data || []).map(e => e.workstations);
    const intersectionWorkstations = workstations.reduce(
      (a, b) => _.intersectionBy(a, b, 'id'),
      _.flattenDeep(workstations),
    );
    let columns = [
      {
        title: '订单编号',
        key: 'purchaseCode',
        width: 80,
        render: (_, process, key) => {
          return <div>{process.purchaseCode || replaceSign}</div>;
        },
      },
      {
        title: '工单编号',
        key: 'workOrderCode',
        width: 80,
        render: (_, process, key) => {
          getFieldDecorator(`values[${key}].workOrderCode`);
          return <div>{getFieldValue(`values[${key}].workOrderCode`)}</div>;
        },
      },
      {
        title: (
          <span>
            工单产出物料
            <Tooltip
              title={
                <div style={{ display: 'flex' }}>
                  <div>下料工单显示工单投入物料</div>
                </div>
              }
            >
              <Icon type="exclamation-circle-o" color={'rgba(0, 0, 0, 0.4)'} />
            </Tooltip>
          </span>
        ),
        key: 'workOrderMaterial',
        width: 180,
        render: (_, process) => {
          const { category, workOrderOutMaterial, workOrderInMaterial } = process;
          const material = category !== 2 ? workOrderOutMaterial : workOrderInMaterial;
          return (
            <Tooltip
              text={
                Array.isArray(material) && material.length
                  ? material.map(e => `${e.code}/${e.name}`).join(',')
                  : replaceSign
              }
              length={15}
            />
          );
        },
      },
      {
        title: (
          <div>
            <span style={{ paddingRight: 10 }}>计划产出数量</span>
            <Link
              onClick={() => {
                openModal({
                  width: '40%',
                  children: <AmountModal />,
                  onOk: value => this.changeAllAmount(value),
                  title: '选择全部',
                  footer: null,
                  innerContainerStyle: { marginBottom: 80 },
                });
              }}
            >
              选择全部
            </Link>
          </div>
        ),
        key: 'amount',
        width: 100,
        render: (_, process, key) => {
          return (
            <div>
              <FormItem style={{ width: 90 }}>
                {getFieldDecorator(`values[${key}].amountProductPlanned`, {
                  rules: [
                    { required: true, message: '产出物料数量不能为空' },
                    { validator: amountValidator(10e6, { value: 0, equal: false, message: '数量必须大于0' }) },
                  ],
                })(
                  <InputNumber
                    style={{ width: 90 }}
                    onBlur={async () => {
                      const amount = getFieldValue(`values[${key}].amountProductPlanned`);
                      const { value: workstation } = getFieldValue(`values[${key}].workstationId`) || {};
                      const [type, workstationId] = (workstation || '').split('-');
                      const workingTimeUnit = getFieldValue(`values[${key}].workingTimeUnit`);
                      const workingTime = getFieldValue(`values[${key}].workingTime`);
                      const startTimePlanned = getFieldValue(`values[${key}].startTimePlanned`);
                      const endTimePlanned = getFieldValue(`values[${key}].endTimePlanned`);
                      this.fetchTimeSlotAndSetState(
                        {
                          amount,
                          workstationId,
                        },
                        key,
                      );
                    }}
                  />,
                )}
              </FormItem>
            </div>
          );
        },
      },
      {
        title: (
          <div>
            <span style={{ paddingRight: 10 }}>工位</span>
            {intersectionWorkstations && intersectionWorkstations.length ? (
              <Link
                onClick={() => {
                  openModal({
                    width: '40%',
                    children: <WorkstationSelectModal intersectionWorkstations={intersectionWorkstations} />,
                    onOk: value => this.selectAllWorkstations(value),
                    title: '选择全部',
                    footer: null,
                    innerContainerStyle: { marginBottom: 80 },
                  });
                }}
              >
                选择全部
              </Link>
            ) : (
              <Popiknow iconType={'exclamation-circle-o'} content={'已选工序无可用公共的工位'}>
                <Link>选择全部</Link>
              </Popiknow>
            )}
          </div>
        ),
        key: 'workstations',
        width: 180,
        render: (_, process, key) => {
          const { workstations } = process || {};
          return (
            <FormItem>
              {getFieldDecorator(`values[${key}].workstationId`, {
                rules: [{ required: true, message: '工位不能为空' }],
                onChange: async value => {
                  const { value: _workstation } = value || {};
                  if (!_workstation) {
                    return;
                  }
                  const [type, workstationId] = _workstation.split('-');
                  const amount = getFieldValue(`values[${key}].amountProductPlanned`);
                  const {
                    data: { data },
                  } = await queryDefWorkstations({ ids: workstationId });
                  const workstation = data[0];
                  if (workstation && !arrayIsEmpty(workstation.workers)) {
                    const operatorIds = workstation.workers
                      .filter(e => e.job === 'OP')
                      .map(e => ({ key: e.id, label: e.name }));
                    if (!arrayIsEmpty(operatorIds)) {
                      const values = [];
                      values[key] = { operatorType: 'user', operatorIds };
                      form.setFieldsValue({ values });
                    }
                  }
                  await this.fetchTimeSlotAndSetState({ workstationId, amount }, key);
                },
              })(
                <WorkstationAndAreaSelect
                  labelInValue
                  onlyWorkstations
                  options={workstations}
                  style={{ width: 160 }}
                />,
              )}
            </FormItem>
          );
        },
      },
      {
        title: (
          <div>
            <span style={{ paddingRight: 10 }}>执行人</span>
            <Link
              onClick={() => {
                openModal({
                  width: '40%',
                  children: <UserSelectModal />,
                  onOk: value => this.selectAllUsers(value),
                  title: '选择全部',
                  footer: null,
                  innerContainerStyle: { marginBottom: 80 },
                });
              }}
            >
              选择全部
            </Link>
          </div>
        ),
        key: 'users',
        width: 400,
        render: (_, process, key) => {
          return (
            <FormItem style={{ width: 400 }}>
              <UserOrUserGroupSelect prefix={`values[${key}].`} form={form} />
            </FormItem>
          );
        },
      },
      {
        title: (
          <div>
            <span style={{ paddingRight: 10 }}>计划开始时间</span>
            <Link
              onClick={() => {
                openModal({
                  width: '40%',
                  children: <TimeSelectModal />,
                  onOk: value => this.selectAllStartTime(value),
                  title: '选择全部',
                  footer: null,
                  innerContainerStyle: { marginBottom: 80 },
                });
              }}
            >
              选择全部
            </Link>
          </div>
        ),
        key: 'startTimePlanned',
        width: 160,
        render: (_, process, key) => {
          const { startTimeConflictsArray, productionTimeArray, capacityConstraintConflictsArray } = this.state;
          const startTimeConflicts = startTimeConflictsArray && startTimeConflictsArray[key];
          const capacityConstraintConflicts = capacityConstraintConflictsArray && capacityConstraintConflictsArray[key];
          const productionTime = productionTimeArray && productionTimeArray[key];
          return (
            <React.Fragment>
              <FormItem style={{ width: 150 }}>
                {getFieldDecorator(`values[${key}].startTimePlanned`, {
                  rules: [
                    { required: true, message: '计划开始时间不能为空' },
                    {
                      validator: (rule, value, cb) => {
                        const endTime = getFieldValue(`values[${key}].endTimePlanned`);
                        if (!configCapacityConstraint && value && endTime && !moment(value).isBefore(endTime)) {
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
                    const { value: workstation } = getFieldValue(`values[${key}].workstationId`) || {};
                    const [type, workstationId] = (workstation || []).split('-');
                    const amount = getFieldValue(`values[${key}].amountProductPlanned`);
                    form.resetFields([`values[${key}].endTimePlanned`, `values[${key}].workingTime`]);
                    if (startTimePlanned) {
                      this.fetchTimeSlotAndSetState({ startTimePlanned, workstationId, amount }, key);
                    }
                  },
                })(
                  <DatePicker
                    disabledDate={current => {
                      return current && current.valueOf() < moment().startOf('day');
                    }}
                    disabledTime={this.getDisabledTime}
                    style={{ width: 150 }}
                    showToday={false}
                    showTime={configCapacityConstraint ? undefined : { format: 'HH:mm' }}
                    format={configCapacityConstraint ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm'}
                  />,
                )}
              </FormItem>
              {startTimeConflicts && startTimeConflicts.length
                ? startTimeConflicts.map((c, index) => <div style={{ color: '#8C8C8C' }}>{c.desc}</div>)
                : null}
              {capacityConstraintConflicts && capacityConstraintConflicts.length ? (
                <div style={{ color: '#8C8C8C' }}>{capacityConstraintConflicts[0].desc}</div>
              ) : null}
              {productionTime !== null && productionTime !== undefined ? (
                <div style={{ color: '#8C8C8C' }}>
                  预计生产
                  {new BigJs(productionTime)
                    .div(60 * 60 * 1000)
                    .round(1)
                    .valueOf()}
                  小时
                </div>
              ) : null}
            </React.Fragment>
          );
        },
      },
    ];
    if (!configCapacityConstraint) {
      columns = columns.concat([
        {
          title: (
            <div>
              <span style={{ paddingRight: 10 }}>计划工作时长</span>
              <Link
                onClick={() => {
                  openModal({
                    width: '40%',
                    children: <WorkingTimeSelectModal />,
                    onOk: value => this.selectAllWorkingTime(value),
                    title: '选择全部',
                    footer: null,
                    innerContainerStyle: { marginBottom: 80 },
                  });
                }}
              >
                选择全部
              </Link>
            </div>
          ),
          key: 'workingTime',
          width: 180,
          render: (_, process, key) => {
            return (
              <FormItem style={{ width: 180 }}>
                {getFieldDecorator(`values[${key}].workingTime`, {
                  rules: [{ required: true, message: '时间必填' }, { validator: amountValidator() }],
                })(
                  <InputNumber
                    onBlur={async () => {
                      const workingTime = getFieldValue(`values[${key}].workingTime`);
                      const { value: workstation } = getFieldValue(`values[${key}].workstationId`) || {};
                      const [type, workstationId] = (workstation || '').split('-');
                      const amount = getFieldValue(`values[${key}].amountProductPlanned`);
                      const workingTimeUnit = getFieldValue(`values[${key}].workingTimeUnit`);
                      const startTimePlanned = getFieldValue(`values[${key}].startTimePlanned`);
                      if (workingTime) {
                        this.fetchTimeSlotAndSetState(
                          { workingTime, startTimePlanned, workstationId, amount, workingTimeUnit },
                          key,
                        );
                      }
                    }}
                  />,
                )}{' '}
                {getFieldDecorator(`values[${key}].workingTimeUnit`, {
                  initialValue: 'm',
                  onChange: workingTimeUnit => {
                    const oldWorkingTime = getFieldValue(`values[${key}].workingTime`);
                    const oldWorkingTimeUnit = getFieldValue(`values[${key}].workingTimeUnit`);
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
                    const values = [];
                    values[key] = {};
                    values[key].workingTime = workingTime;
                    setFieldsValue({ values });
                  },
                })(
                  <Select style={{ width: 80 }}>
                    <Option value={'d'}>天</Option>
                    <Option value={'h'}>小时</Option>
                    <Option value={'m'}>分钟</Option>
                  </Select>,
                )}
              </FormItem>
            );
          },
        },
        {
          title: (
            <div>
              <span style={{ paddingRight: 10 }}>计划结束时间</span>
              <Link
                onClick={() => {
                  openModal({
                    width: '40%',
                    children: <TimeSelectModal />,
                    onOk: value => this.selectAllEndTime(value),
                    title: '选择全部',
                    footer: null,
                    innerContainerStyle: { marginBottom: 80 },
                  });
                }}
              >
                选择全部
              </Link>
            </div>
          ),
          key: 'endTimePlanned',
          width: 160,
          render: (_, process, key) => {
            const { endTimeConflictsArray } = this.state;
            const endTimeConflicts = endTimeConflictsArray && endTimeConflictsArray[key];
            return (
              <React.Fragment>
                <FormItem style={{ width: 150 }}>
                  {getFieldDecorator(`values[${key}].endTimePlanned`, {
                    onChange: endTimePlanned => {
                      if (endTimePlanned) {
                        endTimePlanned.set({ second: 0, millisecond: 0 });
                      }
                      const { value: workstation } = getFieldValue(`values[${key}].workstationId`) || {};
                      const [type, workstationId] = (workstation || []).split('-');
                      const amount = getFieldValue(`values[${key}].amountProductPlanned`);
                      const workingTime = getFieldValue(`values[${key}].workingTime`);
                      const workingTimeUnit = getFieldValue(`values[${key}].workingTimeUnit`);
                      const startTimePlanned = getFieldValue(`values[${key}].startTimePlanned`);
                      if (diff(endTimePlanned, startTimePlanned) > 0) {
                        this.fetchTimeSlotAndSetState(
                          { startTimePlanned, workingTime, workstationId, amount, endTimePlanned, workingTimeUnit },
                          key,
                        );
                      }
                    },
                    rules: [
                      { required: true, message: '计划结束时间不能为空' },
                      {
                        validator: (rule, value, cb) => {
                          const startTime = getFieldValue(`values[${key}].startTimePlanned`);
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
                        const startTime = moment(getFieldValue(`values[${key}].startTimePlanned`));
                        if (startTime) {
                          return current && current.valueOf() < startTime.startOf('day');
                        }
                        return current && current.valueOf() < moment().startOf('day');
                      }}
                      disabledTime={this.getDisabledTime}
                      style={{ width: 150 }}
                      showToday={false}
                      showTime={{ format: 'HH:mm' }}
                      format="YYYY-MM-DD HH:mm"
                    />,
                  )}
                </FormItem>
                {endTimeConflicts && endTimeConflicts.length
                  ? endTimeConflicts.map((c, index) => <div style={{ color: '#8C8C8C' }}>{c.desc}</div>)
                  : null}
              </React.Fragment>
            );
          },
        },
      ]);
    }
    columns = columns.concat([
      {
        title: '是否锁定',
        key: 'locked',
        width: 120,
        render: (_, process, key) => {
          return (
            <FormItem style={{ width: 120 }}>
              {getFieldDecorator(`values[${key}].locked`, {
                rules: [{ required: true, message: '是否锁定必填' }],
                initialValue: false,
              })(<RadioGroup options={[{ label: '是', value: true }, { label: '否', value: false }]} />)}
            </FormItem>
          );
        },
      },
    ]);
    return columns;
  };

  render() {
    const { type, isModal } = this.props;
    const { data } = this.state;
    const columns = this.getColumns();
    return (
      <div className={styles.bulkCreateTaskContainer}>
        <Table pagination={false} columns={columns} scroll={{ x: true, y: 550 }} dataSource={data} />
        <div style={{ position: 'absolute', bottom: 25, marginLeft: 550 }}>
          <Button
            type="default"
            disabled={this.state.submiting}
            style={{ width: 114 }}
            onClick={
              type === 'edit'
                ? isModal
                  ? () => closeModal()
                  : () => this.context.router.push('/cooperate/prodTasks')
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
const BulkCreateBase = withForm({}, BulkCreateProduceTaskBase);
function CreateProduceTask({ processes, ...rest }, callback) {
  const { onSuccess } = callback || {};
  openModal({
    children: <BulkCreateBase processes={processes} {...rest} onSuccess={onSuccess} />,
    width: '95%',
    title: '批量手动排程',
    footer: null,
    innerContainerStyle: {
      margin: 0,
      maxHeight: window.innerHeight - 150,
      marginBottom: 80,
      border: 'none',
      backgroundColor: '#FFF',
    },
    style: {
      top: 10,
      maxHeight: '100%',
    },
  });
}

export default CreateProduceTask;
