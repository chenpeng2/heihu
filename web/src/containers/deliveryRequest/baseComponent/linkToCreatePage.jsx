import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Button } from 'src/components';
import { changeTextLanguage } from 'src/utils/locale/utils';

class LinkToCreatePage extends Component {
  state = {};

  render() {
    const { style } = this.props;
    const { router, intl } = this.context;

    return (
      <Button style={style} icon="plus-circle-o" onClick={() => router.history.push('/stock/deliveryRequest/create')}>
        {changeTextLanguage(intl, { id: 'key3197', defaultMessage: '创建发运申请' })}
      </Button>
    );
  }
}

LinkToCreatePage.propTypes = {
  style: PropTypes.object,
};

LinkToCreatePage.contextTypes = {
  router: PropTypes.any,
  intl: PropTypes.any,
};

export default LinkToCreatePage;
