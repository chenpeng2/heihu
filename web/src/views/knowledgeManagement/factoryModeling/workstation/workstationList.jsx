import React from 'react';
import {
  Button,
  Input,
  Select,
  SimpleTable,
  FilterSortSearchBar,
  withForm,
  Link,
  Badge,
  Checkbox,
  message,
} from 'components';
import _ from 'lodash';
import { getWorkstations, addExportWorkstationLog } from 'services/knowledgeBase/workstation';
import { setLocation } from 'utils/url';
import { AREA_DEFINE, replaceSign } from 'src/constants';
import { exportXlsxFile } from 'utils/exportFile';
import ImportModal from './importModal';
import SwitchStatusLink from './switchStatusLink';
import commonStyle from '../index.scss';

const { ItemList, Item } = FilterSortSearchBar;
const { Option } = Select;
const render = text => text || replaceSign;
type propsType = {
  form: any,
};

const xlsxHeader = ['工位编码', '工位名称', '上级区域', '工位组', '二维码', '备注', '多任务工位标识', '报工设备'];

class WorkstationList extends React.Component<propsType> {
  state = {
    dataSource: [],
    fetchData: [],
    count: 0,
    selectedRowKeys: [],
    unSelectedRowKeys: [],
    checkedAll: false,
    inCheck: false,
    params: {},
    importVisible: false,
  };

  componentDidMount() {
    this.setDataSource();
  }

  toggleModalVisible = (importVisible: boolean) => {
    this.setState({ importVisible });
  };

  setDataSource = params => {
    const { form: { setFieldsValue } } = this.props;
    const { checkedAll, unSelectedRowKeys, fetchData } = this.state;
    const p = setLocation(this.props, p => {
      const _params = { ...p, ...params };
      setFieldsValue(_params);
      return { status: 1, page: 1, size: 10, ..._params };
    });
    this.setState({ params: p });
    getWorkstations(p).then(({ data: { data, count } }) => {
      this.setState({ dataSource: data, count, fetchData: _.unionBy(fetchData, data, 'id') });
      if (checkedAll) {
        this.setState({
          selectedRowKeys: _.pullAll(data.map(({ id }) => id), unSelectedRowKeys),
        });
      }
    });
  };

