import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

import { Button, buttonAuthorityWrapper } from 'src/components';
import auth from 'src/utils/auth';

const ButtonWithAuth = buttonAuthorityWrapper(Button);

class LinkToCreate extends Component {
  props: {
    history: any,
  };
  state = {};

  render() {
    const { history } = this.props;

    return (
      <ButtonWithAuth
        auth={auth.WEB_CREATE_PROCESS_ROUTING_DEF}
        style={{ margin: 20 }}
        icon="plus-circle-o"
        onClick={() => history.push('/bom/processRoute/create')}
      >
        创建工艺路线
      </ButtonWithAuth>
    );
  }
}

export default withRouter(LinkToCreate);
