import React, { Component } from 'react';
import _ from 'lodash';

import { openModal, RestPagingTable, Tooltip, Badge } from 'src/components';
import { replaceSign } from 'src/constants';
import { QUALITY_STATUS } from 'src/views/qualityManagement/constants';
import { primary } from 'src/styles/color';
import { getQrCodeOrganizationConfig } from 'src/containers/storageAdjustRecord/list/table';

import StorageAdjust from '../storageAdjust';

type Props = {
  total: number,
  data: [],
  fetchData: () => {},
};

class Table extends Component {
  props: Props;
  state = {};

  getColumns = () => {
    const useQrCode = getQrCodeOrganizationConfig();

    const baseData = [
      {
        title: '物料编号／名称',
        dataIndex: 'material',
        render: data => {
          const { code, name } = data || {};

          return (
            <div>
              <div>
                <Tooltip text={code || replaceSign} length={20} />
              </div>
              <div>
                <Tooltip text={name || replaceSign} length={20} />
              </div>
            </div>
          );
        },
      },
      {
        title: '规格描述',
        dataIndex: 'material',
        key: 'materialDesc',
        render: data => {
          const { desc } = data || {};
          return <Tooltip text={desc || replaceSign} length={20} />;
        },
      },
      {
        title: '仓位编码／名称',
        dataIndex: 'storage',
        render: data => {
          const { code, name } = data || {};

          return (
            <div>
              <div>
                <Tooltip text={code || replaceSign} length={20} />
              </div>
              <div>
                <Tooltip text={name || replaceSign} length={20} />
              </div>
            </div>
          );
        },
      },
      {
        title: '数量',
        dataIndex: 'amountTotal',
        render: (data, record) => {
          const unit = _.get(record, 'material.unitName');

          return (
            <Tooltip text={`${typeof data === 'number' ? data : replaceSign} ${unit || replaceSign}`} length={20} />
          );
        },
      },
      {
        title: '质量状态',
        dataIndex: 'qcStatus',
        render: data => {
          if (!data) {
            return replaceSign;
          }

          const { name, color } = QUALITY_STATUS[data] || {};

          return <Badge.MyBadge text={name || replaceSign} color={color} />;
        },
      },
      {
        title: '占用数量',
        key: 'useAmount',
        render: (data, record) => {
          const { amountControlled, amountRequested } = record || {};
          const unit = _.get(record, 'material.unitName');

          // 占用数量是两者之和
          const useAmount = amountControlled + amountRequested;

          return (
            <Tooltip
              text={`${typeof useAmount === 'number' ? useAmount : replaceSign} ${unit || replaceSign}`}
              length={20}
            />
          );
        },
      },
    ];

    if (useQrCode !== 'true') {
      baseData.push({
        title: '操作',
        key: 'operation',
        render: (__, record) => {
          return (
            <span
              style={{ color: primary, cursor: 'pointer' }}
              onClick={() => {
                openModal({
                  title: '库存调整',
                  footer: null,
                  children: <StorageAdjust cbForSuccess={this.props.fetchData} data={record} />,
                  width: 600,
                });
              }}
            >
              库存调整
            </span>
          );
        },
      });
    }

    return baseData;
  };

  render() {
    const { data, total, fetchData } = this.props;
    const columns = this.getColumns();

    return <RestPagingTable columns={columns} dataSource={data || []} total={total || 0} refetch={fetchData} />;
  }
}

export default Table;
