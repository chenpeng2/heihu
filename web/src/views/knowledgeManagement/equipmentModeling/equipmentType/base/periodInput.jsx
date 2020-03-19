import * as React from 'react';
import { Select, InputNumber } from 'components';
import { injectIntl } from 'react-intl';
import { changeChineseToLocale } from 'utils/locale/utils';

const cycle = [
  {
    label: '小时',
    value: '0',
  },
  {
    label: '日',
    value: '1',
  },
  {
    label: '周',
    value: '2',
  },
  {
    label: '月',
    value: '3',
  },
];
const Option = Select.Option;

type propsType = {
  value: any,
  intl: any,
  data: any,
  type: any,
  onChange: () => {},
};

class PeriodInput extends React.Component<propsType> {
  props: propsType;

  state = {
    validPeriod: '',
    validPeriodUnit: { label: '日', value: '1' },
  };

  componentWillMount() {
    const { data, type } = this.props;
    if (type === 'edit') {
      const { validPeriod } = data || {};
      const validPeriodUnit = data.validPeriodUnit || 0;
      if (validPeriod) {
        const validPeriodUnitName = cycle.filter(n => n.value === `${validPeriodUnit}`)[0].label;
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
    validPeriodUnit.label = changeChineseToLocale(validPeriodUnit.label, intl);
    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {changeChineseToLocale('每', intl)}
        <InputNumber
          style={{ width: 100, marginLeft: 10 }}
          onChange={this.handleNumberChange}
          defaultValue={validPeriod}
          value={validPeriod}
          placeholder={changeChineseToLocale('请输入', intl)}
        />
        <Select
          style={{ width: 166, marginLeft: 10 }}
          value={validPeriodUnit}
          onChange={this.handleUnitChange}
          labelInValue
        >
          {cycle.map(n => (
            <Option value={n.value}>{changeChineseToLocale(n.label, intl)}</Option>
          ))}
        </Select>
      </div>
    );
  }
}

export default injectIntl(PeriodInput);
