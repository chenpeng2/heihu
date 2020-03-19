import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Link, Icon } from 'src/components';
import auth from 'src/utils/auth';

type Props = {
  code: string,
  iconType: string,
};

class LinkToEditProcess extends Component {
  props: Props;
  state = {};

  render() {
    const { code, iconType } = this.props;
    const { router } = this.context;

    if (!code) return null;

    return (
      <Link
        auth={auth.WEB_EDIT_PROCESS_DEF}
        style={{ marginRight: 20 }}
        onClick={() => {
          router.history.push(`/bom/newProcess/${encodeURIComponent(code)}/edit`);
        }}
        icon={iconType ? <Icon type={iconType} /> : null}
      >
        编辑
      </Link>
    );
  }
}

LinkToEditProcess.contextTypes = {
  router: PropTypes.any,
};

export default LinkToEditProcess;
