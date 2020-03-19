import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Button } from 'src/components';

class LinkToCreateProductBatchCodeRule extends Component {
  state = {};

  render() {
    const { router } = this.context;

    return (
      <Button
        style={{ margin: 20 }}
        icon="plus-circle-o"
        onClick={() => router.history.push('/stock/productBatchCodeRule/create')}
      >
        创建成品批号规则
      </Button>
    );
  }
}

LinkToCreateProductBatchCodeRule.propTypes = {
  style: PropTypes.object,
};
LinkToCreateProductBatchCodeRule.contextTypes = {
  router: PropTypes.object,
};

export default LinkToCreateProductBatchCodeRule;
