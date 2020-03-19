import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { fontSub, border, white, primary } from 'src/styles/color';
import { Tooltip, openModal, Spin, Link, Icon, FormattedMessage } from 'src/components';
import { getQrCodeAmountByCondition } from 'src/services/monitorCenter/index';
import { replaceSign } from 'src/constants';
import { useFetch } from 'src/utils/hookUtils/fetchHooks';
import auth, { hasAuth } from 'src/utils/auth';

import { getMonitorDetailPageUrl } from '../utils';
import Edit from '../edit/EditModal';
import Styles from '../styles.scss';

const ConfigCard = props => {
  const { conditionData, style, warehouseCode, refetch } = props;
  const { name, id } = conditionData || {};

  const [{ data, isLoading }, setParams] = useFetch(getQrCodeAmountByCondition, {
    initialParams: {
      conditionId: id,
      warehouseCode,
    },
  });

  // 这个条件下的二维码数量
  const amount = _.get(data, 'data.data');

  // 改变仓库的时候重新拉取数据
  useEffect(() => {
    setParams({ conditionId: id, warehouseCode });
  }, [warehouseCode, conditionData]);

  return (
    <div className={Styles.commonCard} style={style}>
      <Spin spinning={isLoading}>
        <div style={{ fontSize: 14, display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <Icon iconType={'gc'} type={'tongzhiicon_wuliao'} style={{ color: primary }} />
            {name ? (
              <Tooltip
                text={name}
                length={8}
                style={{ maxWidth: 180, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}
              />
            ) : (
              replaceSign
            )}
          </div>
          {hasAuth(auth.WEB_WATCH_CONDITION_OPERATE) ? (
            <Icon
              onClick={() => {
                openModal({
                  title: '编辑监控条件',
                  footer: null,
                  children: <Edit id={conditionData ? conditionData.id : null} />,
                  onOk: () => {
                    if (typeof refetch === 'function') refetch();
                  },
                });
              }}
              iconType={'gc'}
              type={'bianji'}
              style={{ color: primary, cursor: 'pointer' }}
            />
          ) : null}
        </div>
        <div style={{ margin: '20px 0px', fontSize: 16, display: 'flex', justifyContent: 'center' }}>
          <FormattedMessage defaultMessage={'二维码'} />
          <span>：</span>
          <FormattedMessage defaultMessage={'{amount}个'} values={{ amount: amount || 0 }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Link to={getMonitorDetailPageUrl(id, warehouseCode)}>
            <FormattedMessage id={'key-6-184'} style={{ cursor: 'pointer', color: fontSub }} />
          </Link>
        </div>
      </Spin>
    </div>
  );
};

ConfigCard.propTypes = {
  style: PropTypes.any,
  conditionData: PropTypes.any,
  warehouseCode: PropTypes.any,
  refetch: PropTypes.any,
};

export default ConfigCard;
