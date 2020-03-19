import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { Button } from 'src/components/index';
import { goToCreateTransferApplyPage } from '../util';

const LinkToCreateTransferApplyPage = (props, context) => {
  return (
    <Button icon="plus-circle-o" onClick={() => goToCreateTransferApplyPage(_.get(context, 'router'))}>
      创建转移申请
    </Button>
  );
};

LinkToCreateTransferApplyPage.propTypes = {
  style: PropTypes.object,
};

LinkToCreateTransferApplyPage.contextTypes = {
  router: PropTypes.any,
};

export default LinkToCreateTransferApplyPage;
