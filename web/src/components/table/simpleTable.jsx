import React from 'react';
import _ from 'lodash';
import { injectIntl } from 'react-intl';

import { getParams } from 'utils/url';
import Table from './index';
import { changeTitleLanguage } from '../table/utils';

function simpleTable(props: any) {
  const { pagination, noDefaultPage, columns, intl, ...rest } = props;
  const query = _.get(getParams(), 'queryObj');
  let _pagination =
    pagination === false
      ? false
      : {
          current: _.get(query, 'page'),
          ...pagination,
        };
  if (noDefaultPage) {
    // 不需要默认的page作为current
    _pagination = {};
  }
  const _columns = changeTitleLanguage(columns, intl);
  return <Table columns={_columns} pagination={_pagination} {...rest} />;
}

export default injectIntl(simpleTable);
