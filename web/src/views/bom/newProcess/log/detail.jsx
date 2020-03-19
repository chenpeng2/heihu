import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Row, Col, Table, Tooltip, FormattedMessage } from 'src/components';
import { queryProcessImportLogDetail } from 'src/services/process';
import { formatUnix } from 'src/utils/time';
import { useFrozenTime } from 'src/utils/organizationConfig';
import { getQuery } from 'src/routes/getRouteParams';
import { FIFO_VALUE_DISPLAY_MAP } from 'views/bom/newProcess/utils';
import { replaceSign } from 'src/constants';

import styles from './styles.scss';

type Props = {
  viewer: any,
  relay: any,
  match: any,
  params: {
    materialId: string,
  },
};

class MaterialImportDetail extends Component {
  props: Props;
  state = {
    loading: false,
    data: {},
    detailList: [],
    importId: '',
    pagination: {},
  };

  getColumns = () => {
    const columns = [
      {
        title: '失败原因',
        dataIndex: 'reason',
        render: text => <Tooltip text={text || replaceSign} length={18} />,
      },
      {
        title: '工序编号',
        dataIndex: 'processCode',
        render: text => <Tooltip text={text || replaceSign} length={20} />,
      },
      {
        title: '工序名称',
        dataIndex: 'processName',
        render: text => <Tooltip text={text || replaceSign} length={30} />,
      },
      {
        title: '工位编号',
        dataIndex: 'workstationCodes',
        render: text => <Tooltip text={text || replaceSign} length={12} />,
      },
      {
        title: '单次扫码',
        dataIndex: 'codeScanNum',
        render: text => <Tooltip text={text || replaceSign} length={12} />,
      },
      {
        title: '一码到底',
        dataIndex: 'alwaysOneCode',
        render: text => <Tooltip text={text || replaceSign} length={12} />,
      },
      {
        title: '次品项编号',
        dataIndex: 'defectCodes',
        render: text => <Tooltip text={text || replaceSign} length={12} />,
      },
      {
        title: '用料追溯关系',
        dataIndex: 'fifo',
        render: text => <Tooltip text={FIFO_VALUE_DISPLAY_MAP[text] || replaceSign} length={12} />,
      },
      {
        title: '生产描述',
        dataIndex: 'productDesc',
        render: text => <Tooltip text={text || replaceSign} length={12} />,
      },
      {
        title: '任务下发审批',
        dataIndex: 'deliverableCheck',
        render: text => <Tooltip text={text || replaceSign} length={20} />,
      },
    ];
    if (useFrozenTime()) {
      columns.push({
        title: '产出是否冻结',
        dataIndex: 'outputFrozenCategory',
        render: text => <Tooltip text={text || replaceSign} length={20} />,
      });
    }
    return columns;
  };

  componentDidMount() {
    const { match } = this.props;
    const { importId } = match.params;
    this.setState(
      {
        importId,
        pagination: {
          current: 1,
        },
      },
      () => {
        const { match } = this.props;
        const query = getQuery(match);
        const variables = { ...query };
        this.fetchData({ ...variables });
      },
    );
  }

  fetchData = async () => {
    const { importId } = this.state;
    this.setState({ loading: true });
    const res = await queryProcessImportLogDetail(importId);
    const data = _.get(res, 'data.data');
    const { detailList, createdAt, content, userName, status } = data || {};
    this.setState({
      data: {
        createdAt: formatUnix(createdAt),
        content,
        userName,
        status,
      },
      detailList,
      loading: false,
      pagination: {
        total: _.get(res, 'data.count'),
      },
    });
  };

  render() {
    const { data, detailList, loading, pagination } = this.state;
    const total = this.state.count || 1;
    const { createdAt, userName, status, content } = data || {};

    return (
      <div id="materialImport_detail">
        <p className={styles.detailLogHeader}>
          <FormattedMessage defaultMessage={'导入日志详情'} />
        </p>
        <div style={{ marginBottom: 30 }}>
          <Row>
            <Col type={'title'} style={{ paddingLeft: 20 }}>
              {'导入时间'}
            </Col>
            <Col type={'content'} style={{ width: 920 }}>
              {createdAt || replaceSign}
            </Col>
          </Row>
          <Row>
            <Col type={'title'} style={{ paddingLeft: 20 }}>
              {'导入用户'}
            </Col>
            <Col type={'content'} style={{ width: 920 }}>
              {userName || replaceSign}
            </Col>
          </Row>
          <Row>
            <Col type={'title'} style={{ paddingLeft: 20 }}>
              {'导入结果'}
            </Col>
            <Col type={'content'} style={{ width: 920 }}>
              {status || replaceSign}
            </Col>
          </Row>
          <Row>
            <Col type={'title'} style={{ paddingLeft: 20 }}>
              {'导入详情'}
            </Col>
            <Col type={'content'} style={{ width: 920 }}>
              {content || replaceSign}
            </Col>
          </Row>
        </div>
        <Table
          dataSource={detailList}
          total={total}
          rowKey={record => record.id}
          columns={this.getColumns()}
          pagination={pagination}
          loading={loading}
          bordered
        />
      </div>
    );
  }
}

MaterialImportDetail.contextTypes = {
  router: PropTypes.object.isRequired,
};

export default MaterialImportDetail;
