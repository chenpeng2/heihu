import * as React from 'react';
import { Input } from 'src/components';
import { Select } from 'components';
import { replaceSign } from 'src/constants';

const judgmentLogic = [
  {
    label: '≤',
    key: '1',
  },
  {
    label: '≥',
    key: '2',
  },
];
const Option = Select.Option;

type propsType = {
  value: any,
  data: any,
  type: string,
  unit: any,
  disabled: boolean,
  strategyTriggerType: string,
  onChange: () => {},
};

class MetricInput extends React.Component<propsType> {
  props: propsType;

  state = {
    unit: '',
    metricBaseValue: '',
    metricCompareType: { label: '≥', key: '2' },
  }

  componentWillMount() {
    const { data, type } = this.props;
    if (type === 'edit') {
      const { unit, metricBaseValue, metricCompareType: _metricCompareType } = data || {};
      if (_metricCompareType && metricBaseValue) {
        const metricCompareType = judgmentLogic.filter(n => n.key === `${_metricCompareType.key || _metricCompareType}`)[0];
        this.setState({ unit, metricBaseValue, metricCompareType });
        this.triggerChange({ unit, metricBaseValue, metricCompareType });
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    const { unit } = nextProps;
    this.setState({ unit });
  }

  handleNumberChange = value => {
    this.setState({ metricBaseValue: value });
    this.triggerChange({ metricBaseValue: value });
  }

  handleCompareChange = value => {
    this.setState({ metricCompareType: value });
    this.triggerChange({ metricCompareType: value });
  }

  handleUnitChange = value => {
    this.setState({ unit: value });
    this.triggerChange({ unit: value });
  }

  triggerChange = changedValue => {
    const onChange = this.props.onChange;
    if (onChange) {
      onChange(Object.assign({}, this.state, changedValue));
    }
  }

  render() {
    const { disabled, strategyTriggerType } = this.props;
    const { metricBaseValue, metricCompareType, unit } = this.state;

    return (
      <div>
        <Select
          disabled={disabled || strategyTriggerType === '3'}
          value={metricCompareType}
          onChange={this.handleCompareChange}
          labelInValue
          style={{ width: 80 }}
        >
          {judgmentLogic.map(n => <Option value={n.key}>{n.label}</Option>)}
        </Select>
        <Input
          disabled={disabled}
          onChange={this.handleNumberChange}
          defaultValue={metricBaseValue}
          value={metricBaseValue}
          placeholder={'请输入用度阈值'}
          style={{ width: 120, marginLeft: 10 }}
        />
        <Input value={unit} placeholder={replaceSign} disabled onChange={this.handleUnitChange} style={{ width: 80, marginLeft: 10 }} />
      </div>
    );
  }
}

export default MetricInput;
