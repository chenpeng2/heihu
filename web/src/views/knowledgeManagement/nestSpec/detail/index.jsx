import React, { useState } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { Icon, Link, Spin } from 'src/components';
import { middleGrey, black } from 'src/styles/color';
import { replaceSign } from 'src/constants';
import { getNestSpecDetail } from 'src/services/nestSpec';
import { useFetch } from 'src/utils/hookUtils/fetchHooks';

import UpdateStatus from '../baseComponent/updateStatus';
import { getEditNestSpecPageUrl, findNestSpecStatus, NEST_SPEC_STATUS } from '../utils';
import MaterialTable from './table';

const Item = props => {
  const { label, content } = props;
  const commonStyle = { display: 'inline-block' };

  return (
    <div style={{ margin: '20px 0', display: 'flex', alignItems: 'flex-start' }}>
      <div style={{ ...commonStyle, color: middleGrey, width: 80, textAlign: 'right' }}>{label}</div>
      <div style={{ ...commonStyle, color: black, marginLeft: 10, maxWidth: 800, wordWrap: 'break-word' }}>
        {content || replaceSign}
      </div>
    </div>
  );
};

const Detail = props => {
  const { match } = props;
  const code = _.get(match, 'params.id');
  const _code = decodeURIComponent(code);

  const [{ data, isLoading }, setParams] = useFetch(params => getNestSpecDetail(_.get(params, 'code')), {
    initialParams: { code: _code },
  });
  const { packCode, packName, items, state, memo } = _.get(data, 'data.data') || {};
  const { name: stateName } = findNestSpecStatus(state) || {};

  const refetch = () => {
    setParams({ code: _code });
  };

  return (
    <Spin spinning={isLoading}>
      <div style={{ padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '20px', color: black }}>嵌套规格详情</div>
          <div>
            <div>
              <Link
                disabled={state === NEST_SPEC_STATUS.use.value}
                icon={'edit'}
                style={{ marginRight: 5 }}
                to={getEditNestSpecPageUrl(_code)}
              >
                编辑
              </Link>
            </div>
          </div>
        </div>
        <Item label={'编号'} content={packCode} />
        <Item label={'名称'} content={packName} />
        <Item
          label={'状态'}
          content={
            <div>
              <span style={{ marginRight: 5 }}>{stateName}</span>
              <UpdateStatus id={decodeURIComponent(code)} stateNow={state} cbForUpdateSuccess={refetch} />
            </div>
          }
        />
        <Item label={'物料列表'} content={<MaterialTable style={{ margin: 0 }} tableData={items} />} />
        <Item label={'备注'} content={memo} />
      </div>
    </Spin>
  );
};

Detail.propTypes = {
  style: PropTypes.any,
  match: PropTypes.any,
};

export default Detail;
