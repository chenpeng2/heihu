import React, { Component } from 'react';
import _ from 'lodash';
import { InputNumber, FormItem, Textarea, Select, Table, Input, Radio, Link, Form, Icon } from 'components';
import { checkStringLength } from 'components/form';
import PropTypes from 'prop-types';
import {
  // VARIABLE_VALUE_SOURCE,
  ITEM_TYPE,
  SEQUENCE_TYPE,
  // DATE_VALUE_FORMAT,
  // LETTER_VALUE_FORMAT,
} from '../../constant';
import styles from '../styles.scss';

const replaceSign = '－';
const RadioGroup = Radio.Group;
const Option = Select.Option;
const DATE_VALUE_FORMAT = {
  0: 'YY',
  1: 'YYYY',
  2: 'YYMM',
  3: 'MMYY',
  4: 'YYMMDD',
  5: 'YYYYMMDD',
  6: 'YY/MM',
  7: 'MM/YY',
  8: 'YY/MM/DD',
  9: 'YYYY/MM/DD',
  10: 'YY.MM',
  11: 'MM.YY',
  12: 'YY.MM.DD',
  13: 'YYYY.MM.DD',
};
const LETTER_VALUE_FORMAT = {
  14: '大写',
  15: '小写',
  16: '不变',
};
const VARIABLE_VALUE_SOURCE = {
  0: '订单编号',
  1: '项目编号',
  2: '成品物料编号',
  3: '批次号',
};

// 获取元素格式的初始值
const getInitialValueForFormat = (value, type) => {
  if (_.toNumber(type) === 1) return _.toString(value) || undefined;
  if (_.toNumber(type) === 2) {
    return typeof value === 'number' ? _.toString(value) : '16';
  }

  return undefined;
};

type Props = {
  form: any,
  data: {},
  loading: Boolean,
};

const baseFormItemStyle = { width: 300 };
const baseRuleItemStyle = { width: 100 };
const baseRuleItemNumberStyle = { width: 80 };
const replaceSignFormItem = <div style={{ marginBottom: 14 }}>{replaceSign}</div>;

// const VARIABLE_ITEM_VALUE_SOURCE = {
//   0: '订单编号',
//   1: '项目编号',
//   2: '成品物料编号',
//   3: '批次号',
// };

class BaseForm extends Component {
  props: Props;
  state = {
    dataSource: [],
    itemTypes: [],
    total: 0,
    keys: 0,
  };

  componentDidMount = () => {
    const { data } = this.props;
    if (!data) {
      this.handleAdd();
    }
  };

