import React, { Component, useEffect, useState } from 'react';
import { FormItem, Select } from 'src/components';
import { changeChineseToLocaleWithoutIntl } from 'src/utils/locale/utils';
import { getQcAql, getQcAqlInspections } from 'src/services/qcConfig';
import { AQL_CHECK } from 'src/views/qualityManagement/constants';

const Option = Select.Option;

type Props = {
  field: String,
  logic: Number,
  checkCountType: Number,
  showLabel: Boolean,
  qcAqlBulk: Boolean,
  isCardModel: Boolean,
  qcAqlIdBulk: Boolean,
  form: any,
};

const cardFormItemWrapperStyle = {
  display: 'flex',
  flexDirection: 'column',
};
const cardAqlIdItemStyle = {
  marginLeft: 0,
};

class AqlFormItem extends Component {
  props: Props;
  state = {
    aqlInspections: [],
    aqlValue: [],
  };

  componentDidMount() {
    this.fetchData();
  }

  fetchData = async () => {
    const {
      data: { data: aqlInspections },
    } = await getQcAqlInspections();
    const {
      data: { data: aqlValue },
    } = await getQcAql();
    this.setState({ aqlValue, aqlInspections });
  };

  render() {
    const { form, field, showLabel = false, qcAqlBulk, isCardModel, checkCountType } = this.props;
    const { aqlValue, aqlInspections } = this.state;
    const { getFieldDecorator, validateFields } = form;

    return (
      <div
        style={
          (isCardModel && checkCountType === AQL_CHECK && cardFormItemWrapperStyle) || {
            display: 'flex',
            alignItems: 'center',
          }
        }
      >
        <FormItem label={showLabel ? '检验水平与接收质量限' : ''}>
          {getFieldDecorator(`qcCheckItemConfigs${field}.qcAqlInspectionLevelId`, {
            rules: [
              {
                required: typeof qcAqlBulk === 'boolean' ? qcAqlBulk : true,
                message: changeChineseToLocaleWithoutIntl('检验水平必填'),
              },
            ],
            onChange: () => {
              this.setState({ updated: true }, () => {
                validateFields([`qcCheckItemConfigs${field}.qcAqlInspectionLevelId`], { force: true });
              });
            },
          })(
            <Select style={{ width: 140 }} placeholder={'检验水平'}>
              {aqlInspections.map(({ id, name }) => (
                <Option key={id} value={id}>
                  {name}
                </Option>
              ))}
            </Select>,
          )}
        </FormItem>
        <FormItem label="">
          {getFieldDecorator(`qcCheckItemConfigs${field}.qcAqlId`, {
            rules: [
              {
                required: typeof qcAqlBulk === 'boolean' ? qcAqlBulk : true,
                message: changeChineseToLocaleWithoutIntl('接收质量限必填'),
              },
            ],
            onChange: () => {
              this.setState({ updated: true }, () => {
                validateFields([`qcCheckItemConfigs${field}.qcAqlId`], { force: true });
              });
            },
          })(
            <Select
              style={{
                width: 140,
                marginLeft: 10,
                ...(isCardModel && checkCountType === AQL_CHECK ? cardAqlIdItemStyle : {}),
              }}
              placeholder={'接收质量限'}
            >
              {aqlValue.map(({ id, value }) => (
                <Option key={id} value={id}>
                  {value}
                </Option>
              ))}
            </Select>,
          )}
        </FormItem>
      </div>
    );
  }
}

export default AqlFormItem;
