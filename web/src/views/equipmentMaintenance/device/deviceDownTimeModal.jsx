import React, { Component } from 'react';
import moment from 'utils/time';
import { withForm, FormItem, DatePicker, message, openModal, Button, Icon } from 'src/components';
import {
  addProdEquipPlanDownTime,
  updateProdEquipPlanDownTime,
  addProdEquipRecordDownTime,
  updateProdEquipRecordDownTime,
  addEquipModulePlanDownTime,
  updateEquipModulePlanDownTime,
  addEquipModuleRecordDownTime,
  updateEquipModuleRecordDownTime,
} from 'services/equipmentMaintenance/base';
import { injectIntl } from 'react-intl';
import { changeChineseToLocale, changeChineseToLocaleWithoutIntl } from 'utils/locale/utils';
import styles from './index.scss';

type Props = {
  form: {},
  data: any,
  intl: any,
  type: string,
  equipType: string,
  time: any,
  deviceId: any,
  planId: any,
  action: string,
  handleSubmit: () => {},
  onClose: () => {},
  setPageDeviceLog: () => {},
};
const timeFormat = 'YYYY-MM-DD HH:mm';
const AntModal = openModal.AntModal;
const confirm = AntModal.confirm;

class DeviceDownTimeModal extends Component {
  props: Props;

  getDisabledStartTime = () => {
    const {
      form: { getFieldValue },
    } = this.props;
    const startTime = getFieldValue('startDownTime');
    const endTime = getFieldValue('endDownTime');
    if (endTime && startTime && moment(startTime).dayOfYear() === moment(endTime).dayOfYear()) {
      return {
        disabledHours: () => this.range(0, 24).splice(moment(endTime).hour() + 1),
        disabledMinutes: () => this.range(0, 60).splice(moment(endTime).minute()),
      };
    }
  };

  getDisabledStartDate = current => {
    const {
      form: { getFieldValue },
    } = this.props;
    const endTime = getFieldValue('endDownTime');
    return endTime && current && moment(current).endOf('day') > moment(endTime).endOf('day');
  };

  getDisabledEndTime = () => {
    const {
      form: { getFieldValue },
    } = this.props;
    const startTime = getFieldValue('startDownTime');
    const endTime = getFieldValue('endDownTime');
    if (startTime && endTime && moment(startTime).dayOfYear() === moment(endTime).dayOfYear()) {
      return {
        disabledHours: () => this.range(0, 24).splice(0, moment(startTime).hour()),
        disabledMinutes: () => this.range(0, 60).splice(0, moment(startTime).minute() + 1),
      };
    }
  };

  getDisabledEndDate = current => {
    const {
      form: { getFieldValue },
    } = this.props;
    const startTime = getFieldValue('startDownTime');
    return startTime && current && moment(current).endOf('day') < moment(startTime).endOf('day');
  };

  range = (start, end) => {
    const result = [];
    for (let i = start; i < end; i += 1) {
      result.push(i);
    }
    return result;
  };

  showConfirm = (onOk, type) => {
    confirm({
      title: '确定保存？',
      content: `该${type === 'plan' ? '计划' : '实际'}停机保存后无法修改，是否确定`,
      iconType: 'exclamation-circle',
      onOk,
      onCancel() {},
    });
  };

  submit = () => {
    const {
      data,
      form,
      action,
      type,
      equipType,
      deviceId,
      handleSubmit,
      planId,
      onClose,
      setPageDeviceLog,
    } = this.props;
    const { validateFieldsAndScroll } = form;
    let addDownTime = null;
    let updateDownTime = null;
    if (type === 'plan') {
      if (equipType === 'device') {
        addDownTime = addProdEquipPlanDownTime;
        updateDownTime = updateProdEquipPlanDownTime;
      } else {
        addDownTime = addEquipModulePlanDownTime;
        updateDownTime = updateEquipModulePlanDownTime;
      }
    } else if (equipType === 'device') {
      addDownTime = addProdEquipRecordDownTime;
      updateDownTime = updateProdEquipRecordDownTime;
    } else {
      addDownTime = addEquipModuleRecordDownTime;
      updateDownTime = updateEquipModuleRecordDownTime;
    }
    validateFieldsAndScroll((err, values) => {
      if (!err) {
        try {
          const { startDownTime, endDownTime } = values;
          const startTime = Date.parse(startDownTime);
          const endTime = Date.parse(endDownTime);
          const params = { startTime, endTime };
          if (endTime < Date.parse(moment())) {
            if (action === 'create') {
              this.showConfirm(() => {
                addDownTime(deviceId, params).then(res => {
                  data.push({ id: res.data.data, startTime, endTime });
                  message.success('保存成功！');
                  setPageDeviceLog();
                  handleSubmit();
                  onClose();
                });
              }, type);
            } else {
              this.showConfirm(() => {
                updateDownTime(deviceId, planId, params).then(() => {
                  data.forEach((n, index) => {
                    if (n.id === planId) {
                      data[index] = { id: planId, startTime, endTime };
                    }
                  });
                  message.success('更新成功！');
                  setPageDeviceLog();
                  handleSubmit();
                  onClose();
                });
              }, type);
            }
          } else if (action === 'create') {
            addDownTime(deviceId, params).then(res => {
              data.push({ id: res.data.data, startTime, endTime });
              message.success('保存成功！');
              setPageDeviceLog();
              handleSubmit();
              onClose();
            });
          } else {
            updateDownTime(deviceId, planId, params).then(() => {
              data.forEach((n, index) => {
                if (n.id === planId) {
                  data[index] = { id: planId, startTime, endTime };
                }
              });
              message.success('更新成功！');
              setPageDeviceLog();
              handleSubmit();
              onClose();
            });
          }
        } catch (e) {
          console.error(e);
        }
      }
    });
  };

  render = () => {
    const { form, type, time, onClose, intl } = this.props;
    const { getFieldDecorator } = form;
    return (
      <div>
        <div style={{ display: 'inline-block', marginTop: 20, marginLeft: 50 }}>
          <FormItem label="开始停用时间">
            {getFieldDecorator('startDownTime', {
              rules: [{ required: true, message: changeChineseToLocaleWithoutIntl('开始时间不可为空') }],
              initialValue: time && time.startTime && moment(time.startTime),
            })(
              <DatePicker
                showTime
                format={timeFormat}
                style={{ width: 300 }}
                placeholder={changeChineseToLocale('请选择时间', intl)}
                disabledTime={this.getDisabledStartTime}
                disabledDate={this.getDisabledStartDate}
              />,
            )}
          </FormItem>
          <FormItem label="结束停用时间">
            {getFieldDecorator('endDownTime', {
              rules: [{ required: type === 'plan', message: changeChineseToLocaleWithoutIntl('结束时间不可为空') }],
              initialValue: time && time.endTime && moment(time.endTime),
            })(
              <DatePicker
                showTime
                format={timeFormat}
                style={{ width: 300 }}
                placeholder={changeChineseToLocale('请选择时间', intl)}
                disabledTime={this.getDisabledEndTime}
                disabledDate={this.getDisabledEndDate}
              />,
            )}
          </FormItem>
          <div className={styles.footer}>
            <Button
              className={styles.cancel}
              type="ghost"
              onClick={() => {
                onClose();
              }}
            >
              取消
            </Button>
            <Button type="primary" className={styles.ok} onClick={() => this.submit()}>
              保存
            </Button>
          </div>
        </div>
      </div>
    );
  };
}

export default withForm({ showFooter: false }, injectIntl(DeviceDownTimeModal));
