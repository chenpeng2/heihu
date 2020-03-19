import React, { Component } from 'react';
import _ from 'lodash';
import moment from 'src/utils/time';
import { amountValidator } from 'src/components/form';
import { injectIntl } from 'react-intl';
import { changeChineseToLocale } from 'utils/locale/utils';
import { InputNumber, FormItem, withForm, DatePicker, Select, message } from 'src/components';
import { updateCalibrationConfig } from 'services/equipmentMaintenance/device';
import { cycle } from './constants';

type Props = {
  form: any,
  calibrationConfig: any,
  intl: any,
  deviceId: any,
  update: () => {},
};
const Option = Select.Option;

class EditCalibrationConfigModal extends Component {
  props: Props;
  state = {};

  componentDidMount() {
    const { form, calibrationConfig } = this.props;
    const { setFieldsValue } = form;
    const { calibrationValidEndTime, calibrationRemindTimeAmount, calibrationRemindTimeUnit } = calibrationConfig;
    const formValue = {
      validEndTime: (calibrationValidEndTime && moment(calibrationValidEndTime)) || null,
      remindTimeAmount: (calibrationRemindTimeAmount && `${calibrationRemindTimeAmount}`) || null,
      remindTimeUnit: (calibrationRemindTimeUnit && {
        label: cycle.filter(n => n.key === `${calibrationRemindTimeUnit}`)[0].label,
        key: `${calibrationRemindTimeUnit}`,
      }) || { label: '日', key: '1' },
    };
    setFieldsValue(formValue);
    this.setState({ calibrationValidEndTime });
  }

  submit = () => {
    const {
      form: { validateFieldsAndScroll },
      deviceId,
      update,
      calibrationConfig,
    } = this.props;
    const { calibrationValidEndTime, calibrationLastValidEndTime } = calibrationConfig;
    validateFieldsAndScroll((err, values) => {
      if (err) return null;
      const { remindTimeAmount, remindTimeUnit, validEndTime } = values;
      const params = {
        calibrationRemindTimeAmount: Number(remindTimeAmount),
        calibrationRemindTimeUnit: Number(remindTimeUnit.key),
        calibrationValidEndTime: Date.parse(validEndTime),
        calibrationLastValidEndTime: calibrationValidEndTime || calibrationLastValidEndTime,
      };
      return updateCalibrationConfig(deviceId, params).then(() => {
        message.success('设备效期配置成功');
        update(params);
      });
    });
  };

  render() {
    const { form, intl } = this.props;
    const { calibrationValidEndTime } = this.state;
    const { getFieldDecorator, getFieldValue, resetFields } = form;

    return (
      <div style={{ marginLeft: 65 }}>
        <FormItem label="有效期至" className="resourceCategory">
          {getFieldDecorator('validEndTime')(
            <DatePicker
              showTime={{ format: 'HH:mm' }}
              format="YYYY-MM-DD HH:mm"
              style={{ width: 300 }}
              placeholder={'请选择时间'}
              onChange={value => {
                if (!value) {
                  resetFields(['remindTimeAmount']);
                }
                this.setState({ calibrationValidEndTime: value });
              }}
            />,
          )}
        </FormItem>
        <FormItem label="提醒时间">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div>
              {changeChineseToLocale('有效期前', intl)}
              {getFieldDecorator('remindTimeAmount', {
                rules: [
                  {
                    validator: amountValidator(
                      999,
                      { value: '0', equal: false, message: changeChineseToLocale('数字必须大于0', intl) },
                      'integer',
                    ),
                  },
                ],
              })(
                <InputNumber
                  disabled={!(calibrationValidEndTime || getFieldValue('validEndTime'))}
                  style={{ width: 118, marginLeft: 10 }}
                  placeholder={'请输入整数'}
                />,
              )}
            </div>
            {getFieldDecorator('remindTimeUnit')(
              <Select
                disabled={!(calibrationValidEndTime || getFieldValue('validEndTime'))}
                style={{ width: 113, marginLeft: 10 }}
                labelInValue
              >
                {cycle.map(n => (
                  <Option value={n.key}>{changeChineseToLocale(n.label, intl)}</Option>
                ))}
              </Select>,
            )}
          </div>
        </FormItem>
      </div>
    );
  }
}

export default injectIntl(withForm({ showFooter: true }, EditCalibrationConfigModal));
