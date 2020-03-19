import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { Textarea, DatePicker, Input, withForm, Form, FormItem } from 'src/components/index';
import UserDepartmentWareHouseSelect from 'src/components/select/userDeparetmentWareHouseSelect';
import { getDeliveryRequestCode } from 'src/services/stock/deliveryRequest';
import log from 'src/utils/log';
import moment from 'src/utils/time';
import { orderNumberFormat, lengthValidate } from 'src/components/form';

import MaterialListForm from './materialListForm';

const FORM_ITEM_WIDTH = 300;

class BaseForm extends Component {
  state = {
    sequence: null,
    wareHouseId: null,
  };

  async componentDidMount() {
    const { isEdit } = this.props;

    if (!isEdit) {
      try {
        const res = await getDeliveryRequestCode();
        const code = _.get(res, 'data.data');
        this.setState({ sequence: code });
      } catch (e) {
        log.error(e);
      }
    } else {
      this.setInitialValue(this.props);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(nextProps.initialData, this.props.initialData) && nextProps.isEdit) {
      this.setInitialValue(nextProps);
    }
  }

  setInitialValue = props => {
    const { initialData, form } = props || this.props;
    if (initialData) {
      const { header } = initialData;
      const { code, remark, requireTime, storageId, storageName } = header || {};

      this.setState({ wareHouseId: storageId }, () => {
        form.setFieldsValue({
          storage: { key: storageId, label: storageName },
          sequence: code,
          remark,
          requireTime: requireTime ? moment(requireTime) : null,
        });
      });
    }
  };

  getFormValue = () => {
    const { form } = this.props;
    const { validateFieldsAndScroll } = form || {};

    let res = null;

    if (typeof validateFieldsAndScroll === 'function') {
      validateFieldsAndScroll((err, value) => {
        if (err) return;

        res = value;
      });
    }

    return res;
  };

  render() {
    const { form, initialData, isEdit } = this.props;
    const { sequence, wareHouseId } = this.state;
    const { getFieldDecorator } = form || {};
    const { changeChineseToLocale } = this.context;

    return (
      <Form>
        <FormItem label={'发出仓库'}>
          {getFieldDecorator('storage', {
            rules: [
              {
                required: 'true',
                message: changeChineseToLocale('发出仓库必选'),
              },
            ],
            onChange: value => {
              this.setState({ wareHouseId: value ? value.key : null });
            },
          })(<UserDepartmentWareHouseSelect style={{ width: FORM_ITEM_WIDTH }} />)}
        </FormItem>
        <FormItem label={'发运申请编号'}>
          {getFieldDecorator('sequence', {
            rules: [
              {
                required: true,
                message: changeChineseToLocale('发运申请编号必填'),
              },
              {
                validator: orderNumberFormat(changeChineseToLocale('发运申请编号')),
              },
              {
                validator: lengthValidate(0, 30),
              },
            ],
            initialValue: sequence,
          })(<Input style={{ width: FORM_ITEM_WIDTH }} placeholder={changeChineseToLocale('请输入发运申请编号')} />)}
        </FormItem>
        <FormItem label={'需求时间'}>
          {getFieldDecorator('requireTime')(<DatePicker style={{ width: FORM_ITEM_WIDTH }} />)}
        </FormItem>
        <FormItem label={'物料列表'}>
          <MaterialListForm
            form={form}
            isEdit={isEdit}
            initialData={initialData ? initialData.items : null}
            wareHouseId={wareHouseId}
          />
        </FormItem>
        <FormItem label={'备注'}>
          {getFieldDecorator('remark', {
            rules: [
              {
                validator: lengthValidate(0, 50),
              },
            ],
          })(<Textarea maxLength={50} style={{ height: 100, width: FORM_ITEM_WIDTH }} />)}
        </FormItem>
      </Form>
    );
  }
}

BaseForm.propTypes = {
  style: PropTypes.object,
  form: PropTypes.any,
  isEdit: PropTypes.any,
  initialData: PropTypes.any,
};

BaseForm.contextTypes = {
  changeChineseToLocale: PropTypes.any,
};

export default withForm({}, BaseForm);
