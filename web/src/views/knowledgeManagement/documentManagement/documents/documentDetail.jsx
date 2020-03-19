import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import { openModal, SimpleTable, Link, Attachment } from 'components';
import { replaceSign } from 'src/constants';
import { wrapUrl } from 'utils/attachment';
import moment, { formatDateTime } from 'src/utils/time';
import { black, fontSub, primary } from 'src/styles/color';
import { Row, Col, Spin } from 'src/components';
import { getFileDetail } from 'src/services/knowledgeBase/file';
import { fileStatusMap } from '../utils';

const AttachmentFile = Attachment.AttachmentFile;
const AttachmentImageView = Attachment.ImageView;

const colStyle = { marginRight: 60 };
const labelStyle = {
  width: 100,
  marginRight: 10,
  textAlign: 'right',
  paddingRight: 10,
  display: 'inline-block',
  color: fontSub,
};
const valueStyle = { width: 200, display: 'inline-block', textAlign: 'left' };

type Props = {
  viewer: any,
  match: {},
};

class DocumentDetail extends Component {
  props: Props;
  state = {
    loading: false,
    data: {},
  };

  componentDidMount() {
    this.fetchAndSetData();
  }

  fetchAndSetData = () => {
    const { match } = this.props;
    const id = _.get(match, 'params.id');

    this.setState({ loading: true });
    getFileDetail({ id })
      .then(async res => {
        const data = _.get(res, 'data.data');
        console.log(data);
        this.setState({ data });
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  getColumns = () => {
    const columns = [
      {
        title: '文档名称',
        key: 'name',
        width: 100,
        fixed: 'left',
        dataIndex: 'name',
        render: text => text || replaceSign,
      },
      {
        title: '文档版本',
        key: 'version',
        dataIndex: 'version',
        fixed: 'left',
        width: 100,
        render: text => text || replaceSign,
      },
      {
        title: '文档状态',
        key: 'status',
        dataIndex: 'status',
        width: 180,
        render: status => fileStatusMap[status] || replaceSign,
      },
      {
        title: '描述',
        key: 'desc',
        dataIndex: 'desc',
        width: 180,
        render: text => text || replaceSign,
      },
      {
        title: '创建人',
        key: 'creatorName',
        dataIndex: 'creatorName',
        width: 180,
        render: text => text || replaceSign,
      },
      {
        title: '创建时间',
        dataIndex: 'createdAt',
        key: 'createdAt',
        width: 140,
        render: text => (text ? formatDateTime(text) : replaceSign),
      },
      {
        title: '文档',
        dataIndex: 'attachment',
        key: 'createdAt',
        width: 140,
        render: attachment => {
          if (attachment) {
            return <Link onClick={() => window.open(wrapUrl(attachment.id))} target="_blank" icon="paper-clip" />;
          }
          return replaceSign;
        },
      },
    ];
    return columns;
  };

  renderOperationButtonGroups = () => {
    const { id, status } = this.state.data;
    return (
      <div>
        <Link
          style={{ margin: '0px 20px' }}
          icon={'edit'}
          onClick={() => this.context.router.history.push(`/knowledgeManagement/documents/${id}/edit`)}
        >
          编辑
        </Link>
        {status === 1 ? (
          <Link
            style={{ margin: '0px 20px' }}
            iconType="gc"
            icon={'banbengengxin'}
            onClick={() => this.context.router.history.push(`/knowledgeManagement/documents/${id}/changeVersion`)}
          >
            变更版本
          </Link>
        ) : null}
      </div>
    );
  };

  render() {
    const { data, loading } = this.state;
    const { code, name, version, folder, type, status, creatorName, createdAt, desc, history, attachment } = data || {};

    return (
      <Spin spinning={loading}>
        <div style={{ padding: '20px 20px' }}>
          <Row style={{ justifyContent: 'space-between', marginBottom: 30 }}>
            <Col>
              <div style={{ fontSize: 16, color: black }}>文档详情</div>
            </Col>
            <Col>{this.renderOperationButtonGroups()}</Col>
          </Row>
          <Row style={{ marginBottom: 20 }}>
            <Col style={colStyle}>
              <span style={labelStyle}>文档编码</span>
              <span style={valueStyle}>{code || replaceSign}</span>
            </Col>
          </Row>
          <Row style={{ marginBottom: 20 }}>
            <Col style={colStyle}>
              <span style={labelStyle}>文档版本</span>
              <span style={valueStyle}>{version || replaceSign}</span>
            </Col>
          </Row>
          <Row style={{ marginBottom: 20 }}>
            <Col style={colStyle}>
              <span style={labelStyle}>文档名称</span>
              <span style={valueStyle}>{name || replaceSign}</span>
            </Col>
          </Row>
          <Row style={{ marginBottom: 20 }}>
            <Col style={colStyle}>
              <span style={labelStyle}>文件夹</span>
              <span style={valueStyle}>{(folder && folder.name) || replaceSign}</span>
            </Col>
          </Row>
          <Row style={{ marginBottom: 20 }}>
            <Col style={colStyle}>
              <span style={labelStyle}>文档状态</span>
              <span style={valueStyle}>{fileStatusMap[status] || replaceSign}</span>
            </Col>
          </Row>
          <Row style={{ marginBottom: 20 }}>
            <Col style={colStyle}>
              <span style={labelStyle}>文档格式</span>
              <span style={valueStyle}>{type || replaceSign}</span>
            </Col>
          </Row>
          <Row style={{ marginBottom: 20 }}>
            <Col style={colStyle}>
              <span style={labelStyle}>创建人</span>
              <span style={valueStyle}>{creatorName || replaceSign}</span>
            </Col>
          </Row>
          <Row style={{ marginBottom: 20 }}>
            <Col style={colStyle}>
              <span style={labelStyle}>创建时间</span>
              <span style={valueStyle}>{(createdAt && formatDateTime(createdAt)) || replaceSign}</span>
            </Col>
          </Row>
          <Row style={{ marginBottom: 20 }}>
            <Col style={colStyle}>
              <span style={labelStyle}>描述</span>
              <span style={valueStyle}>{desc || replaceSign}</span>
            </Col>
          </Row>
          <Row style={{ marginBottom: 20 }}>
            <Col style={colStyle}>
              <span style={labelStyle}>文档</span>
              <span style={valueStyle}>{attachment ? AttachmentFile([attachment]) : replaceSign}</span>
            </Col>
          </Row>
        </div>
        <div style={{ padding: '20px 20px' }}>
          <Row style={{ justifyContent: 'space-between', marginBottom: 30 }}>
            <Col>
              <div style={{ fontSize: 16, color: black }}>其他版本</div>
            </Col>
          </Row>
          <SimpleTable pagination={false} columns={this.getColumns()} dataSource={history} />
        </div>
      </Spin>
    );
  }
}

DocumentDetail.contextTypes = {
  router: {},
};

export default withRouter(DocumentDetail);
