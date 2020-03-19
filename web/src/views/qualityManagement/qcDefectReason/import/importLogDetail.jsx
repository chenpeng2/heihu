import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { Row, Col, Table, Tooltip, Spin, Text } from 'components';
import {
  getQcDefectReasonImportLogErrorList,
  getQcDefectReasonImportLogDetail,
} from 'src/services/knowledgeBase/qcModeling/qcDefectReason';
import { formatUnix } from 'utils/time';
import { setLocation } from 'utils/url';
import { injectIntl } from 'react-intl';
import { changeChineseToLocale } from 'utils/locale/utils';
import log from 'utils/log';
import { arrayIsEmpty } from 'utils/array';
import { getQuery } from 'src/routes/getRouteParams';
import { replaceSign } from 'src/constants';
import styles from './styles.scss';

type Props = {
  intl: any,
  match: any,
};

const ImportDetail = (props: Props) => {
  const { match, intl } = props;
  const importId = _.get(match, 'location.query.id', '');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [detailData, setDetailData] = useState({});

  const getFormatData = data => {
    const { createdAt, failureAmount, successAmount, ...rest } = data || {};
    return {
      createdAt: formatUnix(createdAt),
      failureAmount,
      successAmount,
      ...rest,
    };
  };

  const fetchLogDetail = () => {
    setLoading(true);
    getQcDefectReasonImportLogDetail({ importId })
      .then(res => {
        const data = _.get(res, 'data.data');
        const formatData = getFormatData(data);
        setData(formatData);
      })
      .catch(err => {
        log.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const fetchLogErrorList = params => {
    setLoading(true);
    setLocation(props, () => params);
    getQcDefectReasonImportLogErrorList({ importId, ...params })
      .then(res => {
        const detailData = _.get(res, 'data');
        setDetailData(detailData);
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
        dataIndex: 'errorDetail',
        width: 300,
        render: errorDetail => {
          return errorDetail.map(({ v }) => <div style={{ width: 200 }}>{tableItem(v, 300)}</div>);
        },
      },
      {
        title: '名称',
        dataIndex: 'content.name',
        width: 300,
        render: content => tableItem(content, 300),
      },
      {
        title: '备注',
        dataIndex: 'content.description',
        width: 300,
        render: content => tableItem(content, 300),
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
            {data.createdAt}
          </Col>
        </Row>
        <Row>
          <Col type={'title'} style={{ paddingLeft: 20 }}>
            {'导入用户'}
          </Col>
          <Col type={'content'} style={{ width: 920 }}>
            {data.operatorName}
          </Col>
        </Row>
        <Row>
          <Col type={'title'} style={{ paddingLeft: 20 }}>
            {'导入结果'}
          </Col>
          <Col type={'content'} style={{ width: 920 }}>
            {data.mystatusDisplay}
          </Col>
        </Row>
        <Row>
          <Col type={'title'} style={{ paddingLeft: 20 }}>
            {'导入详情'}
          </Col>
          <Col type={'content'} style={{ width: 920 }}>
            <Text
              templateParams={{
                name: changeChineseToLocale('不良原因', intl),
                amountSuccess: data.successAmount,
                amountFailed: data.failureAmount,
              }}
            >
              {'导入完成，{name}导入成功数：{amountSuccess}，导入失败数：{amountFailed}'}
            </Text>
          </Col>
        </Row>
      </div>
    );
  };

  useEffect(() => {
    const query = getQuery(match);
    fetchLogDetail();
    fetchLogErrorList(query);
  }, []);

  if (!data || !detailData) return null;
  const columns = getColumns();

  return (
    <Spin spinning={loading}>
      <div id="materialImport_detail">
        <p className={styles.detailLogHeader}>
          <Text>导入日志详情</Text>
        </p>
        {renderImportInfo()}
        <Table
          dataSource={!arrayIsEmpty(detailData.data) ? detailData.data : []}
          total={detailData && detailData.total}
          refetch={fetchLogDetail}
          columns={columns}
          scroll={{ x: true }}
        />
      </div>
    </Spin>
  );
};

export default injectIntl(ImportDetail);
