import React, { Component } from 'react';
import { FormItem, Select, InputNumber, Input } from 'src/components';
import { changeChineseToLocaleWithoutIntl } from 'src/utils/locale/utils';
import {
  CHECKITEM_CHECKCOUNT_TYPE,
  AQL_CHECK,
  QUANTITY_CHECK,
  RATIO_CHECK,
} from 'src/views/qualityManagement/constants';
import { getCheckNumsValid } from '../index';

const Option = Select.Option;

type Props = {
  field: String,
  showLabel: Boolean,
  samplingBulk: Boolean,
  isCardModel: Boolean,
  checkCountType: Number,
  aqlColumns: any,
  form: any,
};

class samplingFormItem extends Component {
  props: Props;

  render() {
    const { form, field, checkCountType, aqlColumns, samplingBulk, isCardModel, showLabel = false } = this.props;
    const { getFieldDecorator, validateFields } = form;

    return (
      <div style={{ display: isCardModel ? 'block' : 'flex', alignItems: 'center' }}>
        <FormItem
          style={{ marginRight: 10, width: showLabel ? 'auto' : 100 }}
          label={showLabel ? '抽检类型与数值' : ''}
        >
          {getFieldDecorator(`qcCheckItemConfigs${field}.checkCountType`, {
            rules: [
              {
                required: typeof samplingBulk === 'boolean' ? samplingBulk : true,
                message: changeChineseToLocaleWithoutIntl('抽检类型必填'),
              },
            ],
            onChange: () => {
              this.setState({ updated: true }, () => {
                validateFields([`qcCheckItemConfigs${field}.checkCountType`], { force: true });
              });
            },
          })(
            <Select style={{ width: 100 }} placeholder={'请选择'}>
              {Object.keys(CHECKITEM_CHECKCOUNT_TYPE).map(prop => (
                <Option key={Number(prop)} value={Number(prop)}>
                  {changeChineseToLocaleWithoutIntl(CHECKITEM_CHECKCOUNT_TYPE[prop])}
                </Option>
              ))}
            </Select>,
          )}
        </FormItem>
        <FormItem>
          {checkCountType !== AQL_CHECK ? (
            <div style={{ display: 'flex', marginTop: isCardModel ? 6 : 0 }}>
              {getFieldDecorator(`qcCheckItemConfigs${field}.checkNums`, {
                onChange: () => {
                  this.setState({ updated: true }, () => {
                    validateFields([`qcCheckItemConfigs${field}.checkNums`], { force: true });
                  });
                },
                ...getCheckNumsValid(form, checkCountType, false, samplingBulk),
              })(<InputNumber style={{ width: 90 }} placeholder={changeChineseToLocaleWithoutIntl('请输入数量')} />)}
              <Input
                style={{
                  visibility: checkCountType === QUANTITY_CHECK ? 'hidden' : 'visible',
                  width: 60,
                  marginLeft: 10,
                }}
                value={checkCountType === RATIO_CHECK ? '%' : changeChineseToLocaleWithoutIntl('单位')}
                disabled
              />
            </div>
          ) : (
            <div style={{ display: 'flex', width: 290, justifyContent: 'space-between' }}>{aqlColumns}</div>
          )}
        </FormItem>
      </div>
    );
  }
}

export default samplingFormItem;
