import React, { Component } from 'react';

import { Link } from 'src/components';
import { primary } from 'src/styles/color';

type Props = {
  render: () => {},
  style: {},
  code: string
}

class LinkToEditProductivityStandardPage extends Component {
  props: Props
  state = {}

  baseRender = () => {
    return (
      <span style={{ color: primary }} >编辑</span>
    );
  }

  render() {
    const { render, style, code } = this.props;

    if (!code) return null;

    const baseStyle = { margin: '0 20px 0 0' };

    return (
      <Link style={{ ...baseStyle, ...style }} to={`/knowledgeManagement/productivityStandards/${code}/edit`} >
        {
          render && typeof render === 'function' ? render() : this.baseRender()
        }
      </Link>
    );
  }
}

export default LinkToEditProductivityStandardPage;
