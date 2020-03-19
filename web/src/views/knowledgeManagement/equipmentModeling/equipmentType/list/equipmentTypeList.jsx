import React, { Component } from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { getQuery } from 'src/routes/getRouteParams';
import { setLocation } from 'utils/url';
import { injectIntl } from 'react-intl';
import { changeChineseToLocale } from 'utils/locale/utils';
import auth from 'utils/auth';
import { queryEquipmentCategoryList } from 'src/services/knowledgeBase/equipment';
import { EQUIPMENT_TYPE_CATEGORY } from 'src/views/equipmentMaintenance/constants';
import { Button, RestPagingTable, Link, FilterSortSearchBar, Input, withForm, Select } from 'components';
import authorityWrapper from 'src/components/authorityWrapper';
import { borderGrey, middleGrey } from 'src/styles/color';
import { replaceSign } from 'src/constants';

const ButtonWrapper = authorityWrapper(Button);
const DetailWrapper = authorityWrapper(Link);

const ItemList = FilterSortSearchBar.ItemList;
const Item = FilterSortSearchBar.Item;
const Option = Select.Option;

const equipmentTypeItem = {
  value: 'equipmentType',
  display: '设备类型',
};

type Props = {
  match: {},
  intl: any,
  form: {
    getFieldDecorator: () => {},
    resetFields: () => {},
    setFieldsValue: () => {},
  },
};

class EquipmentTypeList extends Component {
  props: Props;
  state = {
    loading: false,
    dataSource: [],
    total: 0,
  };

  componentDidMount() {
    const {
      match,
      form: { setFieldsValue },
    } = this.props;
    const queryMatch = getQuery(match);
    this.fetchData(queryMatch);
    setFieldsValue({ ...queryMatch });
  }

  fetchData = async (params = {}) => {
    this.setState({ loading: true });
    setLocation(this.props, p => ({ ...p, ...params }));
    const {
      data: { data, total },
    } = await queryEquipmentCategoryList(params);
    this.setState({ dataSource: data, total, loading: false });
  };

  getColumns = () => {
    const { intl } = this.props;
    const columns = [
      {
        title: '设备类型',
        dataIndex: 'name',
        key: 'name',
        render: name => {
          return name || replaceSign;
        },
      },
      {
        title: '资源类别',
        dataIndex: 'resourceCategory',
        key: 'resourceCategory',
        render: resourceCategory =>
          resourceCategory === 'equipmentProd'
            ? changeChineseToLocale('生产设备', intl)
            : changeChineseToLocale('设备组件', intl) || replaceSign,
      },
      {
        title: '操作',
        dataIndex: 'id',
        render: (id, record) => {
          return (
            <div key={`action-${record.id}`}>
              <DetailWrapper
                auth={auth.WEB_VIEW_EQUIPMENT}
                style={{ marginRight: 10 }}
                onClick={() => {
                  this.context.router.history.push(
                    `/knowledgeManagement/equipmentType/${id}/detail?resourceCategory=${record.resourceCategory}`,
                  );
                }}
              >
                详情
              </DetailWrapper>
            </div>
          );
        },
      },
    ];
    return columns;
  };

  render() {
    const { dataSource, total, loading } = this.state;
    const columns = this.getColumns();
    const {
      form: { getFieldDecorator, resetFields },
      intl,
    } = this.props;

    return (
      <div>
        <FilterSortSearchBar searchDisabled>
          <ItemList>
            <Item label={'类型名称'}>{getFieldDecorator('searchContent')(<Input placeholder="请输入类型名称" />)}</Item>
            <Item label={'资源类别'}>
              {getFieldDecorator('searchResourceCategory')(
                <Select showSearch placeholder={changeChineseToLocale('请选择资源类别', intl)}>
                  {Object.keys(EQUIPMENT_TYPE_CATEGORY).map(prop => (
                    <Option value={prop}>
                      {changeChineseToLocale(changeChineseToLocale(EQUIPMENT_TYPE_CATEGORY[prop], intl), intl)}
                    </Option>
                  ))}
                </Select>,
              )}
            </Item>
          </ItemList>
          <Button
            icon="search"
            onClick={() => {
              const { form } = this.props;
              form.validateFieldsAndScroll((err, values) => {
                if (!err) {
                  const _values = _.omit(values, _.isUndefined);
                  this.fetchData({ page: 1, size: 10, ...values });
                }
              });
            }}
          >
            查询
          </Button>
          <Link
            style={{
              color: middleGrey,
              cursor: 'pointer',
              paddingLeft: 16,
              lineHeight: '32px',
            }}
            onClick={() => {
              resetFields();
              this.fetchData({ page: 1, size: 10, searchContent: null, searchResourceCategory: null });
            }}
          >
            重置
          </Link>
        </FilterSortSearchBar>
        <div
          style={{
            display: 'flex',
            padding: 20,
            justifyContent: 'space-between',
            borderTop: `1px solid ${borderGrey}`,
          }}
        >
          <ButtonWrapper
            auth={auth.WEB_ADD_EQUIPMENT}
            icon="plus-circle-o"
            onClick={() => {
              this.context.router.history.push('/knowledgeManagement/equipmentType/create');
            }}
          >
            {`创建${equipmentTypeItem.display}`}
          </ButtonWrapper>
        </div>
        <RestPagingTable
          loading={loading}
          dataSource={dataSource}
          columns={columns}
          total={total}
          refetch={this.fetchData}
        />
      </div>
    );
  }
}

EquipmentTypeList.contextTypes = {
  router: PropTypes.object.isRequired,
};

export default withForm({}, withRouter(injectIntl(EquipmentTypeList)));
