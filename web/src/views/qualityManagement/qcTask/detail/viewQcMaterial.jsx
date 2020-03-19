import React from 'react';
import _ from 'lodash';
import { Table, Link, Row, Col, Icon } from 'src/components';
import { getQrCodeDetailUrl } from 'src/views/stock/qrCodeDetail/getQrCodeDetailUrl';
import { isOrganizationUseQrCode } from 'src/utils/organizationConfig';
import CustomFieldsTable from 'containers/material/detail/customFieldsTable';
import { replaceSign } from 'constants';
import { QC_MATERIAL_CATEGORY } from 'src/views/qualityManagement/constants';

type Props = {
  data: any,
  materialName: String,
  type: String,
};

export const getQcMaterialData = (data, type) => {
  const checkMaterials = data.checkMaterials || [];
  const sampleMaterials = data.sampleMaterials || [];
  return type === 'sample' ? sampleMaterials : checkMaterials.concat(sampleMaterials);
};

const ViewQcMaterial = (props: Props) => {
  const { data: taskData, type } = props;
  const { desc, materialCustomFields } = taskData.material || {};
  const data = getQcMaterialData(taskData, type);
  const useQrCode = isOrganizationUseQrCode();

  const getColumns = () => {
    return [
      {
        title: '',
        width: 40,
        dataIndex: 'category',
        render: category => (
          <div style={{ textAlign: 'right' }}>
            {QC_MATERIAL_CATEGORY.QC_SAMPLE.value === category ? (
              <Icon style={{ paddingRight: 0 }} iconType="gc" type="yangbenhui" />
            ) : null}
          </div>
        ),
      },
      {
        title: '物料编号|物料名称',
        width: 240,
        dataIndex: 'code',
        render: code => {
          return `${code || replaceSign} | ${props.materialName || replaceSign}`;
        },
      },
      {
        title: '当前数量',
        width: 140,
        dataIndex: 'count',
        render: (count, record) => {
          const { unit } = record;
          return typeof count !== 'number' && !record
            ? replaceSign
            : `${count || replaceSign} ${(unit && unit.name) || replaceSign}`;
        },
      },
      {
        title: '库存位置',
        width: 140,
        dataIndex: 'storage',
        render: storage => (storage ? storage.name : replaceSign),
      },
      useQrCode
        ? {
            title: '二维码',
            width: 140,
            dataIndex: 'qrCode',
            render: (qrCode, record) => {
              const { materialUnitId } = record;
              return qrCode ? (
                <Link onClick={() => window.open(getQrCodeDetailUrl(materialUnitId), '_blank')}>{qrCode}</Link>
              ) : (
                replaceSign
              );
            },
          }
        : null,
    ];
  };

  const columns = _.compact(getColumns());

  return (
    <div style={{ width: '100%', marginBottom: data.length > 10 ? 60 : 10 }}>
      <Row>
        <Col type="title">规格描述</Col>
        <Col type="content" style={{ width: '80%' }}>
          {desc || replaceSign}
        </Col>
      </Row>
      <Row>
        <Col type="title">自定义字段</Col>
        <Col type="content" style={{ width: 920 }}>
          <CustomFieldsTable data={materialCustomFields} />
        </Col>
      </Row>
      <Table pagination={data.length > 10} columns={columns} dataSource={data} total={data.length} />
    </div>
  );
};

export default ViewQcMaterial;
