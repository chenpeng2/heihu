import * as React from 'react';
import { InputNumber } from 'antd';
import { Select } from 'components';
import { injectIntl } from 'react-intl';
import { changeChineseToLocale } from 'utils/locale/utils';
import { planLaborTime } from './formatValue';

const Option = Select.Option;

type propsType = {
  value: any,
  data: any,
  intl: any,
  type: any,
  onChange: () => {},
};

class PlanLaborInput extends React.Component<propsType> {
  props: propsType;

  state = {
    validPeriod: '',
    validPeriodUnit: { label: '小时', key: '0' },
  };

  componentDidMount() {
    const { data, type } = this.props;
    if (type === 'edit') {
      const { validPeriod } = data || {};
      const validPeriodUnit = data.validPeriodUnit || 0;
      if (validPeriod) {
        const validPeriodUnitName = planLaborTime.filter(n => n.key === `${validPeriodUnit}`)[0].label;
        this.setState({ validPeriod, validPeriodUnit: { key: validPeriodUnit, label: validPeriodUnitName } });
        this.triggerChange({ validPeriod, validPeriodUnit: { key: validPeriodUnit, label: validPeriodUnitName } });
      }
    }
  }

  handleNumberChange = value => {
    this.setState({ validPeriod: value });
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
      <div>
        <InputNumber
          style={{ width: 200 }}
          onChange={this.handleNumberChange}
          defaultValue={validPeriod}
          value={validPeriod}
          placeholder={changeChineseToLocale('请输入', intl)}
        />
        <Select
          style={{ width: 90, marginLeft: 10 }}
          value={validPeriodUnit}
          onChange={this.handleUnitChange}
          labelInValue
        >
          {planLaborTime.map(n => (
            <Option value={n.key}>{changeChineseToLocale(n.label, intl)}</Option>
          ))}
        </Select>
      </div>
    );
  }
}

export default injectIntl(PlanLaborInput);
