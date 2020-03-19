import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import auth from 'utils/auth';
import moment, { formatTodayUnderline } from 'utils/time';
import { withRouter } from 'react-router-dom';
import {
  FilterSortSearchBar,
  Input,
  Checkbox,
  Button,
  withForm,
  Link,
  RestPagingTable,
  Tooltip,
  selectAllExport,
  ImportModal,
} from 'components';
import { queryQcItemsList, importQcItems } from 'src/services/knowledgeBase/qcItems';
import authorityWrapper from 'src/components/authorityWrapper';
import SearchSelect from 'src/components/select/searchSelect';
import { getQuery } from 'src/routes/getRouteParams';
import { replaceSign } from 'src/constants';
import { white } from 'src/styles/color';
import { setLocation } from 'utils/url';
import { isQcItemCodingManually } from 'utils/organizationConfig';
import { qcCheckItemHeaderDesc, qcCheckItemHeader } from './constants';
import { getCreateQcCheckItemUrl, getQcCheckItemImportLogUrl } from '../utils';
import styles from './styles.scss';
import { toQcItemDetail, toEditQcItem, toCopyQcItem } from '../../navigation';

const ItemList = FilterSortSearchBar.ItemList;
const Item = FilterSortSearchBar.Item;

const ButtonWithAuth = authorityWrapper(Button);
const LinkWithAuth = authorityWrapper(Link);

const qcItemsListItem = {
  value: 'qcItemsListItem',
  display: '质检项',
};

type Props = {
  form: {
    getFieldDecorator: () => {},
    resetFields: () => {},
  },
  match: {},
};

class QcItemsList extends Component {
  props: Props;
  state = {
    loading: false,
    isBatchOperation: false,
    isAllChecked: false,
    selectedAmount: 0,
    dataSource: [],
    selectedRows: [],
    total: 0,
  };

  componentDidMount() {
    const { form, match } = this.props;
    const queryMatch = getQuery(match);
    const { setFieldsValue } = form;
    this.fetchData(queryMatch);
    setFieldsValue({ ...queryMatch });
  }

  getColumns = () => {
    return [
      {
        title: '编号',
        dataIndex: 'code',
        key: 'code',
        width: 120,
        render: id => (id ? <Tooltip text={id.toString()} width={110} /> : replaceSign),
      },
      {
        title: '名称',
        dataIndex: 'name',
        key: 'name',
        width: 210,
        render: name => (name ? <Tooltip text={name} width={200} /> : replaceSign),
      },
      {
        title: '分类',
        dataIndex: 'group.name',
        key: 'group.name',
        width: 210,
        render: groupName => (groupName ? <Tooltip text={groupName} width={200} /> : replaceSign),
      },
      {
        title: '备注',
        dataIndex: 'desc',
        key: 'desc',
        width: 400,
        render: desc => (desc ? <Tooltip text={desc} width={390} /> : replaceSign),
      },
      {
        title: '操作',
        width: 140,
        render: record => {
          return (
            <div>
              <LinkWithAuth
                auth={auth.WEB_VIEW_QUALITY_TESTING_POINT}
                style={{ marginRight: 10 }}
                to={toQcItemDetail(record.id)}
              >
                查看
              </LinkWithAuth>
              <LinkWithAuth
                auth={auth.WEB_EDIT_QUALITY_TESTING_CONCERN}
                style={{ marginRight: 10 }}
                to={toEditQcItem(record.id)}
              >
                编辑
              </LinkWithAuth>
              <LinkWithAuth
                auth={auth.WEB_CREATE_QUALITY_TESTING_POINT}
                style={{ marginRight: 10 }}
                to={toCopyQcItem(record.id)}
              >
                复制
              </LinkWithAuth>
            </div>
          );
        },
      },
    ];
  };

  formatData = payloads => {
    payloads.groupId = _.get(payloads, 'groupId.key', undefined);
    return payloads;
  };

