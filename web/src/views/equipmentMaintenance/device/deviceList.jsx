import * as React from 'react';
import PropTypes from 'prop-types';
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
  ImportModal,
} from 'components';
import auth from 'utils/auth';
import { injectIntl } from 'react-intl';
import { changeChineseToLocale } from 'utils/locale/utils';
import { getDevices, importDevice } from 'src/services/equipmentMaintenance/device';
import SearchSelect from 'components/select/searchSelect';
import { warning, error, primary } from 'src/styles/color';
import { setLocation } from 'utils/url';
import { formatRangeUnix, formatUnixMoment } from 'utils/time';
import { DEVICE_ENABLE_STATUS, replaceSign } from 'constants';
import styles from './index.scss';

type propsType = {
  form: any,
  intl: any,
  match: any,
  history: any,
};

const { ItemList, Item } = FilterSortSearchBar;
const { Option } = Select;
const { RangePicker } = DatePicker;

class DeviceList extends React.Component<propsType> {
  state = {
    dataSource: [],
    total: 0,
    loading: false,
  };

  componentDidMount() {
    const {
      match: { location },
      form: { setFieldsValue },
    } = this.props;
    const { query } = location || {};
    if (query && query.value) {
      const value = JSON.parse(query.value);
      const { searchDeviceCategory, searchWorkshop, searchDevice } = value || {};
      const params = {
        searchCategoryId: searchDeviceCategory && searchDeviceCategory.key,
        searchWorkshopId: searchWorkshop && searchWorkshop.key,
        searchName: searchDevice && searchDevice.label,
      };
      setFieldsValue(params);
      this.setDataSource(params);
    } else {
      this.setDataSource({});
    }
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
    } = await getDevices(_params);
    const dataSource = data.map(({ entity, modules }) => ({
      ...entity,
      key: entity.id,
      level: 1,
      children: modules.length > 0 && modules.map(module => ({ ...module, key: module.id })),
    }));
    this.setState({ dataSource, total, loading: false });
  };

  getColumns = () => [
    {
      title: '设备名称',
      dataIndex: 'name',
      key: 'name',
      render: text => <Tooltip length={15} text={text} />,
    },
    {
      title: '设备编码',
      dataIndex: 'code',
      key: 'code',
      render: text => <Tooltip length={15} text={text} />,
    },
    {
      title: '设备类型',
      dataIndex: 'category.name',
      key: 'category',
      render: text => <Tooltip length={15} text={text} />,
    },
    {
      title: '电子标签',
      dataIndex: 'qrcode',
      key: 'qrcode',
      render: text => <Tooltip length={15} text={text || replaceSign} />,
    },
    {
      title: '车间',
      dataIndex: 'workshop.name',
      key: 'workshop',
      render: text => <Tooltip length={15} text={text || replaceSign} />,
    },
    {
      title: '制造商',
      dataIndex: 'manufacturer.name',
      key: 'manufacturer',
      render: text => <Tooltip length={15} text={text || replaceSign} />,
    },
    {
      title: '启用状态',
      dataIndex: 'enableStatus',
      key: 'enableStatus',
      width: 120,
      render: (status, { level }) => {
        const { intl } = this.props;
        const statusMap = {
          1: warning,
          2: primary,
          3: error,
        };
        return level === 1 ? (
          <Badge.MyBadge color={statusMap[status]} text={changeChineseToLocale(DEVICE_ENABLE_STATUS[status], intl)} />
        ) : (
          replaceSign
        );
      },
    },
    {
      title: '操作',
      dataIndex: 'id',
      key: 'id',
      width: 150,
      render: (id, { level }) => {
        const type = level === 1 ? 'device' : 'module';
        return (
          <div className="child-gap">
            <Link to={`/equipmentMaintenance/device/detail/${type}/${id}`}>详情</Link>
            <Link to={`/equipmentMaintenance/device/devicelog/${type}/${id}`}>日志</Link>
          </div>
        );
      },
    },
  ];

  render() {
    const {
      form: { getFieldDecorator, getFieldsValue },
      history,
      intl,
    } = this.props;
    const { dataSource, total, loading } = this.state;
    return (
      <div>
        <FilterSortSearchBar searchDisabled>
          <ItemList>
            <Item label="设备类型">
              {getFieldDecorator('searchCategoryId')(
                <SearchSelect
                  type="deviceCategory"
                  params={{ searchResourceCategory: 'equipmentProd' }}
                  placeholder="请选择类型"
                  labelInValue={false}
                />,
              )}
            </Item>
            <Item label="设备名称">{getFieldDecorator('searchName')(<Input />)}</Item>
            <Item label="设备编码">{getFieldDecorator('searchCode')(<Input />)}</Item>
            <Item label="启用状态">
              {getFieldDecorator('searchEnableStatus', {
                initialValue: null,
              })(
                <Select allowClear>
                  <Option value={null}>{changeChineseToLocale('全部', intl)}</Option>
                  {Object.keys(DEVICE_ENABLE_STATUS).map(key => (
                    <Option value={key} key={key}>
                      {changeChineseToLocale(DEVICE_ENABLE_STATUS[key], intl)}
                    </Option>
                  ))}
                </Select>,
              )}
            </Item>
            <Item label="制造商">
              {getFieldDecorator('searchManufacturerId')(<SearchSelect type="manufacturer" labelInValue={false} />)}
            </Item>
            <Item label="设备型号">{getFieldDecorator('searchModel')(<Input />)}</Item>
            <Item label="序列号">{getFieldDecorator('searchSerialNumber')(<Input />)}</Item>
            <Item label="车间">
              {getFieldDecorator('searchWorkshopId')(<SearchSelect type="workshop" labelInValue={false} />)}
            </Item>
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
            <Button auth={auth.WEB_ADD_EQUIPMENT}>
              <Link icon="plus-circle-o" to="/equipmentMaintenance/device/add">
                创建设备
              </Link>
            </Button>
            <Button
              icon="download"
              ghost
              style={{ margin: '0 20px' }}
              onClick={() =>
                ImportModal({
                  item: '设备基础数据',
                  titles: ['code', 'name', 'category', 'qrcode', 'model', 'workshop', 'manufacturer', 'description'],
                  templateUrl:
                    'https://s3.cn-northwest-1.amazonaws.com.cn/public-template/20190213/%E7%94%9F%E4%BA%A7%E8%AE%BE%E5%A4%87%E5%AF%BC%E5%85%A5%E6%A8%A1%E6%9D%BF.csv',
                  logUrl: '/equipmentMaintenance/device/importLog',
                  method: importDevice,
                  fileTypes: '.csv',
                  context: this.context,
                  listName: 'list',
                })
              }
            >
              导入
            </Button>
            <Link
              icon="eye-o"
              style={{ lineHeight: '30px', height: '28px' }}
              onClick={() => {
                history.push('/equipmentMaintenance/device/importLog');
              }}
            >
              查看导入日志
            </Link>
          </div>
          <SimpleTable
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

DeviceList.contextTypes = {
  router: PropTypes.any,
};

export default withForm({}, injectIntl(DeviceList));
