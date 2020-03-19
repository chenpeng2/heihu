import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { Row, Col, Table, Tooltip, Spin, Text } from 'components';
import { getQcConfigImportLogErrorList, getQcConfigImportLogDetail } from 'src/services/qcConfig';
import { formatUnix } from 'utils/time';
import { setLocation } from 'utils/url';
import { getQrCodeOrganizationConfig } from 'src/containers/storageAdjustRecord/list/table';
import log from 'utils/log';
import { arrayIsEmpty } from 'utils/array';
import { getQuery } from 'src/routes/getRouteParams';
import { replaceSign } from 'src/constants';
import { qcReportRecordCountSettable } from '../../constants';
import styles from './styles.scss';

type Props = {
  match: any,
};

const ImportDetail = (props: Props) => {
  const { match } = props;
  const useQrCode = getQrCodeOrganizationConfig();
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
    getQcConfigImportLogDetail({ importId })
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
    getQcConfigImportLogErrorList({ importId, ...params })
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

  const getQcConfigBaseColumns = () => {
    const columns = [
      {
        title: '失败原因',
        dataIndex: 'errorDetail',
        width: 300,
        render: errorDetail => {
          return errorDetail.map(({ v }) => <div style={{ width: 200 }}>{tableItem(v, 280)}</div>);
        },
      },
      {
        title: '编号',
        dataIndex: 'content.code',
        width: 100,
        render: content => tableItem(content, 100),
      },
      {
        title: '名称',
        dataIndex: 'content.name',
        width: 100,
        render: content => tableItem(content, 100),
      },
      {
        title: '状态',
        dataIndex: 'content.state',
        width: 100,
        render: content => tableItem(content, 100),
      },
      {
        title: '质检类型',
        dataIndex: 'content.checkType',
        width: 100,
        render: content => tableItem(content, 100),
      },
      {
        title: '质检方式',
        dataIndex: 'content.checkCountType',
        width: 100,
        render: content => tableItem(content, 100),
      },
      {
        title: '质检数量',
        dataIndex: 'content.checkCount',
        width: 100,
        render: content => tableItem(content, 100),
      },
      {
        title: '记录方式',
        dataIndex: 'content.recordType',
        width: 100,
        render: content => tableItem(content, 100),
      },
      qcReportRecordCountSettable && {
        title: '报告记录数量',
        dataIndex: 'content.checkEntityType',
        width: 100,
        render: content => tableItem(content, 100),
      },
      qcReportRecordCountSettable && {
        title: '单位数量',
        dataIndex: 'content.checkEntityUnitCount',
        width: 100,
        render: content => tableItem(content, 100),
      },
      qcReportRecordCountSettable && {
        title: '单位名称',
        dataIndex: 'content.checkEntityUnitUnit',
        width: 100,
        render: content => tableItem(content, 100),
      },
      useQrCode && {
        title: '报废性抽检',
        dataIndex: 'content.scrapInspection',
        width: 100,
        render: content => tableItem(content, 100),
      },
      {
        title: '自动生成质检任务',
        dataIndex: 'content.autoCreateQcTask',
        width: 150,
        render: content => tableItem(content, 150),
      },
      {
        title: '质检频次',
        dataIndex: 'content.taskCreateType',
        width: 100,
        render: content => tableItem(content, 100),
      },
      {
        title: '质检频次数字',
        dataIndex: 'content.taskCreateNumber',
        width: 100,
        render: content => tableItem(content, 100),
      },
      useQrCode && {
        title: '样本判定维度',
        dataIndex: 'content.recordSampleResultType',
        width: 100,
        render: content => tableItem(content, 100),
      },
      {
        title: '质检项填写',
        dataIndex: 'content.recordCheckItemType',
        width: 100,
        render: content => tableItem(content, 100),
      },
    ];
    return _.compact(columns);
  };

  const getQcConfigMaterialColumns = () => {
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
        title: '质检方案编号',
        dataIndex: 'content.qcConfigCode',
        width: 200,
        render: content => tableItem(content, 200),
      },
      {
        title: '物料编号',
        dataIndex: 'content.materialCode',
        width: 200,
        render: content => tableItem(content, 200),
      },
      {
        title: '物料单位',
        dataIndex: 'content.qcUnitName',
        width: 200,
        render: content => tableItem(content, 200),
      },
    ];
    return columns;
  };

  const getQcConfigCheckItemColumns = () => {
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
        title: '质检方案编号',
        dataIndex: 'content.qcConfigCode',
        width: 200,
        render: content => tableItem(content, 200),
      },
      {
        title: '质检项分类',
        dataIndex: 'content.checkItemGroupName',
        width: 200,
        render: content => tableItem(content, 200),
      },
      {
        title: '质检项名称',
        dataIndex: 'content.checkItemName',
        width: 200,
        render: content => tableItem(content, 200),
      },
      {
        title: '抽检类型',
        dataIndex: 'content.checkCountType',
        width: 200,
        render: content => tableItem(content, 200),
      },
      {
        title: '抽检数值',
        dataIndex: 'content.checkNums',
        width: 200,
        render: content => tableItem(content, 200),
      },
      {
        title: '校验水平',
        dataIndex: 'content.qcAqlInspectionCategory',
        width: 200,
        render: content => tableItem(content, 200),
      },
      {
        title: '接收质量限',
        dataIndex: 'content.qcAqlCategory',
        width: 200,
        render: content => tableItem(content, 200),
      },
      {
        title: '标准',
        dataIndex: 'content.logic',
        width: 200,
        render: content => tableItem(content, 200),
      },
      {
        title: '标准区间',
        dataIndex: 'content.qcLogicInterval',
        width: 200,
        render: content => tableItem(content, 200),
      },
      {
        title: '标准单位',
        dataIndex: 'content.unitName',
        width: 200,
        render: content => tableItem(content, 200),
      },
      {
        title: '不良原因',
        dataIndex: 'content.qcDefectReasonNames',
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
            {'导入文件'}
          </Col>
          <Col type={'content'} style={{ width: 920 }}>
            {data.importTypeDisplay}
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
                name: '质检方案',
                amountSuccess: data.successAmount,
                amountFailed: data.failureAmount,
              }}
            >
              {'导入完成，质检方案导入成功数：{amountSuccess}，导入失败数：{amountFailed}'}
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
  const { importType } = data;
  const columns =
    importType === 3
      ? getQcConfigBaseColumns()
      : importType === 4
      ? getQcConfigMaterialColumns()
      : getQcConfigCheckItemColumns();

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
          refetch={fetchLogErrorList}
          columns={columns}
          scroll={{ x: true }}
        />
      </div>
    </Spin>
  );
};

export default ImportDetail;
