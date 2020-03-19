import React from 'react';
import { Button, Input, Select, SimpleTable, FilterSortSearchBar, withForm, Link, Badge } from 'components';
import { setLocation } from 'utils/url';
import { AREA_DEFINE, replaceSign } from 'src/constants';
import { getProdLines } from 'services/knowledgeBase/prodLine';
import SwitchStatusLink from './switchStatusLink';
import commonStyle from '../index.scss';

const Option = Select.Option;
const { ItemList, Item } = FilterSortSearchBar;
const render = text => text || replaceSign;
type propsType = {
  form: any,
};

class ProdLineList extends React.PureComponent<propsType> {
  state = { dataSource: [], count: 0 };

  componentDidMount() {
    this.setDataSource();
  }

  setDataSource = params => {
    const { form: { setFieldsValue } } = this.props;
    const p = setLocation(this.props, p => {
      const _params = { ...p, ...params };
      setFieldsValue(_params);
      return { status: 1, page: 1, size: 10, ..._params };
    });
    getProdLines(p).then(({ data: { data, count } }) => {
      this.setState({ dataSource: data, count });
    });
  };

  getColumns = () => [
    { title: '产线名称', key: 'name', dataIndex: 'name', fixed: 'left', width: 140 },
    { title: '产线编码', key: 'code', dataIndex: 'code', width: 140 },
    {
      title: '区域类型',
      key: 'type',
      dataIndex: 'type',
      render: type => AREA_DEFINE[type],
      width: 120,
    },
    { title: '上级区域', key: 'parent', dataIndex: 'parent', width: 130, render },
    { title: '负责人', key: 'manager', dataIndex: 'manager', width: 120, render },
    { title: '二维码', key: 'qrCode', dataIndex: 'qrCode', render },
    {
      title: '状态',
      key: 'status',
      width: 120,
      dataIndex: 'status',
      render: status => {
        const statusMap = {
          0: <Badge status="error" text="停用中" />,
          1: <Badge status="success" text="启用中" />,
          2: <Badge status="default" text="草稿" />,
        };
        return statusMap[status];
      },
    },
    { title: '备注', key: 'remark', dataIndex: 'remark', render },
    {
      title: '操作',
      key: 'id',
      dataIndex: 'id',
      fixed: 'right',
      width: 140,
      render: (id, { type, status }) => (
        <div className="child-gap">
          <SwitchStatusLink
            id={id}
            type={type}
            refetch={() => this.setDataSource()}
            status={status}
          />
          <Link to={`${location.pathname}/detail/${id}?from=${location.pathname}`}>查看</Link>
        </div>
      ),
    },
  ];

  render() {
    const { form: { getFieldDecorator, getFieldsValue } } = this.props;
    const { dataSource, count } = this.state;
    return (
      <div>
        <FilterSortSearchBar searchDisabled>
          <ItemList>
            <Item label="产线">{getFieldDecorator('key')(<Input />)}</Item>
            <Item label="状态">
              {getFieldDecorator('status', {
                initialValue: 1,
              })(
                <Select>
                  <Option value={null}>全部</Option>
                  <Option value={1}>启用中</Option>
                  <Option value={0}>停用中</Option>
                  <Option value={2}>草稿</Option>
                </Select>,
              )}
            </Item>
          </ItemList>
          <Button
            icon="search"
            onClick={() => {
              this.setDataSource({ page: 1, ...getFieldsValue() });
            }}
          >
            查询
          </Button>
        </FilterSortSearchBar>
        <div>
          <div>
            <Button className={commonStyle.tableButton}>
              <Link icon="plus-circle-o" to={`${location.pathname}/create`}>
                创建产线
              </Link>
            </Button>
          </div>
          <SimpleTable
            dataSource={dataSource}
            columns={this.getColumns()}
            scroll={{ x: 1500 }}
            pagination={{
              total: count,
              onChange: page => this.setDataSource({ page }),
            }}
          />
        </div>
      </div>
    );
  }
}

export default withForm({}, ProdLineList);
