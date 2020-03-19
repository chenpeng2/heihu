import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { ImportModal, Link, Button } from 'src/components';
import { importQcDefectReason } from 'src/services/knowledgeBase/qcModeling/qcDefectReason';
import { getQcDefectReasonImportLogUrl } from '../utils';

type Props = {
  history: any,
};

const QcDefectReasonImportButton = (props: Props, context) => {
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
    <div>
      <Button
        icon="download"
        ghost
        style={{ margin: '0 20px' }}
        onClick={() =>
          ImportModal({
            item: '不良原因字典',
            titles: ['name', 'description'],
            templateUrl:
              'https://public-template.s3.cn-northwest-1.amazonaws.com.cn/20190614/%E4%B8%8D%E8%89%AF%E5%8E%9F%E5%9B%A0%E5%AD%97%E5%85%B8.xlsx',
            logUrl: getQcDefectReasonImportLogUrl(),
            method: importQcDefectReason,
            dataFormat,
            fileTypes: '.xlsx',
            listName: 'items',
            context,
          })
        }
      >
        导入
      </Button>
      <Link
        icon="eye-o"
        style={{ lineHeight: '30px', height: '28px' }}
        onClick={() => {
          history.push(getQcDefectReasonImportLogUrl());
        }}
      >
        查看导入日志
      </Link>
    </div>
  );
};

QcDefectReasonImportButton.contextTypes = {
  router: PropTypes.object.isRequired,
};

export default QcDefectReasonImportButton;
