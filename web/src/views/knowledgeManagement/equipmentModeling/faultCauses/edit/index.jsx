import React, { Component } from 'react';
import { updateFaultCause } from 'src/services/knowledgeBase/equipment';
import Base from '../base';

type Props = {
  parentId: any,
  onCancel: any,
  refetch: () => {},
  initialValue: {},
  match: any,
};

class EditFaultCause extends Component {
  props: Props;
  state = {
    data: null,
  };

  render() {
    const { parentId, initialValue, onCancel, refetch, match } = this.props;

    return (
      <Base
        type={'编辑'}
        parentId={parentId}
        match={match}
        actionFunc={updateFaultCause}
        initialValue={initialValue}
        onCancel={onCancel}
        refetch={refetch}
      />
    );
  }
}

export default EditFaultCause;
