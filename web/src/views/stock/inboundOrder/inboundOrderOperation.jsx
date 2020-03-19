import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { ImportModal, Link, Button } from 'src/components';
import { importInboundOrder } from 'src/services/stock/inboundOrder';
import { replaceSign } from 'src/constants';
import { getInboundOrderImportLogUrl } from './utils';
import LinkToCreate from './actionButton/linkToCreate';

type Props = {
  history: any,
};

const InboundOrderOperation = (props: Props, context) => {
  const { history } = props;
  const dataFormat = (data, fields) => {
    // 根据入库单号聚合数组
    const formatData = _.groupBy(data.slice(2), n => n[0] || replaceSign);
    const inboundData = Object.keys(formatData).map(key => {
      const materialList = [];
      fields.forEach((field, outIndex) => {
        formatData[key].forEach((node, index) => {
          const materialItem = node.slice(1);
          materialList[index] = {
            ...materialList[index],
            [field]: materialItem[outIndex],
          };
        });
      });
      return {
        inboundOrderCode: key.split('\n')[0] === replaceSign ? '' : key.split('\n')[0],
        materialList,
        // 入库单备注由物料列表第一项定
        remark: (materialList[0] && materialList[0].remark) || '',
      };
    });
    return _.compact(inboundData);
  };

  return (
    <div style={{ margin: '20px 0 0 20px' }}>
      <LinkToCreate />
      <Button
        icon="download"
        ghost
        style={{ margin: '0 20px' }}
        onClick={() =>
          ImportModal({
            item: '入库单',
            titles: [
              'lineNo',
              'materialCode',
              'amountPlanned',
              'unitName',
              'storageCode',
              'supplierCode',
              'batchNo',
              'originPlaceTxt',
              'inboundBatch',
              'productionDate',
              'validPeriod',
              'remark',
            ],
            templateUrl:
              'https://public-template.s3.cn-northwest-1.amazonaws.com.cn/20190610/%E5%85%A5%E5%BA%93%E5%8D%95%E5%AF%BC%E5%85%A5%E6%A8%A1%E7%89%88.xlsx',
            logUrl: getInboundOrderImportLogUrl(),
            method: importInboundOrder,
            fileTypes: '.xlsx',
            listName: 'orders',
            // splitKey: 'inboundOrderCode',
            context,
            dataFormat,
          })
        }
      >
        导入
      </Button>
      <Link
        icon="eye-o"
        style={{ lineHeight: '30px', height: '28px' }}
        onClick={() => {
          history.push(getInboundOrderImportLogUrl());
        }}
      >
        查看导入日志
      </Link>
    </div>
  );
};

InboundOrderOperation.contextTypes = {
  router: PropTypes.object.isRequired,
};

export default InboundOrderOperation;
