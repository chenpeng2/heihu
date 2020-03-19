import React, { Component } from 'react';
import _ from 'lodash';

import { Link } from 'components';

type Props = {
  id: any,
  style: {},
};

class EditLink extends Component {
  props: Props;
  state = {};

  render() {
    const { id, style, ...rest } = this.props;

    return (
      <Link
        to={`/weighingManagement/weighingTask/edit/${id}`}
        style={{ marginLeft: 10, display: 'inline-block', ...style }}
        {...rest}
      >
        编辑
      </Link>
    );
  }
}

export default EditLink;
