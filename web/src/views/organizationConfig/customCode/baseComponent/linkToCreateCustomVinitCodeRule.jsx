import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

import { Button } from 'src/components';

class LinkToCreate extends Component {
  props: {
    history: any,
    style: any,
  };
  state = {};

  render() {
    const { history, style } = this.props;

    return (
      <Button
        style={{ margin: 20, ...style }}
        icon="plus-circle-o"
        onClick={() => history.push('/customCode/create')}
      >
        创建编码规则
      </Button>
    );
  }
}

export default withRouter(LinkToCreate);
