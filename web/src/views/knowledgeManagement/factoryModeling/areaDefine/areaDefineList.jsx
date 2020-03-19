import React from 'react';
import { Button, Input, Select, SimpleTable, FilterSortSearchBar, withForm, Link, Badge, openModal } from 'components';
import _ from 'lodash';
import { AREA_DEFINE, replaceSign } from 'src/constants';
import {
  getAreaList,
  getWorkShopChildren,
  getProdLineChildren,
  getDisabledAreaList,
} from 'services/knowledgeBase/area';
import WorkshopSwitchStatusLink from '../workshop/switchStatusLink';
import ProdLineSwitchStatusLink from '../prodLine/switchStatusLink';
import WorkstationSwitchStatusLink from '../workstation/switchStatusLink';
import CreateChildrenAreaForm from './createChildrenArea';

const { Option } = Select;
const { ItemList, Item } = FilterSortSearchBar;
type propsType = {
  form: any,
};

class AreaDefineList extends React.Component<propsType> {
  state = {
    dataSource: [],
    expandedRowKeys: [],
    enabled: true,
    key: '',
  };

  componentDidMount() {
    this.setDataSource();
  }

  setDataSource = async () => {
    const { enabled } = this.state;
    const {
      form: { getFieldsValue },
    } = this.props;
    const { key } = getFieldsValue();
    if (enabled === false) {
      const {
        data: { data },
      } = await getDisabledAreaList();
      this.setState({ dataSource: data });
    } else {
      const {
        data: { data },
      } = await getAreaList({ key: key || undefined, enabled });
      if (key) {
        this.setState({ dataSource: [data] });
      } else {
        data.children =
          data.children &&
          data.children.map(node => ({
            ...node,
            key: `${node.type}/${node.id}`,
          }));
        this.setState({
          dataSource: [{ ...data, key: `${data.type}/${data.id}` }],
          expandedRowKeys: [`${data.type}/${data.id}`],
        });
      }
    }
  };

  highlight = (text, keyword) => {
    if (text || keyword) {
      return text.split(keyword).map((frag, index) => {
        if (index > 0) {
          return (
            <span key={index}>
              <span style={{ color: 'green' }}>{keyword}</span>
              {frag}
            </span>
          );
        }
        return frag;
      });
    }
    return text;
  };

  getColumns = () => {
    const { enabled, key } = this.state;
    const columns = [
      {
        title: '区域名称',
        key: 'name',
        dataIndex: 'name',
        fixed: 'left',
        width: 200,
        render: text => <span style={{ wordBreak: 'break-all' }}>{this.highlight(text, key)}</span>,
      },
      {
        title: '区域编码',
        key: 'code',
        dataIndex: 'code',
        width: 150,
        render: text => (text ? <span>{this.highlight(text, key)}</span> : replaceSign),
      },
      {
        title: '区域类型',
        key: 'type',
        dataIndex: 'type',
        render: type => (type ? AREA_DEFINE[type] : replaceSign),
        width: 120,
      },
      {
        title: '上级区域',
        key: 'parent',
        dataIndex: 'parent',
        width: 120,
        render: text => text || replaceSign,
      },
      {
        title: '二维码',
        key: 'qrCode',
        dataIndex: 'qrCode',
        width: 180,
        render: text => text || replaceSign,
      },
      {
        title: '状态',
        key: 'status',
        width: 120,
        dataIndex: 'status',
        render: (status, { type }) => {
          if (type === 'ORGANIZATION') {
            return replaceSign;
          }
          const statusMap = {
            0: <Badge status="error" text="停用中" />,
            1: <Badge status="success" text="启用中" />,
            2: <Badge status="default" text="草稿" />,
          };
          return statusMap[status];
        },
      },
      { title: '备注', key: 'remark', dataIndex: 'remark', render: text => text || replaceSign },
      {
        title: '操作',
        key: 'id',
        width: 180,
        fixed: 'right',
        dataIndex: 'id',
        render: (id, { type, name, key, status }) => {
          let base = '';
          let StatusSwitch = null;
          if (type === 'WORKSHOP') {
            base = 'workshop';
            StatusSwitch = WorkshopSwitchStatusLink;
          } else if (type === 'PRODUCTION_LINE') {
            base = 'prod-line';
            StatusSwitch = ProdLineSwitchStatusLink;
          } else if (type === 'WORKSTATION') {
            base = 'workstation';
            StatusSwitch = WorkstationSwitchStatusLink;
          }
          const refetch = data => {
            this.setState({ dataSource: this.replaceTreeNode(this.state.dataSource, data) });
            this.setState({ expandedRowKeys: _.pull(this.state.expandedRowKeys, key) });
          };
          return (
            <span className="child-gap" style={{ textAlign: 'right' }}>
              {type !== 'WORKSTATION' && (
                <Link
                  disabled={status !== 1}
                  onClick={() => {
                    openModal({
                      children: (
                        <CreateChildrenAreaForm
                          parentAreaType={type}
                          parent={{ name, id, key, type }}
                          setDataSource={this.setDataSource}
                          handleChildren={this.handleChildren}
                        />
                      ),
                      footer: null,
                      title: '创建子区域',
                    });
                  }}
                >
                  创建子区域
                </Link>
              )}
              {StatusSwitch && <StatusSwitch id={id} status={status} refetch={refetch} />}
              {type !== 'ORGANIZATION' && (
                <Link to={`${location.pathname}/${base}/detail/${id}?from=${location.pathname}`}>查看</Link>
              )}
            </span>
          );
        },
      },
    ];
    return enabled === false ? columns : columns.filter(({ key }) => key !== 'parent');
  };

