import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { Spin, Icon } from 'src/components/index';
import Table from 'src/containers/materilCustomProperty/detail/table';
import { black, primary } from 'src/styles/color/index';
import { queryMaterialCustomField } from 'src/services/bom/material';

class Detail extends Component {
  state = {
    loading: false,
  };

  componentDidMount() {
    this.fetchAndSetData();
  }

  fetchAndSetData = async () => {
    this.setState({ loading: true });

    try {
      const res = await queryMaterialCustomField();
      const data = _.get(res, 'data.data');
      this.setState({ data });
    } catch (e) {
      console.log(e);
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    const { router } = this.context;
    const { data, loading } = this.state;

    return (
      <Spin spinning={loading}>
        <div style={{ display: 'flex', justifyContent: 'space-between', margin: 20 }}>
          <div style={{ color: black, fontSize: 16 }}>物料自定义字段</div>
          <div
            style={{ color: primary, cursor: 'pointer' }}
            onClick={() => {
              router.history.push('/customProperty/material/materialCustomPropertyEdit');
            }}
          >
            <Icon type={'edit'} />
            <span style={{ margin: 5 }}>编辑</span>
          </div>
        </div>
        <Table data={data} />
      </Spin>
    );
  }
}

Detail.propTypes = {
  style: PropTypes.object,
};

Detail.contextTypes = {
  router: PropTypes.any,
};

export default withRouter(Detail);
