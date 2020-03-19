import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Tabs } from 'antd';
import { setLocation } from 'utils/url';
import { groupBy } from './config';
import ProductionCapacityTab from './productionCapacityTab';
import styles from '../styles.scss';

class ProductionCapacityRecords extends Component {
  state = {
    group: 'BURDEN',
  };

  render() {
    const { changeChineseToLocale } = this.context;
    return (
      <div>
        <Tabs
          animated={false}
          defaultActiveKey="BURDEN"
          onChange={tab => {
            setLocation(this.props, () => ({}));
            this.setState({ group: tab });
          }}
          className={styles.categoryTabs}
        >
          {groupBy.map(n => (
            <Tabs.TabPane tab={changeChineseToLocale(n.display)} key={n.key}>
              <ProductionCapacityTab config={n.showDataCategory} type={n.display} />
            </Tabs.TabPane>
          ))}
        </Tabs>
      </div>
    );
  }
}

ProductionCapacityRecords.contextTypes = {
  router: PropTypes.object,
  changeChineseToLocale: PropTypes.func,
};

export default ProductionCapacityRecords;
