import React from 'react';
import { withForm } from 'components';
import TaskBaseForm from './taskBaseForm';

class EditSendTask extends React.PureComponent {
  state = {};

  render() {
    return <TaskBaseForm {...this.props} edit />;
  }
}

export default withForm({}, EditSendTask);
