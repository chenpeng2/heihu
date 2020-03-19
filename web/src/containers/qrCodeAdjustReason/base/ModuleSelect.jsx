import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Select } from 'src/components';
import { isOrganizationUseQrCode } from 'src/utils/organizationConfig';

const SelectGroup = Select.SelectGroup;

const GROUP_DATA = [
  {
    name: 'WEB-库存调整',
    useQrCode: false,
    value: 1,
  },
  // {
  //   name: 'WEB-二维码清空',
  //   useQrCode: true,
  //   value: 2,
  // },
  {
    name: 'APP-二维码调整',
    useQrCode: true,
    value: 3,
  },
];

class ModuleSelect extends Component {
  state = {};

  render() {
    return (
      <SelectGroup
        groupData={GROUP_DATA.filter(i => i && i.useQrCode === isOrganizationUseQrCode()).map(i => {
          const { name, value } = i || {};
          return { label: name, value };
        })}
        {...this.props}
      />
    );
  }
}

ModuleSelect.propTypes = {
  style: PropTypes.object,
};

export default ModuleSelect;
