import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { replaceSign } from 'src/constants';
import { message, FormItem, Icon, Select, Input, InputNumber } from 'src/components';
import BasicTable from 'src/components/table/basicTable';
import { amountValidator } from 'src/components/form';
import { primary } from 'src/styles/color';

import { RULE_TYPE, DATE_FORMAT, SEQ_TYPE } from '../../utils';

let KEY = 0;
const Option = Select.Option;
const FORM_ITEM_WIDTH = 150;
const INPUT_NUMBER_WIDTH = 100;

class RuleDetailTableForm extends Component {
  state = {
    data: [{ key: KEY }],
  };
  tableInst = React.createRef();

  componentDidMount() {
    this.setInitialValue(this.props);
  }

  componentDidUpdate(preProps) {
    if (!_.isEqual(preProps.initialData, this.props.initialData)) {
      this.setInitialValue(this.props);
    }
  }

  setInitialValue = props => {
    if (!props) return;
    const { initialData, form } = props;
    if (!initialData) return;

    KEY = Array.isArray(initialData) ? initialData.length - 1 : 0;
    this.setState(
      {
        data: Array.isArray(initialData) ? initialData.map((i, index) => ({ ...i, key: index })) : [],
      },
      () => {
        form.setFieldsValue({
          ruleDetail: Array.isArray(initialData)
            ? initialData.map(i => {
                const { type, ...rest } = i || {};
                return { ...rest, type: type ? type.value : undefined };
              })
            : undefined,
        });
      },
    );
  };

  /**
   * @description: 根据key,来改变state中的data。extraData需要是一个{key: value}的对象
   *
   * @date: 2019/4/1 下午2:09
   */
  changeStateData = (key, extraData) => {
    const { data } = this.state;

    const nextData = data.map(i => {
      if (i && i.key === key) {
        i = { ...i, ...extraData };
      }
      return i;
    });

    this.setState({ data: nextData });
  };

  // 自动将table滚动到底部
  scrollTableIntoView = () => {
    const tableInst = this.tableInst;
    if (tableInst && tableInst.current) {
      const tableContainer = tableInst.current.querySelector('.ant-table-body');
      if (tableContainer) {
        tableContainer.scrollBy({ top: tableContainer.scrollHeight, behavior: 'smooth' });
      }
    }
  };