  componentWillReceiveProps = ({ data: nextData }) => {
    const { dataSource } = this.state;
    if ((_.get(nextData, 'items') && !dataSource) || (_.get(nextData, 'items') && !_.get(dataSource, 'length'))) {
      this.handleAdd(nextData.items);
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
    const {
      form: { getFieldDecorator },
    } = this.props;
    const { changeChineseToLocale } = this.context;

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
          const selectData = Object.keys(ITEM_TYPE).map(k => ({ value: k, label: ITEM_TYPE[k] }));
          return (
            <div style={{ height: 45 }}>
              <FormItem>
                {getFieldDecorator(`items[${key}].itemType`, {
                  initialValue: _.toString(text) || undefined,
                  rules: [
                    {
                      required: true,
                      message: changeChineseToLocale('类型必填'),
                    },
                  ],
                  onChange: () => {
                    this.props.form.resetFields(`items[${key}].valueFormat`);
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
          return _.toNumber(itemType) === 2 ? (
            <div style={{ height: 45 }}>
              <FormItem>
                {getFieldDecorator(`items[${key}].valueSource`, {
                  initialValue: _.toString(text) || undefined,
                  rules: [
                    {
                      required: true,
                      message: changeChineseToLocale('变量元素来源必填'),
                    },
                  ],
                })(
                  <Select placeholder="请选择" style={baseRuleItemStyle} allowClear>
                    {Object.keys(VARIABLE_VALUE_SOURCE)
                      .map(k => ({ value: k, label: VARIABLE_VALUE_SOURCE[k] }))
                      .map(({ value, label }) => (
                        <Option value={value}>{changeChineseToLocale(label)}</Option>
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
          const { key, itemType } = record;
          return _.toNumber(itemType) === 3 ? (
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
                })(<InputNumber min={1} step={1} placeholder={changeChineseToLocale('请输入')} style={baseRuleItemNumberStyle} />)}
              </FormItem>
            </div>
          ) : (
            replaceSignFormItem
          );
        },
      },
      {
        title: '格式',
        dataIndex: 'valueFormat',
        className: 'ruleItemHeader',
        width: 155,
        render: (text, record) => {
          const { key, itemType } = record;
          const selectData =
            _.toNumber(itemType) === 2
              ? Object.keys(LETTER_VALUE_FORMAT).map(k => ({ value: k, label: LETTER_VALUE_FORMAT[k] }))
              : Object.keys(DATE_VALUE_FORMAT).map(k => ({ value: k, label: DATE_VALUE_FORMAT[k] }));
          return [1, 2].indexOf(_.toNumber(itemType)) === -1 ? (
            replaceSignFormItem
          ) : (
            <div style={{ height: 45 }}>
              <FormItem>
                {getFieldDecorator(`items[${key}].valueFormat`, {
                  initialValue: getInitialValueForFormat(text, itemType),
                  rules: [
                    {
                      required: true,
                      message: changeChineseToLocale('格式必填'),
                    },
                  ],
                })(
                  <Select placeholder="请选择" style={{ width: 150 }} allowClear>
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
          return _.toNumber(itemType) === 3 ? (
            <div style={{ height: 45 }}>
              <FormItem>
                {getFieldDecorator(`items[${key}].valueStart`, {
                  initialValue: text || 1,
                })(<InputNumber min={1} step={1} placeholder={changeChineseToLocale('请输入')} style={baseRuleItemNumberStyle} />)}
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
          return _.toNumber(itemType) === 3 ? (
            <div style={{ height: 45 }}>
              <FormItem>
                {getFieldDecorator(`items[${key}].valueStep`, {
                  initialValue: text || 1,
                })(<InputNumber min={1} step={1} placeholder={changeChineseToLocale('请输入')} style={baseRuleItemNumberStyle} />)}
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
          const selectData = Object.keys(SEQUENCE_TYPE).map(k => ({ value: k, label: SEQUENCE_TYPE[k] }));
          return _.toNumber(itemType) !== 3 ? (
            replaceSignFormItem
          ) : (
            <div style={{ height: 45 }}>
              <FormItem>
                {getFieldDecorator(`items[${key}].valueSeqType`, {
                  initialValue: _.isNull(text) ? '0' : _.toString(text),
                  rules: [
                    {
                      required: true,
                      message: changeChineseToLocale('流水码制必填'),
                    },
                  ],
                })(
                  <Select placeholder={changeChineseToLocale('请选择')} style={baseRuleItemStyle} allowClear>
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
    const {
      form: { getFieldDecorator },
      data,
      loading,
    } = this.props;
    const { changeChineseToLocale } = this.context;
    const { asDefault, description, ruleName } = data || {};
    const { dataSource, total } = this.state;
    const columns = this.getColumns();
    return (
      <Form>
        <FormItem label="规则名称">
          {getFieldDecorator('ruleName', {
            initialValue: ruleName,
            rules: [
              {
                required: true,
                message: changeChineseToLocale('规则名称必填'),
              },
              {
                validator: checkStringLength(50),
              },
            ],
          })(<Input style={baseFormItemStyle} placeholder={changeChineseToLocale('请输入规则名称')} />)}
        </FormItem>
        <FormItem label="默认规则">
          {getFieldDecorator('asDefault', {
            initialValue: asDefault,
          })(
            <RadioGroup style={baseFormItemStyle}>
              <Radio value={1} style={{ marginRight: 100 }}>
                {changeChineseToLocale('是')}
              </Radio>
              <Radio value={0}>{changeChineseToLocale('否')}</Radio>
            </RadioGroup>,
          )}
        </FormItem>
        <FormItem label="规则描述">
          {getFieldDecorator('description', {
            initialValue: description,
            rules: [{ validator: checkStringLength(250) }],
          })(<Textarea maxLength={250} style={{ ...baseFormItemStyle, height: 100 }} placeholder={changeChineseToLocale('请输入规则描述')} />)}
        </FormItem>
        <FormItem label="规则明细" style={{ marginTop: 20 }}>
          <Table
            style={{ marginLeft: 0, maxWidth: 800 }}
            dataSource={dataSource}
            loading={loading}
            columns={columns}
            total={total}
            rowClassName={styles.ruleTtemsTable}
            scroll={{ x: true }}
            pagination={false}
            rowKey={record => record.id}
            footer={this.getFooter}
          />
        </FormItem>
      </Form>
    );
  }
}

BaseForm.contextTypes = {
  changeChineseToLocale: PropTypes.any,
};

export default BaseForm;
