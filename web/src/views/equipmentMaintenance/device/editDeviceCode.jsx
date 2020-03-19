import React, { Component } from 'react';
import Proptypes from 'prop-types';
import _ from 'lodash';
import { editDeviceCode, editEquipmentModuleCode } from 'services/equipmentMaintenance/device';
import { editMouldCode } from 'services/equipmentMaintenance/mould';
import { FormItem, withForm, Input } from 'src/components';
import { lengthValidate, equipCodeFormat } from 'components/form';

type Props = {
  form: any,
  intl: any,
  targetId: any,
  targetType: any,
  editCode: () => {},
  initialValue: any,
};

class EditDeviceCode extends Component {
  props: Props;

  submit = () => {
    const {
      form: { getFieldsValue },
      targetId,
      editCode,
      targetType,
    } = this.props;
    // TODO: 此处type不规范
    const editTargetCode =
      targetType === 'module' ? editEquipmentModuleCode : targetType === 'device' ? editDeviceCode : editMouldCode;
    const value = getFieldsValue();
    return editTargetCode(targetId, value.code).then(() => {
      editCode(value.code);
    });
  };

  render() {
    const { form, initialValue } = this.props;
    const { changeChineseToLocale } = this.context;
    const { getFieldDecorator } = form;

    return (
      <div style={{ marginLeft: 65 }}>
        <FormItem label="新编码">
          {getFieldDecorator('code', {
            rules: [
              { required: true, message: changeChineseToLocale('名称必填') },
              {
                validator: lengthValidate(6, 32),
              },
              {
                validator: equipCodeFormat(changeChineseToLocale('编码')),
              },
            ],
            initialValue,
          })(<Input style={{ width: 300 }} placeholder="请输入编码" trim />)}
        </FormItem>
      </div>
    );
  }
}

EditDeviceCode.contextTypes = {
  changeChineseToLocale: Proptypes.func,
};

export default withForm({ showFooter: true }, EditDeviceCode);
