import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { RestPagingTable, Button, openModal } from 'src/components';
import { getMetricList } from 'src/services/equipmentMaintenance/device';
import AddMetricModal from './addMetricModal';
import styles from './styles.scss';

class MetricList extends Component {
  state = {
    data: [],
    total: 0,
  };

  componentDidMount() {
    this.fetchData();
  }

  fetchData = parmas => {
    getMetricList(parmas)
      .then(res => {
        const { data, total } = res.data;
        this.setState({ data, total });
      });
  }

  getColumns = () => {
    return [
      {
        title: '读数名称',
        dataIndex: 'metricName',
      },
      {
        title: '单位',
        dataIndex: 'metricUnitName',
      },
    ];
  };

  render() {
    const { data, total } = this.state;
    const columns = this.getColumns();

    return (
      <div id={'metric'} className={styles.metric}>
        <div style={{ display: 'flex', margin: '20px 20px', justifyContent: 'space-between' }}>
          <Button
            icon="plus-circle-o"
            onClick={() => {
              openModal({
                title: '创建读数',
                width: 500,
                children: <AddMetricModal fetchData={this.fetchData} />,
                footer: null,
                getContainer: () => document.getElementById('metric'),
              }, this.context);
            }}
          >
            创建读数
          </Button>
          </div>
        <RestPagingTable
          columns={columns}
          dataSource={Array.isArray(data) ? data : []}
          total={total}
          refetch={this.fetchData}
        />
      </div>
    );
  }
}

MetricList.contextTypes = {
  router: PropTypes.object,
};

export default MetricList;
