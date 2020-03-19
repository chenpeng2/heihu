import React, { Component } from 'react';

import { Button, withForm, Select, Input } from 'src/components';
import { fontSub } from 'src/styles/color';

import { status } from '../constants';

const INPUT_WIDTH = 220;
const Option = Select.Option;
const labelStyle = {
  color: fontSub,
  margin: '0px 10px',
};

type Props = {
  style: {},
  fetchData: () => {},
  form: any,
};

class Filter extends Component {
  props: Props;
  state = {};

  componentDidMount() {
    this.props.form.setFieldsValue({ status: true });
  }

  renderStatusSelect = props => {
    const { style } = props || {};
    return (
      <Select {...props} style={{ ...style, width: INPUT_WIDTH }}>
        {Object.values(status).map(i => {
          const { name, value } = i;
          return (
            <Option value={value} key={value}>
              {name}
            </Option>
          );
        })}
      </Select>
    );
  };

  search = (p) => {
    const { fetchData } = this.props;
    if (typeof fetchData === 'function') fetchData(p);
  };

  render() {
    const { form } = this.props;
    const { getFieldDecorator, getFieldsValue, resetFields } = form || {};

    return (
      <div style={{ margin: '20px 0px', overflow: 'hidden' }}>
        <div style={{ display: 'inline-block', float: 'right' }}>
          <div style={{ display: 'inline-block' }}>
            <span style={labelStyle}>{'启用状态'}</span>
            <span>{getFieldDecorator('status')(this.renderStatusSelect())}</span>
            <span style={labelStyle}>{'事务'}</span>
            <span>{getFieldDecorator('codeOrName')(<Input placeholder={'请输入事务名称或事务编码'} style={{ width: INPUT_WIDTH }} />)}</span>
          </div>
          <div style={{ display: 'inline-block', marginLeft: 20 }}>
            <Button
              onClick={() => {
                const value = getFieldsValue();
                const { status, codeOrName } = value || {};
                this.search({ enable: status, name: codeOrName });
              }}
            >
              搜索
            </Button>
            <span
              style={{ color: fontSub, marginLeft: 10, cursor: 'pointer' }}
              onClick={() => {
                resetFields();
                this.search({ enable: null, name: null, page: 1 });
              }}
            >
              重置
            </span>
          </div>
        </div>
      </div>
    );
  }
}

export default withForm({}, Filter);
