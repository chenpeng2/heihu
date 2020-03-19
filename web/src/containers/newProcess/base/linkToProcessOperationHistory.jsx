import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Link, Icon } from 'src/components';

type Props = {
  code: string,
  iconType: string,
};

class LinkToProcessDetail extends Component {
  props: Props;
  state = {};

  render() {
    const { code, iconType } = this.props;
    const { router } = this.context;

    if (!code) return null;

    return (
      <Link
        style={{ marginRight: 20 }}
        onClick={() => {
          router.history.push(`/bom/newProcess/${encodeURIComponent(code)}/detail/operationHistory`);
        }}
        icon={iconType || null}
      >
        查看操作记录
      </Link>
    );
  }
}

LinkToProcessDetail.contextTypes = {
  router: PropTypes.any,
};

export default LinkToProcessDetail;