  getColumns = () => [
    { title: '工位名称', key: 'name', dataIndex: 'name', fixed: 'left', width: 140 },
    { title: '工位编码', key: 'code', dataIndex: 'code', width: 140 },
    {
      title: '区域类型',
      key: 'type',
      dataIndex: 'type',
      render: type => AREA_DEFINE[type],
      width: 120,
    },
    { title: '上级区域', key: 'parent', dataIndex: 'parent', width: 130, render },
    { title: '工位组', key: 'group', dataIndex: 'group', width: 140, render },
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
      width: 130,
      render: (id, { status }) => (
        <div className="child-gap">
          <SwitchStatusLink id={id} status={status} refetch={() => this.setDataSource()} />
          <Link to={`${location.pathname}/detail/${id}?from=${location.pathname}`}>查看</Link>
        </div>
      ),
    },
  ];

  getRowSelection = () => {
    const { selectedRowKeys, unSelectedRowKeys } = this.state;
    return {
      selectedRowKeys,
      onSelectAll: (selected, selectedRows, changeRows) => {
        const changeRowIds = changeRows.map(({ id }) => id);
        if (selected) {
          this.setState({
            selectedRowKeys: [...selectedRowKeys, ...changeRowIds],
            unSelectedRowKeys: _.pullAll(unSelectedRowKeys, changeRowIds),
          });
        } else {
          this.setState({
            selectedRowKeys: _.pullAll(selectedRowKeys, changeRowIds),
            unSelectedRowKeys: [...unSelectedRowKeys, ...changeRowIds],
          });
        }
      },
      onSelect: ({ id }, selected, selectedRows) => {
        if (!selected) {
          this.setState({
            selectedRowKeys: _.pull(selectedRowKeys, id),
            unSelectedRowKeys: [...unSelectedRowKeys, id],
          });
        } else {
          this.setState({
            selectedRowKeys: [...selectedRowKeys, id],
            unSelectedRowKeys: _.pull(unSelectedRowKeys, id),
          });
        }
      },
    };
  };

  handleSelectedAll = e => {
    const checked = e.target.checked;
    const { dataSource } = this.state;
    if (checked) {
      this.setState({
        selectedRowKeys: dataSource.map(({ id }) => id),
        checkedAll: true,
        unSelectedRowKeys: [],
      });
    } else {
      this.setState({ selectedRowKeys: [], unSelectedRowKeys: [], checkedAll: false });
    }
  };

  handleExport = async () => {
    const { selectedRowKeys, unSelectedRowKeys, inCheck, checkedAll, params, fetchData } = this.state;
    let exportData = [];
    if (checkedAll) {
      const { data: { data } } = await getWorkstations({ ...params, size: 100000 });
      exportData = data.filter(({ id }) => unSelectedRowKeys.indexOf(id) === -1);
    } else {
      exportData = fetchData.filter(({ id }) => selectedRowKeys.indexOf(id) !== -1);
    }
    if (exportData.length === 0) {
      message.error('请先选择工位');
      return;
    }
    exportXlsxFile(
      [
        xlsxHeader,
        ...exportData.map(({ code, name, parent, group, qrCode, remark, toManyTask, equipmentDTOs }) => [
          code,
          name,
          parent,
          group,
          qrCode,
          remark,
          toManyTask,
          equipmentDTOs && equipmentDTOs.map(({ entity: { name } }) => name).join('、'),
        ]),
      ],
      '工位导出',
    );
    addExportWorkstationLog();
    this.setState({
      inCheck: false,
      selectedRowKeys: [],
      unSelectedRowKeys: [],
    });
  };

  render() {
    const { form: { getFieldDecorator, getFieldsValue } } = this.props;
    const { dataSource, count, inCheck, importVisible } = this.state;
    return (
      <div>
        <FilterSortSearchBar searchDisabled>
          <ItemList>
            <Item label="工位">{getFieldDecorator('key')(<Input />)}</Item>
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
          <div style={{ marginBottom: 20, marginLeft: 20 }}>
            {inCheck ? (
              <div className="child-gap20" style={{ display: 'flex', alignItems: 'center', marginLeft: 33 }}>
                <Checkbox onChange={this.handleSelectedAll}>全选</Checkbox>
                <Button onClick={this.handleExport}>确定</Button>
                <Button
                  ghost
                  onClick={() => {
                    this.setState({
                      selectedRowKeys: [],
                      unSelectedRowKeys: [],
                      inCheck: false,
                    });
                  }}
                >
                  取消
                </Button>
              </div>
            ) : (
              <div className="child-gap20">
                <Button>
                  <Link to={`${location.pathname}/create`} icon="plus-circle-o">
                    创建工位
                  </Link>
                </Button>
                <Button ghost onClick={() => this.setState({ importVisible: true })} icon="download">
                  导入工位
                </Button>
                <Link icon="eye" to={`${location.pathname}/import-log`}>
                  查看导入日志
                </Link>
                <Button ghost onClick={() => this.setState({ inCheck: true })} icon="upload">
                  批量导出
                </Button>
              </div>
            )}
          </div>
          <SimpleTable
            pagination={{ total: count, onChange: page => this.setDataSource({ page }) }}
            dataSource={dataSource}
            columns={this.getColumns()}
            rowKey="id"
            rowSelection={inCheck && this.getRowSelection()}
            scroll={{ x: 1500 }}
          />
        </div>
        <ImportModal visible={importVisible} toggleVisible={this.toggleModalVisible} />
      </div>
    );
  }
}

export default withForm({}, WorkstationList);
