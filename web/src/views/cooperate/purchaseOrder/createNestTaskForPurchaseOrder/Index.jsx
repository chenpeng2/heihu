import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { black } from 'src/styles/color/index';
import { Spin, Button, message } from 'src/components/index';
import { createNestSpec, createNestTask } from 'src/services/nestSpec/index';
import log from 'src/utils/log';
import { getPurchaseOrderDetailById } from 'src/services/cooperate/purchaseOrder';

import BaseForm, { formatFormValue } from './BaseForm';
import { getPurchaseOrderCodeListPageUrl } from '../utils';

const Create = props => {
  const { match } = props;
  const id = _.get(match, 'params.purchaseOrderId') || {};

  const [isLoading, setIsLoading] = useState(false);
  const [purchaseOrder, setPurchaseOrder] = useState(null);

  let formRef;
  const { history } = props;
  const baseStyle = { width: 120 };

  useEffect(() => {
    getPurchaseOrderDetailById(id).then(res => {
      const data = _.get(res, 'data.data');
      setPurchaseOrder(data);
    });
  }, [id]);

  // 创建按钮回调函数
  const createFn = cb => {
    const validateFieldsAndScroll = _.get(formRef, 'props.form.validateFieldsAndScroll');

    if (typeof validateFieldsAndScroll === 'function') {
      validateFieldsAndScroll((err, value) => {
        if (err) return null;
        const valueAfterFormat = formatFormValue(value);

        setIsLoading(true);

        createNestTask(valueAfterFormat)
          .then(() => {
            message.success('创建嵌套任务成功');
            if (typeof cb === 'function') cb();
          })
          .catch(e => {
            log.error(e);
          })
          .finally(() => {
            setIsLoading(false);
          });
      });
    }
  };

  return (
    <Spin spinning={isLoading}>
      <div style={{ padding: 20 }}>
        <div>
          <div style={{ fontSize: '20px', color: black }}>创建嵌套任务</div>
        </div>
        <BaseForm purchaseOrder={purchaseOrder} wrappedComponentRef={inst => (formRef = inst)} />
        <div style={{ marginLeft: 140 }}>
          <Button
            style={{ ...baseStyle }}
            type={'default'}
            onClick={() => {
              history.push(getPurchaseOrderCodeListPageUrl());
            }}
          >
            取消
          </Button>
          <Button
            type={'primary'}
            style={{ ...baseStyle, marginLeft: 10 }}
            onClick={() => {
              createFn(() => history.push(getPurchaseOrderCodeListPageUrl()));
            }}
          >
            确定
          </Button>
        </div>
      </div>
    </Spin>
  );
};

Create.propTypes = {
  style: PropTypes.any,
  history: PropTypes.any,
};

export default Create;
