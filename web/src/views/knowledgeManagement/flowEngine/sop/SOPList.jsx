import React from 'react';
import {
  Button,
  Input,
  FilterSortSearchBar,
  Link,
  Table,
  Badge,
  withForm,
  Select,
  message,
  FormattedMessage,
} from 'components';
import { getSOPList, enableSOP, disableSOP, batchEnableSOP, batchDisableSOP } from 'services/knowledgeBase/sop';
import { setLocation, getParams } from 'utils/url';
import { replaceSign } from 'constants';
import authWrapper from 'utils/auth/authWrapper';
import auth from 'utils/auth';
import SearchSelect from 'components/select/searchSelect';
import Color from 'styles/color';
import { extraSearchForMBom } from 'containers/productivityStandard/base/processSelect';
import { SOPStatus, SOP_ENABLED_STATUS, SOPFieldType, SOPBusinessObjectType } from '../common/SOPConstant';

const { Item, ItemList } = FilterSortSearchBar;
const Option = Select.Option;
const AuthButton = authWrapper(Button);

class SOPList extends React.PureComponent {
  state = {
    dataSource: [],
    total: 0,
    batchEditMode: false,
    selectedRowKeys: [],
    loading: false,
    page: 1,
  };

  componentDidMount() {
    const {
      form: { setFieldsValue },
    } = this.props;
    const { queryObj } = getParams();
    setFieldsValue(queryObj);
    this.setDataSource(queryObj);
  }

  setDataSource = async (params = {}) => {
    const {
      form: { setFieldsValue },
    } = this.props;
    this.setState({ loading: true });
    const query = setLocation(this.props, p => ({ page: 1, size: 10, ...p, ...params }));
    const { templateId, mbomId } = query || {};
    const {
      data: { data, total },
    } = await getSOPList({ ...query, templateId: templateId && templateId.key, mbomId: mbomId && mbomId.key });
    this.setState({ dataSource: data, total, loading: false, page: query.page });
  };

  handleUpdateStatus = async (id, status) => {
    this.setState({ loading: true });
    if (status === SOP_ENABLED_STATUS) {
      await disableSOP(id).finally(() => {
        this.setState({ loading: false });
      });
    } else {
      await enableSOP(id).finally(() => {
        this.setState({ loading: false });
      });
    }
    this.setDataSource({});
    message.success('操作成功！');
  };

  setBatchEditMode = mode => this.setState({ batchEditMode: mode, selectedRowKeys: [] });

  batchHandleStatus = async type => {
    const { selectedRowKeys } = this.state;
    this.setState({ loading: true });
    const handleApi = type === 'enable' ? batchEnableSOP : batchDisableSOP;
    const {
      data: { data },
    } = await handleApi(selectedRowKeys).finally(() => {
      this.setState({ loading: false });
    });
    this.setState({ selectedRowKeys: [], batchEditMode: false });
    message.success(`开始批量${type === 'enable' ? '启用' : '停用'} SOP，预计几分钟后完成`);
    this.setDataSource();
  };

