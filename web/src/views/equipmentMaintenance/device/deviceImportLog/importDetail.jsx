import React, { Component } from 'react';
import { Row, Col, RestPagingTable, Tooltip } from 'components';
import { queryDeviceImportDetail, queryDeviceImportErrorList } from 'src/services/equipmentMaintenance/device';
import { formatUnix } from 'utils/time';
import { injectIntl } from 'react-intl';
import { changeChineseToLocale } from 'utils/locale/utils';
import { getQuery } from 'src/routes/getRouteParams';
import { replaceSign } from 'src/constants';
import styles from './styles.scss';

type Props = {
  match: {
    params: {
      id: string,
    },
  },
  intl: any,
};

class DeviceImportDetail extends Component {
  props: Props;
  state = {
    loading: false,
    data: null,
    detailList: null,
    importId: '',
    total: 1,
  };

  componentDidMount() {
    const { match } = this.props;
    const { id } = match.params;
    this.setState(
      {
        importId: id,
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

  fetchData = async params => {
    const { importId } = this.state;
    this.setState({ loading: true });
    const res = await queryDeviceImportDetail(importId);
    const res1 = await queryDeviceImportErrorList({ importId, ...params });
    const { data } = res.data;
    const { data: detailList } = res1.data;
    this.setState({
      data: {
        createdAt: formatUnix(data.createdAt),
        successAmount: data.successAmount,
        failureAmount: data.failureAmount,
        operatorName: data.operatorName,
        status: (() => {
          const status = data.status;
          if (status === 0) {
            return '导入失败';
          } else if (status === 1) {
            return '导入成功';
          }
          return '部分导入成功';
        })(),
      },
      detailList,
      loading: false,
      total: res1.data.total,
    });
  };

  getColumns = () => {
    const columns = [
      {
        title: '失败原因',
        dataIndex: 'errorDetail',
        width: 200,
        render: errorDetail => <Tooltip text={errorDetail || replaceSign} length={12} />,
      },
      {
        title: '设备编号',
        dataIndex: 'content',
        key: 'code',
        width: 150,
        render: content => <Tooltip text={content.code || replaceSign} length={20} />,
      },
      {
        title: '设备名称',
        key: 'name',
        dataIndex: 'content',
        width: 150,
        render: content => <Tooltip text={content.name || replaceSign} length={30} />,
      },
      {
        title: '设备类型',
        key: 'category',
        dataIndex: 'content',
        width: 150,
        render: content => content.category || replaceSign,
      },
      {
        title: '电子标签',
        key: 'qrcode',
        dataIndex: 'content',
        width: 200,
        render: content => <Tooltip text={content.qrcode || replaceSign} length={15} />,
      },
      {
        title: '设备型号',
        key: 'model',
        dataIndex: 'content',
        width: 200,
        render: content => <Tooltip text={content.model || replaceSign} length={15} />,
      },
      {
        title: '制造商',
        dataIndex: 'content',
        width: 200,
        render: content => <Tooltip text={content.manufacturer || replaceSign} length={15} />,
      },
      {
        title: '备注',
        key: 'desc',
        dataIndex: 'content',
        render: content => <Tooltip text={content.description || replaceSign} length={20} />,
      },
    ];
    return columns;
  };

  render() {
    const { intl } = this.props;
    const { data, detailList, loading } = this.state;
    if (!data || !detailList) return null;
    const columns = this.getColumns();
    const total = this.state.total || 1;

    return (
      <div id="materialImport_detail">
        <p className={styles.detailLogHeader}>{changeChineseToLocale('导入日志详情', intl)}</p>
        <div style={{ marginBottom: 30 }}>
          <Row>
            <Col type={'title'} style={{ paddingLeft: 20 }}>
              {'导入时间'}
            </Col>
            <Col type={'content'} style={{ width: 920 }}>
              {data.createdAt}
            </Col>
          </Row>
          <Row>
            <Col type={'title'} style={{ paddingLeft: 20 }}>
              {'导入用户'}
            </Col>
            <Col type={'content'} style={{ width: 920 }}>
              {data.operatorName}
            </Col>
          </Row>
          <Row>
            <Col type={'title'} style={{ paddingLeft: 20 }}>
              {'导入结果'}
            </Col>
            <Col type={'content'} style={{ width: 920 }}>
              {data.status}
            </Col>
          </Row>
          <Row>
            <Col type={'title'} style={{ paddingLeft: 20 }}>
              {'导入详情'}
            </Col>
            <Col type={'content'} style={{ width: 920 }}>{`导入完成，设备基础数据导入成功数：${
              data.successAmount
            }，设备基础数据导入失败数：${data.failureAmount}`}</Col>
          </Row>
        </div>
        <RestPagingTable
          dataSource={detailList}
          refetch={this.fetchData}
          total={total}
          rowKey={record => record.id}
          columns={columns}
          loading={loading}
          scroll={{ x: 1500 }}
          bordered
        />
      </div>
    );
  }
}

export default injectIntl(DeviceImportDetail);
