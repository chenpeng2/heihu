import React from 'react';
import { Input, withForm, SimpleTable, FilterSortSearchBar, Button, Link, message, SearchSelect } from 'components';
import { getProcessListForSOPTemplate, batchCreateSop } from 'services/knowledgeBase/sopTemplate';
import { requiredRule } from 'components/form';
import Color from 'styles/color';
import { history } from 'routes';
import { toSOPTemplateDetail } from '../utils/navigation';

const Item = FilterSortSearchBar.Item;
const ItemList = FilterSortSearchBar.ItemList;

class BatchCreateSOP extends React.PureComponent {
  state = {
    dataSource: [],
    selectedRowKeys: [],
    loading: false,
  };

  componentDidMount() {
    this.SOPId = this.props.match.params.SOPId;
  }

  handleSearch = async () => {
    const {
      form: { getFieldsValue, validateFields },
    } = this.props;
    validateFields(async (err, value) => {
      if (err) {
        message.error('请选择工序编号');
        return;
      }
      this.setState({ loading: true });
      const {
        data: { data },
      } = await getProcessListForSOPTemplate({ sopTemplateId: this.SOPId, ...value });
      this.setState({
        loading: false,
        dataSource:
          data &&
          data.map(node => ({
            ...node,
            key: JSON.stringify({
              mbomId: node.mbomId,
              nodeCode: node.node.nodeCode,
            }),
          })),
      });
    });
  };

  handleBatchCreate = async () => {
    const { selectedRowKeys } = this.state;
    if (selectedRowKeys.length === 0) {
      message.error('请至少选择一个生产 BOM 的工序');
      return;
    }
    this.setState({ loading: true });
    const {
      data: { data },
    } = await batchCreateSop(this.SOPId, selectedRowKeys.map(node => JSON.parse(node)));
    this.setState({ loading: false });
    message.success('开始批量创建 SOP，预计几分钟后完成');
    history.push(toSOPTemplateDetail(this.SOPId));
  };

  render() {
    const { form } = this.props;
    const { dataSource, loading } = this.state;
    const { getFieldDecorator, resetFields } = form;
    const columns = [
      {
        title: '生产BOM成品物料',
        key: 'materialCode',
        dataIndex: 'materialCode',
        render: (materialCode, { materialName }) => `${materialCode}/${materialName}`,
      },
      { title: '版本号', key: 'version', dataIndex: 'version' },
      { title: '状态', key: 'status', render: () => '未发布' },
      { title: '工艺路线编号', key: 'processRouting', dataIndex: 'processRoutingCode' },
      { title: '工序', key: 'process', dataIndex: 'node.process', render: ({ name, code }) => `${code}/${name}` },
    ];
    return (
      <div>
        <FilterSortSearchBar searchFn={this.handleSearch}>
          <ItemList>
            <Item label="生产BOM成品物料编号">{getFieldDecorator('materialCode')(<Input />)}</Item>
            <Item label="工艺路线编号">{getFieldDecorator('processRoutingCode')(<Input />)}</Item>
            <Item label="工序编号" required>
              {getFieldDecorator('processCode', {
                rules: [requiredRule('工序编号')],
              })(
                <SearchSelect
                  labelInValue={false}
                  type="processName"
                  handleData={data => data.map(({ key, label }) => ({ label: `${key}/${label}`, key }))}
                />,
              )}
            </Item>
          </ItemList>
          <div style={{ display: 'flex', alignItems: 'center', marginTop: -12 }}>
            <Button
              icon="search"
              style={{ marginRight: 10 }}
              onClick={() => {
                this.handleSearch();
              }}
            >
              查询
            </Button>
            <Link
              type={'grey'}
              onClick={() => {
                resetFields();
              }}
            >
              重置
            </Link>
          </div>
        </FilterSortSearchBar>
        <p style={{ margin: '10px 20px', color: Color.alertYellow }}>
          只能查询未发布状态的生产BOM, 且每个SOP模板只能用一个生产BOM一次。
        </p>
        <SimpleTable
          loading={loading}
          columns={columns}
          dataSource={dataSource}
          noDefaultPage
          rowSelection={{
            selections: true,
            onChange: (selectedRowKeys, selectedRows) => {
              this.setState({ selectedRowKeys });
            },
          }}
        />
        <div style={{ margin: 20, display: 'flex', justifyContent: 'center', marginTop: 70 }}>
          <Button type="default" style={{ width: 90, marginRight: 40 }}>
            <Link to={toSOPTemplateDetail(this.SOPId)}>取消</Link>
          </Button>
          <Button onClick={this.handleBatchCreate} style={{ width: 90 }} loading={loading}>
            批量创建
          </Button>
        </div>
      </div>
    );
  }
}

export default withForm({}, BatchCreateSOP);
