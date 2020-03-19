import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { Pagination, message, Spin, FormattedMessage, Icon, Searchselect } from 'src/components';
import { getUserFromLocalStorage } from 'src/utils/localStorage';
import { primary, fontSub } from 'src/styles/color';
import { arrayIsEmpty } from 'src/utils/array';
import { getMonitorConditions } from 'src/services/monitorCenter/index';
import { useFetch } from 'src/utils/hookUtils/fetchHooks';
import moment from 'src/utils/time';
import auth, { hasAuth } from 'src/utils/auth';

import ConfigCard from './ConfigCard';
import AddConfigCard from '../create/AddConfigCard';
import { setMonitorWarehouseInLocalStorage, getMonitorWarehouseInLocalStorage } from '../utils';

const List = props => {
  // 刷新时间
  const [refreshTime, setRefreshTime] = useState(moment().format('HH:mm'));
  // 分页
  const [pagination, setPagination] = useState({ pageSize: 10, current: 1, total: 10 });
  // 用户名
  const { name } = getUserFromLocalStorage();

  // 仓库
  const initialWarehouseCode = getMonitorWarehouseInLocalStorage() || undefined;
  const [warehouseCode, setWarehouseCode] = useState(initialWarehouseCode);

  // condition数据
  const [{ data, isLoading }, setParams] =
    useFetch(
      async params => {
        if (!params || !params.warehouseCode) return;
        return await getMonitorConditions(params);
      },
      {
        initialParams: { warehouseCode: warehouseCode ? warehouseCode.key : null, page: 1, size: 10 },
      },
    ) || {};
  const { data: conditions, total } = _.get(data, 'data') || {};

  useEffect(() => {
    setPagination({ ...pagination, total: total || 10 });
  }, [total]);

  // refetch函数
  const refetch = (warehouseCode, rest) => {
    if (!warehouseCode) {
      message.warn('请选择仓库');
      return;
    }
    if (rest) {
      const { page, pageSize } = rest;
      setPagination({ ...pagination, pageSize, current: page });
    }

    setParams({ warehouseCode, size: _.get(rest, 'pageSize') || 10, page: _.get(rest, 'page') || 1 });
  };

  return (
    <Spin spinning={isLoading}>
      <div style={{ padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <FormattedMessage defaultMessage={'你好，{name}欢迎来到你的监控台'} values={{ name }} />
          <div>
            <FormattedMessage
              style={{ color: fontSub }}
              defaultMessage={'页面刷新时间：{time}'}
              values={{ time: refreshTime }}
            />
            <span
              onClick={() => {
                refetch(warehouseCode ? warehouseCode.key : null, {
                  page: _.get(pagination, 'current'),
                  pageSize: _.get(pagination, 'pageSize'),
                });
                setRefreshTime(moment().format('HH:mm'));
              }}
              style={{ margin: '0px 10px', color: primary, cursor: 'pointer' }}
            >
              <Icon iconType={'gc'} type={'shuaxin'} />
              <FormattedMessage defaultMessage={'刷新'} />
            </span>
            <Searchselect
              onChange={value => {
                setWarehouseCode(value);

                const code = _.get(value, 'key');
                if (!code) return;

                refetch(code);
                setRefreshTime(moment().format('HH:mm'));

                setMonitorWarehouseInLocalStorage(value);
              }}
              value={warehouseCode}
              style={{ width: 200 }}
              type={'wareHouseWithCode'}
            />
          </div>
        </div>

        <div style={{ width: 1150, margin: 'auto' }}>
          {!arrayIsEmpty(conditions)
            ? conditions.map(i => {
                return (
                  <ConfigCard
                    refetch={() => refetch(warehouseCode ? warehouseCode.key : null)}
                    warehouseCode={warehouseCode ? warehouseCode.key : null}
                    conditionData={i}
                    style={{ margin: 5 }}
                  />
                );
              })
            : null}

          {/* 没有编辑权限又没有监控条件的时候显示 */}
          {arrayIsEmpty(conditions) && !hasAuth(auth.WEB_WATCH_CONDITION_OPERATE) ? (
            <div style={{ textAlign: 'center', margin: 20 }}>
              <FormattedMessage
                style={{ color: fontSub }}
                defaultMessage={'当前仓库无监控条件，联系监控台管理员维护监控条件'}
              />
            </div>
          ) : null}

          {/* 有编辑的权限的时候显示 */}
          {hasAuth(auth.WEB_WATCH_CONDITION_OPERATE) ? (
            <AddConfigCard
              refetch={() => refetch(warehouseCode ? warehouseCode.key : null)}
              style={{ margin: 5, verticalAlign: 'bottom' }}
            />
          ) : null}
        </div>

        {/* 分页 */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Pagination
            {...pagination}
            onChange={(page, pageSize) => refetch(warehouseCode ? warehouseCode.key : null, { page, pageSize })}
            showSizeChanger
            onShowSizeChange={(current, size) =>
              refetch(warehouseCode ? warehouseCode.key : null, { page: 1, pageSize: size })
            }
          />
        </div>
      </div>
    </Spin>
  );
};

List.propTypes = {
  style: PropTypes.any,
};

export default List;
