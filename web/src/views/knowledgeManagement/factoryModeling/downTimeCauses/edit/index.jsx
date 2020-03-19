import React, { Component } from 'react';
import { updateDownTimeCause } from 'src/services/knowledgeBase/downtimeCause';
import Base from '../base';

type Props = {
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
    const { initialValue, onCancel, refetch, match } = this.props;

    return (
      <Base
        type={'编辑'}
        match={match}
        actionFunc={updateDownTimeCause}
        initialValue={initialValue}
        onCancel={onCancel}
        refetch={refetch}
      />
    );
  }
}

export default EditFaultCause;
