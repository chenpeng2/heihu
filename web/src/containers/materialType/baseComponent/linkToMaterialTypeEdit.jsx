import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Icon, Link } from 'src/components';
import { primary } from 'src/styles/color';

class LinkToMaterialTypeEdit extends Component {
  state = {};

  render() {
    const { withIcon, id, style } = this.props;
    const { router } = this.context;
    const baseStyle = { color: primary, display: 'inline-block', cursor: 'pointer' };

    const goToCreatePage = id => {
      router.history.push(`/bom/materialTypes/${id}/edit`);
    };

    // 如果不传入id返回空
    if (!id) {
      return null;
    }

    if (!withIcon) {
      return (
        <Link
          style={{ ...baseStyle, ...style }}
          onClick={() => {
            goToCreatePage(id);
          }}
        >
          编辑
        </Link>
      );
    }

    return (
      <Link
        style={{ ...baseStyle, ...style }}
        onClick={() => {
          goToCreatePage(id);
        }}
        icon="edit"
      >
        编辑
      </Link>
    );
  }
}

LinkToMaterialTypeEdit.propTypes = {
  style: PropTypes.object,
  withIcon: PropTypes.bool,
  id: PropTypes.string, // 物料类型id
};

LinkToMaterialTypeEdit.contextTypes = {
  router: PropTypes.any,
};

export default LinkToMaterialTypeEdit;
