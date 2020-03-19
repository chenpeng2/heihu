import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { Table, Row, Col, Tooltip, FormattedMessage } from 'src/components';
import { importProcessRoutingLogDetail } from 'src/services/bom/processRouting';
import { black } from 'src/styles/color';
import { replaceSign } from 'src/constants';
import { arrayIsEmpty } from 'src/utils/array';
import { formatUnix } from 'src/utils/time';
import { getParams, setLocation } from 'src/utils/url';
import log from 'src/utils/log';
import { SUCCESSION_MODE_ENUM } from 'src/containers/mBom/base/constant';

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
    pagination: { current: 1, pageSize: 10, total: 0 },
  };

  getColumns = () => {
    return [
      {
        title: '失败原因',
        width: 300,
        dataIndex: 'reason',
        render: text => text || replaceSign,
      },
      {
        title: '工艺路线编号',
        width: 150,
        dataIndex: 'code',
        render: text => text || replaceSign,
      },
      {
        title: '工艺路线名称',
        width: 150,
        dataIndex: 'name',
        render: text => text || replaceSign,
      },
      {
        title: '有效期开始',
        width: 150,
        dataIndex: 'validFrom',
        render: text => <Tooltip text={text || replaceSign} length={30} />,
      },
      {
        title: '有效期结束',
        width: 150,
        dataIndex: 'validTo',
        render: text => <Tooltip text={text || replaceSign} length={12} />,
      },
      {
        title: '工序序号',
        dataIndex: 'seq',
        width: 150,
        render: text => <Tooltip text={text || replaceSign} length={12} />,
      },
      {
        title: '工序编号',
        width: 150,
        dataIndex: 'processCode',
        render: text => <Tooltip text={text || replaceSign} length={12} />,
      },
      {
        title: '接续方式',
        dataIndex: 'successionMode',
        width: 150,
        render: text => {
          const name = text ? SUCCESSION_MODE_ENUM[Number(text)] : replaceSign;
          return <Tooltip text={name || replaceSign} length={12} />;
        },
      },
      {
        title: '准备时间',
        width: 150,
        dataIndex: 'preparationTime',
        render: text => <Tooltip text={text || replaceSign} length={12} />,
      },
      {
        title: '工位编号',
        width: 150,
        dataIndex: 'workstations',
        render: data => {
          return arrayIsEmpty(data) ? replaceSign : data.join(',');
        },
      },
      {
        width: 150,
        title: '生产描述',
        dataIndex: 'productDesc',
        render: text => text || replaceSign,
      },
    ];
  };

  componentDidMount() {
    const { match } = this.props;
    const { id: importId } = match.params;
    this.setState({ importId }, () => {
      const { queryObj } = getParams() || {};
      this.fetchData(queryObj);
    });
  }

  getStatusText = status => {
    if (status === 0) {
      return '导入失败';
    } else if (status === 1) {
      return '导入成功';
    }
    return '部分导入成功';
  };

  fetchData = async params => {
    const { importId, pagination } = this.state;

    const { queryObj } = getParams() || {};
    const nextParams = { ...queryObj, importId, ...params };

    setLocation(this.props, nextParams);

    this.setState({ loading: true });

    try {
      const res = await importProcessRoutingLogDetail(nextParams);

      const { data } = _.get(res, 'data') || {};
      const { detailList, size, page, status } = data || {};

      this.setState({
        data: {
          createdAt: formatUnix(data.createdAt),
          content: data.content,
          userName: data.userName,
          status: this.getStatusText(status),
        },
        detailList,
        pagination: {
          ...pagination,
          total: size,
          current: page + 1,
          pageSize: nextParams ? nextParams.size : 10,
        },
      });
    } catch (e) {
      log.error(e);
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    const { data, detailList, loading, pagination } = this.state;
    const { createdAt, userName, status, content } = data || {};

    const titleStyle = { paddingLeft: 20 };
    const contentStyle = { width: 920 };

    return (
      <div id="materialImport_detail">
        <p style={{ color: black, fontSize: 16, margin: 20 }}>
          <FormattedMessage defaultMessage={'导入日志详情'} />
        </p>
        <div style={{ marginBottom: 30 }}>
          <Row>
            <Col type={'title'} style={titleStyle}>
              {'导入时间'}
            </Col>
            <Col type={'content'} style={contentStyle}>
              {createdAt || replaceSign}
            </Col>
          </Row>
          <Row>
            <Col type={'title'} style={titleStyle}>
              {'导入用户'}
            </Col>
            <Col type={'content'} style={contentStyle}>
              {userName || replaceSign}
            </Col>
          </Row>
          <Row>
            <Col type={'title'} style={titleStyle}>
              {'导入结果'}
            </Col>
            <Col type={'content'} style={contentStyle}>
              {status}
            </Col>
          </Row>
          <Row>
            <Col type={'title'} style={titleStyle}>
              {'导入详情'}
            </Col>
            <Col type={'content'} style={contentStyle}>
              {content}
            </Col>
          </Row>
        </div>
        <Table
          dataSource={detailList}
          refetch={this.fetchData}
          rowKey={record => record.id}
          columns={this.getColumns()}
          loading={loading}
          pagination={pagination}
          dragable
        />
      </div>
    );
  }
}

ImportDetail.contextTypes = {
  router: PropTypes.object.isRequired,
};

export default ImportDetail;