  columns = [
    { title: '编号', dataIndex: 'code' },
    { title: '名称', dataIndex: 'name' },
    { title: '版本号', dataIndex: 'version' },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: status => (
        <Badge status={status === SOP_ENABLED_STATUS ? 'success' : 'error'} text={SOPStatus.get(status)} />
      ),
    },
    {
      title: 'SOP模板',
      dataIndex: 'sopTemplate',
      render: sopTemplate => (sopTemplate ? `${sopTemplate.code}/${sopTemplate.name}` : replaceSign),
    },
    {
      title: '同步状态',
      dataIndex: 'sopTemplate',
      width: 100,
      render: sopTemplate => {
        if (!sopTemplate) {
          return replaceSign;
        }
        return <FormattedMessage defaultMessage={sopTemplate.syncStatus === 1 ? '同步中' : '空闲'} />;
      },
    },
    {
      title: '业务实体',
      dataIndex: 'businessObjectType',
      render: (type, { mbom, node }) => {
        if (!mbom) {
          return replaceSign;
        }
        const { materialCode, materialName, version } = mbom;
        const {
          process: { code, name },
        } = node;
        return `${materialCode}/${materialName}/${version} - ${code}/${name}`;
      },
    },
    {
      title: '操作',
      dataIndex: 'id',
      width: 180,
      fixed: 'right',
      render: (id, { status, sopTemplate }) => (
        <div className="child-gap">
          <Link to={`${location.pathname}/detail/${id}`}>查看</Link>
          <Link to={`${location.pathname}/edit/${id}`} disabled={status} title="启用中的SOP不能编辑">
            编辑
          </Link>
          <Link to={`${location.pathname}/edit-sop-step/${id}`} disabled={status} title="启用中的SOP不能编辑">
            步骤
          </Link>
          <Link
            onClick={() => {
              this.handleUpdateStatus(id, status);
            }}
          >
            {status === SOP_ENABLED_STATUS ? '停用' : '启用'}
          </Link>
        </div>
      ),
    },
  ].map(node => ({
    width: 150,
    ...node,
    key: node.title,
  }));

  render() {
    const { dataSource, total, batchEditMode, selectedRowKeys, loading, page } = this.state;
    const {
      form: { getFieldDecorator, getFieldsValue, resetFields, getFieldValue },
    } = this.props;
    return (
      <div>
        <FilterSortSearchBar style={{ borderBottom: `1px solid ${Color.border}`, marginBottom: 10 }}>
          <ItemList>
            <Item label="编号">{getFieldDecorator('code')(<Input />)}</Item>
            <Item label="名称">{getFieldDecorator('name')(<Input />)}</Item>
            <Item label="状态">
              {getFieldDecorator('status', {
                initialValue: null,
              })(
                <Select
                  options={[
                    { value: null, label: '全部' },
                    ...Array.from(SOPStatus, ([value, label]) => ({ value, label })),
                  ]}
                />,
              )}
            </Item>
            <Item label="版本号">{getFieldDecorator('version')(<Input />)}</Item>
            <Item label="SOP模板">{getFieldDecorator('templateId')(<SearchSelect type="sopTemplate" />)}</Item>
            <Item label="业务实体" wrapperStyle={{ width: '100%' }}>
              <div className="child-gap">
                {getFieldDecorator('businessObjectType', {
                  initialValue: 1,
                })(<Select options={[{ label: '生产BOM', value: 1 }]} />)}
                {getFieldDecorator('mbomId')(
                  <SearchSelect
                    style={{ width: 400 }}
                    extraSearch={params => extraSearchForMBom({ ...params, status: 0 })}
                  />,
                )}
              </div>
            </Item>
          </ItemList>
          <div className="child-gap">
            <Button
              icon="search"
              onClick={() => {
                this.setDataSource({ page: 1, ...getFieldsValue() });
              }}
            >
              查询
            </Button>
            <Link
              type="grey"
              onClick={() => {
                resetFields();
                this.setDataSource({ page: 1, ...getFieldsValue() });
              }}
            >
              重置
            </Link>
          </div>
        </FilterSortSearchBar>
        <div style={{ margin: 20 }} className="child-gap">
          {batchEditMode ? (
            <React.Fragment>
              <Button onClick={() => this.batchHandleStatus('enable')}>批量启用</Button>
              <Button onClick={() => this.batchHandleStatus('disable')}>批量停用</Button>
              <Button type="default" onClick={() => this.setBatchEditMode(false)}>
                取消
              </Button>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <Button auth={auth.WEB_SOP_CREATE}>
                <Link icon="plus-circle-o" to={`${location.pathname}/create`} auth={auth.WEB_SOP_CREATE}>
                  创建SOP
                </Link>
              </Button>
              <Button onClick={() => this.setBatchEditMode(true)} icon="piliangcaozuo" iconType="gc" type="default">
                批量操作
              </Button>
            </React.Fragment>
          )}
        </div>
        <Table
          dragable
          tableUniqueKey="sop-list-table"
          loading={loading}
          dataSource={dataSource}
          columns={this.columns}
          rowKey="id"
          pagination={{ total, onChange: current => this.setDataSource({ page: current }), current: page }}
          rowSelection={
            batchEditMode
              ? {
                  selectedRowKeys,
                  onChange: selectedRowKeys => this.setState({ selectedRowKeys }),
                }
              : undefined
          }
          refetch={this.setDataSource}
        />
      </div>
    );
  }
}

export default withForm({}, SOPList);
