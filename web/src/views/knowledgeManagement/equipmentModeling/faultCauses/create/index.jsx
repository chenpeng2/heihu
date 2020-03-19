import React, { Component } from 'react';
import { addFaultCause } from 'src/services/knowledgeBase/equipment';
import Base from '../base';

type Props = {
  parentId: any,
  onCancel: () => {},
  refetch: () => {},
  initialValue: {},
  isCommonUse: Boolean,
  match: any,
};

class CreateFaultCause extends Component {
  props: Props;
  state = {
    data: null,
  };

  render() {
    const { parentId, onCancel, refetch, initialValue, match, isCommonUse } = this.props;

    return (
      <Base
        type={'创建'}
        match={match}
        parentId={parentId}
        actionFunc={addFaultCause}
        onCancel={onCancel}
        refetch={refetch}
        initialValue={initialValue}
        isCommonUse={isCommonUse}
      />
    );
  }
}

export default CreateFaultCause;
