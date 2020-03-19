import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { DetailPageItemContainer, Table, Link, Tooltip, openModal } from 'components';
import { replaceSign } from 'src/constants';
import styles from './styles.scss';

type Props = {
  data: {},
};

class QcReportResult extends Component {
  props: Props;

  getColumns = () => {
    const columns = [
      {
        title: '编号',
        dataIndex: 'qcMaterial.seq',
        key: 'seq',
        width: 80,
      },
      {
        title: '二维码',
        dataIndex: 'qcMaterial.materialUnitId',
        key: 'materialUnitId',
        width: 160,
        render: (materialUnitId, record) => (
          <Link
            onClick={() => {
              this.context.router.history.push(`/stock/material-trace/${materialUnitId}/qrCodeDetail`);
            }}
          >
            {record.qcMaterial.qrCode}
          </Link>
        ),
      },
      {
        title: '当前数量',
        dataIndex: 'qcMaterial.count',
        key: 'count',
        render: (count, record) => {
          const { unitName } = record;
          return `${count}${unitName && unitName !== 'null' ? unitName : replaceSign}`;
        },
      },
      {
        title: '合计抽样',
        dataIndex: 'qualifiedCount',
        key: 'total',
        render: (qualifiedCount, record) => {
          const { defectCount, qualifiedConcessionCount, unitName } = record;
          return `${qualifiedCount + defectCount + qualifiedConcessionCount}${
            unitName && unitName !== 'null' ? unitName : replaceSign
          }`;
        },
      },
      {
        title: '合格 / 率',
        dataIndex: 'qualifiedCount',
        key: 'qualifiedPercent',
        render: (qualifiedCount, record) => {
          const { defectCount, qualifiedConcessionCount } = record;
          const totalCount = qualifiedCount + defectCount + qualifiedConcessionCount;
          return `${qualifiedCount}/${((qualifiedCount / totalCount) * 100).toFixed(1)}%`;
        },
      },
      {
        title: '让步合格 / 率',
        dataIndex: 'qualifiedCount',
        key: 'qualifiedConcessionPercent',
        render: (qualifiedCount, record) => {
          const { defectCount, qualifiedConcessionCount } = record;
          const totalCount = qualifiedCount + defectCount + qualifiedConcessionCount;
          return `${qualifiedConcessionCount}/${((qualifiedConcessionCount / totalCount) * 100).toFixed(1)}%`;
        },
      },
      {
        title: '不合格 / 率',
        dataIndex: 'qualifiedCount',
        key: 'defectPercent',
        render: (qualifiedCount, record) => {
          const { defectCount, qualifiedConcessionCount } = record;
          const totalCount = qualifiedCount + defectCount + qualifiedConcessionCount;
          return `${defectCount}/${((defectCount / totalCount) * 100).toFixed(1)}%`;
        },
      },
    ];
    return columns;
  };

  render() {
    const { data } = this.props;
    const { qcMaterialReports } = data || {};
    const columns = this.getColumns();

    return (
      <DetailPageItemContainer
        contentStyle={{
          width: '100%',
          padding: `10px 0 ${qcMaterialReports && qcMaterialReports.length > 10 ? '60px' : '10px'} 0`,
        }}
        itemHeaderTitle="样本质检结果"
      >
        <div style={{ width: '100%' }}>
          <Table
            bordered
            dataSource={qcMaterialReports || []}
            total={qcMaterialReports && qcMaterialReports.length}
            columns={columns}
            refetch={() => {}}
            pagination={qcMaterialReports && qcMaterialReports.length > 10}
          />
        </div>
      </DetailPageItemContainer>
    );
  }
}

QcReportResult.contextTypes = {
  router: PropTypes.object.isRequired,
};

export default withRouter(QcReportResult);
