import * as React from 'react';
import { InputNumber } from 'antd';
import { injectIntl } from 'react-intl';
import { changeChineseToLocale } from 'src/utils/locale/utils';
import { Select } from 'components';

const Option = Select.Option;

type propsType = {
  value: any,
  intl: any,
  onChange: () => {},
};

class CleanConfigInput extends React.Component<propsType> {
  props: propsType;

  state = {
    validPeriod: 0,
    validPeriodUnit: 'h',
  };

  componentWillMount() {
    const { value } = this.props;
    if (value) {
      const { validPeriod, validPeriodUnit } = value;
      this.setState({ validPeriod, validPeriodUnit });
    }
  }

  handleNumberChange = value => {
    this.setState({ validPeriod: value || 0 });
    if (!value && value !== 0) {
      return;
    }
    this.triggerChange({ validPeriod: value });
  };

  handleUnitChange = value => {
    this.setState({ validPeriodUnit: value });
    this.triggerChange({ validPeriodUnit: value });
  };

  triggerChange = changedValue => {
    const onChange = this.props.onChange;
    if (onChange) {
      onChange(Object.assign({}, this.state, changedValue));
    }
  };

  render() {
    const { intl } = this.props;
    const { validPeriod, validPeriodUnit } = this.state;

    return (
      <div style={{ display: 'flex', marginTop: 6 }}>
        <InputNumber
          style={{ width: 180 }}
          onChange={this.handleNumberChange}
          defaultValue={validPeriod}
          value={validPeriod}
          min={0}
        />
        <Select style={{ width: 100, marginLeft: 20 }} value={validPeriodUnit} onChange={this.handleUnitChange}>
          <Option key={''} value={'h'}>
            {changeChineseToLocale('小时', intl)}
          </Option>
          <Option key={''} value={'d'}>
            {changeChineseToLocale('天', intl)}
          </Option>
        </Select>
      </div>
    );
  }
}

export default injectIntl(CleanConfigInput);
