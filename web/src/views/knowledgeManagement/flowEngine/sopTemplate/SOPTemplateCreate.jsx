import React from 'react';
import { withForm } from 'components';
import { createSopTemplate } from 'services/knowledgeBase/sopTemplate';
import SOPBaseForm from '../sop/SOPBaseForm';

class SOPTemplateCreate extends React.PureComponent {
  state = {};

  render() {
    return (
      <div>
        <SOPBaseForm {...this.props} type="create" mode="template" createApi={createSopTemplate} title="创建SOP模板" />
      </div>
    );
  }
}

export default withForm({}, SOPTemplateCreate);
