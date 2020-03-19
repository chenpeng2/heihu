import React from 'react';
import TaskBaseForm from './taskBaseForm';

class EditReceiptTask extends React.PureComponent {
  state = {};
  render() {
    return <TaskBaseForm {...this.props} edit />;
  }
}

export default EditReceiptTask;
