import React, { Component } from 'react';
import { addDownTimeCause } from 'src/services/knowledgeBase/downtimeCause';
import Base from '../base';

type Props = {
  parentId: any,
  onCancel: () => {},
  refetch: () => {},
  match: any,
};

class CreateFaultCause extends Component {
  props: Props;
  state = {
    data: null,
  };

  render() {
    const { parentId, onCancel, refetch, match } = this.props;

    return (
      <Base
        match={match}
        type={'创建'}
        parentId={parentId}
        actionFunc={addDownTimeCause}
        onCancel={onCancel}
        refetch={refetch}
      />
    );
  }
}

export default CreateFaultCause;
