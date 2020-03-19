import React from 'react';
import { withForm } from 'components';
import { createBatchTemplate } from 'services/process';
import BaseForm from '../base/BaseForm';

class Create extends React.PureComponent {
  state = {};

  render() {
    return <BaseForm {...this.props} submitApi={createBatchTemplate} />;
  }
}

export default withForm({}, Create);
