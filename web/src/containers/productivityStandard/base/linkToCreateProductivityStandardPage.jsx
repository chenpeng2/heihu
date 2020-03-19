import React, { Component } from 'react';

import { Link } from 'src/components';
import { Primary } from 'src/styles/color';

type Props = {
  render: () => {},
  style: {}
}

class LinkToCreateProductivityStandardPage extends Component {
  props: Props
  state = {}

  baseRender = () => {
    return (
      <span>创建产能标准</span>
    );
  }

  render() {
    const { render, style } = this.props;


    return (
      <Link style={style} to={'/knowledgeManagement/productivityStandards/create'} >
        {
          render && typeof render === 'function' ? render() : this.baseRender()
        }
      </Link>
    );
  }
}

export default LinkToCreateProductivityStandardPage;
