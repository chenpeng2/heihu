import React, { Component } from 'react';
import _ from 'lodash';

import { Select, Input, Popover, Icon } from 'src/components';
import { white, primary } from 'src/styles/color';

import { AVAILABLE_DATE_TYPE, WEEK_OPTIONS, MONTH_OPTIONS } from '../../constant';

type Props = {
  style: {},
  onChange: () => {},
  value: {}
};

class DateSelect extends Component {
  props: Props;
  state = {
    value: {
      type: null,
      date: null,
    },
  };

  // initialValue
  componentDidMount() {
    const value = this.props.value;
    if (value && value.type) {
      this.setState({ value });
    }
  }

  // setFieldsValue
  componentWillReceiveProps(nextProps) {
    const valueNow = _.get(this.props, 'value');
    const valueNext = _.get(nextProps, 'value');
    if (!_.isEqual(valueNow, valueNext)) {
      this.setState({ value: valueNext });
    }
  }

  renderTypeSelect = () => {
    const { value } = this.state;
    const { type } = value || {};

    return (
      <Select
        style={{ width: 100 }}
        value={typeof type === 'number' ? type : null}
        onChange={value => {
          const nextValue = { type: value, date: undefined };
          this.setState({ value: nextValue });
          this.props.onChange(nextValue);
        }}
      >
        {Object.entries(AVAILABLE_DATE_TYPE).map(([value, content]) => {
          const { name } = content;

          return (
            <Select.Option value={Number(value)} key={value}>
              {name}
            </Select.Option>
          );
        })}
      </Select>
    );
  };

  renderDateSelect = () => {
    const { onChange: propsOnChange } = this.props;
    const { value } = this.state;
    const { type, date } = value || {};

    const _type = AVAILABLE_DATE_TYPE[type] ? AVAILABLE_DATE_TYPE[type].type : null;

    const style = { width: 290 };
    const onChange = (value) => {
      const nextValue = { type, date: value };

      this.setState({ value: nextValue });
      if (propsOnChange && typeof propsOnChange === 'function') propsOnChange(nextValue);
    };

    if (_type === 'specified') {
      return (<Input style={{ ...style }} onChange={onChange} value={date} placeholder={'请按YYYY-MM-DD格式输入，以英文逗号分隔'} />);
    }

    if (_type === 'week') {
      return (
        <Select style={style} onChange={onChange} mode={'multiple'} value={date} >
          {
            WEEK_OPTIONS.map(({ name, value }) => {
              return (<Select.Option value={Number(value)} key={value} >{name}</Select.Option>);
            })
          }
        </Select>
      );
    }

    if (_type === 'month') {
      return (
        <Select style={style} onChange={onChange} mode={'multiple'} value={date} >
          {
            MONTH_OPTIONS.map(({ name, value }) => {
              return (<Select.Option value={Number(value)} key={value} >{name}</Select.Option>);
            })
          }
        </Select>
      );
    }

    if (_type === 'holiday') {
      return (
        <Popover content={'法定节假日包括：元旦，清明节，端午节，中秋节，国庆节，春节。'} >
          <Icon style={{ background: white, color: primary }} type="exclamation-circle" />
        </Popover>
      );
    }
  };

  render() {
    return (
      <div>
        <div style={{ display: 'inline-block', marginRight: 10 }} >
          {this.renderTypeSelect()}
        </div>
        {this.renderDateSelect()}
      </div>
    );
  }
}

export default DateSelect;
