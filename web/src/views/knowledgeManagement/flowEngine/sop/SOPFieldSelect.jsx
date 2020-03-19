import React from 'react';
import { Select } from 'components';
import CONSTANT from '../common/SOPConstant';

const Option = Select.Option;
const width = 200;

export const typeMapField = new Map([
  [CONSTANT.TYPE_TEXT, CONSTANT.FIELD_TYPE_TEXT],
  [CONSTANT.TYPE_NUMBER, CONSTANT.FIELD_TYPE_NUMBER],
  [CONSTANT.TYPE_TIME, CONSTANT.FIELD_TYPE_TIME],
  [CONSTANT.TYPE_FILE, CONSTANT.FIELD_TYPE_FILE],
  [CONSTANT.TYPE_USER, CONSTANT.FIELD_TYPE_USER],
  [CONSTANT.TYPE_WORKSTATION, CONSTANT.FIELD_TYPE_WORKSTATION],
  [CONSTANT.TYPE_AUTH, CONSTANT.FIELD_TYPE_USER],
  [CONSTANT.TYPE_DEVICE, CONSTANT.FIELD_TYPE_DEVICE],
  [CONSTANT.TYPE_MULTIPLE_USER, CONSTANT.FIELD_TYPE_MULTIPLE_USER],
]);

class SOPFieldSelect extends React.PureComponent {
  state = {};

  render() {
    const { SOPDetail, type, value, filterReadOnly = false, ...rest } = this.props;
    if (!SOPDetail) {
      return <Select labelInValue value={value || undefined} {...rest} />;
    }
    const { customFieldList, presetFieldList } = SOPDetail;
    let fieldList = presetFieldList.concat(customFieldList).filter(node => {
      // if (type === CONSTANT.SOP_CONTROL_TYPE_AUTH) {
      //   return node.type === CONSTANT.SOP_CONTROL_TYPE_USER;
      // }
      return node.type === typeMapField.get(type);
    });
    if (filterReadOnly) {
      fieldList = fieldList.filter(node => {
        return node.rwPermission === CONSTANT.SOP_FIELD_READWRITE;
      });
    }
    return (
      <Select labelInValue style={{ width }} value={value || undefined} {...rest}>
        {fieldList.map(({ id, name }) => (
          <Option value={id} key={id}>
            {name}
          </Option>
        ))}
      </Select>
    );
  }
}

export default SOPFieldSelect;
