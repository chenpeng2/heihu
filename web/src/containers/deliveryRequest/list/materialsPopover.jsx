import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Popover, Icon } from 'src/components';
import { primary } from 'src/styles/color';
import { changeTextLanguage } from 'src/utils/locale/utils';

import MaterialTable from './materialTable';

class MaterialPopover extends Component {
  state = {};

  render() {
    const { code, data } = this.props;
    const { intl } = this.context;

    return (
      <div>
        <Popover
          placement={'topRight'}
          content={
            <MaterialTable
              deliveryRequestDetail={data}
              code={code}
              title={`${changeTextLanguage(intl, { id: 'key3005', defaultMessage: '发运编号' })}：${code}`}
            />
          }
        >
          <div style={{ color: primary, cursor: 'default' }}>
            <div style={{ display: 'inline-block' }}>{code}</div>
            <Icon type={'down'} size={8} style={{ margin: '0 5px' }} />
          </div>
        </Popover>
      </div>
    );
  }
}

MaterialPopover.propTypes = {
  style: PropTypes.object,
  code: PropTypes.string,
  data: PropTypes.any,
};

MaterialPopover.contextTypes = {
  intl: PropTypes.any,
};

export default MaterialPopover;
