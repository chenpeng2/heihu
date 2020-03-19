import React from 'react';
import SOPDetail from '../sop/SopDetail';

class SOPTemplateDetail extends React.PureComponent {
  state = {};

  render() {
    return (
      <div>
        <SOPDetail {...this.props} mode="template" />
      </div>
    );
  }
}

export default SOPTemplateDetail;
