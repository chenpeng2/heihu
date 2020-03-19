import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { Row, Col, Table, Tooltip, Spin } from 'components';
import { getToolingImportLogDetail, getToolingImportLogErrorList } from 'src/services/equipmentMaintenance/base';
import { formatUnix } from 'utils/time';
import { setLocation } from 'utils/url';
import log from 'utils/log';
import { injectIntl } from 'react-intl';
import { changeChineseToLocale } from 'utils/locale/utils';
import { getCustomLanguage } from 'src/utils/customLanguage';
import { arrayIsEmpty } from 'utils/array';
import { getQuery } from 'src/routes/getRouteParams';
import { replaceSign, IMPORT_STATUS } from 'src/constants';
import styles from './styles.scss';

type Props = {
  match: any,
  intl: any,
};

const customLanguage = getCustomLanguage();

const DeviceImportDetail = (props: Props) => {
  const { match, intl } = props;
  const importId = _.get(match, 'location.query.id', '');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [detailData, setDetailData] = useState({});

  const getFormatData = data => {
    const { createdAt, status, ...rest } = data || {};
    return {
      createdAt: formatUnix(data.createdAt),
      status: IMPORT_STATUS[status],
      ...rest,
    };
  };

  const fetchLogDetail = () => {
    setLoading(true);
    getToolingImportLogDetail(importId)
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
    getToolingImportLogErrorList(importId, params)
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
        dataIndex: 'reason',
        width: 200,
        render: content => {
          const reasons = content.split('\n');
          return reasons.map(reason => <div style={{ width: 200 }}>{tableItem(reason, 200)}</div>);
        },
      },
      {
        title: customLanguage.equipment_machining_material,
        dataIndex: 'defCode',
        width: 150,
        render: content => tableItem(content),
      },
      {
        title: '编号',
        dataIndex: 'code',
        width: 150,
        render: content => tableItem(content),
      },
      {
        title: '名称',
        dataIndex: 'name',
        width: 150,
        render: content => tableItem(content),
      },
      {
        title: '电子标签',
        dataIndex: 'qrcode',
        width: 150,
        render: content => tableItem(content),
      },
      {
        title: '制造商',
        dataIndex: 'manufacturer',
        width: 200,
        render: content => {
          const { name } = content || {};
          return tableItem(name, 200);
        },
      },
      {
        title: '型号',
        dataIndex: 'model',
        width: 150,
        render: content => tableItem(content),
      },
      {
        title: '序列号',
        dataIndex: 'serialNumber',
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
            {data.createdAt}
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
          <Col type={'content'} style={{ width: 920 }}>{`导入完成，模具导入成功数：${
            data.successAmount
          }，模具导入失败数：${data.failureAmount}`}</Col>
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
  const query = getQuery(match);

  return (
    <Spin spinning={loading}>
      <div id="materialImport_detail">
        <p className={styles.detailLogHeader}>{changeChineseToLocale('导入日志详情', intl)}</p>
        {renderImportInfo()}
        <Table
          dataSource={!arrayIsEmpty(detailData.data) ? detailData.data : []}
          total={detailData && detailData.total}
          refetch={fetchLogErrorList}
          columns={columns}
          scroll={{ x: 1500 }}
          pagination={{ current: (query && query.page) || 1, pageSize: (query && query.size) || 10 }}
        />
      </div>
    </Spin>
  );
};

export default injectIntl(DeviceImportDetail);