  replaceTreeNode = (orginalData, updateData) => {
    const uniqueKey = `${updateData.type}/${updateData.id}`;
    return orginalData.map(node => {
      if (`${node.type}/${node.id}` === uniqueKey) {
        return {
          ...updateData,
          key: uniqueKey,
          children: updateData.type === 'WORKSTATION' ? null : [],
        };
      } else if (_.get(node, 'children.length', 0) > 0) {
        return { ...node, children: this.replaceTreeNode(node.children, updateData) };
      }
      return node;
    });
  };

  recureData = (data, key, children) => {
    return data.map(node => {
      const uniqueKey = `${node.type}/${node.id}`;
      if (`${node.type}/${node.id}` === key) {
        return { ...node, children, key: uniqueKey };
      } else if (node.children) {
        return { ...node, children: this.recureData(node.children, key, children) };
      }
      return node;
    });
  };

  handleChildren = async ({ type, id, key }) => {
    const { enabled } = this.state;
    let expandData = [];
    if (type === 'WORKSHOP') {
      // handle workshop expanded
      expandData = await getWorkShopChildren(id, { enabled });
    } else if (type === 'PRODUCTION_LINE') {
      // handle prodLine expanded
      expandData = await getProdLineChildren(id, { enabled });
    }
    const data = this.recureData(
      this.state.dataSource,
      key,
      expandData.data.data.map(node => ({ ...node, key: `${node.type}/${node.id}` })),
    );
    this.setState({
      dataSource: data,
    });
  };

  handleExpandStatus = (expand, key) => {
    const { expandedRowKeys } = this.state;
    if (expand) {
      this.setState({ expandedRowKeys: [...expandedRowKeys, key] });
    } else {
      this.setState({ expandedRowKeys: _.pull(expandedRowKeys, key) });
    }
  };

  render() {
    const {
      form: { getFieldDecorator, getFieldsValue, setFieldsValue },
    } = this.props;
    const { dataSource, expandedRowKeys, enabled, key } = this.state;
    return (
      <div>
        <FilterSortSearchBar searchDisabled>
          <ItemList>
            <Item label="区域">{getFieldDecorator('key')(<Input />)}</Item>
            <Item label="状态">
              {getFieldDecorator('enabled', {
                initialValue: true,
              })(
                <Select>
                  <Option value="all">全部</Option>
                  <Option value>启用中</Option>
                  <Option value={false}>停用中</Option>
                </Select>,
              )}
            </Item>
          </ItemList>
          <Button
            icon="search"
            onClick={() => {
              const { enabled, key } = getFieldsValue();
              if (key) {
                this.setState({ enabled: null, expandedRowKeys: [], key }, this.setDataSource);
                setFieldsValue({ enabled: 'all' });
              } else {
                this.setState(
                  { enabled: enabled === 'all' ? null : enabled, expandedRowKeys: [], key },
                  this.setDataSource,
                );
              }
            }}
          >
            查询
          </Button>
        </FilterSortSearchBar>
        <div>
          {enabled === false || key ? (
            <SimpleTable
              key={JSON.stringify(dataSource)}
              defaultExpandAllRows
              scroll={{ x: 1400 }}
              dataSource={dataSource}
              pagination={false}
              columns={this.getColumns()}
              rowKey={({ id, type }) => `${type}/${id}`}
            />
          ) : (
            <SimpleTable
              expandIconAsCell
              key={JSON.stringify(dataSource)}
              scroll={{ x: 1400 }}
              rowKey={({ id, type }) => `${type}/${id}`}
              expandedRowKeys={expandedRowKeys}
              dataSource={dataSource}
              pagination={false}
              columns={this.getColumns()}
              onExpand={async (expanded, record) => {
                const { key } = record;
                this.handleExpandStatus(expanded, key);
                if (expanded && _.get(record, 'children.length', 0) === 0) {
                  this.handleChildren(record);
                }
              }}
            />
          )}
        </div>
      </div>
    );
  }
}

export default withForm({}, AreaDefineList);
