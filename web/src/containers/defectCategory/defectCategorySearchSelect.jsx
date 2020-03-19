import React, { useState } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { Searchselect } from 'src/components';
import { getDefectCategoryList } from 'src/services/knowledgeBase/defect';
import { arrayIsEmpty } from 'src/utils/array';

const extraSearch = async params => {
  const res = await getDefectCategoryList(params);
  const data = _.get(res, 'data.data');

  return arrayIsEmpty(data)
    ? []
    : data.map(i => {
        const { id, name } = i || {};
        return {
          key: id,
          label: name,
          data: i,
        };
      });
};

const DefectCategorySearchSelect = props => {
  return <Searchselect extraSearch={extraSearch} {...props} />;
};

DefectCategorySearchSelect.propTypes = {
  style: PropTypes.any,
};

export default DefectCategorySearchSelect;
