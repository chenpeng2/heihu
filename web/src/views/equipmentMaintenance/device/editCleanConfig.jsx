import React, { Component } from 'react';
import _ from 'lodash';
import { FormItem, withForm, Checkbox } from 'src/components';
import { injectIntl } from 'react-intl';
import { changeChineseToLocale } from 'utils/locale/utils';
import { configClean } from 'services/equipmentMaintenance/device';
import CleanConfigInput from 'src/views/knowledgeManagement/equipmentModeling/equipmentType/base/cleanConfigInput';
import { warning } from 'src/styles/color';

type Props = {
  form: any,
  intl: any,
  cleanConfig: {},
  deviceId: any,
  update: () => {},
};

class EditCleanConfig extends Component {
  props: Props;
  state = {
    data: null,
  };

  submit = () => {
    const {
      form: { getFieldsValue },
      deviceId,
      update,
    } = this.props;
    const value = getFieldsValue();
    const { open, cleanValidPeriod } = value;
    update({ open, ...cleanValidPeriod });
    return configClean(deviceId, { open, ...cleanValidPeriod });
  };

  render() {
    const { form, cleanConfig, intl } = this.props;
    const { getFieldDecorator } = form;

    return (
      <div style={{ marginLeft: 65 }}>
        <FormItem
          label="清洁管理"
          className="resourceCategory"
          validateStatus="warning"
          help="勾选后，系统会对该设备类型设备的清洁操作进行记录、管理和控制"
        >
          {getFieldDecorator('open', {
            valuePropName: 'checked',
            initialValue: _.get(cleanConfig, 'open', undefined) || false,
          })(<Checkbox>开启</Checkbox>)}
        </FormItem>
        <FormItem label="清洁效期">
          {getFieldDecorator('cleanValidPeriod', {
            initialValue: {
              validPeriod: _.get(cleanConfig, 'validPeriod', undefined) || 0,
              validPeriodUnit: _.get(cleanConfig, 'validPeriodUnit', undefined) || 'h',
            },
            rules: [
              {
                validator: (rule, value, callback) => {
                  const reg = /^[0-9]*$/g;
                  if (!reg.test(value.validPeriod)) {
                    callback('必须为正整数');
                  }
                  callback();
                },
              },
            ],
          })(<CleanConfigInput />)}
        </FormItem>
        <div style={{ marginLeft: 120, color: warning, marginTop: -7 }}>
          {changeChineseToLocale('如果该清洁无需进行效期控制，则填写0', intl)}
        </div>
      </div>
    );
  }
}

export default injectIntl(withForm({ showFooter: true }, EditCleanConfig));
