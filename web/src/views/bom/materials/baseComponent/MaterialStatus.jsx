import React, { useState } from 'react';
import { Link, message as Message, Spin } from 'components';
import auth from 'utils/auth';
import { error, primary } from 'styles/color';
import { updateMaterialStatus } from 'services/bom/material';
import log from 'utils/log';
import Popikonw from 'components/popconfirm/popiknow';

const MaterialStatus = props => {
  const { status, code, callback, style } = props;
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  return (
    <Popikonw
      onConfirm={() => {
        setVisible(false);
      }}
      visible={visible}
      title={message}
      overlayStyle={{ width: 253 }}
      trigger="click"
      onVisibleChange={visible => {
        if (!visible) {
          setVisible(false);
        }
      }}
    >
      <Link
        auth={auth.WEB_EDIT_MATERIAL_DEF}
        style={{ marginRight: 20, color: status === 1 ? error : primary, ...style }}
        onClick={() => {
          setLoading(true);
          updateMaterialStatus(code, { status: status === 1 ? 0 : 1 })
            .then(({ data: { data, code, message: updateMessage } }) => {
              if (code === 'MATERIAL_DISABLE_FAILED') {
                setVisible(true);
                setMessage(updateMessage);
                return;
              }
              const res = `${data.status === 1 ? '启用' : '停用'}成功`;
              Message.success(res);
              if (typeof callback === 'function') {
                callback();
              }
            })
            .catch(e => log.error(e))
            .finally(() => {
              setLoading(false);
            });
        }}
      >
        {status === 0 ? '启用' : '停用'}
      </Link>
    </Popikonw>
  );
};

export default MaterialStatus;
