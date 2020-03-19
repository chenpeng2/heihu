import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Popconfirm, Tooltip, message, Spin } from 'antd';
import { content, primary, error } from 'src/styles/color/index';
import { replaceSign } from 'src/constants';
import { Icon, Attachment, Link, Row, Col } from 'components';
import { queryMaterialDetail, updateMaterialStatus } from 'src/services/bom/material';
// import { EditMaterialFormWithQueryRenderer } from '../basicInfo/edit';
import styles from './styles.scss';

const AttachmentFile = Attachment.AttachmentFile;
const contentStyle = { width: 620 };

type Props = {
  match: {
    params: {
      materialCode: string,
    },
  },
  location: {
    pathname: String,
  },
};

class MaterialDetail extends Component {
  props: Props;
  state = {
    successVisible: false,
    failedVisible: false,
    loading: false,
    data: [],
  };

  componentDidMount() {
    this.setState({ loading: true });
    const {
      match: {
        params: { materialCode },
      },
    } = this.props;
    this.fetchData(materialCode);
  }

  fetchData = async code => {
    const { data } = await queryMaterialDetail(code);
    this.setState({
      data: data.data,
      loading: false,
    });
  };

  confirm = () => {
    this.setState({ failedVisible: false });
  };

  cancel = e => {
    message.error('Click on No');
  };
  renderButton = (code, status) => {
    return (
      <Popconfirm
        cancelText={'知道了'}
        onCancel={() => {
          this.setState({ failedVisible: false });
        }}
        visible={this.state.failedVisible}
        title={'停用失败！该物料已被用于发布的生产BOM或启用中的物料清单，不可以停用！'}
        overlayStyle={{ width: 253 }}
        placement="topLeft"
        getPopupContainer={() => {
          document.getElementById('material_detail').addEventListener('click', e => {
            this.setState({ failedVisible: false });
          });
          return document.getElementById('material_detail');
        }}
      >
        <span
          className={styles.statusLabel}
          style={status && status.num ? { backgroundColor: error } : { backgroundColor: primary }}
          onClick={() => {
            updateMaterialStatus(code, { status: status.num ? 0 : 1 }).then(res => {
              const { data } = res;
              if (data.code === 'MATERIAL_DISABLE_FAILED') {
                this.setState({ failedVisible: true });
              } else {
                this.fetchData(data.data.code);
                this.setState({ successVisible: true });
              }
            });
          }}
        >
          {status && status.num ? '停用' : '启用'}
        </span>
      </Popconfirm>
    );
  };
  renderStatus = status => {
    return (
      <Tooltip
        visible={this.state.successVisible}
        onVisibleChange={visible => {
          this.setState({ successVisible: visible });
        }}
        overlayStyle={{ width: 116 }}
        trigger="click"
        placement="top"
        getPopupContainer={() => document.getElementById('material_detail')}
        title={
          <div style={{ color: content, padding: '10px 0' }}>
            <Icon type={'check-circle'} style={{ color: primary, margin: '0 4px 0 15px' }} />
            {status && status.num ? '启用成功！' : '停用成功！'}
          </div>
        }
      >
        <span>{status && status.display}</span>
      </Tooltip>
    );
  };

  render() {
    const { data } = this.state;

    return (
      <Spin spinning={this.state.loading}>
        <div id="material_detail" className={styles.materialDetail}>
          <Row style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 0 30px 20px' }}>
            <Col>
              <p className={styles.header}>物料详情</p>
            </Col>
            <Col>
              <Link
                icon="form"
                style={{ marginRight: 40 }}
                onClick={() => {
                  const path = this.props.location.pathname;
                  if (path.indexOf('bom') !== -1) {
                    this.context.router.history.push(`/bom/materials/${data.code}/detail/edit`);
                  }
                  if (path.indexOf('lgUnits') !== -1) {
                    this.context.router.history.push(`/stock/lgUnits/${data.code}/detail/edit`);
                  }
                  if (path.indexOf('produceUnits') !== -1) {
                    this.context.router.history.push(`/stock/produceUnits/${data.code}/detail/edit`);
                  }
                  if (path.indexOf('initLgTransfers') !== -1) {
                    this.context.router.history.push(`/stock/initLgTransfers/${data.code}/detail/edit`);
                  }
                  if (path.indexOf('deliverLgTransfers') !== -1) {
                    this.context.router.history.push(`/stock/deliverLgTransfers/${data.code}/detail/edit`);
                  }
                }}
              >
                编辑
              </Link>
              <Link
                icon="bars"
                onClick={() => {
                  const path = this.props.location.pathname;
                  if (path.indexOf('bom') !== -1) {
                    this.context.router.history.push(`/bom/materials/${data.code}/detail/operationHistory`);
                  }
                  if (path.indexOf('lgUnits') !== -1) {
                    this.context.router.history.push(`/stock/lgUnits/${data.code}/detail/operationHistory`);
                  }
                  if (path.indexOf('produceUnits') !== -1) {
                    this.context.router.history.push(`/stock/produceUnits/${data.code}/detail/operationHistory`);
                  }
                  if (path.indexOf('initLgTransfers') !== -1) {
                    this.context.router.history.push(`/stock/initLgTransfers/${data.code}/detail/operationHistory`);
                  }
                  if (path.indexOf('deliverLgTransfers') !== -1) {
                    this.context.router.history.push(`/stock/deliverLgTransfers/${data.code}/detail/operationHistory`);
                  }
                }}
              >
                查看操作记录
              </Link>
            </Col>
          </Row>
          <div>
            <Row>
              <Col type={'title'}>{'名称'}</Col>
              <Col type={'content'} style={contentStyle}>
                {data.name}
              </Col>
            </Row>
            <Row>
              <Col type={'title'}>{'编号'}</Col>
              <Col type={'content'} style={contentStyle}>
                {data.code}
              </Col>
            </Row>
            <Row>
              <Col type={'title'}>{'状态'}</Col>
              <Col type={'content'} style={contentStyle}>
                {this.renderStatus(data.status)}
                {this.renderButton(data.code, data.status)}
              </Col>
            </Row>
            <Row>
              <Col type={'title'}>{'单位'}</Col>
              <Col type={'content'} style={contentStyle}>
                {(data.unit && data.unit.name) || replaceSign}
              </Col>
            </Row>
            <Row>
              <Col type={'title'}>{'规格描述'}</Col>
              <Col type={'content'} style={contentStyle}>
                {data.desc === '' ? replaceSign : data.desc}
              </Col>
            </Row>
            <Row style={{ alignItems: 'flex-start' }}>
              <Col type={'title'}>{'附件'}</Col>
              <Col type={'content'} style={{ display: 'flex', flex: 1, marginTop: 10 }}>
                {data.attachments && data.attachments.length !== 0 ? AttachmentFile(data.attachments) : replaceSign}
              </Col>
            </Row>
          </div>
        </div>
      </Spin>
    );
  }
}

MaterialDetail.contextTypes = {
  router: PropTypes.object.isRequired,
};

export default withRouter(MaterialDetail);

// 不能删除
/*
  <HorizontalItem label="保质期" content={`${material.shelf_life || '/ '}天`} />
  <HorizontalItem label="生产工位" content={'/'} />
  <HorizontalItem label="批次采购周期" content={`${material.purchase_lead_time || '/ '}天`} />
  <HorizontalItem label="批次采购数量" content={material.purchase_batch_amount} />
  <HorizontalItem label="批次生产周期" content={`${material.produce_lead_time || '/ '}天`} />
  <HorizontalItem label="批次生产数量" content={material.produce_batch_amount} />
*/
