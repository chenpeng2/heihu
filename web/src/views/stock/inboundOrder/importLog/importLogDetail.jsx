import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { Row, Col, Table, Tooltip, Spin } from 'components';
import { getInboundOrderImportDetail } from 'src/services/stock/inboundOrder';
import { formatUnix } from 'utils/time';
import { setLocation } from 'utils/url';
import log from 'utils/log';
import { arrayIsEmpty } from 'utils/array';
import { getQuery } from 'src/routes/getRouteParams';
import { replaceSign, IMPORT_STATUS } from 'src/constants';
import styles from './styles.scss';

type Props = {
  match: any,
};

const ImportDetail = (props: Props) => {
  const { match } = props;
  const importId = _.get(match, 'location.query.id', '');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [detailData, setDetailData] = useState({});

  const getFormatData = data => {
    const { createAt, failureAmount, successAmount, ...rest } = data || {};
    const status =
      failureAmount === 0
        ? IMPORT_STATUS.IMPORT_SUCCESS
        : successAmount === 0
        ? IMPORT_STATUS.IMPORT_FAILED
        : IMPORT_STATUS.IMPORT_PART_SUCCESS;
    return {
      createAt: formatUnix(createAt),
      status: IMPORT_STATUS[status],
      failureAmount,
      successAmount,
      ...rest,
    };
  };

  const fetchLogDetail = params => {
    setLoading(true);
    setLocation(props, () => params);
    getInboundOrderImportDetail({ importId, page: 1, size: 10, ...params })
      .then(res => {
        const data = _.get(res, 'data.data');
        const total = _.get(res, 'data.total');
        const { fails, log } = data;
        const formatData = getFormatData(log);
        setData(formatData);
        setDetailData({ data: fails, total });
      })
      .catch(err => {
        log.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const tableItem = (content, width) => <Tooltip text={content || replaceSign} width={width || 150} />;

  const getColumns = () => {
    const columns = [
      {
        title: '失败原因',
        dataIndex: 'reason',
        width: 200,
        render: content => {
          const reasons = content.slice(0, -1).split('\n');
          return reasons.map(reason => <div style={{ width: 200 }}>{tableItem(reason, 200)}</div>);
        },
      },
      {
        title: '编号',
        dataIndex: 'inboundOrderCode',
        width: 150,
        render: content => tableItem(content),
      },
      {
        title: '行序列',
        dataIndex: 'lineNo',
        width: 150,
        render: content => tableItem(content),
      },
      {
        title: '物料编码',
        dataIndex: 'materialCode',
        width: 150,
        render: content => tableItem(content),
      },
      {
        title: '数量',
        dataIndex: 'amountPlanned',
        width: 150,
        render: content => tableItem(content),
      },
      {
        title: '单位',
        dataIndex: 'useUnit',
        width: 200,
        render: content => tableItem(content),
      },
      {
        title: '入库位置编号',
        dataIndex: 'storageCode',
        width: 150,
        render: content => tableItem(content),
      },
      {
        title: '供应商编码',
        dataIndex: 'supplierCode',
        width: 150,
        render: content => tableItem(content),
      },
      {
        title: '供应商批次',
        dataIndex: 'supplierBatch',
        width: 150,
        render: content => tableItem(content),
      },
      {
        title: '产地',
        dataIndex: 'originPlaceTxt',
        width: 150,
        render: content => tableItem(content),
      },
      {
        title: '入厂批次',
        dataIndex: 'inboundBatch',
        width: 150,
        render: content => tableItem(content),
      },
      {
        title: '生产日期',
        dataIndex: 'productionDate',
        width: 150,
        render: content => tableItem(content),
      },
      {
        title: '有效期',
        dataIndex: 'validPeriod',
        width: 150,
        render: content => tableItem(content),
      },
      {
        title: '备注',
        dataIndex: 'remark',
        width: 150,
        render: content => tableItem(content),
      },
    ];
    return columns;
  };

  const renderImportInfo = () => {
    return (
      <div style={{ marginBottom: 30 }}>
        <Row>
          <Col type={'title'} style={{ paddingLeft: 20 }}>
            {'导入时间'}
          </Col>
          <Col type={'content'} style={{ width: 920 }}>
            {data.createAt}
          </Col>
        </Row>
        <Row>
          <Col type={'title'} style={{ paddingLeft: 20 }}>
            {'导入用户'}
          </Col>
          <Col type={'content'} style={{ width: 920 }}>
            {data.userName}
          </Col>
        </Row>
        <Row>
          <Col type={'title'} style={{ paddingLeft: 20 }}>
            {'导入结果'}
          </Col>
          <Col type={'content'} style={{ width: 920 }}>
            {data.status}
          </Col>
        </Row>
        <Row>
          <Col type={'title'} style={{ paddingLeft: 20 }}>
            {'导入详情'}
          </Col>
          <Col type={'content'} style={{ width: 920 }}>{`导入完成，入库单导入成功数：${
            data.successAmount
          }，入库单导入失败数：${data.failureAmount}`}</Col>
        </Row>
      </div>
    );
  };

  useEffect(() => {
    const query = getQuery(match);
    fetchLogDetail(query);
  }, []);

  if (!data || !detailData) return null;
  const columns = getColumns();
  const query = getQuery(match);

  return (
    <Spin spinning={loading}>
      <div id="materialImport_detail">
        <p className={styles.detailLogHeader}>导入日志详情</p>
        {renderImportInfo()}
        <Table
          dataSource={!arrayIsEmpty(detailData.data) ? detailData.data : []}
          total={detailData && detailData.total}
          refetch={fetchLogDetail}
          columns={columns}
          scroll={{ x: true }}
          pagination={{ current: (query && query.page) || 1, pageSize: (query && query.size) || 10 }}
        />
      </div>
    </Spin>
  );
};

export default ImportDetail;
