import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import { Button, OpenImportModal, Link } from 'components';
import { importWeighingDefinition } from 'services/weighing/weighingDefinition';
import { toWeighingDefintionLog } from '../../navigation';

type Props = {
  history: any,
};

class WeighingDefinitionAction extends Component {
  props: Props;
  state = {};

  render() {
    return (
      <div style={{ marginBottom: 20, padding: '0 20px' }}>
        <Button
          icon="plus-circle-o"
          style={{ marginRight: '20px' }}
          onClick={() => this.props.history.push('/weighingManagement/weighingDefinition/create')}
        >
          创建称量定义
        </Button>
        <Button
          ghost
          icon="download"
          style={{ marginRight: '20px' }}
          onClick={() => {
            OpenImportModal({
              item: '称量定义',
              fileTypes: ['.xlsx'],
              context: { router: { history: _.get(this.props, 'history') } },
              method: importWeighingDefinition,
              listName: 'list',
              logUrl: '/weighingManagement/weighingDefinition/importLogs',
              titles: [
                'productCode',
                'workstationCodes',
                'ebomVersion',
                'preciseType',
                'materialCode',
                'weighingType',
                'weighingMode',
                'perSegmentWeight',
                'unitName',
                'reservedBits',
                'period',
                'alterPeriod',
                'periodUnit',
                'segmentUpperLimit',
                'segmentLowerLimit',
                'instructionUpperLimit',
                'instructionLowerLimit',
                'instructionLimitType',
                'fifo',
              ],
              fileDataStartLocation: 1,
              splitData: data => {
                // 此处要求最多支持导入500行数据，故不做数据切割
                return [data];
              },
              templateUrl:
                'https://public-template.s3.cn-northwest-1.amazonaws.com.cn/v20190911/%E7%A7%B0%E9%87%8F%E5%AE%9A%E4%B9%89%E5%AF%BC%E5%85%A5%E6%A8%A1%E6%9D%BF_V3.9.11.xlsx',
              onSuccess: () => {
                if (sensors) {
                  sensors.track('web_weighingManagement_weighingDefinition_create', {
                    CreateMode: 'Excel导入',
                  });
                }
              },
            });
          }}
        >
          导入称量定义
        </Button>
        <Link icon="eye-o" to={toWeighingDefintionLog()}>
          查看导入日志
        </Link>
      </div>
    );
  }
}

WeighingDefinitionAction.contextTypes = {
  router: PropTypes.object,
};

export default withRouter(WeighingDefinitionAction);
