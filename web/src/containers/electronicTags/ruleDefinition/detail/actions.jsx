import React, { Component } from 'react';
import { Link } from 'components';

type Props = {
  editPath: String,
  logPath: String,
  status: Number,
};

class Actions extends Component {
  props: Props;
  state = {};

  render() {
    const { editPath, logPath, status } = this.props;
    return (
      <div>
        <Link
          style={{ marginRight: 30 }}
          icon="edit"
          to={editPath}
          disabled={status === 1}
        >
          编辑
        </Link>
        <Link icon="bars" style={{ marginRight: 30 }} to={logPath}>
          查看操作记录
        </Link>
      </div>
    );
  }
}

export default Actions;
