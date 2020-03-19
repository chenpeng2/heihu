import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { buttonAuthorityWrapper, Button, Icon } from 'src/components';
import auth from 'src/utils/auth';
import { getCreateProcessPath } from 'views/bom/newProcess/utils';

const ButtonWithAuth = buttonAuthorityWrapper(Button);

type Props = {
  style: {},
};

class LinkToCreateProcess extends Component {
  props: Props;
  state = {};

  render() {
    const { style } = this.props;
    const { router } = this.context;

    return (
      <ButtonWithAuth
        auth={auth.WEB_CREATE_PROCESS_DEF}
        icon={'plus-circle-o'}
        style={{ marginRight: 20 }}
        onClick={() => {
          router.history.push(getCreateProcessPath());
        }}
      >
        创建工序
      </ButtonWithAuth>
    );
  }
}

LinkToCreateProcess.contextTypes = {
  router: PropTypes.any,
};

export default LinkToCreateProcess;
