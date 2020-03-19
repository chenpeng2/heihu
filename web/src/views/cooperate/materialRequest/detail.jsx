import React, { Component } from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';

import { getOrganizationConfigFromLocalStorage, ORGANIZATION_CONFIG } from 'src/utils/organizationConfig';
import { Spin } from 'src/components';
import { replaceSign } from 'src/constants';
import { black, middleGrey } from 'src/styles/color';
import { getMaterialRequestDetail } from 'src/services/cooperate/materialRequest';
import moment from 'src/utils/time';
import { findStatus } from 'src/containers/materialRequest/utils';
import MaterialListTable from 'src/containers/materialRequest/detail/materialListTable';
import ChangeStatus from 'src/containers/materialRequest/base/changeStatus';
import LinkToEditPage from 'src/containers/materialRequest/base/linkToEditPage';

type Props = {
  match: {},
};

class Detail extends Component {
  props: Props;
  state = {
    code: null,
    loading: false,
    detailData: null,
  };

  componentDidMount() {
    const code = _.get(this.props, 'match.params.id');

    this.setState({ code }, () => {
      this.fetchDetailDataAndSetState();
    });
  }

  fetchDetailDataAndSetState = () => {
    const { code } = this.state;
    if (!code) return null;

    this.setState({ loading: true });

    getMaterialRequestDetail(code)
      .then(res => {
        const data = _.get(res, 'data.data');
        this.setState({
          detailData: data,
        });
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  // 获取物料请求类型工厂配置
  getMaterialRequestTypeConfig = () => {
    const config = getOrganizationConfigFromLocalStorage();

    return config && config[ORGANIZATION_CONFIG.materialRequestType]
      ? config[ORGANIZATION_CONFIG.materialRequestType].configValue
      : null;
  };

  renderItem = (label, component) => {
    const labelStyle = { color: middleGrey, width: 100, display: 'inline-block', textAlign: 'right' };
    const componentStyle = {
      display: 'inline-block',
      marginLeft: 10,
      verticalAlign: 'top',
      maxWidth: 1000,
      overflowWrap: 'break-word',
    };
    const containerStyle = { margin: '20px 0 20px 20px' };

    return (
      <div style={containerStyle}>
        <div style={labelStyle}>{label}</div>
        <div style={componentStyle}>{component || replaceSign}</div>
      </div>
    );
  };

  renderOperation = () => {
    const { code, detailData } = this.state;
    const requestStatus = _.get(detailData, 'request.requestStatus');

    return (
      <div>
        {requestStatus === 0 ? (
          <ChangeStatus
            style={{ margin: '0px 20px', verticalAlign: 'middle' }}
            isGcIcon
            iconType={'xiafa'}
            code={code}
            type={'dispatch'}
            fetchData={this.fetchDetailDataAndSetState}
          />
        ) : null}
        {requestStatus === 0 ? (
          <LinkToEditPage style={{ margin: '0px 20px', verticalAlign: 'middle' }} iconType={'edit'} code={code} />
        ) : null}
        {requestStatus === 0 ? (
          <ChangeStatus
            style={{ margin: '0px 20px', verticalAlign: 'middle' }}
            iconType={'close-circle-o'}
            code={code}
            type={'cancel'}
            fetchData={this.fetchDetailDataAndSetState}
          />
        ) : null}
      </div>
    );
  };

  render() {
    const { loading, detailData } = this.state;

    const { requestCode, requestStatus, requireTime, createAt, sourceStorage, transitStorage, remark } = detailData
      ? detailData.request
      : {};
    const status = findStatus(requestStatus);

    const materialRequestType = this.getMaterialRequestTypeConfig();

    return (
      <Spin spinning={loading}>
        <div style={{ margin: '20px 0 30px 20px' }}>
          <div
            style={{
              color: black,
              fontSize: 16,
              display: 'inline-block',
            }}
          >
            物料请求详情
          </div>
          <div style={{ float: 'right', marginRight: 20 }}>{this.renderOperation()}</div>
        </div>
        {this.renderItem('编号', requestCode)}
        {this.renderItem(
          '状态',
          <div>
            <span>{status ? status.name : replaceSign}</span>
          </div>,
        )}
        {this.renderItem('创建时间', createAt ? moment(createAt).format('YYYY/MM/DD') : replaceSign)}
        {this.renderItem('请求仓位', sourceStorage ? sourceStorage.name : replaceSign)}
        {materialRequestType && materialRequestType !== '2'
          ? null
          : this.renderItem('中转位置', transitStorage ? transitStorage.name : replaceSign)}
        {this.renderItem('需求时间', requireTime ? moment(requireTime).format('YYYY/MM/DD') : replaceSign)}
        {this.renderItem('物料列表', <MaterialListTable data={detailData ? detailData.requestCompactItems : null} />)}
        {this.renderItem('备注', remark || replaceSign)}
      </Spin>
    );
  }
}

export default withRouter(Detail);
