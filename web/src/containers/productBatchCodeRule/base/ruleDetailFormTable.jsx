// 批号规则的规则明细的form table

// 组件中的数据流向：
// 1. table的数据initial data来源与state中的dataSource。state中的dataSource来源于props中的initialData
// 2. table中表单的数据来源与form store

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { Select, Link, FormItem, Icon, InputNumber, Input, Table } from 'src/components';
import { replaceSign } from 'src/constants';
import {
  PRODUCT_BATCH_CODE_RULE_DETAIL_TYPE,
  PRODUCT_BATCH_CODE_RULE_DETAIL_ORIGINAL,
  PRODUCT_BATCH_CODE_RULE_DETAIL_SEQUENCE_TYPE,
  PRODUCT_BATCH_CODE_RULE_DETAIL_DATE_FORMAT,
  PRODUCT_BATCH_CODE_RULE_DETAIL_VARIABLE_FORMAT,
  findProductBatchCodeRuleDetailDate,
  PRODUCT_BATCH_CODE_RULE_TYPE,
} from '../util';

const Option = Select.Option;

const baseRuleItemStyle = { width: 100 };
const baseRuleItemNumberStyle = { width: 80 };
const replaceSignFormItem = <div style={{ marginBottom: 14 }}>{replaceSign}</div>;

// 获取元素来源的可选项
const getSelectOptionDataForValueSource = (ruleType, allSource) => {
  const allData = Object.values(allSource).map(k => ({
    value: k.value,
    label: k.name,
  }));
  const purchaseOrderCode_projectCode_materialCode = [
    PRODUCT_BATCH_CODE_RULE_DETAIL_ORIGINAL.purchaseOrderCode.value,
    PRODUCT_BATCH_CODE_RULE_DETAIL_ORIGINAL.projectCode.value,
    PRODUCT_BATCH_CODE_RULE_DETAIL_ORIGINAL.projectProductCode.value,
  ];

  // 后生成：订单编号、项目编号、成品物料编号；+车间编号（20）、产线编号（20）、工位编号（20）、工序编号（20）、设备编号（32）（生产过程中所使用的工位关联设备）、模具编号（32）（生产过程中所使用的工位关联模具）；
  if (ruleType === PRODUCT_BATCH_CODE_RULE_TYPE.afterCreate.value) {
    return allData;
  }

  // 预生成：订单编号（20）、项目编号（20）、成品物料编号（50）；
  if (ruleType === PRODUCT_BATCH_CODE_RULE_TYPE.preCreate.value) {
    return allData.filter(i => {
      return purchaseOrderCode_projectCode_materialCode.indexOf(i.value) !== -1;
    });
  }

  return allData;
};

// 获取元素格式的初始值
const getInitialValueForFormat = (value, type) => {
  if (type === PRODUCT_BATCH_CODE_RULE_DETAIL_TYPE.date.value) return value;
  if (type === PRODUCT_BATCH_CODE_RULE_DETAIL_TYPE.variable.value) {
    return typeof value === 'number' ? value : PRODUCT_BATCH_CODE_RULE_DETAIL_VARIABLE_FORMAT.variableUnchanged.value;
  }

  return undefined;
};

class RuleDetailFormTable extends Component {
  state = {
    dataSource: [],
    itemTypes: [],
    total: 0,
    keys: 0,
  };

  componentDidMount = () => {
    const { initialValue } = this.props;
    if (!initialValue) {
      this.handleAdd();
    } else {
      this.handleAdd(initialValue);
    }
  };

  componentWillReceiveProps = nextProps => {
    if (!_.isEqual(nextProps.initialValue, this.props.initialValue)) {
      this.handleAdd(nextProps.initialValue);
    }
  };

