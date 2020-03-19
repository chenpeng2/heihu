import * as React from 'react';
import {
  FilterSortSearchBar,
  withForm,
  Input,
  Button,
  SimpleTable,
  Link,
  Select,
  DatePicker,
  Badge,
  Tooltip,
} from 'components';
import { getMouldList } from 'src/services/equipmentMaintenance/mould';
import { getValidDeviceCategoryList } from 'src/services/equipmentMaintenance/repairTask';
import SearchSelect from 'components/select/searchSelect';
import { setLocation } from 'utils/url';
import auth from 'utils/auth';
import { formatRangeUnix, formatUnixMoment } from 'utils/time';
import { DEVICE_ENABLE_STATUS, replaceSign } from 'constants';
import styles from './index.scss';

type propsType = {
  form: any,
};

const { ItemList, Item } = FilterSortSearchBar;
const { Option } = Select;
const { RangePicker } = DatePicker;

class MouldList extends React.Component<propsType> {
  state = {
    dataSource: [],
    total: 0,
    loading: false,
  };

  componentDidMount() {
    this.setDataSource({});
  }

  setDataSource = async params => {
    this.setState({ loading: true });
    const {
      form: { setFieldsValue },
    } = this.props;
    const _params = setLocation(this.props, p => ({ page: 1, ...p, ...params, size: 10 }));
    setFieldsValue({
      ..._params,
      firstEnableDateFrom: [
        _params.firstEnableDateFrom && formatUnixMoment(_params.firstEnableDateFrom),
        _params.firstEnableDateTill && formatUnixMoment(_params.firstEnableDateTill),
      ],
    });
    const {
      data: { data, total },
    } = await getMouldList(_params);
    this.setState({ dataSource: data, total, loading: false });
  };

  getColumns = () => [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: text => <Tooltip length={15} text={text} />,
    },
    {
      title: '编码',
      dataIndex: 'code',
      key: 'code',
      render: text => <Tooltip length={15} text={text} />,
    },
    {
      title: '类型',
      dataIndex: 'categoryName',
      key: 'categoryName',
      render: text => <Tooltip length={15} text={text} />,
    },
    {
      title: '电子标签',
      dataIndex: 'qrcode',
      key: 'qrcode',
      render: text => <Tooltip length={15} text={text} />,
    },
    {
      title: '制造商',
      dataIndex: 'manufacturerName',
      key: 'manufacturerName',
      render: text => <Tooltip length={15} text={text || replaceSign} />,
    },
    {
      title: '启用状态',
      dataIndex: 'enableStatus',
      width: 80,
      key: 'enableStatus',
      render: status => {
        const statusMap = {
          1: 'warning',
          2: 'success',
          3: 'error',
        };
        return (
          <span>
            <Badge status={statusMap[status]} />
            {DEVICE_ENABLE_STATUS[status]}
          </span>
        );
      },
    },
    {
      title: '操作',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      render: id => {
        return (
          <div className="child-gap">
            <Link to={`/equipmentMaintenance/mould/detail/${id}`}>详情</Link>
            <Link to={`/equipmentMaintenance/mould/mould-log/${id}`}>日志</Link>
          </div>
        );
      },
    },
  ];

  render() {
    const {
      form: { getFieldDecorator, getFieldsValue },
    } = this.props;
    const { dataSource, total, loading } = this.state;
    return (
      <div>
        <FilterSortSearchBar searchDisabled>
          <ItemList>
            <Item label="模具类型">
              {getFieldDecorator('searchCategoryId')(
                <SearchSelect
                  type="deviceCategory"
                  params={{ searchType: 'mould' }}
                  placeholder="请选择类型"
                  labelInValue={false}
                />,
              )}
            </Item>
            <Item label="模具名称">{getFieldDecorator('searchName')(<Input />)}</Item>
            <Item label="模具编码">{getFieldDecorator('searchCode')(<Input />)}</Item>
            <Item label="启用状态">
              {getFieldDecorator('searchEnableStatus', {
                initialValue: null,
              })(
                <Select>
                  <Option value={null}>全部</Option>
                  {Object.keys(DEVICE_ENABLE_STATUS).map(key => (
                    <Option value={key} key={key}>
                      {DEVICE_ENABLE_STATUS[key]}
                    </Option>
                  ))}
                </Select>,
              )}
            </Item>
            <Item label="制造商">
              {getFieldDecorator('searchManufacturerId')(<SearchSelect type="manufacturer" labelInValue={false} />)}
            </Item>
            <Item label="模具型号">{getFieldDecorator('searchModel')(<Input />)}</Item>
            <Item label="序列号">{getFieldDecorator('searchSerialNumber')(<Input />)}</Item>
            <Item label="首次启用时间">{getFieldDecorator('firstEnableDateFrom')(<RangePicker />)}</Item>
          </ItemList>
          <Button
            icon="search"
            onClick={() => {
              const { firstEnableDateFrom } = getFieldsValue();
              this.setDataSource({
                ...getFieldsValue(),
                firstEnableDateFrom: firstEnableDateFrom[0] && formatRangeUnix(firstEnableDateFrom)[0],
                firstEnableDateTill: firstEnableDateFrom[0] && formatRangeUnix(firstEnableDateFrom)[1],
                page: 1,
              });
            }}
          >
            查询
          </Button>
        </FilterSortSearchBar>
        <div className={styles.listContainer}>
          <div style={{ margin: 20 }}>
            <Button auth={auth.WEB_ADD_MOULD}>
              <Link to="/equipmentMaintenance/mould/add" icon="plus-circle-o">
                创建模具
              </Link>
            </Button>
          </div>
          <SimpleTable
            rowKey="id"
            loading={loading}
            columns={this.getColumns()}
            dataSource={dataSource}
            pagination={{
              total,
              onChange: page => this.setDataSource({ page }),
            }}
          />
        </div>
      </div>
    );
  }
}

export default withForm({}, MouldList);
