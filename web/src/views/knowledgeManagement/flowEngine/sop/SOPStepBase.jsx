import React from 'react';
import {
  getSOPSteps,
  getSOPDetail,
  createSOPStepGroup,
  deleteSOPStep,
  getSOPStepDetail,
  createSOPStep,
  updateSOPStep,
  copySopStep,
  updateStepOrder,
  updateSOPStepGroup,
} from 'services/knowledgeBase/sop';
import SOPStep from './SOPStep';

class SOPStepBase extends React.PureComponent {
  state = {};

  render() {
    const SOPStepApi = {
      getSOPSteps,
      getSOPDetail,
      createSOPStepGroup,
      deleteSOPStep,
      getSOPStepDetail,
      createSOPStep,
      updateSOPStep,
      copySopStep,
      updateStepOrder,
      updateSOPStepGroup,
    };
    return <SOPStep {...this.props} SOPStepApi={SOPStepApi} mode="sop" />;
  }
}

export default SOPStepBase;
