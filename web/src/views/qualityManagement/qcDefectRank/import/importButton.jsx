import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { ImportModal, Link, Button } from 'src/components';
import { importQcDefectRank } from 'src/services/knowledgeBase/qcModeling/qcDefectRank';
import { getQcDefectRankImportLogUrl } from '../utils';

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
            item: '不良等级',
            titles: ['code', 'name', 'remark'],
            templateUrl:
              'https://public-template.s3.cn-northwest-1.amazonaws.com.cn/20190614/%E4%B8%8D%E8%89%AF%E7%AD%89%E7%BA%A7.xlsx',
            logUrl: getQcDefectRankImportLogUrl(),
            method: importQcDefectRank,
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
          history.push(getQcDefectRankImportLogUrl());
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