  handleAdd = initialItems => {
    const { dataSource, keys } = this.state;

    const initialObj = {
      itemType: null,
      valueConst: null,
      valueFormat: null,
      valueLength: null,
      valueSeqType: null,
      valueSource: null,
      valueStart: null,
      valueStep: null,
    };
    if (initialItems) {
      initialItems = initialItems.map((x, i) => _.merge(x, { key: i }));
    }

    this.setState({
      dataSource:
        initialItems ||
        _.concat(dataSource, [
          {
            key: keys,
            ...initialObj,
          },
        ]),
      keys: initialItems ? initialItems.length : keys + 1,
    });
  };

  handleMinus = index => {
    const { dataSource } = this.state;
    const _dataSource = _.difference(dataSource, [dataSource[index]]);
    this.setState({
      dataSource: _dataSource,
    });
  };

  getFooter = () => {
    const { changeChineseToLocale } = this.context;
    return (
      <Link icon="plus-circle-o" onClick={() => this.handleAdd()}>
        {changeChineseToLocale('添加')}
      </Link>
    );
  };

  getColumns = () => {
    const { ruleType, form } = this.props;
    const { changeChineseToLocale } = this.context;
    const { getFieldDecorator } = form;

    return [
      {
        title: '序号',
        width: 80,
        render: (text, record, index) => {
          return (
            <div>
              <Icon
                onClick={() => this.handleMinus(index)}
                style={{ margin: '0 10px', cursor: 'pointer' }}
                type="minus-circle"
                className="minusIcon"
              />
              {index + 1}
            </div>
          );
        },
      },
      {
        title: '类型',
        dataIndex: 'itemType',
        className: 'ruleItemHeader',
        width: 105,
        render: (text, record) => {
          const { key } = record;
          const selectData = Object.values(PRODUCT_BATCH_CODE_RULE_DETAIL_TYPE).map(k => ({
            value: k.value,
            label: k.name,
          }));

          return (
            <div style={{ height: 45 }}>
              <FormItem>
                {getFieldDecorator(`items[${key}].itemType`, {
                  initialValue: typeof text === 'number' ? text : undefined,
                  rules: [
                    {
                      required: true,
                      message: changeChineseToLocale('类型必填'),
                    },
                  ],
                  onChange: () => {
                    // 类型改变，重置格式的值
                    form.resetFields(`items[${key}].valueFormat`);
                  },
                })(
                  <Select
                    placeholder={changeChineseToLocale('请选择')}
                    style={baseRuleItemStyle}
                    allowClear
                    onSelect={value => {
                      record.itemType = value;
                      record.valueSource = value === 1 ? 5 : null;
                    }}
                  >
                    {selectData.map(({ value, label }) => (
                      <Option value={value}>{changeChineseToLocale(label)}</Option>
                    ))}
                  </Select>,
                )}
              </FormItem>
            </div>
          );
        },
      },
      {
        title: '元素来源',
        dataIndex: 'valueSource',
        className: 'ruleItemHeader',
        width: 105,
        render: (text, record) => {
          const { key, itemType } = record;
          const selectData = getSelectOptionDataForValueSource(ruleType, PRODUCT_BATCH_CODE_RULE_DETAIL_ORIGINAL);

          // 类型选择为变量字段时，元素来源可以选择

          return _.toNumber(itemType) === PRODUCT_BATCH_CODE_RULE_DETAIL_TYPE.variable.value ? (
            <div style={{ height: 45 }}>
              <FormItem>
                {getFieldDecorator(`items[${key}].valueSource`, {
                  initialValue: typeof text === 'number' ? text : undefined,
                  rules: [
                    {
                      required: true,
                      message: changeChineseToLocale('变量元素来源必填'),
                    },
                  ],
                })(
                  <Select placeholder={changeChineseToLocale('请选择')} style={baseRuleItemStyle} allowClear>
                    {selectData.map(({ value, label }) => (
                      <Option value={value}>{label}</Option>
                    ))}
                  </Select>,
                )}
              </FormItem>
            </div>
          ) : (
            replaceSignFormItem
          );
        },
      },
      {
        title: '长度',
        dataIndex: 'valueLength',
        className: 'ruleItemHeader',
        width: 85,
        render: (text, record) => {
          const { key, itemType, valueConst, valueFormat } = record;

          // 常量根据设置值长度自动计算长度且不可修改；
          if (_.toNumber(itemType) === PRODUCT_BATCH_CODE_RULE_DETAIL_TYPE.constant.value) {
            return <span>{valueConst && valueConst ? valueConst.length : 0}</span>;
          }

          // 日期类型日期格式自动计算长度且不可修改；
          if (_.toNumber(itemType) === PRODUCT_BATCH_CODE_RULE_DETAIL_TYPE.date.value) {
            const { name: dateFormat } = findProductBatchCodeRuleDetailDate(valueFormat) || {};
            return <span>{dateFormat && dateFormat.length ? dateFormat.length : 0}</span>;
          }

          // 流水号,手工输入长度；
          if (_.toNumber(itemType) === PRODUCT_BATCH_CODE_RULE_DETAIL_TYPE.sequence.value) {
            return (
              <div style={{ height: 45 }}>
                <FormItem>
                  {getFieldDecorator(`items[${key}].valueLength`, {
                    initialValue: text,
                    rules: [
                      {
                        required: true,
                        message: changeChineseToLocale('长度必填'),
                      },
                    ],
                  })(
                    <InputNumber
                      min={1}
                      step={1}
                      placeholder={changeChineseToLocale('请输入')}
                      style={baseRuleItemNumberStyle}
                    />,
                  )}
                </FormItem>
              </div>
            );
          }

          // 变量默认为空；
          return replaceSignFormItem;
        },
      },
      {
        title: '格式',
        dataIndex: 'valueFormat',
        className: 'ruleItemHeader',
        width: 155,
        render: (text, record) => {
          const { key, itemType } = record;

          // 当元素类型=日期字段时，格式必须选择一个日期格式；
          // 当元素类型=变量、关联变量时，可以设置字母格式
          const selectData =
            _.toNumber(itemType) === PRODUCT_BATCH_CODE_RULE_DETAIL_TYPE.variable.value
              ? Object.values(PRODUCT_BATCH_CODE_RULE_DETAIL_VARIABLE_FORMAT).map(k => ({
                  value: k.value,
                  label: k.name,
                }))
              : Object.values(PRODUCT_BATCH_CODE_RULE_DETAIL_DATE_FORMAT).map(k => ({ value: k.value, label: k.name }));

          // 当元素类型=常量、流水号字段时，格式字段无法设置；
          return [
            PRODUCT_BATCH_CODE_RULE_DETAIL_TYPE.constant.value,
            PRODUCT_BATCH_CODE_RULE_DETAIL_TYPE.sequence.value,
          ].indexOf(_.toNumber(itemType)) !== -1 ? (
            replaceSignFormItem
          ) : (
            <div style={{ height: 45 }}>
              <FormItem>
                {getFieldDecorator(`items[${key}].valueFormat`, {
                  initialValue: getInitialValueForFormat(text, itemType),
                  rules: [
                    {
                      required: _.toNumber(itemType) === 1,
                      message: changeChineseToLocale('格式必填'),
                    },
                  ],
                  onChange: v => {
                    record.valueFormat = v;
                  },
                })(
                  <Select placeholder={changeChineseToLocale('请选择')} style={{ width: 150 }} allowClear>
                    {selectData.map(({ value, label }) => (
                      <Option value={value}>{changeChineseToLocale(label)}</Option>
                    ))}
                  </Select>,
                )}
              </FormItem>
            </div>
          );
        },
      },
      {
        title: '设置值',
        dataIndex: 'valueConst',
        className: 'ruleItemHeader',
        width: 105,
        render: (text, record) => {
          const { key, itemType } = record;

          // 如果类型选择常量，可以设置常量的值，否则不可编辑
          return _.toNumber(itemType) === 0 ? (
            <div style={{ height: 45 }}>
              <FormItem>
                {getFieldDecorator(`items[${key}].valueConst`, {
                  initialValue: text,
                  rules: [
                    {
                      required: true,
                      message: changeChineseToLocale('常量设置值必填'),
                    },
                  ],
                  onChange: v => {
                    record.valueConst = v;
                  },
                })(<Input placeholder={changeChineseToLocale('请输入')} style={baseRuleItemStyle} />)}
              </FormItem>
            </div>
          ) : (
            replaceSignFormItem
          );
        },
      },
      {
        title: '起始值',
        dataIndex: 'valueStart',
        className: 'ruleItemHeader',
        width: 85,
        render: (text, record) => {
          const { key, itemType } = record;

          // 设置流水号的起始值，支持正整数，默认1
          return _.toNumber(itemType) === PRODUCT_BATCH_CODE_RULE_DETAIL_TYPE.sequence.value ? (
            <div style={{ height: 45 }}>
              <FormItem>
                {getFieldDecorator(`items[${key}].valueStart`, {
                  initialValue: text || 1,
                })(<InputNumber min={1} step={1} placeholder="请输入" style={baseRuleItemNumberStyle} />)}
              </FormItem>
            </div>
          ) : (
            replaceSignFormItem
          );
        },
      },
      {
        title: '步长',
        dataIndex: 'valueStep',
        className: 'ruleItemHeader',
        width: 85,
        render: (text, record) => {
          const { key, itemType } = record;

          // 设置流水号的步长，支持正整数，默认1
          return _.toNumber(itemType) === PRODUCT_BATCH_CODE_RULE_DETAIL_TYPE.sequence.value ? (
            <div style={{ height: 45 }}>
              <FormItem>
                {getFieldDecorator(`items[${key}].valueStep`, {
                  initialValue: text || 1,
                })(<InputNumber min={1} step={1} placeholder="请输入" style={baseRuleItemNumberStyle} />)}
              </FormItem>
            </div>
          ) : (
            replaceSignFormItem
          );
        },
      },
      {
        title: '流水码制',
        dataIndex: 'valueSeqType',
        className: 'ruleItemHeader',
        width: 105,
        render: (text, record) => {
          const { key, itemType } = record;
          const selectData = Object.values(PRODUCT_BATCH_CODE_RULE_DETAIL_SEQUENCE_TYPE).map(k => ({
            value: k.value,
            label: k.name,
          }));

          return _.toNumber(itemType) !== PRODUCT_BATCH_CODE_RULE_DETAIL_TYPE.sequence.value ? (
            replaceSignFormItem
          ) : (
            <div style={{ height: 45 }}>
              <FormItem>
                {getFieldDecorator(`items[${key}].valueSeqType`, {
                  initialValue: _.isNull(text) ? 0 : _.toNumber(text),
                  rules: [
                    {
                      required: true,
                      message: changeChineseToLocale('流水码制必填'),
                    },
                  ],
                })(
                  <Select placeholder="请选择" style={baseRuleItemStyle} allowClear>
                    {selectData.map(({ value, label }) => (
                      <Option value={value}>{changeChineseToLocale(label)}</Option>
                    ))}
                  </Select>,
                )}
              </FormItem>
            </div>
          );
        },
      },
    ];
  };

  render() {
    const { loading } = this.props;
    const { dataSource, total } = this.state;
    const columns = this.getColumns();

    return (
      <Table
        style={{ marginLeft: 0, width: 800 }}
        dataSource={dataSource}
        loading={loading}
        columns={columns}
        total={total}
        scroll={{ x: 1200 }}
        pagination={false}
        rowKey={record => record.id}
        footer={this.getFooter}
      />
    );
  }
}

RuleDetailFormTable.propTypes = {
  style: PropTypes.object,
  initialValue: PropTypes.array,
  form: PropTypes.object,
  loading: PropTypes.bool,
  ruleType: PropTypes.number,
};

RuleDetailFormTable.contextTypes = {
  changeChineseToLocale: PropTypes.any,
};

export default RuleDetailFormTable;
