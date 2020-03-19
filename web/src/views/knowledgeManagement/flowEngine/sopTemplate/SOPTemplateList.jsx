import React from 'react';
import {
  Button,
  Input,
  FilterSortSearchBar,
  Link,
  SimpleTable,
  Badge,
  withForm,
  Select,
  message,
  FormattedMessage,
} from 'components';
import { sopTemplateList, disableSopTemplate, enableSopTemplate } from 'services/knowledgeBase/sopTemplate';
import { setLocation, getParams } from 'utils/url';
import { replaceSign } from 'constants';
import authWrapper from 'utils/auth/authWrapper';
import auth from 'utils/auth';
import Color from 'styles/color';
import { SOPStatus, SOP_ENABLED_STATUS, SOPFieldType } from '../common/SOPConstant';
import { toSOPTemplateStep } from '../utils/navigation';

const { Item, ItemList } = FilterSortSearchBar;
const Option = Select.Option;
const AuthButton = authWrapper(Button);

class SOPTemplateList extends React.PureComponent {
  state = {
    dataSource: [],
    total: 0,
    loading: false,
  };

  componentDidMount() {
    const {
      form: { setFieldsValue },
    } = this.props;
    const { queryObj } = getParams();
    setFieldsValue(queryObj);
    this.setDataSource(queryObj);
  }

  setDataSource = async params => {
    const {
      form: { setFieldsValue },
    } = this.props;
    this.setState({ loading: true });
    const query = setLocation(this.props, p => ({ page: 1, size: 10, ...p, ...params }));
    const {
      data: { data, total },
    } = await sopTemplateList(query).finally(() => {
      this.setState({ loading: false });
    });
    this.setState({ dataSource: data, total });
  };

  handleUpdateStatus = async (id, status) => {
    this.setState({ loading: true });
    if (status === SOP_ENABLED_STATUS) {
      await disableSopTemplate(id).finally(() => {
        this.setState({ loading: false });
      });
    } else {
      await enableSopTemplate(id).finally(() => {
        this.setState({ loading: false });
      });
    }
    this.setDataSource({});
    message.success('操作成功！');
  };

  columns = [
    { title: '编号', dataIndex: 'code' },
    { title: '名称', dataIndex: 'name' },
    {
      title: '状态',
      dataIndex: 'status',
      render: status => (
        <Badge status={status === SOP_ENABLED_STATUS ? 'success' : 'error'} text={SOPStatus.get(status)} />
      ),
    },
    {
      title: '同步状态',
      dataIndex: 'syncStatus',
      render: syncStatus => <FormattedMessage defaultMessage={syncStatus === 1 ? '同步中' : '空闲'} />,
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
      render: (id, { status, syncStatus }) => (
        <div className="child-gap">
          <Link to={`${location.pathname}/detail/${id}`}>查看</Link>
          {syncStatus !== 1 && (
            <React.Fragment>
              <Link to={`${location.pathname}/edit/${id}`} disabled={status} title="启用中的SOP不能编辑">
                编辑
              </Link>
              <Link to={toSOPTemplateStep(id)} disabled={status} title="启用中的SOP不能编辑">
                步骤
              </Link>
              <Link
                onClick={() => {
                  this.handleUpdateStatus(id, status);
                }}
              >
                {status === SOP_ENABLED_STATUS ? '停用' : '启用'}
              </Link>
            </React.Fragment>
          )}
        </div>
      ),
    },
  ].map(node => ({
    ...node,
    key: node.title,
  }));

  render() {
    const { dataSource, total, loading } = this.state;
    const {
      form: { getFieldDecorator, getFieldsValue, resetFields },
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
        <div style={{ margin: 20 }}>
          <Button auth={auth.WEB_SOP_TEMPLATE_CREATE}>
            <Link auth={auth.WEB_SOP_TEMPLATE_CREATE} icon="plus-circle-o" to={`${location.pathname}/create`}>
              创建SOP模板
            </Link>
          </Button>
        </div>
        <SimpleTable
          loading={loading}
          dataSource={dataSource}
          columns={this.columns}
          pagination={{ total, onChange: current => this.setDataSource({ page: current }) }}
        />
      </div>
    );
  }
}

export default withForm({}, SOPTemplateList);
