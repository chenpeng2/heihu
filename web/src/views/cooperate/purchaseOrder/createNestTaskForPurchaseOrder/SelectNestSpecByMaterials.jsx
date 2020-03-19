import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { Searchselect } from 'src/components';
import { getNestSpecByMaterials } from 'src/services/nestSpec';
import { arrayIsEmpty } from 'src/utils/array';

export const extraSearch = async materialCodes => {
  const res = await getNestSpecByMaterials({ materialCodes });
  const data = _.get(res, 'data.data');
  return arrayIsEmpty(data)
    ? []
    : data.map(i => {
        const { packCode, packName } = i || {};
        return { key: packCode, label: packName };
      });
};

class SelectNestSpecByMaterials extends Component {
  state = {};

  render() {
    const { materialCodes, ...rest } = this.props;
    return <Searchselect fetchOnDidMount extraSearch={async () => extraSearch(materialCodes)} {...rest} />;
  }
}

SelectNestSpecByMaterials.propTypes = {
  style: PropTypes.object,
  materialCodes: PropTypes.any,
};

export default SelectNestSpecByMaterials;
