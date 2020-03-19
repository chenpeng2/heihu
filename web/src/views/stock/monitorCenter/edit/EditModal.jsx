import React, { useState } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { Spin, Button, message } from 'src/components';
import { updateMonitorCondition, getMonitorConditionDetail } from 'src/services/monitorCenter/index';
import { useFetch } from 'src/utils/hookUtils/fetchHooks';

import BaseForm, { formatFormValueForSubmit } from '../commonComponent/baseForm/Index.jsx';

const baseButtonStyle = {
  width: 120,
};

const EditModal = props => {
  const { style, onClose: close, onOk, id } = props;
  const formRef = React.createRef();

  const [{ data, isLoading }] = useFetch(getMonitorConditionDetail, { initialParams: id });
  const initialData = _.get(data, 'data.data');

  return (
    <Spin spinning={isLoading}>
      <div style={{ padding: 20, ...style }}>
        <BaseForm ref={formRef} initialData={initialData} />
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            type={'default'}
            style={baseButtonStyle}
            onClick={() => {
              if (typeof close === 'function') close();
            }}
          >
            取消
          </Button>
          <Button
            style={{ ...baseButtonStyle, marginLeft: 10 }}
            onClick={() => {
              const { validateFieldsAndScroll } = _.get(formRef, 'current') || {};
              validateFieldsAndScroll((err, value) => {
                if (err) return;
                updateMonitorCondition({ id, ...(formatFormValueForSubmit(value) || {}) }).then(() => {
                  message.success('编辑成功');
                  if (typeof onOk === 'function') onOk();
                });
              });
            }}
          >
            确认
          </Button>
        </div>
      </div>
    </Spin>
  );
};

EditModal.propTypes = {
  style: PropTypes.any,
  id: PropTypes.any,
  onClose: PropTypes.any,
  onOk: PropTypes.any,
};

export default EditModal;
