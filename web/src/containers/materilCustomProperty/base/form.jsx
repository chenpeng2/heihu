import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';

import { message, InputNumber, Icon, withForm, FormItem, Input, RestPagingTable, Popconfirm } from 'src/components';
import { amountValidator, lengthValidate, checkTwoSidesTrim, requiredRule } from 'src/components/form';
import { primary, fontSub } from 'src/styles/color';
import { genArr } from 'src/utils/array';
import { getVariableType, getVariableType2 } from 'src/utils/variableType';

const DELETE_ITEM_SIGN = 'deletedItem';

let keyIndex = 0;

const nameRepeatValidate = names => {
  return (rule, value, callback) => {
    const firstIndex = names.indexOf(value);
    if (_.indexOf(names, value, firstIndex + 1) !== -1) {
      callback('字段名不可以重复');
    }
    callback();
  };
};

class BaseForm extends Component {
  state = {
    data: [keyIndex],
    names: [],
  };

  tableInst = React.createRef();

  componentDidMount() {
    this.setInitialValue();
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(nextProps.initialData, this.props.initialData)) {
      this.setInitialValue(nextProps);
    }
  }

  setInitialValue = props => {
    const { initialData, form } = props || this.props;

    this.setState(
      {
        data: Array.isArray(initialData) ? genArr(initialData.length) : [keyIndex],
        names: Array.isArray(initialData) ? initialData.map(i => i && i.keyName) : [],
      },
      () => {
        keyIndex = initialData.length - 1;
        form.setFieldsValue({ data: initialData });
      },
    );
  };

  addFormItem = () => {
    // 如果多过20个那么不可以添加
    const values = this.props.form.getFieldsValue();
    const { data } = values || {};
    if (Array.isArray(data)) {
      const _data = data.filter(i => i);
      if (_data.length >= 20) {
        message.warn('最多支持20个自定义字段');
        return;
      }
    }

    this.setState(
      ({ data }) => {
        keyIndex += 1;
        return {
          data: data.concat([keyIndex]),
        };
      },
      () => {
        this.scrollTableIntoView();
      },
    );
  };

  forceValidateAllNames = () => {
    const { names } = this.state;
    const { form } = this.props;
    if (Array.isArray(names)) {
      const fields = [];
      for (let i = 0; i < names.length; i += 1) {
        fields.push(`data[${i}].keyName`);
      }

      form.validateFields(fields, { force: true });
    }
  };

  deleteItem = itemIndex => {
    this.setState(
      ({ data, names }) => {
        delete names[itemIndex];
        return {
          data: data
            .map(key => {
              if (key === itemIndex) {
                return DELETE_ITEM_SIGN;
              }
              return key;
            })
            .filter(i => i !== DELETE_ITEM_SIGN),
          names,
        };
      },
      () => {
        this.forceValidateAllNames();
      },
    );
  };

  getFormValue = () => {
    const { form } = this.props;

    let res = null;
    form.validateFieldsAndScroll((err, value) => {
      if (err) return;

      res = value;
    });

    if (res && Array.isArray(res.data)) {
      const { data } = res || {};
      let everyFieldHasValue = true;
      data.forEach(i => {
        if (!(i && i.keyName && i.length)) {
          everyFieldHasValue = false;
        }
      });

      if (everyFieldHasValue) {
        return data.filter(i => i);
      }

      return null;
    }

    // 当没有任何值的时候res是{}。这个时候需要删除,就是传空数组
    const type = getVariableType(res);
    if (type === 'object') {
      return [];
    }

    return res;
  };

  getColumns = () => {
    const { names } = this.state;
    const { form } = this.props;
    const { getFieldDecorator } = form;

    return [
      {
        title: null,
        width: 50,
        render: key => {
          return (
            <div style={{ marginBottom: 5 }}>
              <Popconfirm
                title={'删除字段后，物料定义中该物料的所有数据都会丢失，确定删除？'}
                onConfirm={() => {
                  this.deleteItem(key);
                }}
                okText={'确定'}
                cancelText={'暂不删除'}
              >
                <Icon type={'minus-circle'} />
              </Popconfirm>
            </div>
          );
        },
      },
      {
        title: '字段名称',
        width: 250,
        render: key => {
          return (
            <FormItem>
              {getFieldDecorator(`data[${key}].keyName`, {
                rules: [
                  requiredRule('字段名称'),
                  { validator: lengthValidate(1, 100) },
                  { validator: nameRepeatValidate(names) },
                  { validator: checkTwoSidesTrim('字段名称') },
                ],
                onChange: v => {
                  this.setState(
                    ({ names }) => {
                      names[key] = v;
                      return { names };
                    },
                    () => {
                      this.forceValidateAllNames();
                    },
                  );
                },
              })(<Input style={{ width: 200 }} placeholder={'字段名称'} />)}
            </FormItem>
          );
        },
      },
      {
        title: '最大字符数',
        width: 150,
        render: key => {
          return (
            <FormItem>
              {getFieldDecorator(`data[${key}].length`, {
                rules: [requiredRule('最大字符数'), { validator: amountValidator(100, 1, 'integer') }],
              })(<InputNumber style={{ width: 100 }} placeholder={'最大字符数'} />)}
            </FormItem>
          );
        },
      },
    ];
  };

  scrollTableIntoView = () => {
    const tableInst = this.tableInst;
    if (tableInst && tableInst.current) {
      const tableContainer = tableInst.current.querySelector('.ant-table-body');
      if (tableContainer) {
        tableContainer.scrollBy({ top: tableContainer.scrollHeight, behavior: 'smooth' });
      }
    }
  };

  renderFooter = () => {
    return (
      <div>
        <div
          style={{ color: primary, cursor: 'pointer', display: 'inline-block' }}
          onClick={() => {
            this.addFormItem();
          }}
        >
          <Icon type={'plus-circle-o'} style={{ verticalAlign: 'text-bottom' }} />
          <span style={{ marginLeft: 5 }}>添加字段</span>
        </div>
        <span style={{ color: fontSub, marginLeft: 10 }}>最多支持20个自定义字段</span>
      </div>
    );
  };

  render() {
    return (
      <div ref={this.tableInst}>
        <RestPagingTable
          style={{ width: 500 }}
          scroll={{ y: 400 }}
          columns={this.getColumns()}
          dataSource={this.state.data}
          footer={this.renderFooter}
          pagination={false}
        />
      </div>
    );
  }
}

BaseForm.propTypes = {
  style: PropTypes.object,
  form: PropTypes.any,
  initialData: PropTypes.any,
};

export default withForm({}, BaseForm);
