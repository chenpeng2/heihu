import React, { Component } from 'react';
import { Spin } from 'components';
import { queryProductionCapacity } from 'src/services/datagram/productionCapacityRecords';
import ProductionCapacityFilter from './productionCapacityFilter';
import ProductionCapacityList from './productionCapacityList';
import styles from '../styles.scss';

type Props = {
  config: [],
  type: string,
  router: {},
};

class ProductionCapacityTab extends Component {
  props: Props;
  state = {
    loading: false,
    data: null,
  };

  fetechData = (params) => {
    this.setState({ loading: true });
    queryProductionCapacity(params)
      .then(res => {
        this.setState({ data: res.data });
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  }

  render() {
    const { config, type, router } = this.props;
    const { data, loading } = this.state;

    return (
      <div>
        <ProductionCapacityFilter
          router={router}
          type={type}
          fetechData={this.fetechData}
          showDataCategory={config}
        />
        <Spin spinning={loading}>
          <ProductionCapacityList
            loading={loading}
            data={data}
            showDataCategory={config}
            fetechData={this.fetechData}
            type={type}
          />
        </Spin>
      </div>
    );
  }
}

export default ProductionCapacityTab;
