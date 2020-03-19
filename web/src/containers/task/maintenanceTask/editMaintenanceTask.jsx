import React, { Component } from 'react';
import Base from './base';

type Props = {
  match: {
    params: {
      taskCode: string,
    }
  },
};

class EditMaintenanceTask extends Component {
  props: Props;
  state = {};

  render() {
    const { match: { params: { taskCode } } } = this.props;

    return (
      <Base type={'编辑'} taskCode={taskCode} />
    );
  }
}

export default EditMaintenanceTask;
