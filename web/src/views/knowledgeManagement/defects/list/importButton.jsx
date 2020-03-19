/**
 * @description:  导入次品项
 *
 * @date: 2019/6/10 下午8:53
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { buttonAuthorityWrapper, Link, Button, OpenImportModal } from 'src/components/index';
import { importDefects } from 'src/services/knowledgeBase/defect';
import auth from 'src/utils/auth';

import { getImportLogUrlForDefects } from '../constants';

const ButtonWithAuth = buttonAuthorityWrapper(Button);

const ImportButton = (props, context) => {
  const { fetchData, style, ...rest } = props || {};

  return (
    <div style={{ display: 'inline-block', ...style }}>
      <ButtonWithAuth
        auth={auth.WEB_DEFECT_IMPORT}
        icon="download"
        ghost
        onClick={() => {
          OpenImportModal({
            item: '次品项',
            fileTypes: '.xlsx',
            titles: ['defectCode', 'defectName', 'defectGroupName', 'remark'],
            listName: 'defects',
            logUrl: getImportLogUrlForDefects(),
            templateUrl:
              'https://public-template.s3.cn-northwest-1.amazonaws.com.cn/20190610/%E6%AC%A1%E5%93%81%E9%A1%B9.xlsx',
            method: importDefects,
            context,
            onSuccess: () => {
              if (typeof fetchData === 'function') fetchData();
            },
          });
        }}
        {...rest}
      >
        导入
      </ButtonWithAuth>
      <Link
        icon="eye-o"
        style={{ marginLeft: 10, lineHeight: '30px', height: '28px' }}
        to={getImportLogUrlForDefects()}
      >
        查看导入日志
      </Link>
    </div>
  );
};

ImportButton.propTypes = {
  style: PropTypes.any,
  fetchData: PropTypes.any,
};

ImportButton.contextTypes = {
  router: PropTypes.any,
};

export default ImportButton;
