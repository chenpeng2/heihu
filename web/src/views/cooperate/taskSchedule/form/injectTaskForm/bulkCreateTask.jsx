import React, { Component } from 'react';
import { openModal, Icon, SimpleTable, withForm, Button, message } from 'components';
import { closeModal } from 'components/modal';
import { formatUnixMoment, formatToUnix } from 'utils/time';
import { arrayIsEmpty } from 'utils/array';
import { bulkManualCreateInjectTask, checkMouldUnit } from 'services/schedule';
import { replaceSign } from 'constants';
import { blacklakeGreen } from 'styles/color';
import BaseForm from './baseForm';
import ConflictModal from './conflictModal';
import { formatFormValue } from './utils';

const BaseWithForm = withForm({}, BaseForm);

class BulkCreateInjectTaskBase extends Component {
  state = {
    index: 0,
  };

  saveFormValue = () => {
    const { form } = this.props;
    const { index } = this.state;
    let value;
    if (this.formRef) {
      value = this.formRef.wrappedInstance.getFormValue();
    }
    if (!value) {
      return;
    }
    const v = form.getFieldValue('value');
    v[index] = value;
    form.setFieldsValue({ value: v });
    return value;
  };

  submitData = async value => {
    const { onSuccess } = this.props;
    this.setState({ submiting: true });
    const {
      data: { data },
    } = await bulkManualCreateInjectTask(value.map(e => formatFormValue(e))).finally(() => {
      this.setState({ submiting: false });
    });
    console.log(data);
    if (!arrayIsEmpty(data.failed)) {
      const { scheduleLog, failed } = data;
      openModal({
        onOk: () => {
          closeModal();
        },
        onCancel: () => {
          closeModal();
        },
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
    message.success('批量创建任务成功');
    if (onSuccess) {
      onSuccess(data);
    } else {
      closeModal();
    }
  };

  submit = async () => {
    const { form } = this.props;
    const res = this.saveFormValue();
    if (!res) {
      return;
    }
    const { value } = form.getFieldsValue();
    const { mouldUnit, startTimePlanned, endTimePlanned } = res;
    if (mouldUnit && mouldUnit.id) {
      const {
        data: { data },
      } = await checkMouldUnit({
        id: mouldUnit.id,
        startTime: formatToUnix(startTimePlanned.set({ second: 0, millisecond: 0 })),
        endTime: formatToUnix(endTimePlanned.set({ second: 0, millisecond: 0 })),
      });
      if (data && data.conflict === 'MOULD_UNIT_CONFLICTED') {
        openModal({
          children: <ConflictModal data={data.detail} />,
          onOk: () => this.submitData(value),
        });
      } else {
        await this.submitData(value);
      }
    } else {
      await this.submitData(value);
    }
  };

  render() {
    const { form, isModal, type, workOrderCodes, onCancel } = this.props;
    const { index } = this.state;
    workOrderCodes.forEach((workOrderCodes, index) => {
      form.getFieldDecorator(`value[${index}]`);
    });
    return (
      <BaseWithForm
        key={index}
        initialValue={form.getFieldValue(`value[${index}]`)}
        wrappedComponentRef={inst => (this.formRef = inst)}
        workOrderCode={workOrderCodes[index]}
        footer={
          <div style={{ position: 'absolute', bottom: -10, marginLeft: 120 }}>
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
            {index === 0 ? null : (
              <Button
                disabled={this.state.submiting}
                style={{ width: 114, marginLeft: 60 }}
                onClick={async () => {
                  const res = this.saveFormValue();
                  if (!res) {
                    return;
                  }
                  const { mouldUnit, startTimePlanned, endTimePlanned } = res;
                  if (mouldUnit && mouldUnit.id) {
                    const {
                      data: { data },
                    } = await checkMouldUnit({
                      id: mouldUnit.id,
                      startTime: formatToUnix(startTimePlanned.set({ second: 0, millisecond: 0 })),
                      endTime: formatToUnix(endTimePlanned.set({ second: 0, millisecond: 0 })),
                    });
                    if (data && data.conflict === 'MOULD_UNIT_CONFLICTED') {
                      openModal({
                        children: <ConflictModal data={data.detail} />,
                        onOk: () => this.setState({ index: index + 1 }),
                      });
                    } else {
                      this.setState({ index: index - 1 });
                    }
                  } else {
                    this.setState({ index: index - 1 });
                  }
                }}
              >
                上一个
              </Button>
            )}
            {index === workOrderCodes.length - 1 ? (
              <Button
                disabled={this.state.submiting}
                style={{ width: 114, marginLeft: 60 }}
                onClick={async () => {
                  await this.submit();
                  onCancel();
                }}
              >
                保存
              </Button>
            ) : (
              <Button
                disabled={this.state.submiting || index === workOrderCodes.length - 1}
                style={{ width: 114, marginLeft: 60 }}
                onClick={async () => {
                  const res = this.saveFormValue();
                  if (!res) {
                    return;
                  }
                  const { mouldUnit, startTimePlanned, endTimePlanned } = res;
                  if (mouldUnit && mouldUnit.id) {
                    const {
                      data: { data },
                    } = await checkMouldUnit({
                      id: mouldUnit.id,
                      startTime: formatToUnix(startTimePlanned.set({ second: 0, millisecond: 0 })),
                      endTime: formatToUnix(endTimePlanned.set({ second: 0, millisecond: 0 })),
                    });
                    if (data && data.conflict === 'MOULD_UNIT_CONFLICTED') {
                      openModal({
                        children: <ConflictModal data={data.detail} />,
                        onOk: () => this.setState({ index: index + 1 }),
                      });
                    } else {
                      this.setState({ index: index + 1 });
                    }
                  } else {
                    this.setState({ index: index + 1 });
                  }
                }}
              >
                下一个（{index + 1}／{workOrderCodes.length}）
              </Button>
            )}
          </div>
        }
      />
    );
  }
}

const BulkCreateInjectTaskForm = withForm({ className: 'notDefaultClassName' }, BulkCreateInjectTaskBase);

function EditInjectTask({ workOrderCodes, ...rest }, callback) {
  const { onSuccess } = callback || {};
  openModal({
    children: <BulkCreateInjectTaskForm workOrderCodes={workOrderCodes} {...rest} onSuccess={onSuccess} />,
    title: '创建排程',
    footer: null,
    innerContainerStyle: { marginBottom: 80 },
  });
}

export default EditInjectTask;
