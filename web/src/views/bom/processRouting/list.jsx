import React, { Component } from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { getTablePageSizeFromLocalStorage } from 'utils/localStorage';
import { Link, OpenImportModal, Spin, Button } from 'src/components';
import { setLocation } from 'src/utils/url';
import { getQuery, getLocation } from 'src/routes/getRouteParams';
import { border } from 'src/styles/color';
import { getProcessRoutes, importProcessRouting } from 'src/services/bom/processRouting';
import Table from 'src/containers/processRouting/list/table';
import Filter from 'src/containers/processRouting/list/filter';
import LinkToCreate from 'src/containers/processRouting/base/linkToCreate';
import { keysToObj } from 'src/utils/parseFile';
import { arrayIsEmpty } from 'src/utils/array';

import { getImportHistoryPageUrl } from './utils';

type Props = {
  viewer: any,
  relay: any,
  children: Element,
  match: {},
};

const tableUniqueKey = 'ProcessRoutingDefinationTableConfig';

class ProcessRoutingList extends Component {
  props: Props;
  state = {
    loading: false,
    data: [],
    total: 0,
  };

  componentDidMount() {
    this.fetchAndSetData();
  }

  handleLoading = loading => this.setState({ loading });

  fetchAndSetData = p => {
    const pageSize = getTablePageSizeFromLocalStorage(tableUniqueKey);
    const { match } = this.props;
    const query = getQuery(match);
    const params = { size: pageSize, ...query, ...p };

    this.setState({ loading: true });

    const location = getLocation(match) || {};
    location.query = { ...params };
    setLocation(this.props, () => location.query);
    getProcessRoutes(params)
      .then(res => {
        const data = _.get(res, 'data.data');
        const total = _.get(res, 'data.count');

        this.setState({
          data,
          total,
          pagination: { current: params && params.page, pageSize: params && params.size },
        });
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  renderFilter = () => {
    return <Filter fetchData={this.fetchAndSetData} />;
  };

  renderTable = () => {
    const { loading, data, total, pagination } = this.state;

    return (
      <Table
        tableUniqueKey={tableUniqueKey}
        fetchData={this.fetchAndSetData}
        pagination={pagination}
        loading={loading}
        dataSource={data}
        total={total}
        handleLoading={this.handleLoading}
      />
    );
  };

  renderButtons = () => {
    return (
      <div style={{ borderTop: `1px solid ${border}` }}>
        <LinkToCreate />
        <Button
          icon="download"
          ghost
          style={{ marginRight: 20 }}
          onClick={() => {
            OpenImportModal({
              item: '工艺路线',
              fileDataStartLocation: 1,
              fileTypes: ['.xlsx'],
              logUrl: getImportHistoryPageUrl(),
              dataFormat: data => {
                const titles = [
                  'processRoutingCode',
                  'processRoutingName',
                  'validFrom',
                  'validTo',
                  'processSeq',
                  'processCode',
                  'successionMode',
                  'preparationTime',
                  'workStations',
                  'productDesc',
                  'qcConfigCodes',
                ];
                const dataAfterFormat = keysToObj(data, titles);
                return arrayIsEmpty(dataAfterFormat)
                  ? []
                  : dataAfterFormat.map(i => {
                      const { workStations, qcConfigCodes, ...rest } = i || {};
                      return {
                        ...rest,
                        workStations: typeof workStations === 'string' ? workStations.trim().split(',') : null,
                        qcConfigCodes: typeof qcConfigCodes === 'string' ? qcConfigCodes.trim().split(',') : [],
                      };
                    });
              },
              splitKey: ['processRoutingCode', 'processRoutingName'],
              listName: 'processRoutings',
              templateUrl:
                'https://public-template.s3.cn-northwest-1.amazonaws.com.cn/20180620/%E5%B7%A5%E8%89%BA%E8%B7%AF%E7%BA%BF%E6%A8%A1%E6%9D%BF.xlsx',
              method: importProcessRouting,
              context: this.context,
              onSuccess: res => {
                if (sensors) {
                  sensors.track('web_bom_processRoute_create', {
                    CreateMode: 'Excel导入',
                    amount: res.success,
                  });
                }
                this.fetchAndSetData();
              },
            });
          }}
        >
          导入
        </Button>
        <Link icon="eye-o" style={{ lineHeight: '30px', height: '28px' }} to={getImportHistoryPageUrl()}>
          查看导入日志
        </Link>
      </div>
    );
  };

  render() {
    return (
      <div id="ebom_list">
        {this.renderFilter()}
        {this.renderButtons()}
        {this.renderTable()}
      </div>
    );
  }
}

ProcessRoutingList.contextTypes = {
  router: PropTypes.any,
};

export default withRouter(ProcessRoutingList);
