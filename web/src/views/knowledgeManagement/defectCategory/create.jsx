import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { message, Button } from 'src/components';
import { createDefectCategory } from 'src/services/knowledgeBase/defect';
import log from 'src/utils/log';

import BaseForm from './baseComponent/baseForm';

const Create = props => {
  const { onCancel, onClose, cbForSuccess } = props;

  const formRef = React.createRef();

  return (
    <div style={{ paddingBottom: 30 }}>
      <BaseForm ref={formRef} />
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Button
          type="default"
          onClick={() => {
            if (typeof onCancel === 'function') onCancel();
          }}
          style={{ width: 110 }}
        >
          取消
        </Button>
        <Button
          type={'primary'}
          style={{
            width: 110,
            marginLeft: 10,
          }}
          onClick={() => {
            const form = formRef.current;

            if (!form) return;

            form.validateFieldsAndScroll(async (err, value) => {
              if (err) return;

              createDefectCategory(value)
                .then(() => {
                  message.success('创建次品分类成功');
                  if (typeof cbForSuccess === 'function') cbForSuccess();
                  if (typeof onClose === 'function') onClose();
                })
                .catch(e => {
                  log.error(e);
                });
            });
          }}
        >
          确定
        </Button>
      </div>
    </div>
  );
};

Create.propTypes = {
  style: PropTypes.any,
  onClose: PropTypes.any,
  onCancel: PropTypes.any,
  cbForSuccess: PropTypes.any,
};

export default Create;
