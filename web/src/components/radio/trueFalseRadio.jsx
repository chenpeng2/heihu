import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Radio } from 'antd';
import { FormattedMessage } from 'src/components';

const RadioGroup = Radio.Group;

class TrueFalseRadio extends Component {
  state = {};

  render() {
    return (
      <RadioGroup {...this.props}>
        <Radio value={1}>
          <FormattedMessage defaultMessage={'是'} />
        </Radio>
        <Radio value={2}>
          <FormattedMessage defaultMessage={'否'} />
        </Radio>
      </RadioGroup>
    );
  }
}

TrueFalseRadio.propTypes = {
  style: PropTypes.object,
};

export default TrueFalseRadio;
