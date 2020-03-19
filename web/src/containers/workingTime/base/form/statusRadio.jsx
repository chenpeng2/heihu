import * as React from 'react';

import { Radio } from 'src/components';

const RadioGroup = Radio.Group;
const STATUS = {
  1: '启用中',
  0: '停用中',
};

type Props = {
  onChange: () => {},
  style: {}
}

class StatusRadio extends React.Component {
  props: Props
  state = {
    value: 1,
  }

  onChange = (e) => {
    const nextValue = e.target.value;

    const { onChange } = this.props;
    if (onChange && typeof onChange === 'function') onChange(nextValue);

    this.setState({
      value: nextValue,
    });
  }

  render() {
    const { style, ...rest } = this.props;
    const { value } = this.state;

    return (
      <RadioGroup style={{ ...style }} value={Number(value)} {...rest} onChange={this.onChange}>
        {
          Object.entries(STATUS).map(([value, label]) => {
            return (
              <Radio value={Number(value)} key={value} >{label}</Radio>
            );
          })
        }

      </RadioGroup>
    );
  }
}

export default StatusRadio;
