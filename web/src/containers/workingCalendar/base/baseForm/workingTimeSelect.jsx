import React, { Component } from 'react';
import _ from 'lodash';

import { getWorkingTimesList } from 'src/services/knowledgeBase/workingTime';
import SearchSelect from 'src/components/select/searchSelect';

type Props = {
  style: {},
};

class WorkingTimeSelect extends Component {
  props: Props;
  state = {};

  render() {
    const { style, ...rest } = this.props;

    return (
      <SearchSelect
        style={style}
        extraSearch={async params => {
          const res = await getWorkingTimesList({ ...params, status: 1 });
          const data = _.get(res, 'data.data');

          return data.map(({ name, id }) => {
            return { label: name, key: id };
          });
        }}
        {...rest}
      />
    );
  }
}

export default WorkingTimeSelect;
