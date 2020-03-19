// 物料类型
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { Button, Spin, Link } from 'src/components';
import Filter from 'src/containers/materialType/list/filter';
import Table from 'src/containers/materialType/list/table';
import { border } from 'src/styles/color';
import { queryMaterialList } from 'src/services/bom/materialType';
import { getSearchInLocation, setSearchAndFilterParamsInUrl } from 'src/routes/getRouteParams';
import log from 'src/utils/log';
import { getTablePageSizeFromLocalStorage } from 'utils/localStorage';

const tableUniqueKey = 'MaterialTypeTableConfig';
class MaterialType extends Component {
  state = {
    data: [],
    total: 0,
    loading: false,
  };

  componentDidMount() {
    this.fetchData();
  }

  fetchData = async (params, originalParams) => {
    // 将参数设置到url中
    const { query } = getSearchInLocation();
    const pageSize = getTablePageSizeFromLocalStorage(tableUniqueKey);
    const _params = { size: pageSize, ...query, ...params }; // url中需要有输入框参数和查询参数

    this.setState({ loading: true });
    try {
      const res = await queryMaterialList(_params);
      setSearchAndFilterParamsInUrl(_params, originalParams);
      const { data, count } = _.get(res, 'data');
      this.setState({
        data,
        total: count,
        pagination: {
          current: _params && _params.page,
          pageSize: (_params && _params.size) || pageSize,
          total: count,
        },
      });
    } catch (e) {
      log.error(e);
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    const { data, total, pagination } = this.state;
    const { router } = this.context;
    return (
      <Spin spinning={this.state.loading}>
        <Filter fetchData={this.fetchData} />
        <div style={{ borderTop: `1px solid ${border}`, marginBottom: 20 }} />
        <div style={{ margin: '0px 20px' }}>
          <Button style={{ marginBottom: 20 }}>
            <Link icon="plus-circle-o" to="/bom/materialTypes/create">
              创建物料类型
            </Link>
          </Button>
          <Table
            tableUniqueKey={tableUniqueKey}
            data={data}
            fetchData={this.fetchData}
            pagination={pagination}
            total={total}
          />
        </div>
      </Spin>
    );
  }
}

MaterialType.propTypes = {
  style: PropTypes.object,
};

export default MaterialType;
