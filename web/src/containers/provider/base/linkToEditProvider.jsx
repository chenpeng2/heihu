import React, { Component } from 'react';

import { Link } from 'src/components';

type Props = {
  style: {},
  render: () => {},
  code: string
};

class LinkToEditProvider extends Component {
  props: Props;
  state = {};

  render() {
    const { style, code } = this.props;

    if (!code) return null;

    return (
      <Link to={`/knowledgeManagement/provider/${encodeURIComponent(code)}/edit`} style={style}>
        编辑
      </Link>
    );
  }
}

export default LinkToEditProvider;
