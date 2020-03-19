import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Link } from 'src/components';
import auth from 'src/utils/auth';

type Props = {
  code: string,
};

class LinkToProcessDetail extends Component {
  props: Props;
  state = {};

  render() {
    const { code } = this.props;
    const { router } = this.context;

    if (!code) return null;

    return (
      <Link
        auth={auth.WEB_VIEW_PROCESS_DEF}
        style={{ marginRight: 20 }}
        onClick={() => {
          router.history.push(`/bom/newProcess/${encodeURIComponent(code)}/detail`);
        }}
      >
        查看
      </Link>
    );
  }
}

LinkToProcessDetail.contextTypes = {
  router: PropTypes.any,
};

export default LinkToProcessDetail;
