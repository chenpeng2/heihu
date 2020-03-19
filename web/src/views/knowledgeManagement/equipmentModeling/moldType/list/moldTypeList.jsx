import React, { Component } from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { setLocation } from 'utils/url';
import auth from 'utils/auth';
import { getQuery } from 'src/routes/getRouteParams';
import { queryMoldCategoryList } from 'src/services/knowledgeBase/equipment';
import authorityWrapper from 'src/components/authorityWrapper';
import { withForm, Input, Button, RestPagingTable, Link, FilterSortSearchBar } from 'components';
import { borderGrey, middleGrey } from 'src/styles/color';
import { replaceSign } from 'src/constants';

const CreateButton = authorityWrapper(Button);
const DetailLink = authorityWrapper(Link);

const ItemList = FilterSortSearchBar.ItemList;
const Item = FilterSortSearchBar.Item;

const moldTypeItem = {
  value: 'moldType',
  display: '模具类型',
};

type Props = {
  match: {},
  form: {
    getFieldDecorator: () => {},
    resetFields: () => {},
    setFieldsValue: () => {},
  },
};

class MoldTypeList extends Component {
  props: Props;
  state = {
    loading: false,
    dataSource: [],
    total: 0,
  };

  componentDidMount() {
    const { match, form: { setFieldsValue } } = this.props;
    const queryMatch = getQuery(match);
    this.fetchData(queryMatch);
    setFieldsValue({ ...queryMatch });
  }

  fetchData = async (params = {}) => {
    this.setState({ loading: true });
    setLocation(this.props, p => ({ ...p, ...params }));
    const { data: { data, total } } = await queryMoldCategoryList(params);
    this.setState({ dataSource: data, total, loading: false });
  };

  getColumns = () => {
    const columns = [
      {
        title: '模具类型',
        dataIndex: 'name',
        key: 'name',
        render: name => {
          return name || replaceSign;
        },
      },
      {
        title: '操作',
        dataIndex: 'id',
        width: 250,
        fixed: 'right',
        render: (id, record) => {
          return (
            <div key={`action-${record.id}`}>
              <DetailLink
                auth={auth.WEB_VIEW_MOULD}
                style={{ marginRight: 10 }}
                onClick={() => {
                  this.context.router.history.push(`/knowledgeManagement/moldType/${id}/detail`);
                }}
              >
              详情
              </DetailLink>
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
    const { form: { getFieldDecorator, resetFields } } = this.props;
    return (
      <div>
        <FilterSortSearchBar searchDisabled>
          <ItemList>
            <Item label={'类型名称'}>
              {getFieldDecorator('searchContent')(
                <Input placeholder="请输入类型名称" />)}
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
          <span
            style={{
              color: middleGrey,
              cursor: 'pointer',
              paddingLeft: 16,
              lineHeight: '32px',
            }}
            onClick={() => {
              resetFields();
              this.fetchData({ page: 1, size: 10, searchContent: null });
            }}
          >
            重置
          </span>
        </FilterSortSearchBar>
        <div style={{ display: 'flex', padding: 20, justifyContent: 'space-between', borderTop: `1px solid ${borderGrey}` }}>
          <CreateButton
            auth={auth.WEB_ADD_MOULD}
            icon="plus-circle-o"
            onClick={() => {
              this.context.router.history.push('/knowledgeManagement/moldType/create');
            }}
          >
            {`创建${moldTypeItem.display}`}
          </CreateButton>
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

MoldTypeList.contextTypes = {
  router: PropTypes.object.isRequired,
};

export default withForm({}, withRouter(MoldTypeList));
