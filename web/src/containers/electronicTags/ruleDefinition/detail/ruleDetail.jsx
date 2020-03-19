import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Spin, Modal } from 'antd';
import { replaceSign } from 'src/constants';
import { error, primary, white } from 'src/styles/color';
import { getBarcodeLabelRuleDetail, enableBarcodeLabelRule, disableBarcodeLabelRule } from 'src/services/barCodeLabel';
import { Row, Col, Table, Popover, Link, Button, Alert, message as AntMessage } from 'components';
import {
  VARIABLE_VALUE_SOURCE,
  DATE_VALUE_SOURCE,
  ITEM_TYPE,
  SEQUENCE_TYPE,
  DATE_VALUE_FORMAT,
  LETTER_VALUE_FORMAT,
} from '../../constant';
import styles from '../styles.scss';
import Actions from './actions';

const basePath = '/electronicTag/ruleDefinition';

type Props = {
  match: any,
};

class RuleDetail extends Component {
  props: Props;
  state = {
    data: {},
    loading: false,
    dataSource: [],
    total: 0,
    showTooltip: false,
  };

  componentDidMount = () => {
    this.fetchData();
  };

  fetchData = async () => {
    const {
      match: {
        params: { id },
      },
    } = this.props;
    this.setState({ loading: true });
    const {
      data: { data },
    } = await getBarcodeLabelRuleDetail(id);
    this.setState({ data, dataSource: data.items, loading: false });
  };

  getColumns = () => {
    const { changeChineseToLocale } = this.context;
    return [
      {
        title: '序号',
        render: (text, record, index) => index + 1,
      },
      {
        title: '类型',
        dataIndex: 'itemType',
        render: text => ITEM_TYPE[text] ? changeChineseToLocale(ITEM_TYPE[text]) : replaceSign,
      },
      {
        title: '元素来源',
        dataIndex: 'valueSource',
        render: text => _.merge(VARIABLE_VALUE_SOURCE, DATE_VALUE_SOURCE)[text] ? changeChineseToLocale(_.merge(VARIABLE_VALUE_SOURCE, DATE_VALUE_SOURCE)[text]) : replaceSign,
      },
      {
        title: '长度',
        dataIndex: 'valueLength',
        render: text => text || replaceSign,
      },
      {
        title: '格式',
        dataIndex: 'valueFormat',
        render: text => _.merge(DATE_VALUE_FORMAT, LETTER_VALUE_FORMAT)[text] || replaceSign,
      },
      {
        title: '设置值',
        dataIndex: 'valueConst',
        render: text => text || replaceSign,
      },
      {
        title: '起始值',
        dataIndex: 'valueStart',
        render: text => text || replaceSign,
      },
      {
        title: '步长',
        dataIndex: 'valueStep',
        render: text => text || replaceSign,
      },
      {
        title: '流水码制',
        dataIndex: 'valueSeqType',
        render: text => SEQUENCE_TYPE[text] ? changeChineseToLocale(SEQUENCE_TYPE[text]) : replaceSign,
      },
    ];
  };

  enableRule = async ruleId => {
    const {
      data: { data, statusCode },
    } = await enableBarcodeLabelRule(ruleId, false);
    if (statusCode === 200) {
      AntMessage.success('启用成功！');
      this.fetchData();
    }
    if (statusCode === 202) {
      Modal.confirm({
        iconType: 'exclamation-circle',
        className: `${styles.enableModal}`,
        title: '',
        content: `已配置默认编码规则${data.ruleName}，是否确定替代原编码规则？`,
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          enableBarcodeLabelRule(ruleId, true)
            .then(({ data: { statusCode } }) => {
              if (statusCode === 200) {
                AntMessage.success('启用成功！');
                this.fetchData();
              }
            })
            .catch(console.log);
        },
      });
    }
  };

  disableRule = async ruleId => {
    const {
      data: { message },
    } = await disableBarcodeLabelRule(ruleId);
    if (message === '成功') {
      AntMessage.success('停用成功！');
      this.fetchData();
    }
  };

  renderContent = () => {
    return (
      <div style={{ height: 90 }}>
        <div>
          <Alert
            style={{ width: 234, background: white, border: 'none' }}
            showIcon
            type={'error'}
            message={'停用失败！'}
          />
        </div>
        <Button
          size={'small'}
          style={{ float: 'right' }}
          type={'default'}
          onClick={() => {
            this.setState({ showTooltip: false });
          }}
        >
          {'知道了'}
        </Button>
      </div>
    );
  };

  renderStatus = status => {
    const display = status === 1 ? '启用中' : '停用中';
    const updateAction = status === 1 ? '停用' : '启用';
    const { showTooltip } = this.state;
    const { changeChineseToLocale } = this.context;

    return (
      <div>
        <span>{changeChineseToLocale(display)}</span>
        <Popover
          cancelText={'知道了'}
          content={this.renderContent()}
          visible={showTooltip}
          overlayStyle={{ width: 253 }}
          placement="topLeft"
        >
          <Link
            style={{ marginLeft: 20, color: showTooltip ? error : primary }}
            onClick={() => {
              const {
                match: {
                  params: { id },
                },
              } = this.props;
              if (status === 1) this.disableRule(id);
              if (status === 0) this.enableRule(id);
            }}
          >
            {updateAction}
          </Link>
        </Popover>
      </div>
    );
  };

  render() {
    const { data, dataSource, loading, total } = this.state;
    const {
      match: {
        params: { id },
      },
    } = this.props;
    const { changeChineseToLocale } = this.context;
    const editPath = `${basePath}/detail/${id}/edit`;
    const logPath = `${basePath}/detail/${id}/logs/operate`;
    const { status, ruleName, asDefault, description } = data;
    const columns = this.getColumns();
    return (
      <Spin spinning={loading}>
        <div className={styles.pageStyle}>
          <div className={styles.pageHeader}>
            <p>{changeChineseToLocale('成品条码规则详情')}</p>
            <Actions editPath={editPath} logPath={logPath} status={status} />
          </div>
          <Row>
            <Col type="title">规则名称</Col>
            <Col type="content" style={{ width: 620 }}>
              {ruleName || replaceSign}
            </Col>
          </Row>
          <Row>
            <Col type="title">默认规则</Col>
            <Col type="content" style={{ width: 620 }}>
              {asDefault === 1 ? '是' : '否'}
            </Col>
          </Row>
          <Row>
            <Col type="title">状态</Col>
            <Col type="content" style={{ width: 620 }}>
              {this.renderStatus(status)}
            </Col>
          </Row>
          <Row>
            <Col type="title">规则描述</Col>
            <Col type="content" style={{ width: 620 }}>
              {description || replaceSign}
            </Col>
          </Row>
          <Row>
            <Col type="title">规则明细</Col>
            <Col type="content" style={{ width: 620 }}>
              <Table
                style={{ margin: 0, maxWidth: 800 }}
                scroll={{ x: true }}
                dataSource={dataSource}
                columns={columns}
                total={total}
                pagination={false}
                rowKey={record => record.id}
                footer={this.getFooter}
              />
            </Col>
          </Row>
        </div>
      </Spin>
    );
  }
}

RuleDetail.contextTypes = {
  changeChineseToLocale: PropTypes.any,
};

export default RuleDetail;
