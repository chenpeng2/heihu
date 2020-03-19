import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import {
  message as AntMessage,
  FilterSortSearchBar,
  RestPagingTable,
  withForm,
  Tooltip,
  Popover,
  Select,
  Button,
  Input,
  Badge,
  Alert,
  Link,
  Icon,
  Checkbox,
  FormattedMessage,
} from 'components';
import { Modal } from 'antd';
import { setLocation } from 'utils/url';
import { getLocation, getQuery } from 'src/routes/getRouteParams';
import { white, border, blacklakeGreen } from 'src/styles/color';
import {
  getBarcodeRuleList,
  enableBarcodeLabelRule,
  disableBarcodeLabelRule,
  enableBulkProductBatchCodeRule,
  disableBulkProductBatchCodeRule,
  enableAllProductBatchCodeRule,
  disableAllProductBatchCodeRule,
} from 'src/services/barCodeLabel';
import { replaceSign } from 'src/constants';

import SelectedRuleModal from './selectedRuleModal';
import styles from './styles.scss';

const ItemList = FilterSortSearchBar.ItemList;
const Item = FilterSortSearchBar.Item;
const { Option } = Select;

const statusGroup = [
  {
    key: 2,
    label: '全部',
  },
  {
    key: 1,
    label: '启用中',
  },
  {
    key: 0,
    label: '停用中',
  },
];

const buttonStyle = {
  height: 32,
  lineHeight: '32px',
};

type Props = {
  form: {
    getFieldDecorator: () => {},
    getFieldsValue: () => {},
    getFieldValue: () => {},
  },
};

const basePath = '/electronicTag/ruleDefinition';

class RuleList extends Component {
  props: Props;
  state = {
    showTooltip: false,
    loading: false,
    dataSource: [],
    total: 0,
    isBatchOperation: null,
    isCrosspageSelect: false,
    visible: false,
  };

  componentDidMount = () => {
    this.onReset();
  };

  fetchData = async params => {
    this.setState({ loading: true });
    const { match } = this.props;
    const location = getLocation(match);
    const query = getQuery(match);
    const _params = { ...query, ...params, size: 10 };
    location.query = _params;
    setLocation(this.props, () => location.query);
    const {
      data: { data, total },
    } = await getBarcodeRuleList({ ..._params });
    this.setState(
      {
        dataSource: data,
        loading: false,
        total,
      },
      () => {
        if (this.state.isCrosspageSelect) {
          const selectedRows = this.state.selectedRows || [];
          const _selectedRows = selectedRows.concat(data);
          this.setState({ selectedRows: _.uniqBy(_selectedRows, 'ruleId') });
        }
      },
    );
  };

