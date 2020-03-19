import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { Searchselect } from 'src/components';
import { queryTransferApplyList } from 'src/services/cooperate/materialRequest';
import { arrayIsEmpty } from 'src/utils/array';

const extraSearch = async params => {
  const res = await queryTransferApplyList({ ...params, page: 1 });
  const data = _.get(res, 'data.data');
  return arrayIsEmpty(data)
    ? []
    : data
        .filter(i => i)
        .map(i => {
          const { code } = i;
          return { key: code, label: code, data: i };
        });
};

class TransferApplySelectForMerge extends Component {
  state = {};

  render() {
    const { style, transferApplyIds, ...rest } = this.props;
    return (
      <Searchselect
        fetchOnDidMount
        style={style}
        extraSearch={async params => {
          return await extraSearch({
            ids: transferApplyIds,
            size: arrayIsEmpty(transferApplyIds) ? 10 : transferApplyIds.length,
            ...params,
          });
        }}
        {...rest}
      />
    );
  }
}

TransferApplySelectForMerge.propTypes = {
  style: PropTypes.object,
  transferApplyIds: PropTypes.any,
};

export default TransferApplySelectForMerge;
