import React, { Component } from 'react';
import _ from 'lodash';

import { RestPagingTable, Tooltip } from 'src/components';
import { getMbomByMaterialCodeAndVersion } from 'src/services/bom/mbom';
import { getProcessRoutingByCode } from 'src/services/bom/processRouting';
import { replaceSign } from 'src/constants';

type Props = {
  style: {},
  mBomInfo: {},
  processRoutingInfo: {},
};

class CraftTable extends Component {
  props: Props;
  state = {
    processes: [],
  };

  componentDidMount() {
    this.getInitialValue(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.getInitialValue(nextProps);
  }

  getInitialValue = props => {
    const craftType = this.getCraftType(props);

    if (craftType === 'mBom') {
      const { mBomInfo } = this.props;
      getMbomByMaterialCodeAndVersion({ version: mBomInfo.mBomVersion, code: mBomInfo.productCode }).then(res => {
        const processList = _.get(res, 'data.data.processList');
        let processes = [];
        if (Array.isArray(processList)) {
          processList.map(i => {
            processes = processes.concat(i.nodes);
            return null;
          });
        }

        this.setState({
          processes,
        });
      });
    }

    if (craftType === 'processRouting') {
      const { processRoutingInfo } = this.props;
      getProcessRoutingByCode(processRoutingInfo).then(res => {
        const processList = _.get(res, 'data.data.processList');
        let processes = [];
        if (Array.isArray(processList)) {
          processList.map(i => {
            processes = processes.concat(i.nodes);
            return null;
          });
        }

        this.setState({
          processes,
        });
      });
    }
  };

  getCraftType = props => {
    const { mBomInfo, processRoutingInfo } = props || this.props;

    if (mBomInfo && mBomInfo.mBomVersion && mBomInfo.productCode) {
      return 'mBom';
    }

    if (processRoutingInfo && processRoutingInfo.code) {
      return 'processRouting';
    }

    return null;
  };

  getColumns = () => {
    return [
      {
        title: '序号',
        dataIndex: 'nodeCode',
      },
      {
        title: '工序名称',
        key: 'processName',
        render: (__, record) => {
          const processName = _.get(record, 'process.name');

          return <Tooltip text={processName || replaceSign} length={20} />;
        },
      },
      {
        title: '投入物料',
        key: 'inputMaterials',
        render: (__, record) => {
          const inputMaterials = _.get(record, 'inputMaterials');

          return (
            <React.Fragment>
              {Array.isArray(inputMaterials)
                ? inputMaterials.map(i => {
                    return <div>{`${_.get(i, 'material.code')}/${_.get(i, 'material.name')}`}</div>;
                  })
                : replaceSign}
            </React.Fragment>
          );
        },
      },
      {
        title: '投入数量',
        key: 'inputMaterialAmount',
        render: (__, record) => {
          const inputMaterials = _.get(record, 'inputMaterials');

          return (
            <React.Fragment>
              {Array.isArray(inputMaterials)
                ? inputMaterials.map(i => {
                    return <div>{`${_.get(i, 'amount')}/${_.get(i, 'material.unitName')}`}</div>;
                  })
                : replaceSign}
            </React.Fragment>
          );
        },
      },
      {
        title: '产出物料',
        dataIndex: 'outputMaterial',
        render: data => {
          const text = data
            ? `${_.get(data, 'material.code') || replaceSign}/${_.get(data, 'material.name') || replaceSign}`
            : replaceSign;
          return <Tooltip text={text} length={20} />;
        },
      },
      {
        title: '产出数量',
        key: 'outputMaterialAmount',
        render: (__, record) => {
          const amount = _.get(record, 'outputMaterial.amount');
          const unitName = _.get(record, 'outputMaterial.material.unitName');

          return <Tooltip text={amount && unitName ? `${amount} ${unitName}` : replaceSign} length={20} />;
        },
      },
    ];
  };

  render() {
    const columns = this.getColumns();
    const { processes } = this.state;

    return (
      <RestPagingTable
        scroll={{ x: 1600 }}
        pagination={false}
        columns={columns}
        dataSource={processes}
        style={{ width: 620, margin: 0, marginBottom: 20 }}
      />
    );
  }
}

export default CraftTable;
