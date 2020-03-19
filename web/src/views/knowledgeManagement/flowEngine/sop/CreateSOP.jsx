import React from 'react';
import { withForm } from 'components';
import { createSOP } from 'services/knowledgeBase/sop';
import SOPBaseForm from './SOPBaseForm';

class CreateSOP extends React.PureComponent {
  state = {};

  render() {
    return <SOPBaseForm {...this.props} type="create" createApi={createSOP} title="创建SOP" />;
  }
}

export default withForm({}, CreateSOP);
