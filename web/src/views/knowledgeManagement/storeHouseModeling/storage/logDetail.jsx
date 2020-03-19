import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { FormattedMessage, Row, Col, RestPagingTable, Tooltip } from 'src/components';
import { importLogDetail } from 'src/services/knowledgeBase/storage';
import { formatUnix } from 'src/utils/time';
import { getQuery } from 'src/routes/getRouteParams';
import { black, error, primary, warning } from 'src/styles/color';
import { replaceSign } from 'src/constants';

type Props = {
  viewer: any,
  relay: any,
  match: any,
  params: {
    materialId: string,
  },
};

class ImportDetail extends Component {
  props: Props;
  state = {
    loading: false,
    data: {},
    detailList: [],
    importId: '',
  };

  isContentRed = (failFields, id) => {
    const fields = Object.keys(failFields);

    if (fields.indexOf(id) !== -1) return error;

    return black;
  };

  getColumns = () => {
    const columns = [
      {
        title: '失败原因',
        dataIndex: 'failFields',
        render: data => {
          const text = Object.values(data);

          return (
            <div>
              {Array.isArray(text)
                ? text.map(i => {
                    return (
                      <div style={{ color: error }}>
                        <Tooltip text={i} length={18} />
                      </div>
                    );
                  })
                : replaceSign}
            </div>
          );
        },
      },
      {
        title: '上级仓位类型',
        dataIndex: 'storageItem.parentLevel',
        render: (data, record) => {
          const { failFields } = record || {};
          return (
            <Tooltip
              containerStyle={{ color: this.isContentRed(failFields, 'parentLevel') }}
              text={data || replaceSign}
              length={18}
            />
          );
        },
      },
      {
        title: '上级仓位编号',
        dataIndex: 'storageItem.parentCode',
        render: (data, record) => {
          const { failFields } = record || {};
          return (
            <Tooltip
              containerStyle={{ color: this.isContentRed(failFields, 'parentCode') }}
              text={data || replaceSign}
              length={18}
            />
          );
        },
      },
      {
        title: '仓位编号',
        dataIndex: 'storageItem.code',
        render: (text, record) => {
          const { failFields } = record || {};
          return (
            <Tooltip
              containerStyle={{ color: this.isContentRed(failFields, 'code') }}
              text={text || replaceSign}
              length={20}
            />
          );
        },
      },
      {
        title: '仓位名称',
        dataIndex: 'storageItem.name',
        render: (text, record) => {
          const { failFields } = record || {};
          return (
            <Tooltip
              containerStyle={{ color: this.isContentRed(failFields, 'name') }}
              text={text || replaceSign}
              length={20}
            />
          );
        },
      },
      {
        title: '二维码',
        dataIndex: 'storageItem.qrCode',
        render: (text, record) => {
          const { failFields } = record || {};
          return (
            <Tooltip
              containerStyle={{ color: this.isContentRed(failFields, 'qrCode') }}
              text={text || replaceSign}
              length={20}
            />
          );
        },
      },
      {
        title: '备注',
        dataIndex: 'storageItem.remark',
        render: (text, record) => {
          const { failFields } = record || {};
          return (
            <Tooltip
              containerStyle={{ color: this.isContentRed(failFields, 'remark') }}
              text={text || replaceSign}
              length={20}
            />
          );
        },
      },
    ];
    return columns;
  };

  componentDidMount() {
    const { match } = this.props;
    const { importId } = match.params;
    this.setState(
      {
        importId,
      },
      () => {
        const { match } = this.props;
        const query = getQuery(match);
        const variables = { ...query };
        this.fetchData({ ...variables });
      },
    );
  }

  fetchData = async params => {
    this.setState({ loading: true });

    const { importId } = this.state;
    params = { fileId: importId, ...params };

    const res = await importLogDetail(params);
    const { file, items } = _.get(res, 'data.data');
    const { createdAt, operatorName, succeedCount, totalCount, fileName } = file || {};

    this.setState({
      data: {
        createdAt: createdAt ? formatUnix(createdAt) : replaceSign,
        userName: operatorName || replaceSign,
        status: { succeedCount, totalCount },
        fileName,
      },
      detailList: items,
      loading: false,
    });
  };

  renderStatus = (succeedCount, totalCount) => {
    if (succeedCount === 0) {
      return <FormattedMessage style={{ color: error }} defaultMessage={'导入失败'} />;
    } else if (totalCount === succeedCount) {
      return <FormattedMessage style={{ color: primary }} defaultMessage={'导入成功'} />;
    } else if (totalCount > succeedCount) {
      return <FormattedMessage style={{ color: warning }} defaultMessage={'部分导入成功'} />;
    }

    return replaceSign;
  };

  render() {
    const colums = this.getColumns();
    const { data, detailList, loading } = this.state;
    const { status, createdAt, userName, fileName } = data || {};
    const { succeedCount, totalCount } = status || {};

    return (
      <div id="materialImport_detail">
        <FormattedMessage
          style={{ display: 'block', fontSize: '16px', color: black, margin: 20 }}
          defaultMessage={'导入日志详情'}
        />
        <div style={{ marginBottom: 30 }}>
          <Row>
            <Col type={'title'} style={{ paddingLeft: 20 }}>
              导入时间
            </Col>
            <Col type={'content'} style={{ width: 920 }}>
              {createdAt}
            </Col>
          </Row>
          <Row>
            <Col type={'title'} style={{ paddingLeft: 20 }}>
              导入用户
            </Col>
            <Col type={'content'} style={{ width: 920 }}>
              {userName}
            </Col>
          </Row>
          <Row>
            <Col type={'title'} style={{ paddingLeft: 20 }}>
              导入文件
            </Col>
            <Col type={'content'} style={{ width: 920 }}>
              {fileName}
            </Col>
          </Row>
          <Row>
            <Col type={'title'} style={{ paddingLeft: 20 }}>
              导入结果
            </Col>
            <Col type={'content'} style={{ width: 920 }}>
              {this.renderStatus(succeedCount, totalCount)}
            </Col>
          </Row>
          <Row>
            <Col type={'title'} style={{ paddingLeft: 20 }}>
              导入详情
            </Col>
            <Col type={'content'} style={{ width: 920 }}>
              <FormattedMessage
                defaultMessage={'导入完成！仓位导入成功数：{amount1}，失败数：{amount2}'}
                values={{
                  amount1: succeedCount,
                  amount2: totalCount - succeedCount,
                }}
              />
            </Col>
          </Row>
        </div>
        <RestPagingTable
          dataSource={detailList}
          refetch={this.fetchData}
          rowKey={record => record.id}
          columns={colums}
          loading={loading}
          pagination={false}
          scroll={{ y: 400 }}
          bordered
        />
      </div>
    );
  }
}

ImportDetail.contextTypes = {
  router: PropTypes.object.isRequired,
};

export default ImportDetail;
