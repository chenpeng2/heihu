import React from 'react';
import TaskBaseForm from './taskBaseForm';

class CreateReceiptTask extends React.PureComponent {
  state = {};
  render() {
    return <TaskBaseForm {...this.props} />;
  }
}

export default CreateReceiptTask;
