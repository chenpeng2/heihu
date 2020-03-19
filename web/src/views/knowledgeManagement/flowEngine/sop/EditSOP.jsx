import React from 'react';
import { withForm } from 'components';
import { editSOP } from 'services/knowledgeBase/sop';
import SOPBaseForm from './SOPBaseForm';

class EditSOP extends React.PureComponent {
  state = {};

  render() {
    return (
      <div>
        <SOPBaseForm title={'编辑SOP详情'} {...this.props} type="edit" editApi={editSOP} />
      </div>
    );
  }
}

export default withForm({}, EditSOP);
