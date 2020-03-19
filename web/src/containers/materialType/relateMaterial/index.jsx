// 物料类型关联物料

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { message, Button, Spin } from 'src/components';
import { queryMaterialList } from 'src/services/bom/material';
import { relateMaterials } from 'src/services/bom/materialType';
import log from 'src/utils/log';

import Filter from './filter';
import Table from './table';

class RelateMaterial extends Component {
  state = {
    loading: false,
    data: [],
    count: 0,
    selectedData: [],
    params: { page: 1 },
  };

  async componentDidMount() {
    await this.fetchData();
  }

  fetchData = async params => {
    this.setState({ loading: true });
    const { params: lastParams } = this.state;
    const nextParams = { ...lastParams, size: 10, ...params, status: 1 };

    this.setState({ params: nextParams }, async () => {
      const res = await queryMaterialList(nextParams);
      const { data, count } = _.get(res, 'data');
      this.setState({ loading: false, data, total: count });
    });
  };

  renderFilter = () => {
    return <Filter fetchData={this.fetchData} />;
  };

  renderTable = () => {
    const { params, total, data } = this.state;
    const { materialTypeId } = this.props;

    return (
      <Table
        cbForSelect={data => {
          this.setState({ selectedData: data });
        }}
        data={data}
        refetch={this.fetchData}
        pagination={{
          total,
          pageSize: params ? params.size : 10,
          current: params ? params.page : 1,
        }}
        materialTypeId={materialTypeId}
      />
    );
  };

  renderButtons = () => {
    const { onClose, materialTypeId } = this.props;
    const baseStyle = { width: 120 };

    return (
      <div style={{ display: 'flex', justifyContent: 'center', margin: '60px 0px 0px' }}>
        <Button
          style={{ ...baseStyle }}
          type={'default'}
          onClick={() => {
            if (typeof onClose === 'function') {
              onClose();
            }
          }}
        >
          取消
        </Button>
        <Button
          type={'primary'}
          style={{ ...baseStyle, marginLeft: 10 }}
          onClick={async () => {
            const { selectedData } = this.state;
            if (Array.isArray(selectedData) && selectedData.length) {
              const params = selectedData.map(i => {
                const { code } = i || {};
                return {
                  materialCode: code,
                  materialTypeId,
                };
              });

              try {
                await relateMaterials(params);
                message.success('关联物料成功');
                if (typeof onClose === 'function') {
                  onClose();
                }
              } catch (e) {
                log.error(e);
              }
            } else {
              message.warn('请选择物料');
            }
          }}
        >
          确定
        </Button>
      </div>
    );
  };

  render() {
    const { style } = this.props;
    const { loading } = this.state;

    const baseStyle = { margin: 20 };

    return (
      <Spin spinning={loading}>
        <div style={{ ...style, ...baseStyle }}>
          {this.renderFilter()}
          {this.renderTable()}
          {this.renderButtons()}
        </div>
      </Spin>
    );
  }
}

RelateMaterial.propTypes = {
  style: PropTypes.object,
  onClose: PropTypes.any,
  materialTypeId: PropTypes.number,
};

RelateMaterial.contextTypes = {
  router: PropTypes.any,
};

export default RelateMaterial;