  onSearch = () => {
    const { form } = this.props;
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const _format = this.formatData(values);
        this.fetchData({ ..._format, page: 1, size: 10 });
      }
    });
  };

  fetchData = async (params = {}) => {
    setLocation(this.props, p => ({ ...p, ...params }));
    await queryQcItemsList({ ...params })
      .then(({ data: { data, total } }) => {
        this.setState({
          dataSource: data,
          total,
        });
      })
      .catch(e => console.log(e));
  };

  formatExportData = data => {
    const _data = data.map(x => {
      const { code, name, desc } = x || {};
      const groupName = _.get(x, 'group.name');

      return {
        code: isQcItemCodingManually() && code,
        groupName,
        name,
        desc,
      };
    });
    return _data.map(x => _.compact(Object.values(x)));
  };

  handleExport = () => {
    const { match } = this.props;
    const { total, isAllChecked, selectedRows } = this.state;
    const queryMatch = getQuery(match);
    selectAllExport(
      {
        width: '30%',
      },
      {
        selectedAmount: total,
        getExportData: async params => {
          const res = await queryQcItemsList({ ...queryMatch, ...params });
          let exportData;
          if (isAllChecked) {
            exportData = _.get(res, 'data.data');
          } else {
            exportData = selectedRows;
          }
          const values = this.formatExportData(exportData);
          if (isQcItemCodingManually()) {
            qcCheckItemHeaderDesc.unshift('不能为空，最长不超过10个字符');
            qcCheckItemHeader.unshift('编号');
          }
          return [qcCheckItemHeaderDesc, qcCheckItemHeader, ...values];
        },
        fileName: `质检项_${moment().format(formatTodayUnderline())}`,
      },
    );
  };

  renderExport = () => {
    const { isBatchOperation, selectedAmount, isAllChecked, total } = this.state;
    const { changeChineseTemplateToLocale } = this.context;
    return (
      <div style={{ marginRight: 20 }}>
        {isBatchOperation ? (
          <div style={{ display: 'flex', alignItems: 'center', marginLeft: 20 }}>
            <Checkbox
              style={{ marginRight: 23 }}
              checked={isAllChecked}
              onChange={e => {
                const checked = e.target.checked;
                this.setState({ selectedAmount: checked ? total || 0 : 0, isAllChecked: checked, selectedRowKeys: [] });
              }}
            >
              全选
            </Checkbox>
            <Button disabled={selectedAmount === 0} style={{ width: 80, height: 28 }} onClick={this.handleExport}>
              确定
            </Button>
            <Button
              style={{ width: 80, height: 28, margin: '0 20px' }}
              type={'default'}
              onClick={() => {
                this.setState({ isBatchOperation: false, isAllChecked: false });
              }}
            >
              取消
            </Button>
            <span>{changeChineseTemplateToLocale('已选{amount}个', { amount: selectedAmount })}</span>
          </div>
        ) : (
          <Button
            icon="upload"
            ghost
            onClick={() => {
              this.setState({ isBatchOperation: true });
            }}
            disabled={total === 0}
          >
            批量导出
          </Button>
        )}
      </div>
    );
  };

  render() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    const { loading, dataSource, total, selectedRows, isBatchOperation, selectedRowKeys, isAllChecked } = this.state;
    const { history } = this.context.router;
    const columns = this.getColumns();
    const _selectedRows = selectedRows || [];
    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        const newSelectedRows = _.pullAllBy(_selectedRows, dataSource, 'id').concat(selectedRows);
        this.setState({ selectedRows: newSelectedRows, selectedRowKeys, selectedAmount: newSelectedRows.length });
      },
      getCheckboxProps: () => ({
        disabled: isAllChecked,
      }),
      selectedRowKeys,
    };
    const importTitle = ['groupName', 'name', 'desc'];
    if (isQcItemCodingManually()) {
      importTitle.unshift('code');
    }
    return (
      <div
        onKeyDown={e => {
          if (e.keyCode === 13) {
            this.onSearch();
          }
        }}
      >
        <FilterSortSearchBar style={{ backgroundColor: white, width: '100%' }} searchDisabled>
          <ItemList>
            <Item label="编号">{getFieldDecorator('codeSearch')(<Input placeholder="请输入编号" />)}</Item>
            <Item label="分类">
              {getFieldDecorator('groupId', {
                initialValue: undefined,
              })(<SearchSelect placeholder="请选择分类" type="qcItemsGroup" className="select-input" />)}
            </Item>
            <Item label="名称">
              {getFieldDecorator('nameSearch')(<Input onPressEnter={this.onSearch} placeholder="请输入名称" />)}
            </Item>
          </ItemList>
          <ButtonWithAuth auth={auth.VIEW_QUALITY_TESTING_POINT} icon="search" onClick={this.onSearch}>
            查询
          </ButtonWithAuth>
          <Link
            style={{ lineHeight: '30px', height: '28px', color: '#8C8C8C', paddingLeft: 16 }}
            onClick={() => {
              this.props.form.resetFields();
              this.onSearch();
            }}
          >
            重置
          </Link>
        </FilterSortSearchBar>
        <div className={styles.operationLine}>
          <ButtonWithAuth
            auth={auth.WEB_CREATE_QUALITY_TESTING_POINT}
            icon="plus-circle-o"
            style={{ marginRight: 20 }}
            onClick={() => {
              history.push(getCreateQcCheckItemUrl());
            }}
          >
            {`创建${qcItemsListItem.display}`}
          </ButtonWithAuth>
          <ButtonWithAuth
            auth={auth.WEB_CREATE_QUALITY_TESTING_POINT}
            icon="download"
            ghost
            style={{ marginRight: 20 }}
            onClick={() =>
              ImportModal({
                item: '质检项',
                titles: importTitle,
                templateUrl: isQcItemCodingManually()
                  ? 'https://public-template.s3.cn-northwest-1.amazonaws.com.cn/20190614/%E8%B4%A8%E6%A3%80%E9%A1%B9_%E6%89%8B%E5%B7%A5%E8%BE%93%E5%85%A5%E8%B4%A8%E6%A3%80%E9%A1%B9%E7%BC%96%E5%8F%B7.xlsx'
                  : 'https://public-template.s3.cn-northwest-1.amazonaws.com.cn/20190614/%E8%B4%A8%E6%A3%80%E9%A1%B9.xlsx',
                method: importQcItems,
                logUrl: getQcCheckItemImportLogUrl(),
                listName: 'items',
                fileTypes: '.xlsx',
                dataFormat: (data, keys) => {
                  const rs = [];
                  keys.forEach((key, outIndex) => {
                    data.forEach((node, index) => {
                      if (index > 1) {
                        rs[index - 1] = {
                          ...rs[index - 1],
                          [key]: node[outIndex],
                        };
                      }
                    });
                  });
                  return _.compact(rs);
                },
                context: this.context,
              })
            }
          >
            导入
          </ButtonWithAuth>
          {this.renderExport()}
          <Link
            icon="bars"
            style={{ lineHeight: '30px', height: '28px', marginRight: 20 }}
            onClick={() => {
              history.push(getQcCheckItemImportLogUrl());
            }}
          >
            查看导入日志
          </Link>
        </div>
        <RestPagingTable
          loading={loading}
          dataSource={dataSource}
          columns={columns}
          total={total}
          refetch={this.fetchData}
          rowKey={record => record.id}
          rowSelection={isBatchOperation ? rowSelection : null}
        />
      </div>
    );
  }
}

QcItemsList.contextTypes = {
  router: PropTypes.object.isRequired,
  changeChineseTemplateToLocale: PropTypes.func,
};

export default withForm({}, withRouter(QcItemsList));
