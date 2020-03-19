import React, { Component } from 'react';

import { Button, Link } from 'src/components';

type Props = {
  style: {},
  render: () => {},
};

class LinkToCreateProvider extends Component {
  props: Props;
  state = {};

  render() {
    const { style } = this.props;

    return (
      <Link to={'/knowledgeManagement/provider/create'} style={style}>
        <Button icon={'plus-circle-o'}>创建供应商</Button>
      </Link>
    );
  }
}

export default LinkToCreateProvider;
