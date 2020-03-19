import React, { useState } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { Button, message } from 'src/components';
import { createMonitorCondition } from 'src/services/monitorCenter/index';

import BaseForm, { formatFormValueForSubmit } from '../commonComponent/baseForm/Index.jsx';

const baseButtonStyle = {
  width: 120,
};

const CreateModal = props => {
  const { style, onClose: close, onOk } = props;
  const formRef = React.createRef();

  return (
    <div style={{ padding: 20, ...style }}>
      <BaseForm ref={formRef} />
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
              createMonitorCondition(formatFormValueForSubmit(value)).then(() => {
                message.success('创建成功');
                if (typeof onOk === 'function') onOk();
              });
            });
          }}
        >
          确认
        </Button>
      </div>
    </div>
  );
};

CreateModal.propTypes = {
  style: PropTypes.any,
  onClose: PropTypes.any,
  onOk: PropTypes.any,
};

export default CreateModal;
