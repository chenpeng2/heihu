import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';

import { Tooltip, Icon, Radio, message, Select, withForm, FilterSortSearchBar, Button, Input } from 'src/components';
import { primary, error, middleGrey, greyWhite, border } from 'src/styles/color';
import { amountValidator } from 'src/components/form';
import SearchSelect from 'src/components/select/searchSelect';
import { getBarcodeRuleList, createBarcodeLabelList } from 'src/services/barCodeLabel';
import { getProject } from 'src/services/cooperate/project';
import ProductBatchCodeSelect from 'src/containers/productBatchCode/base/productBatchCodeSelect';
import { PRODUCT_BATCH_CODE_GENERATE_SOURCE } from 'src/containers/productBatchCode/util';

import { TAG_TYPE } from '../../constant';
import { ELECTRONIC_TAG_MODEL, getLabelType, saveLabelType } from '../utils';

const ItemList = FilterSortSearchBar.ItemList;
const Item = FilterSortSearchBar.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;

type Props = {
  style: {},
  form: any,
  cbForCreateTag: () => {},
  selectedProjectInfo: any,
};

class TagSelect extends Component {
  props: Props;
  state = {};

  componentDidMount() {
    this.setDefaultLabelRule();
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(nextProps.selectedProjectInfo, this.props.selectedProjectInfo)) {
      this.props.form.resetFields();
      this.setDefaultLabelRule(nextProps);
    }
  }

  setLabelAmount = innerProductAmount => {
    const { selectedProjectInfo, form } = this.props;
    const projectCode = _.get(selectedProjectInfo, 'projectCode');

    getProject({ code: projectCode }).then(res => {
      const data = _.get(res, 'data.data');
      const { productAmount, amountProductPlanned } = data || {};

      if (!Number(innerProductAmount)) {
        form.setFieldsValue({ labelAmount: 1 });
        return;
      }

      const legalAmount = (Number(amountProductPlanned) - Number(productAmount)) / Number(innerProductAmount);
      if (typeof legalAmount === 'number' && legalAmount >= 1) {
        form.setFieldsValue({ labelAmount: Math.floor(legalAmount) });
      } else {
        form.setFieldsValue({ labelAmount: 1 });
      }
    });
  };

  setDefaultLabelRule = props => {
    const { form } = props || this.props;

    getBarcodeRuleList({ searchAsDefaults: 1, searchStatuses: 1 }).then(res => {
      const data = _.get(res, 'data.data');
      if (Array.isArray(data) && data.length === 1 && data[0]) {
        const { ruleName, ruleId } = data[0];
        form.setFieldsValue({ labelRule: { key: ruleId, label: ruleName } });
      }
    });
  };

  extraSearchForLabelRule = p => {
    const { search, ...rest } = p || {};
    return getBarcodeRuleList({ searchRuleName: search, ...rest, searchStatuses: 1 }).then(res => {
      const data = _.get(res, 'data.data');

      if (Array.isArray(data)) {
        return data.map(i => {
          const { ruleName, ruleId } = i || {};
          return {
            key: ruleId,
            label: ruleName,
          };
        });
      }
      return [];
    });
  };

  onClickForCreate = () => {
    const { cbForCreateTag, form, selectedProjectInfo } = this.props;
    const { projectCode, productCode } = selectedProjectInfo || {};
    const { validateFieldsAndScroll } = form || {};

    validateFieldsAndScroll((err, value) => {
      if (err) return;

      const { type, labelType, productAmount, productBatchSeq, labelRule, labelAmount } = value || {};

      const _value = {
        labelAmount,
        labelType,
        productAmount,
        productBatchSeq: productBatchSeq ? productBatchSeq.key : null,
        ruleId: labelRule ? labelRule.key : null,
        type,
        keys: [
          {
            projectCode,
            productCode,
          },
        ],
      };

      createBarcodeLabelList(_value).then(() => {
        message.success('创建条码标签成功');
        saveLabelType(type);

        if (typeof cbForCreateTag === 'function') cbForCreateTag();
      });
    });
  };

  renderTipForTitle = (title, tipText) => {
    return (
      <div>
        <Tooltip.AntTooltip title={tipText}>
          <div style={{ whiteSpace: 'nowrap' }} >
            <span style={{ marginRight: 5 }}>{title}</span>
            <Icon type={'info-circle-o'} style={{ color: primary }} />
          </div>
        </Tooltip.AntTooltip>
      </div>
    );
  };

  render() {
    const { form, selectedProjectInfo } = this.props;
    const { changeChineseToLocale } = this.context;
    const projectCode = _.get(selectedProjectInfo, 'projectCode') || null;
    const { getFieldDecorator, resetFields, getFieldError } = form || {};

    return (
      <div style={{ background: greyWhite, border: `1px dashed ${border}` }}>
        <FilterSortSearchBar searchDisabled>
          <ItemList>
            <Item label={'条码标签类型'}>
              {getFieldDecorator('labelType', {
                initialValue: 2,
              })(
                <Select placeholder={'请选择'} disabled>
                  {Object.values(TAG_TYPE).map(i => {
                    const { name, value } = i || {};
                    return (
                      <Option value={value} key={value}>
                        {changeChineseToLocale(name)}
                      </Option>
                    );
                  })}
                </Select>,
              )}
            </Item>
            <Item label={'包含产品数量'}>
              <div>
                {getFieldDecorator('productAmount', {
                  rules: [
                    {
                      validator: amountValidator(),
                    },
                  ],
                  onChange: this.setLabelAmount,
                })(<Input />)}
                <span style={{ color: error }}>
                  {getFieldError('productAmount') ? getFieldError('productAmount').join(',') : null}
                </span>
              </div>
            </Item>
            <Item label={'产品批次号'}>
              {getFieldDecorator('productBatchSeq')(
                <ProductBatchCodeSelect
                  searchParams={{
                    searchChannels: [
                      PRODUCT_BATCH_CODE_GENERATE_SOURCE.preCreate.value,
                      PRODUCT_BATCH_CODE_GENERATE_SOURCE.unKnow.value,
                    ].join(','), // 不显示后生成的数据
                  }}
                  cbForAddNewCode={newValue => {
                    form.setFieldsValue({
                      productBatchSeq: { key: newValue, label: newValue },
                    });
                  }}
                  projectCode={projectCode}
                />,
              )}
            </Item>
            <Item label={'条码标签规则'}>
              {getFieldDecorator('labelRule')(<SearchSelect extraSearch={this.extraSearchForLabelRule} />)}
            </Item>
            <Item label={'条码标签数量'}>
              <div>
                {getFieldDecorator('labelAmount', {
                  rules: [
                    {
                      validator: amountValidator(null, 1, 'integer'),
                    },
                  ],
                })(<Input />)}
                <span style={{ color: error }}>
                  {getFieldError('labelAmount') ? getFieldError('labelAmount').join(',') : null}
                </span>
              </div>
            </Item>
            <Item
              label={this.renderTipForTitle(
                changeChineseToLocale('标签模式'),
                <div>
                  <div>{changeChineseToLocale('成品出货模式：标签只能使用在对应项目下的成品物料产出')}</div>
                  <div>{changeChineseToLocale('流转卡模式：标签可以使用在对应项目下的任意工序产出')}</div>
                </div>,
              )}
              itemWrapperStyle={{ marginTop: 5 }}
            >
              {getFieldDecorator('type', {
                initialValue: getLabelType() || ELECTRONIC_TAG_MODEL.productLabel.value,
              })(
                <RadioGroup>
                  {Object.values(ELECTRONIC_TAG_MODEL).map(i => {
                    const { name, value } = i || {};
                    return <Radio value={value}>{changeChineseToLocale(name)}</Radio>;
                  })}
                </RadioGroup>,
              )}
            </Item>
          </ItemList>
          <div>
            {/* 没有projectCode就disabled */}
            <Button disabled={!projectCode} icon="plus-circle-o" onClick={this.onClickForCreate}>
              {changeChineseToLocale('生成条码')}
            </Button>
            <span
              style={{ color: middleGrey, margin: '0 10px', cursor: 'pointer', verticalAlign: 'middle' }}
              onClick={() => {
                resetFields();
              }}
            >
              {changeChineseToLocale('重置')}
            </span>
          </div>
        </FilterSortSearchBar>
      </div>
    );
  }
}

TagSelect.contextTypes = {
  changeChineseToLocale: PropTypes.any,
};

export default withForm({}, TagSelect);