  getColumns = () => {
    const { form, disabled } = this.props;
    const { getFieldDecorator } = form || {};

    return [
      {
        title: '行序列',
        key: 'lineId',
        width: 80,
        render: (__, record, index) => {
          const { key } = record;

          if (disabled) {
            return (
              <span style={{ marginLeft: 5 }}>{index + 1}</span>
            );
          }

          return (
            <span
              onClick={() => {
                this.deleteFormItem(key);
              }}
            >
              <Icon type={'minus-circle'} />
              <span style={{ marginLeft: 5 }}>{index + 1}</span>
            </span>
          );
        },
      },
      {
        title: '类型',
        key: 'type',
        width: 180,
        render: (__, record) => {
          const { key } = record;
          return (
            <FormItem>
              {getFieldDecorator(`ruleDetail[${key}].type`, {
                onChange: (v, options) => {
                  this.changeStateData(key, { type: options.props.data });
                },
                rules: [
                  {
                    required: true,
                    message: '类型必填',
                  },
                ],
              })(
                <Select disabled={disabled} style={{ width: FORM_ITEM_WIDTH }}>
                  {Object.values(RULE_TYPE).map(i => {
                    const { name, value } = i;
                    return (
                      <Option data={i} value={value}>
                        {name}
                      </Option>
                    );
                  })}
                </Select>,
              )}
            </FormItem>
          );
        },
      },
      {
        title: '长度',
        key: 'length',
        width: 130,
        render: (__, record) => {
          const { key, type, dateFormat, setValue } = record;
          // 常量、日期根据设置值长度或日期格式自动计算长度且不可修改；
          if (type && type.value === RULE_TYPE.constant.value) {
            return <span>{setValue ? setValue.length : 0}</span>;
          }
          if (type && type.value === RULE_TYPE.date.value) {
            return <span>{dateFormat ? dateFormat.length : 0}</span>;
          }

          // 流水号，手工输入长度；
          return (
            <FormItem>
              {getFieldDecorator(`ruleDetail[${key}].length`, {
                rules: [
                  {
                    validator: amountValidator(null, null, 'integer'),
                  },
                  {
                    required: true,
                    message: '长度必填',
                  },
                ],
              })(<InputNumber disabled={disabled} style={{ width: INPUT_NUMBER_WIDTH }} />)}
            </FormItem>
          );
        },
      },
      {
        title: '格式',
        key: 'format',
        width: 180,
        render: (__, record) => {
          const { key, type } = record;
          // 当元素类型=日期字段时，格式必须选择一个日期格式；当元素类型=常量、流水号字段时，格式字段无法设置
          if (type && type.value === RULE_TYPE.date.value) {
            return (
              <FormItem>
                {getFieldDecorator(`ruleDetail[${key}].dateFormat`, {
                  onChange: v => {
                    this.changeStateData(key, { dateFormat: v });
                  },
                  rules: [
                    {
                      required: true,
                      message: '格式必填',
                    },
                  ],
                })(
                  <Select disabled={disabled} style={{ width: FORM_ITEM_WIDTH }}>
                    {DATE_FORMAT.map(i => {
                      return <Option value={i}>{i}</Option>;
                    })}
                  </Select>,
                )}
              </FormItem>
            );
          }

          return <span>{replaceSign}</span>;
        },
      },
      {
        title: '设置值',
        key: 'setValue',
        width: 180,
        render: (__, record) => {
          const { key, type } = record;
          // 如果类型选择常量，可以设置常量的值，否则不可
          if (type && type.value === RULE_TYPE.constant.value) {
            return (
              <FormItem>
                {getFieldDecorator(`ruleDetail[${key}].setValue`, {
                  onChange: v => {
                    this.changeStateData(key, { setValue: v });
                  },
                  rules: [
                    {
                      required: true,
                      message: '设置值必填',
                    },
                    {
                      pattern: /^[a-zA-Z0-9\-\.\/]+$/,
                      message: '入厂批次常量只支持字母，数字，-，.，/',
                    },
                  ],
                })(<Input disabled={disabled} style={{ width: FORM_ITEM_WIDTH }} />)}
              </FormItem>
            );
          }

          return <span>{replaceSign}</span>;
        },
      },
      {
        title: '起始值',
        key: 'startValue',
        width: 130,
        render: (__, record) => {
          const { key, type } = record;

          // 设置流水号的起始值，支持正整数，默认1
          if (type && type.value === RULE_TYPE.seq.value) {
            return (
              <FormItem>
                {getFieldDecorator(`ruleDetail[${key}].startValue`, {
                  initialValue: 1,
                  rules: [
                    {
                      pattern: /^[0-9A-HJ-NP-RT-Y]$/g,
                      message: '起始值只可以是0-9和A-Z;（除I、O、S、Z）',
                    },
                    {
                      required: true,
                      message: '起始值必填',
                    },
                  ],
                })(<Input disabled={disabled} style={{ width: INPUT_NUMBER_WIDTH }} />)}
              </FormItem>
            );
          }

          return <span>{replaceSign}</span>;
        },
      },
      {
        title: '步长',
        key: 'stepLength',
        width: 130,
        render: (__, record) => {
          const { key, type } = record;

          // 设置流水号的步长，支持正整数，默认1；
          if (type && type.value === RULE_TYPE.seq.value) {
            return (
              <FormItem>
                {getFieldDecorator(`ruleDetail[${key}].stepLength`, {
                  initialValue: 1,
                  rules: [
                    {
                      validator: amountValidator(null, null, 'integer'),
                    },
                    {
                      required: true,
                      message: '步长必填',
                    },
                  ],
                })(<InputNumber disabled={disabled} style={{ width: INPUT_NUMBER_WIDTH }} />)}
              </FormItem>
            );
          }

          return <span>{replaceSign}</span>;
        },
      },
      {
        title: '流水码制',
        key: 'seqType',
        width: 250,
        render: (__, record) => {
          const { key, type } = record;

          if (type && type.value === RULE_TYPE.seq.value) {
            return (
              <FormItem>
                {getFieldDecorator(`ruleDetail[${key}].seqType`, {
                  rules: [
                    {
                      required: true,
                      message: '流水码制必填',
                    },
                  ],
                  initialValue: SEQ_TYPE.decimalism.value,
                })(
                  <Select disabled={disabled} style={{ width: FORM_ITEM_WIDTH + 30 }}>
                    {Object.values(SEQ_TYPE).map(i => {
                      const { name, value } = i;
                      return <Option value={value} >{name}</Option>;
                    })}
                  </Select>,
                )}
              </FormItem>
            );
          }

          return <span>{replaceSign}</span>;
        },
      },
    ];
  };

  addFormItem = () => {
    this.setState(
      ({ data }) => {
        const nextData = data.concat([{ key: (KEY += 1) }]);
        return { data: nextData };
      },
      () => {
        this.scrollTableIntoView();
      },
    );
  };

  deleteFormItem = key => {
    this.setState(({ data }) => {
      if (Array.isArray(data) && data.length === 1) {
        message.warn('规则明细至少有一条');
        return;
      }
      const nextData = data.filter(i => !(i && i.key === key));
      return { data: nextData };
    });
  };

  renderFooter = () => {
    return (
      <div
        style={{ color: primary, cursor: 'pointer', display: 'inline-block' }}
        onClick={() => {
          this.addFormItem();
        }}
      >
        <Icon type={'plus-circle-o'} style={{ verticalAlign: 'text-bottom' }} />
        <span style={{ marginLeft: 5 }}>添加编码组成规则</span>
      </div>
    );
  };

  render() {
    const { disabled } = this.props;
    const columns = this.getColumns();

    return (
      <div ref={this.tableInst}>
        <BasicTable
          style={{ width: 800, margin: 0 }}
          scroll={{ x: 1400, y: 400 }}
          columns={columns}
          pagination={false}
          dataSource={this.state.data}
          footer={disabled ? null : this.renderFooter}
        />
      </div>
    );
  }
}

RuleDetailTableForm.propTypes = {
  style: PropTypes.object,
  form: PropTypes.any,
  initialData: PropTypes.any,
  disabled: PropTypes.bool,
};

export default RuleDetailTableForm;
