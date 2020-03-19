import React, { Component } from 'react';
import _ from 'lodash';

import { Link } from 'components';

type Props = {
  text: string,
  style: {},
  initialData: {},
};

class CreateLink extends Component {
  props: Props;
  state = {};

  render() {
    const { text, style, initialData, ...rest } = this.props;

    return (
      <Link
        to={`/weighingManagement/weighingTask/create?data=${JSON.stringify(initialData)}`}
        style={{ marginLeft: 10, display: 'inline-block', ...style }}
        {...rest}
      >
        {text || '创建'}
      </Link>
    );
  }
}

export default CreateLink;
