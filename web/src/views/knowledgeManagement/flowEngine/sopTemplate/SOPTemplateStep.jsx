import React from 'react';
import {
  getSOPTemplateSteps,
  getSOPTemplateDetail,
  createSOPTemplateStepGroup,
  deleteSOPTemplateStep,
  getSOPTemplateStepDetail,
  createSOPTemplateStep,
  updateSOPTemplateStep,
  copSOPTemplateStep,
  updateStepTemplateOrder,
  updateSOPTemplateStepGroup,
} from 'services/knowledgeBase/sopTemplate';
import { CREATE_BY_SOP_TEMPLATE } from '../common/SOPConstant';
import SOPStep from '../sop/SOPStep';

class SOPTemplateStep extends React.PureComponent {
  state = {};

  render() {
    const SOPStepApi = {
      getSOPSteps: getSOPTemplateSteps,
      getSOPDetail: getSOPTemplateDetail,
      createSOPStepGroup: createSOPTemplateStepGroup,
      deleteSOPStep: deleteSOPTemplateStep,
      getSOPStepDetail: getSOPTemplateStepDetail,
      createSOPStep: createSOPTemplateStep,
      updateSOPStep: updateSOPTemplateStep,
      copySopStep: copSOPTemplateStep,
      updateStepOrder: updateStepTemplateOrder,
      updateSOPStepGroup: updateSOPTemplateStepGroup,
    };
    const sopTemplateId = this.props.match.params.id;
    return (
      <SOPStep
        {...this.props}
        SOPStepApi={SOPStepApi}
        mode="sopTemplate"
        type={CREATE_BY_SOP_TEMPLATE}
        sopTemplateId={sopTemplateId}
      />
    );
  }
}

export default SOPTemplateStep;
