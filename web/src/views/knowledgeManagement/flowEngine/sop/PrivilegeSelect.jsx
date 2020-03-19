import React from 'react';
import { Select } from 'components';
import SearchSelect from 'components/select/searchSelect';
import SOPFieldSelect from './SOPFieldSelect';
import CONSTANT from '../common/SOPConstant';

const width = 200;

class PrivilegeSelect extends React.PureComponent {
  state = {};
  render() {
    const { privilegeType, SOPDetail, ...rest } = this.props;
    let selectProps = {};
    if (privilegeType === CONSTANT.SOP_STEP_PRIVILEGE_TYPE_USERTYPE) {
      return <SOPFieldSelect SOPDetail={SOPDetail} type={CONSTANT.TYPE_USER} {...rest} />;
    } else if (privilegeType === CONSTANT.SOP_STEP_PRIVILEGE_TYPE_USER) {
      selectProps = { type: 'user' };
    } else if (privilegeType === CONSTANT.SOP_STEP_PRIVILEGE_TYPE_ROLE) {
      selectProps = { type: 'role' };
    } else if (privilegeType === CONSTANT.SOP_STEP_PRIVILEGE_TYPE_USER_GROUP) {
      selectProps = { type: 'workgroup' };
    } else {
      return <Select style={{ width }} {...rest} />;
    }
    return <SearchSelect loadOnFocus clearOnFocus {...selectProps} style={{ width }} {...rest} />;
  }
}

export default PrivilegeSelect;
