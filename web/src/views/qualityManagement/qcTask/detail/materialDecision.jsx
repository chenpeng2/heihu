import React, { Component } from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Row, Col, Table, Tooltip, message, Link } from 'components';
import { queryQcMaterial } from 'src/services/qualityManagement/qcTask';
import { thousandBitSeparator } from 'utils/number';
import { replaceSign } from 'src/constants';

import { getDefect } from '../utils';

type Props = {
  form: {
    getFieldDecorator: () => {},
  },
  match: {},
  recordType: Number,
  checkType: Number,
};

class MaterialDecision extends Component {
  props: Props;
  state = {
    data: {
      materials: [],
      loading: false,
      isQr: false,
      isStorage: false,
      checkDefectRate: null,
    },
  };

  componentDidMount() {
    const {
      match: {
        params: { id },
      },
    } = this.props;
    this.fetchData({ id, category: 0 });
  }

  getColumns = checkType => {
    const { data } = this.state;
    const { isQr, isStorage } = data || {};
    if ([2, 3].indexOf(checkType) !== -1) {
      return [
        {
          title: '二维码',
          key: 'qrCode',
          dataIndex: 'qrCode',
          width: 130,
          render: qrCode =>
            qrCode ? (
              <Link
                onClick={() => {
                  // message.success('稍后跳转库存重构后的现有量查询页面');
                  this.context.router.history.push(`/stock/qrCode?qrcode=${qrCode}`);
                }}
              >
                {qrCode}
              </Link>
            ) : (
              replaceSign
            ),
        },
        {
          title: '数量',
          key: 'count',
          dataIndex: 'count',
          width: 120,
          render: (count, record) =>
            count ? (
              <Tooltip text={`${thousandBitSeparator(count)}${_.get(record, 'unit.name', '')}`} length={16} />
            ) : (
              replaceSign
            ),
        },
        {
          title: '生产工位',
          key: 'workstation.name',
          dataIndex: 'workstation.name',
          width: 120,
          render: (name, record) => (name ? <Tooltip text={name} length={16} /> : replaceSign),
        },
        {
          title: '生产执行人',
          key: 'operators',
          dataIndex: 'operators',
          width: 120,
          render: (operators, record) =>
            operators && operators.length ? (
              <Tooltip text={_.join(operators.map(x => x.name), '，')} length={16} />
            ) : (
              replaceSign
            ),
        },
        {
          title: '结果',
          key: 'status',
          dataIndex: 'status',
          render: status => {
            if (status === 1) {
              return '合格';
            }
            if (status === 2) {
              return '让步合格';
            }
            if (status === 3) {
              return '待检';
            }
            if (status === 4) {
              return '不合格';
            }
            return replaceSign;
          },
        },
      ];
    }
    if (isQr) {
      return [
        {
          title: '二维码',
          key: 'qrCode',
          dataIndex: 'qrCode',
          width: 130,
          render: qrCode =>
            qrCode ? (
              <Link
                onClick={() => {
                  // message.success('稍后跳转库存重构后的现有量查询页面');
                  this.context.router.history.push(`/stock/qrCode?qrcode=${qrCode}`);
                  // this.context.router.push(`/cooperate/prodTasks/${record.id}/qrCodeDetail`);
                }}
              >
                {qrCode}
              </Link>
            ) : (
              replaceSign
            ),
        },
        {
          title: '数量',
          key: 'count',
          dataIndex: 'count',
          width: 150,
          render: (count, record) =>
            count ? (
              <Tooltip text={`${thousandBitSeparator(count)}${_.get(record, 'unit.name', '')}`} length={15} />
            ) : (
              replaceSign
            ),
        },
        {
          title: '结果',
          key: 'status',
          dataIndex: 'status',
          render: status => {
            if (status === 1) {
              return '合格';
            }
            if (status === 2) {
              return '让步合格';
            }
            if (status === 3) {
              return '待检';
            }
            if (status === 4) {
              return '不合格';
            }
            return replaceSign;
          },
        },
      ];
    }
    if (isStorage) {
      return [
        {
          title: '仓位',
          key: 'storage',
          dataIndex: 'storage',
          width: 200,
          render: storage =>
            _.get(storage, 'name', undefined) ? <Tooltip text={_.get(storage, 'name')} length={20} /> : replaceSign,
        },
        {
          title: '数量',
          key: 'count',
          dataIndex: 'count',
          width: 150,
          render: (count, record) =>
            count ? (
              <Tooltip text={`${thousandBitSeparator(count)}${_.get(record, 'unit.name', '')}`} length={15} />
            ) : (
              replaceSign
            ),
        },
        {
          title: '结果',
          key: 'status',
          dataIndex: 'status',
          render: status => {
            if (status === 1) {
              return '合格';
            }
            if (status === 2) {
              return '让步合格';
            }
            if (status === 3) {
              return '待检';
            }
            if (status === 4) {
              return '不合格';
            }
            return replaceSign;
          },
        },
      ];
    }
  };

  fetchData = async params => {
    this.setState({
      loading: true,
    });
    await queryQcMaterial(params)
      .then(res => {
        const data = _.get(res, 'data.data');
        this.setState({ data });
      })
      .catch(e => console.log(e))
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  getDefectTitle = (type, suffix) => {
    switch (type) {
      case 0:
        return `入厂批${suffix}`;
      case 1:
        return `出厂批${suffix}`;
      case 2:
        return `生产批${suffix}`;
      case 3:
        return `生产批${suffix}`;
      default:
        break;
    }
  };

  render() {
    const { checkType } = this.props;
    const { data, loading } = this.state;
    const columns = this.getColumns(checkType);

    const { materials, checkDefectRate, waitRate, standardRate, asStandardRate } = data;

    return (
      <div>
        <Row>
          <Col type="title">判定结果</Col>
          <Col type="content">
            <Table
              style={{ margin: 0, width: 640 }}
              loading={loading}
              dataSource={materials}
              rowKey={record => record.code}
              pagination={false}
              columns={columns}
            />
          </Col>
        </Row>
        <Row>
          <Col type="title">{this.getDefectTitle(checkType, '不合格率')}</Col>
          <Col type="content">
            {getDefect(checkDefectRate)}
          </Col>
        </Row>
        <Row>
          <Col type="title">{this.getDefectTitle(checkType, '待检率')}</Col>
          <Col type="content">
            {getDefect(waitRate)}
          </Col>
        </Row>
        <Row>
          <Col type="title">{this.getDefectTitle(checkType, '让步合格率')}</Col>
          <Col type="content">
            {getDefect(asStandardRate)}
          </Col>
        </Row>
        <Row>
          <Col type="title">{this.getDefectTitle(checkType, '合格率')}</Col>
          <Col type="content">
            {getDefect(standardRate)}
          </Col>
        </Row>
      </div>
    );
  }
}

MaterialDecision.contextTypes = {
  router: PropTypes.object.isRequired,
};

export default withRouter(MaterialDecision);
