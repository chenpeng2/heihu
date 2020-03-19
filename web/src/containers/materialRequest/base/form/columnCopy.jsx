import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { openModal, withForm } from 'src/components';
import { primary } from 'src/styles/color';

import ChangeTargetColumn from './changeTargetColumn';

class ColumnCopy extends Component {
  state = {
    value: null,
  };

  render() {
    const { style, successCb } = this.props;
    return (
      <div style={style}>
        <span
          onClick={() => {
            openModal({
              title: '目的地（批量操作）',
              children: <ChangeTargetColumn successCb={successCb} />,
              footer: null,
            });
          }}
          style={{ color: primary, cursor: 'pointer' }}
        >
          列复制
        </span>
      </div>
    );
  }
}

ColumnCopy.propTypes = {
  style: PropTypes.object,
  form: PropTypes.any,
  successCb: PropTypes.any,
};

export default withForm({}, ColumnCopy);
