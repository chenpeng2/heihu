import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Tooltip, Table, Radio, FormattedMessage } from 'src/components';
import { Big, getFractionString } from 'src/utils/number';
import { replaceSign } from 'src/constants';
import { getOrganizationConfigFromLocalStorage, ORGANIZATION_CONFIG } from 'src/utils/organizationConfig';
import { changeChineseToLocaleWithoutIntl } from 'utils/locale/utils';
import TreeTable from './treeTable';

const IS_TREE = 'tree';
const NOT_TREE = 'noTree';

class MaterialListTable extends Component {
  state = {
    isTree: NOT_TREE,
    OrganizationWeighingConfig: false, // 是否启用称量配置
  };

  componentDidMount() {
    this.setState({
      OrganizationWeighingConfig: this.getOrganizationWeighConfig(),
    });
  }

  getOrganizationWeighConfig = () => {
    const organizationConfig = getOrganizationConfigFromLocalStorage();
    return organizationConfig[ORGANIZATION_CONFIG.weighing]
      ? organizationConfig[ORGANIZATION_CONFIG.weighing].configValue === 'true'
      : false;
  };

  getColumns = () => {
    const { OrganizationWeighingConfig } = this.state;

    return [
      {
        title: '序号',
        key: 'sequence',
        render: (__, ___, index) => {
          return <span>{index + 1}</span>;
        },
      },
      {
        title: '物料编号/名称',
        dataIndex: 'name',
        key: 'name',
        render: (name, { code }) => `${code}/${name}`,
      },
      {
        title: '单位',
        dataIndex: 'currentUnit.name',
        key: 'unit',
        maxWidth: { C: 4 },
        render: (currentUnitName, record) => currentUnitName || record.unitName,
      },
      {
        title: '数量',
        key: 'amount',
        maxWidth: { C: 4 },
        render: (__, record) => {
          const { amount, amountFraction } = record;
          if (amountFraction && amountFraction.denominator && amountFraction.numerator) {
            return getFractionString(amountFraction);
          }

          return amount;
        },
      },
      {
        title: '耗损率(%)',
        dataIndex: 'lossRate',
        key: 'lossRate',
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
        width: 100,
        key: 'regulatoryControl',
        render: value => <FormattedMessage defaultMessage={value ? '是' : '否'} />,
      },
      OrganizationWeighingConfig
        ? {
            title: '需要称量',
            dataIndex: 'weight',
            width: 100,
            render: value => <FormattedMessage defaultMessage={value ? '是' : '否'} />,
          }
        : null,
    ]
      .filter(i => i)
      .map(node => ({ width: 120, ...node }));
  };

  render() {
    const { isTree, OrganizationWeighingConfig } = this.state;
    const { data, ebomId } = this.props;
    const columns = this.getColumns();

    return (
      <div style={{ marginRight: 20, marginLeft: 120 }}>
        <Radio.Group
          onChange={e => {
            this.setState({ isTree: e.target.value });
          }}
          style={{ marginBottom: 20 }}
          defaultValue={isTree}
        >
          <Radio.Button style={{ width: 100, textAlign: 'center' }} value={NOT_TREE}>
            {changeChineseToLocaleWithoutIntl('单层')}
          </Radio.Button>
          <Radio.Button style={{ width: 100, textAlign: 'center' }} value={IS_TREE}>
            {changeChineseToLocaleWithoutIntl('多层')}
          </Radio.Button>
        </Radio.Group>
        {isTree === IS_TREE ? (
          <TreeTable ebomId={ebomId} OrganizationWeighingConfig={OrganizationWeighingConfig} />
        ) : (
          <Table
            pagination={false}
            columns={columns}
            dataSource={data}
            style={{ margin: 0 }}
            dragable
            scroll={{ x: true }}
          />
        )}
      </div>
    );
  }
}

MaterialListTable.propTypes = {
  style: PropTypes.object,
  data: PropTypes.any,
  ebomId: PropTypes.any,
};

export default MaterialListTable;
