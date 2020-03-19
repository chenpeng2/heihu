import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { primary, black, middleGrey } from 'src/styles/color';
import { Spin, Row, Col, Icon, openModal } from 'src/components';
import LinkToMaterialTypeEdit from 'src/containers/materialType/baseComponent/linkToMaterialTypeEdit';
import RelateMaterial from 'src/containers/materialType/relateMaterial';
import UpdateStatus from 'src/containers/materialType/baseComponent/updateMaterialTypeStatus';
import { getMaterialTypeDetail } from 'src/services/bom/materialType';
import log from 'src/utils/log';
import { replaceSign } from 'src/constants';
import { findMaterialType, MATERIAL_TYPE_STATUS } from 'src/containers/materialType/utils';
import { changeChineseToLocaleWithoutIntl } from 'utils/locale/utils';

const DETAIL = changeChineseToLocaleWithoutIntl('物料类型详情');
const CODE = changeChineseToLocaleWithoutIntl('编号');
const NAME = changeChineseToLocaleWithoutIntl('名称');
const STATUS = changeChineseToLocaleWithoutIntl('状态');
const ROUTE = changeChineseToLocaleWithoutIntl('默认工艺路线');
const RELATE_MATERIAL = changeChineseToLocaleWithoutIntl('关联物料');

class MaterialTypeDetail extends Component {
  state = {
    data: null,
    loading: false,
  };

  componentDidMount() {
    const { match } = this.props;
    const id = _.get(match, 'params.id');

    this.fetchData(id);
  }

  fetchData = async () => {
    const { match } = this.props;
    const id = _.get(match, 'params.id');

    if (!id) return;

    this.setState({ loading: true });

    try {
      const res = await getMaterialTypeDetail(id);
      const data = _.get(res, 'data.data');
      this.setState({ data });
    } catch (e) {
      log.error(e);
    } finally {
      this.setState({ loading: false });
    }
  };

  renderTitle = () => {
    const { match } = this.props;
    const id = _.get(match, 'params.id');

    const { data } = this.state;
    const { status } = data || {};

    const stopUse = status === MATERIAL_TYPE_STATUS.inStop.value;

    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', margin: '20px 0px', paddingRight: 20 }}>
        <div style={{ color: black, fontSize: 20 }}>{DETAIL}</div>
        <div>
          <span
            style={
              stopUse
                ? {
                    cursor: 'not-allowed',
                    opacity: 0.3,
                  }
                : { color: primary, cursor: 'pointer' }
            }
            onClick={() => {
              if (stopUse) {
                return;
              }

              openModal({
                title: RELATE_MATERIAL,
                children: <RelateMaterial materialTypeId={id} />,
                footer: null,
                width: 850,
                wrapClassName: null,
              });
            }}
          >
            <Icon type={'plus-circle-o'} style={{ marginRight: 5 }} />
            {RELATE_MATERIAL}
          </span>
          <LinkToMaterialTypeEdit id={id} withIcon style={{ marginLeft: 20 }} />
        </div>
      </div>
    );
  };

  render() {
    const nameStyle = { color: middleGrey, textAlign: 'right', paddingRight: 10 };
    const rowStyle = { margin: '20px 0px' };
    const nameSpan = 2;
    const contentOffset = 2;

    const { data } = this.state;
    const { code, name, status, processRouting, id } = data || {};
    if (!data) {
      return null;
    }
    const { code: processRouteCode, name: processRouteName } = processRouting || {};
    const _status = findMaterialType(status);

    return (
      <Spin spinning={this.state.loading}>
        <div style={{ marginLeft: 20 }}>
          {this.renderTitle()}
          <div style={{ marginLeft: 60 }}>
            <Row.AntRow style={rowStyle}>
              <Col.AntCol span={nameSpan} style={nameStyle}>
                {CODE}
              </Col.AntCol>
              <Col.AntCol offset={contentOffset}>{code || replaceSign}</Col.AntCol>
            </Row.AntRow>
            <Row.AntRow style={rowStyle}>
              <Col.AntCol span={nameSpan} style={nameStyle}>
                {NAME}
              </Col.AntCol>
              <Col.AntCol offset={contentOffset}>{name || replaceSign}</Col.AntCol>
            </Row.AntRow>
            <Row.AntRow style={rowStyle}>
              <Col.AntCol span={nameSpan} style={nameStyle}>
                {STATUS}
              </Col.AntCol>
              <Col.AntCol offset={contentOffset}>
                <div>
                  {_status ? _status.name : replaceSign}
                  <UpdateStatus style={{ marginLeft: 10 }} id={id} statusNow={status} cbForUpdate={this.fetchData} />
                </div>
              </Col.AntCol>
            </Row.AntRow>
            <Row.AntRow style={rowStyle}>
              <Col.AntCol span={nameSpan} style={nameStyle}>
                {ROUTE}
              </Col.AntCol>
              <Col.AntCol offset={contentOffset}>
                {processRouteName && processRouteCode ? `${processRouteCode}/${processRouteName}` : replaceSign}
              </Col.AntCol>
            </Row.AntRow>
          </div>
        </div>
      </Spin>
    );
  }
}

MaterialTypeDetail.propTypes = {
  style: PropTypes.object,
  id: PropTypes.any,
  match: PropTypes.any,
};

MaterialTypeDetail.contextTypes = {
  router: PropTypes.any,
};

export default MaterialTypeDetail;
