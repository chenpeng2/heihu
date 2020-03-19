import React, { Component } from 'react';

import moment from 'src/utils/time';
import { Select } from 'src/components';
import { black, white } from 'src/styles/color';

import { innerGreen } from './availableTimeItem';

const Option = Select.Option;

type Props = {
  style: {},
  cbForSelect: () => {},
  activeYear: number
};

class Title extends Component {
  props: Props;
  state = {};

  renderYearSelect = () => {
    const { cbForSelect, activeYear } = this.props;

    const years = [];
    for (let i = moment().year(); i <= 2099; i += 1) {
      years.push(i);
    }

    return (
      <Select
        style={{ width: 150 }}
        onChange={value => {
          if (cbForSelect && typeof cbForSelect === 'function') cbForSelect(value);
        }}
        value={activeYear}
      >
        {years.map(item => {
          return (
            <Option value={item} key={item}>
              {item}
            </Option>
          );
        })}
      </Select>
    );
  };

  render() {
    const { style } = this.props;

    return (
      <div style={{ alignItems: 'space-between', background: white, ...style }} >
        <div style={{ display: 'inline-block' }} >
          <span style={{ color: black, fontSize: 14 }}>有效工作时间:</span>
          <div style={{ display: 'inline-block', margin: 5, width: 10, height: 10, background: innerGreen, verticalAlign: 'middle' }} />
        </div>
        <div style={{ display: 'inline-block', float: 'right', marginRight: 2 }} >{this.renderYearSelect()}</div>
      </div>
    );
  }
}

export default Title;
