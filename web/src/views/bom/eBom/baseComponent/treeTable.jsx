import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { Tooltip, Table, Link, Icon, FormattedMessage, Popover } from 'components';
import { Big, getFractionString } from 'src/utils/number';
import { replaceSign } from 'src/constants';
import { getEbomDetailForTree } from 'src/services/bom/ebom';
import { arrayIsEmpty } from 'utils/array';

class TreeTable extends Component {
  state = {
    treeData: [],
    loading: false,
    isInitial: true,
    expandedKeys: [],
    dataSource: [],
  };

  componentDidMount() {
    this.setInitialData(this.props.ebomId);
  }

  /**
   * @description: 进入页面的时候需要两次数据。第二层不打开
   *
   * @date: 2019/3/14 上午11:31
   */
  setInitialData = async (ebomId, cb) => {
    const data = await this.getEbomDetailData(ebomId);

    const { rawMaterialList, id } = data || {};

    this.setState({
      dataSource: rawMaterialList.map(node => ({
        ...node,
        parentIds: [id],
        children: node.childEBom ? [] : null,
        ebomId: id,
        level: 1,
        ebom: data,
      })),
    });
  };

  /**
   * @description: 获取ebom的详情信息
   *
   * @date: 2019/3/14 上午11:31
   */
  getEbomDetailData = async (ebomId, unitId, amount) => {
    if (!ebomId) return;
    this.setState({ loading: true });

    const res = await getEbomDetailForTree(ebomId, { unitId, amount });
    this.setState({ loading: false });
    return _.get(res, 'data.data');
  };

  getColumns = () => {
    const { OrganizationWeighingConfig } = this.props;

    return [
      {
        title: 'BOM层级',
        dataIndex: 'level',
        width: 100,
        render: level => {
          return <span>{level || replaceSign}</span>;
        },
      },
      {
        title: '物料编号/名称',
        dataIndex: 'material',
        width: 200,
        render: data => {
          const { name, code } = data || {};
          return name && code ? `${code}/${name}` : replaceSign;
        },
      },
      {
        title: '单位',
        dataIndex: 'currentUnit.name',
        width: 100,
        render: (data, record) => {
          const unitName = _.get(record, 'unit.name');
          const currentUnitName = _.get(record, 'currentUnit.name');
          const text = currentUnitName || unitName || replaceSign;
          return <Tooltip text={text} length={10} />;
        },
      },
      {
        title: '数量',
        key: 'amount',
        width: 100,
        render: (__, record) => {
          const { amount, amountFraction } = record || {};
          if (amountFraction && amountFraction.denominator && amountFraction.numerator) {
            return getFractionString(amountFraction);
          }

          return amount;
        },
      },
      {
        title: '耗损率(%)',
        dataIndex: 'lossRate',
        width: 100,
        render: value => {
          if (typeof value === 'number') {
            const x = new Big(value);
            return x.times(100).valueOf();
          }

          return replaceSign;
        },
      },
      {
        title: '投料管控',
        dataIndex: 'regulatoryControl',
        width: 80,
        render: value => (value ? '是' : '否'),
      },
      OrganizationWeighingConfig
        ? {
            title: '需要称量',
            dataIndex: 'weight',
            width: 80,
            render: value => (value ? '是' : '否'),
          }
        : null,
      {
        title: '版本号',
        dataIndex: 'ebom.version',
        width: 80,
      },
      {
        title: '工艺路线',
        dataIndex: 'ebom.processRoutingCode',
        width: 120,
        render: (processRoutingCode, { ebom: { processRoutingName } }) =>
          processRoutingCode ? `${processRoutingCode}/${processRoutingName}` : replaceSign,
      },
    ].filter(i => i);
  };

  handleExpand = async (expanded, record) => {
    const { childEBom, children, parentIds, level, amount, unit, currentUnit } = record;
    if (!Array.isArray(children) || !arrayIsEmpty(children)) {
      return;
    }
    const data = await this.getEbomDetailData(childEBom.id, currentUnit.id || unit.id, amount);
    const { rawMaterialList } = data || {};
    const _children = rawMaterialList
      .map(node => ({
        ...node,
        parentIds: [...parentIds, childEBom.id],
        children: node.childEBom ? [] : null,
        ebomId: childEBom.id,
        level: level + 1,
        ebom: data,
      }))
      .filter(({ parentIds, childEBom }) => {
        if (!childEBom) {
          return true;
        }
        return !parentIds.includes(childEBom.id);
      });
    record.children = arrayIsEmpty(_children) ? null : _children;
    this.forceUpdate();
  };

  handleAutoExpand = dataSource => {
    const { expandedKeys } = this.state;
    dataSource.forEach(node => {
      const rowKey = this.renderRowKey(node);
      if (!expandedKeys.includes(rowKey)) {
        // hack
        expandedKeys.push(rowKey);
        this.setState({ expandedKeys });
        this.handleExpand(true, node);
      } else if (node.children) {
        this.handleAutoExpand(node.children);
      }
    });
  };

  renderRowKey = ({ ebomId, material }) => `${ebomId}-${material && material.code}`;

  render() {
    const columns = this.getColumns();
    const { loading, expandedKeys, dataSource } = this.state;
    console.log('dataSource', dataSource);
    return (
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', top: -44, left: 210 }}>
          <Link onClick={() => this.handleAutoExpand(dataSource)}>
            <FormattedMessage defaultMessage={'展开下一层'} />
            <Popover
              title="按多层展开"
              content={'当某种物料存在存在多个启用中的物料清单版本时，默认展示创建时间最大的版本。'}
            >
              <Icon type="info-circle-o" style={{ marginLeft: 4 }} />
            </Popover>
          </Link>
        </div>
        <Table
          dragable
          onExpand={async (expanded, record) => {
            this.handleExpand(expanded, record);
          }}
          onExpandedRowsChange={expandedRows => this.setState({ expandedKeys: expandedRows })}
          pagination={false}
          columns={columns}
          dataSource={dataSource}
          expandedRowKeys={expandedKeys}
          style={{ margin: 0, width: '100%' }}
          rowKey={this.renderRowKey}
          loading={loading}
        />
      </div>
    );
  }
}

TreeTable.propTypes = {
  style: PropTypes.object,
  OrganizationWeighingConfig: PropTypes.bool,
  ebomId: PropTypes.string,
};

export default TreeTable;
