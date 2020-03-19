import React, { Component } from 'react';
import _ from 'lodash';
import { message, InputNumber, withForm, FormItem, Input, RestPagingTable } from 'components';
import { amountValidator, lengthValidate, checkTwoSidesTrim, dotValidator } from 'components/form';
import { KeyTypes } from 'models/organizationConfig/SaleOrderCPModel';
import { getVariableType } from 'utils/variableType';
import TypeSelect from '../TypeSelect';
import Footer from './Footer';
import DeleteButton from './DeleteButton';

// 字段名称的组成验证
export const validateName = type => {
  return (rule, value, callback) => {
    if (!value) {
      callback();
      return;
    }
    let strArr = [];
    strArr = value.split(' ');
    if (strArr.length > 1) {
      callback(`${type}只能由中文、英文、数字或符号组成`);
      return;
    }
    callback();
  };
};

const nameRepeatValidate = names => {
  return (rule, value, callback) => {
    const firstIndex = names.indexOf(value);
    if (_.indexOf(names, value, firstIndex + 1) !== -1) {
      callback('字段名不可以重复');
    }
    callback();
  };
};

type Props = {
  style: any,
  form: any,
  initialData: any[],
};

type State = {
  dataSource: any[],
};

class Form extends Component {
  props: Props;
  state: State = {
    names: [],
    dataSource: [],
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
    const { initialData } = props || this.props;
    const dataSource = Array.isArray(initialData) ? initialData : [];
    this.setState({
      names: Array.isArray(initialData) ? initialData.map(i => i && i.name) : [],
      dataSource,
    });
  };

  forceValidateAllNames = () => {
    const { names } = this.state;
    const { form } = this.props;
    if (Array.isArray(names)) {
      const fields = [];
      for (let i = 0; i < names.length; i += 1) {
        fields.push(`data[${i}].name`);
      }
      form.validateFields(fields, { force: true });
    }
  };

  addFormItem = () => {
    const { dataSource } = this.state;
    if (!Array.isArray(dataSource)) return;
    if (dataSource.length >= 20) {
      message.warn('最多支持20个自定义字段');
      return;
    }
    dataSource.push({});
    this.setState({ dataSource }, this.scrollTableIntoView);
  };

  deleteItem = itemIndex => {
    const { names, dataSource } = this.state;
    const { form } = this.props;
    const newNames = names;
    if (Array.isArray(names) && names.length > itemIndex) {
      newNames.splice(itemIndex, 1);
    }
    const newDataSource = dataSource;
    if (Array.isArray(dataSource) && dataSource.length > itemIndex) {
      newDataSource.splice(itemIndex, 1);
    }
    this.setState({ names: newNames, dataSource: newDataSource }, () => form.resetFields());
  };

  getFormValue = () => {
    const { form } = this.props;
    return new Promise((resolve, reject) => {
      let res = null;
      form.validateFieldsAndScroll((err, value) => {
        if (err) {
          reject();
          return;
        }
        res = value;

        if (res && Array.isArray(res.data)) {
          const { data } = res || {};
          const filteredData = data.filter(i => {
            const validObj = i && i.name && i.maxLen;
            return validObj;
          });
          resolve(filteredData);
          return;
        }
        // 当没有任何值的时候res是{}。这个时候需要删除,就是传空数组
        const type = getVariableType(res);
        if (type === 'object') {
          resolve([]);
          return;
        }
        resolve(res);
      });
    });
  };

  getColumns() {
    const { names } = this.state;
    const { form } = this.props;
    const { getFieldDecorator } = form;
    const renderDelete = (data, record, index) => {
      return <DeleteButton onConfirm={() => this.deleteItem(index)} />;
    };
    const renderName = (data, record, index) => {
      const initialValue = _.get(record, 'name', '');
      return (
        <FormItem>
          {getFieldDecorator(`data[${index}].name`, {
            rules: [
              {
                required: true,
                message: '字段名称必填',
              },
              {
                validator: checkTwoSidesTrim('字段名称'),
              },
              {
                validator: dotValidator('字段名称'),
              },
              {
                validator: lengthValidate(1, 100),
              },
              {
                validator: nameRepeatValidate(names),
              },
            ],
            initialValue,
            onChange: v => {
              const { names, dataSource } = this.state;
              names[index] = v;
              dataSource[index].name = v;
              this.setState({ names }, () => this.forceValidateAllNames());
            },
          })(<Input style={{ width: 200 }} placeholder="请输入字段名称" />)}
        </FormItem>
      );
    };
    const renderLength = (data, record, index) => {
      const initialValue = _.get(record, 'maxLen', '');
      return (
        <FormItem>
          {getFieldDecorator(`data[${index}].maxLen`, {
            rules: [
              {
                required: true,
                message: '字段长度必填',
              },
              {
                validator: amountValidator(100, 1, 'integer'),
              },
            ],
            initialValue,
            onChange: v => {
              const { dataSource } = this.state;
              dataSource[index].maxLen = v;
            },
          })(<InputNumber style={{ width: 100 }} placeholder="请输入" />)}
        </FormItem>
      );
    };
    return [
      {
        title: null,
        width: 50,
        render: renderDelete,
      },
      {
        title: '字段名称',
        width: 250,
        render: renderName,
      },
      {
        title: '最大字符数',
        width: 150,
        render: renderLength,
      },
    ];
  }

  scrollTableIntoView = () => {
    const tableInst = this.tableInst;
    if (tableInst && tableInst.current) {
      const tableContainer = tableInst.current.querySelector('.ant-table-body');
      if (tableContainer) {
        tableContainer.scrollBy({ top: tableContainer.scrollHeight, behavior: 'smooth' });
      }
    }
  };

  renderFooter = () => <Footer onAdd={this.addFormItem} />;

  render() {
    const columns = this.getColumns();
    const tableStyle = { width: 600 };
    const scroll = { x: 0, y: 400 };
    const { dataSource } = this.state;
    return (
      <div ref={this.tableInst}>
        <RestPagingTable
          style={tableStyle}
          scroll={scroll}
          columns={columns}
          dataSource={dataSource}
          footer={this.renderFooter}
          pagination={false}
        />
      </div>
    );
  }
}

export default withForm({}, Form);
