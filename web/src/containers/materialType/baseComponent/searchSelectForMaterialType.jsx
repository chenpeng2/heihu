import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';

import { Searchselect, FormattedMessage } from 'src/components';
import { queryMaterialTypeList } from 'src/services/bom/materialType';
import { arrayIsEmpty } from 'src/utils/array';

export const KEY_TYPE = {
  id: { value: 0 },
  code: { value: 1 },
};

export const EMPTY_OPTION = 'empty_material_type';

const SearchSelectForMaterialType = props => {
  const { params, keyType, needEmptyOption } = props;

  const getKey = data => {
    const { code, id } = data || {};
    if (keyType === KEY_TYPE.id.value) return id;
    if (keyType === KEY_TYPE.code.value) return code;
    return id;
  };

  const extraSearch = async p => {
    const { search, ...rest } = p || {};
    return queryMaterialTypeList({ name: search, ...rest, ...params }).then(res => {
      const data = _.get(res, 'data.data');

      let dataOptions = arrayIsEmpty(data)
        ? []
        : data.map(i => {
            const { name } = i || {};
            return {
              label: name,
              key: getKey(i),
            };
          });

      if (needEmptyOption) {
        dataOptions = [
          {
            label: <FormattedMessage defaultMessage={'无物料类型'} />,
            key: EMPTY_OPTION,
          },
        ].concat(dataOptions);
      }

      return dataOptions;
    });
  };

  return <Searchselect {...props} extraSearch={extraSearch} />;
};

SearchSelectForMaterialType.propTypes = {
  params: PropTypes.any,
  keyType: PropTypes.any,
  needEmptyOption: PropTypes.bool, // 是否需要物料类型为空选项
};

export default SearchSelectForMaterialType;