  enableRule = async ruleId => {
    const {
      data: { data, statusCode },
    } = await enableBarcodeLabelRule(ruleId, false);
    if (statusCode === 200) {
      AntMessage.success('启用成功！');
      this.onSearch();
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
                this.onSearch();
              }
            })
            .catch(console.log);
        },
      });
    }
  };

  disableRule = async ruleId => {
    const {
      data: { statusCode },
    } = await disableBarcodeLabelRule(ruleId);
    if (statusCode === 200) {
      AntMessage.success('停用成功！');
      this.onSearch();
    }
  };

  onReset = () => {
    const {
      form: { resetFields },
    } = this.props;
    resetFields();
    this.onSearch();
  };

  onSearch = () => {
    const {
      form: { getFieldsValue },
    } = this.props;
    const values = getFieldsValue();
    this.fetchData({ ...values, page: 1 });
  };

  getColumns = () => {
    const { changeChineseToLocale } = this.context;
    return [
      {
        title: '规则名称',
        dataIndex: 'ruleName',
      },
      {
        title: '默认规则',
        dataIndex: 'asDefault',
        render: text => changeChineseToLocale(text ? '是' : '否'),
      },
      {
        title: '状态',
        dataIndex: 'status',
        render: text =>
          text === 1 ? <Badge status="success" text="启用中" /> : <Badge status="error" text="停用中" />,
      },
      {
        title: '规则描述',
        dataIndex: 'description',
        render: text => (text ? <Tooltip text={text} length={23} /> : replaceSign),
      },
      {
        title: '操作',
        render: record => {
          return this.renderActions(record);
        },
      },
    ];
  };

  renderActions = ({ ruleId, status }) => {
    const { showTooltip } = this.state;
    const updateAction = status === 1 ? '停用' : '启用';
    const detailPath = `${basePath}/detail/${ruleId}`;
    const editPath = `${basePath}/edit/${ruleId}`;
    return (
      <div>
        <Popover
          cancelText={'知道了'}
          content={this.renderContent()}
          visible={showTooltip}
          overlayStyle={{ width: 253 }}
          placement="topLeft"
        >
          <Link
            style={{ marginRight: 10 }}
            onClick={() => {
              if (status === 1) this.disableRule(ruleId);
              if (status === 0) this.enableRule(ruleId);
            }}
          >
            {updateAction}
          </Link>
        </Popover>
        <Link to={editPath} disabled={status === 1} style={{ marginRight: 10 }}>
          编辑
        </Link>
        <Link to={detailPath}>查看</Link>
      </div>
    );
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

  renderActionButton = () => {
    const {
      form: { getFieldValue },
    } = this.props;
    const { selectedRows, isCrosspageSelect, total, dataSource } = this.state;
    const isEnabled = selectedRows && selectedRows.length && selectedRows.filter(n => n.status === 0).length > 0;
    const isDisabled = selectedRows && selectedRows.length && selectedRows.filter(n => n.status === 1).length > 0;
    const enableProductBatchCodeRule = isCrosspageSelect
      ? enableAllProductBatchCodeRule
      : enableBulkProductBatchCodeRule;
    const disableProductBatchCodeRule = isCrosspageSelect
      ? disableAllProductBatchCodeRule
      : disableBulkProductBatchCodeRule;
    const searchRuleName = getFieldValue('searchRuleName') || '';
    const { changeChineseToLocale } = this.context;

    return (
      <div style={{ display: 'flex', alignItems: 'center', margin: 20, marginTop: 0 }}>
        <Checkbox
          onChange={() => {
            this.setState({
              isCrosspageSelect: !isCrosspageSelect,
              selectedRows: !isCrosspageSelect ? dataSource : [],
            });
          }}
        >
          {changeChineseToLocale('全选')}
        </Checkbox>
        <Button
          style={{ ...buttonStyle, margin: '0 20px' }}
          onClick={() => {
            this.setState({ isBatchOperation: false, isCrosspageSelect: false, selectedRows: [] });
          }}
          type={'default'}
        >
          取消
        </Button>
        {(selectedRows && selectedRows.length) || isCrosspageSelect ? (
          <span
            style={{ marginRight: 20, cursor: !isCrosspageSelect ? 'pointer' : 'auto' }}
            onClick={() => {
              if (!isCrosspageSelect) {
                this.setState({ visible: true });
              }
            }}
          >
            <FormattedMessage
              values={{
                amount: (
                  <span style={{ color: blacklakeGreen }}>{isCrosspageSelect ? total : selectedRows.length}</span>
                ),
              }}
              defaultMessage={'已选择{amount}个结果'}
            />
          </span>
        ) : null}
        <Button
          disabled={!isEnabled}
          style={{ ...buttonStyle, marginRight: 20 }}
          onClick={() => {
            const params = isCrosspageSelect
              ? { searchRuleName, searchStatuses: 0 }
              : selectedRows.map(n => n.ruleId).join(',');
            this.setState({ isBatchOperation: true });
            enableProductBatchCodeRule(params).then(res => {
              const { message } = res.data || {};
              if (message === '成功') {
                this.onSearch();
                this.setState({ selectedRows: [] });
                Modal.success({
                  title: '数据启用成功',
                });
              } else {
                Modal.error({
                  title: '数据启用失败',
                  content: message,
                });
              }
            });
          }}
        >
          {changeChineseToLocale('批量启用')}
        </Button>
        <Button
          disabled={!isDisabled}
          style={{ ...buttonStyle, color: blacklakeGreen }}
          onClick={() => {
            const params = isCrosspageSelect
              ? { searchRuleName, searchStatuses: 'enable' }
              : selectedRows.map(n => n.ruleId).join(',');
            this.setState({ isBatchOperation: true });
            disableProductBatchCodeRule(params).then(res => {
              const { message } = res.data || {};
              if (message === '成功') {
                this.onSearch();
                this.setState({ selectedRows: [] });
                Modal.success({
                  title: '数据停用成功',
                });
              } else {
                Modal.error({
                  title: '数据停用失败',
                  content: message,
                });
              }
            });
          }}
          type={'default'}
        >
          {changeChineseToLocale('批量停用')}
        </Button>
      </div>
    );
  };

  render() {
    const { dataSource, loading, total, isBatchOperation, isCrosspageSelect, visible } = this.state;
    const { changeChineseToLocale } = this.context;
    const _selectedRows = this.state.selectedRows || [];
    const {
      form: { getFieldDecorator },
    } = this.props;
    const columns = this.getColumns();
    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        const multiSelectedRows = _selectedRows.concat(selectedRows);
        this.setState({ selectedRows: _.uniq(multiSelectedRows) });
      },
      onSelect: (record, selected) => {
        if (!selected) {
          this.setState({ selectedRows: _selectedRows.filter(n => n.ruleId !== record.ruleId) });
        }
      },
      onSelectAll: (selected, selectedRows, changeRows) => {
        if (!selected) {
          const diffSelectedRows = _selectedRows.filter(n => {
            return changeRows.map(m => m.ruleId).indexOf(n.ruleId) === -1;
          });
          this.setState({ selectedRows: diffSelectedRows });
        }
      },
      selectedRowKeys: (_selectedRows && _selectedRows.map(n => n.ruleId)) || [],
      getCheckboxProps: () => ({ disabled: isCrosspageSelect }),
    };

    return (
      <div>
        <FilterSortSearchBar style={{ backgroundColor: white, width: '100%' }} searchDisabled>
          <ItemList>
            <Item label="规则名称">
              {getFieldDecorator('searchRuleName')(<Input placeholder={changeChineseToLocale('请输入规则名称')} />)}
            </Item>
            <Item label="状态">
              {getFieldDecorator('searchStatuses', {
                initialValue: 1,
              })(
                <Select>
                  <Option value={null}>{changeChineseToLocale('全部')}</Option>
                  <Option value={1}>{changeChineseToLocale('启用中')}</Option>
                  <Option value={0}>{changeChineseToLocale('停用中')}</Option>
                </Select>,
              )}
            </Item>
          </ItemList>
          <Button
            icon="search"
            style={{ float: 'right', width: 86 }}
            onClick={() => {
              this.onSearch();
            }}
          >
            查询
          </Button>
          <Link
            style={{
              lineHeight: '30px',
              height: '28px',
              color: '#8C8C8C',
              paddingLeft: 16,
            }}
            onClick={this.onReset}
          >
            重置
          </Link>
        </FilterSortSearchBar>
        <div style={{ borderTop: `1px solid ${border}`, padding: '20px 0' }}>
          {!this.state.isBatchOperation ? (
            <div style={{ margin: '0 20px 20px 20px', display: 'flex' }}>
              <Button
                icon="plus-circle-o"
                style={{ ...buttonStyle, marginRight: 20 }}
                onClick={() => {
                  this.context.router.history.push('/electronicTag/ruleDefinition/create');
                }}
              >
                创建成品条码规则
              </Button>
              <Button
                style={buttonStyle}
                onClick={() => {
                  this.setState({ isBatchOperation: true });
                }}
                type={'default'}
              >
                <Icon iconType={'gc'} type={'piliangcaozuo'} />
                {changeChineseToLocale('批量操作')}
              </Button>
            </div>
          ) : (
            this.renderActionButton()
          )}
          <RestPagingTable
            loading={loading}
            dataSource={dataSource}
            total={total}
            columns={columns}
            rowSelection={isBatchOperation ? rowSelection : null}
            rowKey={record => record.ruleId}
            refetch={this.fetchData}
          />
        </div>
        <SelectedRuleModal
          onVisibleChange={value => {
            this.setState({ visible: value });
          }}
          visible={visible}
          data={_selectedRows}
        />
      </div>
    );
  }
}

RuleList.contextTypes = {
  router: PropTypes.object,
  changeChineseToLocale: PropTypes.any,
};

export default withForm({}, withRouter(RuleList));
