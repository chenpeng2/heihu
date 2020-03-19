import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Button, ImportModal, Link, buttonAuthorityWrapper } from 'src/components';
import { importTooling } from 'src/services/equipmentMaintenance/base';
import auth from 'utils/auth';
import { getCreateToolingUrl, getToolingImportLogUrl } from './utils';

const ButtonWithAuth = buttonAuthorityWrapper(Button);

type Props = {
  history: any,
};

const ToolingOperation = (props: Props, context) => {
  const { history } = props;
  const dataFormat = (data, keys) => {
    const rs = [];
    keys.forEach((key, outIndex) => {
      data.forEach((node, index) => {
        if (index > 1) {
          rs[index - 1] = {
            ...rs[index - 1],
            [key]: node[outIndex],
          };
        }
      });
    });
    return _.compact(rs);
  };

  return (
    <div style={{ margin: '20px 0 0 20px' }}>
      <ButtonWithAuth
        auth={auth.WEB_ADD_TOOLING}
        icon="plus-circle-o"
        onClick={() => {
          history.push(getCreateToolingUrl());
        }}
      >
        创建模具
      </ButtonWithAuth>
      <ButtonWithAuth
        auth={auth.WEB_ADD_TOOLING}
        icon="download"
        ghost
        style={{ margin: '0 20px' }}
        onClick={() =>
          ImportModal({
            item: '模具',
            titles: [
              'defCode',
              'code',
              'name',
              'qrcode',
              'manufacturerName',
              'model',
              'serialNumber',
              'deliverDate',
              'admitDate',
              'firstEnableDate',
            ],
            templateUrl:
              'https://public-template.s3.cn-northwest-1.amazonaws.com.cn/20190702/%E6%A8%A1%E5%85%B7%E6%A8%A1%E6%9D%BF.xlsx',
            logUrl: getToolingImportLogUrl(),
            method: importTooling,
            fileTypes: '.xlsx',
            listName: 'items',
            context,
            dataFormat,
          })
        }
      >
        导入
      </ButtonWithAuth>
      <Link
        icon="eye-o"
        style={{ lineHeight: '30px', height: '28px' }}
        onClick={() => {
          history.push(getToolingImportLogUrl());
        }}
      >
        查看导入日志
      </Link>
    </div>
  );
};

ToolingOperation.contextTypes = {
  router: PropTypes.object.isRequired,
};

export default ToolingOperation;
