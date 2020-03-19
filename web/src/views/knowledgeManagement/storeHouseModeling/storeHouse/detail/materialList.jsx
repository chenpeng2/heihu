import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Table, Tooltip, Tabs } from 'src/components';
import { replaceSign } from 'src/constants';
import { arrayIsEmpty } from 'src/utils/array';

import { findStorageCapacity, getTitleByType, STORAGE_CAPACITY } from 'src/containers/storeHouse/storageCapacity/utils';

// 后端数据的前缀
const getPrefixByType = (type, dataType) => {
  // 后端在安全库容的通知用户上不按照规矩取名字
  if (type === STORAGE_CAPACITY.safe.value && dataType === 'users') return 'info';

  if (type === STORAGE_CAPACITY.max.value) return 'max';
  if (type === STORAGE_CAPACITY.min.value) return 'min';
  if (type === STORAGE_CAPACITY.safe.value) return 'secure';
};

const TabPane = Tabs.TabPane;

class MaterialList extends Component {
  state = {};

  getColumns = type => {
    return [
      {
        title: '物料编号/名称',
        key: 'material',
        render: (__, record) => {
          const { materialCode, materialName } = record || {};
          const text = `${materialCode || replaceSign}/${materialName || replaceSign}`;
          return <Tooltip text={text} length={20} />;
        },
      },
      {
        title: getTitleByType(type),
        dataIndex: `${getPrefixByType(type)}Amount`,
        render: (data, record) => {
          const { unit } = record;
          const text = typeof data === 'number' && unit ? `${data} ${unit}` : replaceSign;
          return <Tooltip text={text} length={12} />;
        },
      },
      {
        title: '单位',
        dataIndex: 'unit',
        render: text => <Tooltip text={text} length={20} />,
      },
      {
        title: '通知用户',
        dataIndex: `${getPrefixByType(type, 'users')}Users`,
        render: data => {
          const { names } = data || {};
          return arrayIsEmpty(names) ? replaceSign : names.join(',');
        },
      },
    ];
  };

  render() {
    const { tableData, types } = this.props;

    return (
      <div>
        {arrayIsEmpty(types) ? null : (
          <Tabs style={{ width: 800 }} type="card">
            {types.map(i => {
              const { name, value } = findStorageCapacity(i) || {};
              return (
                <TabPane tab={name} key={value}>
                  <Table
                    style={{ margin: 0, width: 800 }}
                    columns={this.getColumns(value)}
                    dataSource={tableData || []}
                    pagination={false}
                  />
                </TabPane>
              );
            })}
          </Tabs>
        )}
      </div>
    );
  }
}

MaterialList.propTypes = {
  style: PropTypes.object,
  tableData: PropTypes.any,
  types: PropTypes.any,
};

export default MaterialList;
