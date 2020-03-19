import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Table, Tooltip, Link, openModal, Attachment } from 'src/components';
import { ORGANIZATION_CONFIG, getOrganizationConfigFromLocalStorage } from 'utils/organizationConfig';
import { replaceSign } from 'src/constants';
import { arrayIsEmpty } from 'src/utils/array';
import { primary } from 'src/styles/color';
import { AQL_CHECK, CHECKITEM_CHECK } from 'src/views/qualityManagement/constants';
import { getQcAqlValue } from './utils';
import { DefectDetailByOnlyRecordDefect } from './defectDetail';
import { getNormalStandard } from './index';

type Props = {
  data: any,
  taskData: any,
  checkCountType: Number,
};

const AttachmentImageView = Attachment.ImageView;

const OnlyRecordDefect = (props: Props, context) => {
  const { data, taskData, checkCountType } = props;
  const { changeChineseTemplateToLocale } = context;
  const configs = getOrganizationConfigFromLocalStorage();
  const haveComment = _.get(configs, `${ORGANIZATION_CONFIG.configQcCheckItemComment}.configValue`) === 'true';
  const aqlRecord = [
    {
      title: '检验水平',
      dataIndex: 'qcCheckItemConfig.qcAqlInspectionLevelName',
      width: 120,
      key: 'qcAqlInspectionLevelName',
      render: data => data || replaceSign,
    },
    {
      title: '样本数量',
      dataIndex: 'checkCount',
      width: 120,
      key: 'checkCount',
      render: (data, record) => {
        const { qcCheckItemConfig } = record;
        if (!qcCheckItemConfig.qcAqlInspectionLevelName) return replaceSign;
        return data;
      },
    },
    {
      title: '接收质量限',
      dataIndex: 'qcCheckItemConfig',
      width: 120,
      key: 'qcAqlValue',
      render: (data, record) => {
        const { qcCheckItemConfig } = record;
        if (!qcCheckItemConfig.qcAqlInspectionLevelName) return replaceSign;
        return getQcAqlValue(data, taskData);
      },
    },
  ];

  const normalStandardColumn = [
    {
      title: '合格标准',
      dataIndex: 'qcCheckItemConfig',
      width: 150,
      key: 'logic',
      render: record => getNormalStandard(record, false, false, changeChineseTemplateToLocale),
    },
  ];

  const getColumns = () => {
    return [
      {
        title: '编号',
        dataIndex: 'qcCheckItemConfig.seq',
        width: 80,
        key: 'seq',
      },
      {
        title: '质检项',
        dataIndex: 'qcCheckItemConfig.checkItem.name',
        width: 150,
        key: 'checkItemName',
        render: checkItemName => <Tooltip text={checkItemName || replaceSign} width={130} />,
      },
      {
        title: '次品数',
        dataIndex: 'defect',
        width: 100,
        key: 'defect',
      },
      {
        title: '次品明细',
        dataIndex: 'qcReportDefectValues',
        width: 200,
        key: 'qcReportDefectValues',
        render: (data, record) => <DefectDetailByOnlyRecordDefect data={record} />,
      },
      {
        title: '图片',
        dataIndex: 'attachmentIds',
        width: 150,
        key: 'attachmentIds',
        render: data => {
          if (arrayIsEmpty(data)) return replaceSign;
          const attachment = {
            files: data.map(id => ({ id })),
          };

          return (
            <div style={{ color: primary, cursor: 'pointer' }}>
              <Link
                icon="paper-clip"
                onClick={() => {
                  openModal({
                    title: '附件',
                    width: 830,
                    footer: null,
                    children: <AttachmentImageView attachment={attachment} />,
                  });
                }}
              />
              <span> {!arrayIsEmpty(data) ? data.length : 0} </span>
            </div>
          );
        },
      },
      haveComment
        ? {
            title: '备注',
            dataIndex: 'remark',
            width: 150,
            key: 'remark',
            render: remark => <Tooltip text={remark || replaceSign} width={120} />,
          }
        : null,
    ];
  };

  const columns = _.compact(getColumns());
  const checkItemCheckHaveAql = data.filter(n => n.qcCheckItemConfig.checkCountType === AQL_CHECK).length > 0;
  const standard =
    checkCountType === AQL_CHECK || checkItemCheckHaveAql
      ? aqlRecord.concat(normalStandardColumn)
      : normalStandardColumn;
  columns.splice(2, 0, ...standard);

  return (
    <div style={{ width: '100%' }}>
      <Table
        bordered
        dataSource={data || []}
        total={data && data.length}
        columns={columns}
        refetch={() => {}}
        pagination={data && data.length > 10}
        scroll={{ x: true }}
      />
    </div>
  );
};

OnlyRecordDefect.contextTypes = {
  changeChineseTemplateToLocale: PropTypes.any,
};

export default OnlyRecordDefect;
