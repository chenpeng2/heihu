import React from 'react';
import { Select } from 'components';
import CONSTANT from '../common/SOPConstant';

const Option = Select.Option;
class PrivilegeTypeSelect extends React.PureComponent {
  state = {};
  render() {
    const { style, types, ...rest } = this.props;
    let options = Array.from(CONSTANT.SopStepPrivilegeType, ([key, value]) => ({ key, label: value }));
    if (types) {
      options = types.map(key => ({ key, label: CONSTANT.SopStepPrivilegeType.get(key) }));
    }
    return (
      <Select style={{ width: 120, ...style }} {...rest}>
        {options.map(({ key, label }) => (
          <Option value={key}>{label}</Option>
        ))}
      </Select>
    );
  }
}

export default PrivilegeTypeSelect;
