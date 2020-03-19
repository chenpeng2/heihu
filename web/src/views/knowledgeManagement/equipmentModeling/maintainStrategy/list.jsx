import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  getStrategyGroupApplicationList,
  enableStrategyGroup,
  disableStrategyGroup,
} from 'src/services/equipmentMaintenance/base';
import {
  Popover,
  Alert,
  RestPagingTable,
  FilterSortSearchBar,
  Link,
  withForm,
  Input,
  Button,
  Icon,
  openModal,
  Select,
} from 'src/components';
import { injectIntl } from 'react-intl';
import { changeChineseToLocale } from 'utils/locale/utils';
import { setLocation } from 'utils/url';
import { replaceSign } from 'src/constants';
import { white, borderGrey } from 'src/styles/color/index';
import { getQuery } from 'src/routes/getRouteParams';
import ChangeStrategyModal from './changeStrategyModal';
import { STRATEGY_APPLiCATION_SCOPE, findStrategyApplicationScope } from './constants';
import styles from './styles.scss';

const ItemList = FilterSortSearchBar.ItemList;
const Item = FilterSortSearchBar.Item;

type Props = {
  form: {},
  intl: any,
  match: any,
};

class MaintainStrategy extends Component {
  props: Props;
  state = {
    data: [],
    total: 0,
    visible: false,
    selectId: null,
  };

  componentDidMount() {
    const {
      form: { setFieldsValue },
    } = this.props;
    const queryMatch = getQuery(this.props.match);
    setFieldsValue(queryMatch);
    this.fetchData(queryMatch);
  }

  fetchData = params => {
    if (params && params.searchCategoryType === 0) {
      delete params.searchCategoryType;
    }
    getStrategyGroupApplicationList({ params }).then(res => {
      const { data, total } = res.data;
      this.setState({ data, total });
    });
  };

  hide = () => {
    this.setState({ visible: false });
  };

  open = () => {
    this.setState({ visible: true });
  };

  getColumns = () => {
    const { intl } = this.props;
    const { visible, selectId } = this.state;
    return [
      {
        title: '策略组',
        dataIndex: 'title',
      },
      {
        title: '适用范围',
        dataIndex: 'categoryType',
        render: categoryType =>
          changeChineseToLocale(findStrategyApplicationScope(categoryType).label, intl) || replaceSign,
      },
      {
        title: '策略数量',
        dataIndex: 'strategyCount',
      },
      {
        title: '操作',
        width: 200,
        key: 'operation',
        render: (__, record) => {
          const { disabledApplicationCount, enabledApplicationCount } = record;
          return (
            <div>
              {!(disabledApplicationCount === 0 && enabledApplicationCount === 0) ? (
                <Popover
                  trigger={'click'}
                  content={this.renderContent(record.title, record.id)}
                  visible={visible && selectId === record.id}
                >
                  <Link
                    onClick={() => {
                      this.setState({ selectId: record.id });
                      if (enabledApplicationCount === 0) {
                        enableStrategyGroup([record.id]).finally(() => {
                          this.fetchData();
                          this.hide();
                        });
                      } else {
                        this.open();
                      }
                    }}
                  >
                    {enabledApplicationCount !== 0 ? '停用' : '启用'}
                  </Link>
                </Popover>
              ) : (
                replaceSign
              )}
              <Link
                style={{ marginLeft: 20 }}
                onClick={() => {
                  openModal(
                    {
                      title: '编辑策略组',
                      width: 500,
                      children: <ChangeStrategyModal fetchData={this.fetchData} data={record} type="edit" />,
                      footer: null,
                      getContainer: () => document.getElementById('strategy'),
                    },
                    this.context,
                  );
                }}
              >
                编辑
              </Link>
            </div>
          );
        },
      },
    ];
  };

  renderContent = (title, id) => {
    const { changeChineseTemplateToLocale } = this.context;
    return (
      <div>
        <Alert
          style={{ width: 204, background: white, border: 'none' }}
          message={changeChineseTemplateToLocale('确定停用策略组<{title}>吗？', { title })}
          showIcon
          type={'warning'}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button type={'default'} size={'small'} style={{ marginRight: 10 }} onClick={this.hide}>
            取消
          </Button>
          <Button
            size={'small'}
            onClick={() => {
              disableStrategyGroup([id]).finally(() => {
                this.fetchData();
                this.hide();
              });
            }}
          >
            确定
          </Button>
        </div>
      </div>
    );
  };

  renderButton = () => {
    const { form } = this.props;
    const { getFieldsValue } = form;
    return (
      <div>
        <Button
          style={{ width: 130 }}
          onClick={() => {
            const value = getFieldsValue();
            this.fetchData({ ...value, size: 10, page: 1 });
            setLocation(this.props, p => ({ ...p, ...value, size: 10, page: 1 }));
          }}
          icon={'search'}
        >
          查询
        </Button>
      </div>
    );
  };

  render() {
    const { form, intl } = this.props;
    const { getFieldDecorator } = form;
    const { data, total } = this.state;
    const columns = this.getColumns();

    return (
      <div id="strategy" className={styles.strategy}>
        <FilterSortSearchBar
          style={{ backgroundColor: white, width: '100%', borderBottom: `1px solid ${borderGrey}`, marginBottom: 20 }}
          searchDisabled
        >
          <ItemList>
            <Item label="策略组">{getFieldDecorator('searchContent')(<Input placeholder="请输入" />)}</Item>
            <Item label="适用范围">
              {getFieldDecorator('searchCategoryType')(
                <Select placeholder={changeChineseToLocale('请输入', intl)}>
                  {Object.values(STRATEGY_APPLiCATION_SCOPE).map(({ key, label }) => (
                    <Select.Option key={key} value={key}>
                      {changeChineseToLocale(label, intl)}
                    </Select.Option>
                  ))}
                </Select>,
              )}
            </Item>
          </ItemList>
          {this.renderButton()}
        </FilterSortSearchBar>
        <Button
          icon="plus-circle-o"
          style={{ margin: '0 0 20px 20px' }}
          onClick={() => {
            openModal(
              {
                title: '创建策略组',
                width: 500,
                children: <ChangeStrategyModal fetchData={this.fetchData} type="create" />,
                footer: null,
                getContainer: () => document.getElementById('strategy'),
              },
              this.context,
            );
          }}
        >
          创建策略组
        </Button>
        <RestPagingTable
          columns={columns}
          dataSource={Array.isArray(data) ? data : []}
          total={total}
          refetch={this.fetchData}
        />
      </div>
    );
  }
}

MaintainStrategy.contextTypes = {
  router: PropTypes.object,
  changeChineseTemplateToLocale: PropTypes.any,
};

export default withForm({}, injectIntl(MaintainStrategy));
