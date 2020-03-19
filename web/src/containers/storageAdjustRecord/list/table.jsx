import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';

import moment from 'src/utils/time';
import { primary } from 'src/styles/color';
import { Table as BasicTable, Link, openModal, Attachment, Tooltip } from 'src/components';
import { queryESignatureStatus, E_SIGN_SERVICE_TYPE } from 'src/services/knowledgeBase/eSignature';
import { getOrganizationConfigFromLocalStorage, ORGANIZATION_CONFIG } from 'src/utils/organizationConfig';
import { replaceSign } from 'src/constants';
import { getStorageAdjustDetailPageUrl } from '../util';

const AttachmentImageView = Attachment.ImageView;
export const getQrCodeOrganizationConfig = () => {
  const config = getOrganizationConfigFromLocalStorage();

  return _.get(config, `[${ORGANIZATION_CONFIG.useQrcode}].configValue`);
};

type Props = {
  style: {},
  data: [],
  fetchData: () => {},
  total: number,
  rowSelection: any,
};

class Table extends Component {
  props: Props;
  state = {
    useESign: false, // 是否开启电子签名功能
  };

  async componentWillMount() {
    const res = await queryESignatureStatus(E_SIGN_SERVICE_TYPE.MATERIAL_LOT_ADJUST);
    const useESign = _.get(res, 'data.data');

    this.setState({ useESign });
  }

  getColumns = () => {
    const qrCodeConfig = getQrCodeOrganizationConfig();
    const { changeChineseToLocale } = this.context;
    const { useESign } = this.state;

    const columns = [
      {
        title: '记录编号',
        width: 150,
        dataIndex: 'recordCode',
        render: data => {
          return data || replaceSign;
        },
      },
      {
        title: '事务编号/名称',
        width: 150,
        key: 'transactionKeyAndName',
        render: (__, record) => {
          const { transactionName, transactionCode } = record || {};

          return (
            <div>
              <div>
                <Tooltip text={transactionCode || replaceSign} length={10} />
              </div>
              <div>
                <Tooltip text={transactionName || replaceSign} length={10} />
              </div>
            </div>
          );
        },
      },
      {
        title: '功能模块',
        width: 180,
        dataIndex: 'module',
        render: data => {
          return data || replaceSign;
        },
      },
      {
        title: '是否过账',
        width: 100,
        key: 'posting',
        render: () => {
          return changeChineseToLocale('已过账');
        },
      },
      {
        title: '物料编号/名称',
        width: 200,
        key: 'materialInfo',
        render: (__, record) => {
          const { materialCode, materialName } = record || {};

          return (
            <div>
              <div>
                <Tooltip text={materialCode || replaceSign} length={20} />
              </div>
              <div>
                <Tooltip text={materialName || replaceSign} length={20} />
              </div>
            </div>
          );
        },
      },
      {
        title: '操作位置',
        width: 200,
        key: 'storageInfo',
        render: (__, record) => {
          const { storageCode, storageName } = record || {};

          return (
            <div>
              <div>
                <Tooltip text={storageCode || replaceSign} length={20} />
              </div>
              <div>
                <Tooltip text={storageName || replaceSign} length={20} />
              </div>
            </div>
          );
        },
      },
      {
        title: '操作时间',
        width: 200,
        key: 'operationTime',
        dataIndex: 'createdAt',
        render: data => {
          return data ? moment(data).format('YYYY/MM/DD HH:mm') : replaceSign;
        },
      },
      {
        title: '操作人',
        width: 100,
        dataIndex: 'operatorName',
        render: data => {
          return data || replaceSign;
        },
      },
      useESign && {
        title: '电子签名人',
        dataIndex: 'digitalSignatureUserName',
        width: 100,
        key: 'digitalSignatureUserName',
        render: digitalSignatureUserName => digitalSignatureUserName || replaceSign,
      },
      {
        title: '操作',
        key: 'operation',
        width: 150,
        render: (__, record) => {
          const { recordCode } = record || {};
          return <Link to={getStorageAdjustDetailPageUrl(encodeURIComponent(recordCode))}>查看</Link>;
        },
      },
    ];

    if (qrCodeConfig === 'true') {
      const qrCodeColumns = {
        title: '二维码',
        width: 100,
        dataIndex: 'qrcode',
        render: data => {
          return data || replaceSign;
        },
      };
      const fatherQrCodeColumns = {
        title: '父级二维码',
        width: 150,
        dataIndex: 'containerCode',
        render: data => {
          return data || replaceSign;
        },
      };
      const attachmentColumn = {
        title: '附件',
        key: 'attachment',
        width: 100,
        render: (__, record) => {
          const { qrcode, attachments: fileIds, materialCode, materialName } = record || {};

          if (Array.isArray(fileIds) && fileIds.length) {
            const _title =
              qrCodeConfig === 'true'
                ? `${qrcode || replaceSign}-${materialCode}/${materialName}`
                : `${materialCode}/${materialName}`;
            const _files = Array.isArray(fileIds)
              ? fileIds.map(i => {
                  return { id: i };
                })
              : [];

            return (
              <div>
                <Link
                  icon="paper-clip"
                  onClick={() => {
                    openModal({
                      title: _title,
                      footer: null,
                      children: <AttachmentImageView attachment={{ files: _files }} />,
                    });
                  }}
                />
                <span style={{ color: primary }}>{Array.isArray(fileIds) ? fileIds.length : 0}</span>
              </div>
            );
          }

          return replaceSign;
        },
      };

      columns.splice(4, 0, qrCodeColumns);
      columns.splice(6, 0, fatherQrCodeColumns);
      columns.splice(-1, 0, attachmentColumn);
    }
    return columns;
  };

  render() {
    const { data, fetchData, total, rowSelection } = this.props;
    const columns = this.getColumns();

    return (
      <BasicTable
        dragable
        dataSource={data || []}
        total={total}
        columns={_.compact(columns)}
        refetch={fetchData}
        rowSelection={rowSelection}
      />
    );
  }
}

Table.contextTypes = {
  changeChineseToLocale: PropTypes.any,
};

export default Table;
