import React, { useState } from 'react';
import _ from 'lodash';
import { Popconfirm, buttonAuthorityWrapper, Link, message, Spin } from 'src/components';
import { STORAGE_STATUS, STORAGE_LEVEL } from 'src/containers/storage/storageConstants';
import auth from 'utils/auth';
import log from 'src/utils/log';
import { disabledStorage, enabledStorage, getStorageListByLevel } from 'src/services/knowledgeBase/storage';
import { disabledStoreHouse, enabledStoreHouse } from 'src/services/knowledgeBase/storeHouse';

const LinkWithAuth = buttonAuthorityWrapper(Link);

type Props = {
  record: any,
  query: any,
  updateStart: () => {},
  updateEnd: () => {},
  setStatus: () => {},
};

const UpdateStatusConfirmModal = (props: Props) => {
  // haveChildren为判断停用的实体下是否有子级，当操作为「启用时」，如果有子级，要确认是否启用所有子级
  const initialData = { data: '是否启用所有子仓位', statusCode: 200 };
  const [data, setData] = useState(initialData);
  const [visible, setVisible] = useState(false);
  const { query, record, updateStart, setStatus } = props;
  const { id, level } = record;
  const code = typeof record.code === 'string' ? record.code : (id && id.split(':')[0]) || '';
  const disabledFunc = !level || `${level}` === STORAGE_LEVEL.WAREHOUSE_LEVEL ? disabledStoreHouse : disabledStorage;
  const enabledFunc = !level || `${level}` === STORAGE_LEVEL.WAREHOUSE_LEVEL ? enabledStoreHouse : enabledStorage;

  // bool为当前实体有不符合直接停用条件时，是否继续停用的判断条件
  const handleDisabledStorage = bool => {
    updateStart();
    const params = { ignoreFeeding: bool, ignoreFinished: bool };
    disabledFunc(code, params)
      .then(res => {
        const data = _.get(res, 'data', {});
        const { statusCode } = data;
        if (statusCode === 200) {
          message.success('停用成功');
          record.status = 0;
          setStatus(record, 0);
          setVisible(false);
          setData(initialData);
        } else {
          setStatus(record, 1);
          setVisible(true);
          setData(data);
        }
      })
      .catch(e => {
        log.error(e);
        setVisible(false);
        setStatus(record, 1);
      });
  };
  // bool为启用当前实体时，是否启用所有子级的判断条件
  const handleEnabledStorage = bool => {
    updateStart();
    enabledFunc(code, { yes: bool })
      .then(() => {
        message.success('启用成功');
        record.status = 1;
        setStatus(record, 1, !bool);
        setVisible(false);
      })
      .catch(e => {
        log.error(e);
        setVisible(false);
        setStatus(record, 0);
      });
  };

  const handleClick = async () => {
    if (record.status === STORAGE_STATUS.DISABLE) {
      if (query.search) {
        if (
          `${record.level}` === STORAGE_LEVEL.SECOND_STORAGE_LEVEL ||
          record.status === STORAGE_STATUS.ENABLE ||
          !(record.children && record.children.length)
        ) {
          handleEnabledStorage(false);
        } else {
          setVisible(true);
        }
      } else {
        const { data } = await getStorageListByLevel({
          parentCode: record.code,
          level: `${record.level}` === STORAGE_LEVEL.WAREHOUSE_LEVEL ? 1 : 2,
        });
        const haveChildren = data.data && data.data.length;
        if (record.status === STORAGE_STATUS.ENABLE || !haveChildren) {
          handleEnabledStorage(false);
        } else {
          setVisible(true);
        }
      }
    } else {
      handleDisabledStorage(false);
    }
  };

  const formatConfirmText = text => {
    const reg = /{换行}/gim;
    const message = document.getElementsByClassName('ant-popover-message-title')[0];
    if (message && text.match(reg)) {
      message.innerHTML = text.replace(reg, '<br>');
      return null;
    }
    return text;
  };

  return (
    <Popconfirm
      title={formatConfirmText(data.data)}
      onConfirm={() => {
        if (record.status === STORAGE_STATUS.DISABLE) {
          handleEnabledStorage(true);
        } else {
          handleDisabledStorage(true);
        }
      }}
      onCancel={() => {
        if (record.status === STORAGE_STATUS.DISABLE) {
          handleEnabledStorage(false);
        } else {
          setVisible(false);
        }
      }}
      okText="是"
      cancelText="否"
      visible={visible}
      overlayStyle={{ width: 240 }}
    >
      <LinkWithAuth
        auth={auth.WEB_STORAGE_UPDATE}
        style={{ marginLeft: `${record.level}` !== STORAGE_LEVEL.SECOND_STORAGE_LEVEL ? 10 : 70 }}
        onClick={handleClick}
      >
        {record.status === STORAGE_STATUS.ENABLE ? '停用' : '启用'}
      </LinkWithAuth>
    </Popconfirm>
  );
};

export default UpdateStatusConfirmModal;
