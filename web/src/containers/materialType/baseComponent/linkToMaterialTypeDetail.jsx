import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'components';
import { primary } from '../../../styles/color';

class LinkToMaterialTypeDetail extends Component {
  state = {};

  render() {
    const { id, style } = this.props;
    const { router } = this.context;
    const baseStyle = { color: primary, display: 'inline-block', cursor: 'pointer' };

    const goToDetailPage = id => {
      router.history.push(`/bom/materialTypes/${id}/detail`);
    };

    // 如果不传入id返回空
    if (!id) {
      return null;
    }

    return (
      <Link
        style={{ ...baseStyle, ...style }}
        onClick={() => {
          goToDetailPage(id);
        }}
      >
        查看
      </Link>
    );
  }
}

LinkToMaterialTypeDetail.propTypes = {
  style: PropTypes.object,
  id: PropTypes.any,
};

LinkToMaterialTypeDetail.contextTypes = {
  router: PropTypes.any,
};

export default LinkToMaterialTypeDetail;
