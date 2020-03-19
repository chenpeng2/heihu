import React from 'react';
import { withForm } from 'components';
import TaskBaseForm from './taskBaseForm';

class CreateSendTask extends React.PureComponent {
  state = {};

  render() {
    return <TaskBaseForm {...this.props} />;
  }
}

export default withForm({}, CreateSendTask);
