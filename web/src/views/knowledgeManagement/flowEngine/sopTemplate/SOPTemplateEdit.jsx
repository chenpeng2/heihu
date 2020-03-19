import React from 'react';
import { withForm } from 'components';
import { editSopTemplate } from 'services/knowledgeBase/sopTemplate';
import SOPBaseForm from '../sop/SOPBaseForm';

class SOPTemplateEdit extends React.PureComponent {
  state = {};

  render() {
    return (
      <div>
        <SOPBaseForm {...this.props} type="edit" mode="template" editApi={editSopTemplate} title="编辑SOP模板" />
      </div>
    );
  }
}

export default withForm({}, SOPTemplateEdit);
