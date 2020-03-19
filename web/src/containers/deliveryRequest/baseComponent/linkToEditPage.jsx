import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { primary } from 'src/styles/color';
import { changeTextLanguage } from 'src/utils/locale/utils';

class LinkToCreatePage extends Component {
  state = {};

  render() {
    const { style, id } = this.props;
    const { router, intl } = this.context;

    const baseStyle = { color: primary, cursor: 'pointer' };

    if (!id) return null;
    return (
      <span style={{ ...baseStyle, ...style }} onClick={() => router.history.push(`/stock/deliveryRequest/${id}/edit`)}>
        {changeTextLanguage(intl, { id: 'key2274', defaultMessage: '编辑' })}
      </span>
    );
  }
}

LinkToCreatePage.propTypes = {
  style: PropTypes.object,
  id: PropTypes.any,
};

LinkToCreatePage.contextTypes = {
  router: PropTypes.any,
  intl: PropTypes.any,
};

export default LinkToCreatePage;
