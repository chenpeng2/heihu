import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Link, Icon } from 'src/components/index';
import { getTransferApplyEditPageUrl } from '../util';

const LinkToTransferApplyEditPage = (props, context) => {
  const { id, style, withIcon } = props || {};
  const { changeChineseToLocale } = context || {};

  return (
    <Link style={{ ...style }} to={getTransferApplyEditPageUrl(id)}>
      {withIcon ? <Icon style={{ marginRight: 5 }} type={'edit'} /> : null}
      {changeChineseToLocale('编辑')}
    </Link>
  );
};

LinkToTransferApplyEditPage.propTypes = {
  style: PropTypes.object,
  id: PropTypes.any,
  withIcon: PropTypes.bool,
};

LinkToTransferApplyEditPage.contextTypes = {
  router: PropTypes.any,
  changeChineseToLocale: PropTypes.any,
};

export default LinkToTransferApplyEditPage;
