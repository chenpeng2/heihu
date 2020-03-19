import React, { Component } from 'react';

import { Link } from 'src/components';
import { Primary } from 'src/styles/color';

type Props = {
  render: () => {},
  style: {},
  code: string,
};

class LinkToProductivityStandardOperationHistory extends Component {
  props: Props;
  state = {};

  baseRender = () => {
    return <span>查看操作记录</span>;
  };

  render() {
    const { render, style, code } = this.props;

    if (!code) return null;

    const baseStyle = { margin: '0 20px 0 0' };

    return (
      <Link
        style={{ ...baseStyle, ...style }}
        to={`/knowledgeManagement/productivityStandards/${code}/detail/operationHistory`}
      >
        {render && typeof render === 'function' ? render() : this.baseRender()}
      </Link>
    );
  }
}

export default LinkToProductivityStandardOperationHistory;
