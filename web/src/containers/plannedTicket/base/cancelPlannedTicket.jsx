import React, { Component, Fragment, useState } from 'react';
import _ from 'lodash';

import { message, Link, Popconfirm, Spin } from 'components';
import { PLAN_TICKET_INJECTION_MOULDING } from 'constants';
import auth from 'utils/auth';
import log from 'utils/log';
import { arrayIsEmpty } from 'utils/array';
import {
  cancelPlannedTicket,
  cancelInjectionMoldingPlannedTicket,
  hasSubWorkOrders,
  queryWorkOrderTransReqCodes,
} from 'services/cooperate/plannedTicket';

import {
  WORK_ORDER_CANCEL_TIP_TYPE_REGULAR,
  WORK_ORDER_CANCEL_TIP_TYPE_HAS_SUB,
  WORK_ORDER_CANCEL_TIP_TYPE_HAS_TRANS_REQ,
  getWorkOrderCancelTip,
} from '../constants';

type CancelWorkOrderPropsType = {
  style: {},
  code: string,
  iconType: string,
  isGcIcon: boolean,
  iconStyle: any,
  fetchData: () => {},
  category: number,
};

export default function CancelWorkOrder(props: CancelWorkOrderPropsType) {
  const { code, iconType, linkStyle, ...rest } = props;
  const [regularText, setRegularText] = useState(null);
  const [hasSubText, setHasSubText] = useState(null);
  const [hasTransReqText, setTransReqText] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checkPhase, setCheckPhase] = useState(null);

  async function checkTransReq() {
    console.log('checkTransReq');
    queryWorkOrderTransReqCodes(code)
      .then(res => {
        const transReqRecord = _.get(res, 'data.data');
        console.log('transReqRecord', transReqRecord);
        if (!arrayIsEmpty(transReqRecord)) {
          const transReqCodes = transReqRecord.join('，');
          setTransReqText(getWorkOrderCancelTip(WORK_ORDER_CANCEL_TIP_TYPE_HAS_TRANS_REQ, transReqCodes));
        }
      })
      .catch(err => log.error(err));
  }

  function checkSub() {
    hasSubWorkOrders(code)
      .then(res => {
        const hasSub = _.get(res, 'data.data');
        if (hasSub) {
          setHasSubText(getWorkOrderCancelTip(WORK_ORDER_CANCEL_TIP_TYPE_HAS_SUB));
        }
      })
      .catch(err => log.error(err));
  }

  function regularCancel() {
    setRegularText(getWorkOrderCancelTip(WORK_ORDER_CANCEL_TIP_TYPE_REGULAR));
  }

  async function getConfirmText() {
    setLoading(true);
    await checkSub();
    await checkTransReq();
    await regularCancel();
    setLoading(false);
  }

  function confirmContent() {
    return (
      <Spin spinning={loading}>
        {(!hasTransReqText && !hasSubText && regularText) || (
          <Fragment>
            <p>{hasSubText || ''}</p>
            <p>{hasTransReqText || ''}</p>
          </Fragment>
        )}
      </Spin>
    );
  }

  function cancelWorkOrder() {
    const { fetchData, category, code } = props;
    let cancelApi = cancelPlannedTicket;
    if (category === PLAN_TICKET_INJECTION_MOULDING) {
      cancelApi = cancelInjectionMoldingPlannedTicket;
    }
    cancelApi(code)
      .then(async ({ data: { statusCode } }) => {
        if (statusCode === 200) {
          if (typeof fetchData === 'function') await fetchData();
          message.success('取消成功');
        }
      })
      .catch(err => log.error(err));
  }

  return (
    <Popconfirm
      arrowPointAtCenter
      autoAdjustOverflow
      placement="topRight"
      overlayStyle={{ width: 250, fontSize: 14 }}
      title={confirmContent()}
      onConfirm={cancelWorkOrder}
      // onCancel={() =>{}}
      okText="确认"
      cancelText="暂不取消"
    >
      <Link icon={iconType} auth={auth.WEB_CANCEL_PLAN_WORK_ORDER} style={linkStyle} onClick={getConfirmText} {...rest}>
        取消
      </Link>
    </Popconfirm>
  );
}
