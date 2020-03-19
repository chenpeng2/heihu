import * as React from 'react';
import {
  FilterSortSearchBar,
  withForm,
  SimpleTable,
  Select,
  Button,
  DatePicker,
  Tooltip,
} from 'components';
import { setLocation } from 'utils/url';
import { getPathname, getQuery } from 'src/routes/getRouteParams';
import { formatToUnix, formatUnix, formatUnixMoment } from 'utils/time';
import SearchSelect from 'components/select/searchSelect';
import { getEquipmentSparePartsChangeList, getModuleSparePartsChangeList } from 'services/equipmentMaintenance/spareParts';
import { replaceSign } from '../../../constants';

const { ItemList, Item } = FilterSortSearchBar;
const { Option } = Select;
const { RangePicker } = DatePicker;

type propsType = {
  form: any,
  match: {
    params: {
      id: string,
    },
  },
  match: any,
};

class SparePartsChangeLog extends React.Component<propsType> {
  state = {
    total: 0,
    page: 1,
    loading: false,
  };

  componentDidMount() {
    const { form: { setFieldsValue }, match } = this.props;
    const query = getQuery(match);
    const params = this.formatValues(query);
    setFieldsValue({
      ...query,
      time: [
        params.createdAtFrom && formatUnixMoment(params.createdAtFrom),
        params.createdAtFrom && formatUnixMoment(params.createdAtTill),
      ],
    });
    this.setDataSource(params);
  }

  setDataSource = async params => {
    this.setState({ loading: true });
    const { match: { params: { id } }, match } = this.props;
    const pathname = getPathname(match);
    const getSparePartsChangeList = pathname.indexOf('module') !== -1 ? getModuleSparePartsChangeList : getEquipmentSparePartsChangeList;
    getSparePartsChangeList(id, params)
      .then(res => {
        const { data: { data, total } } = res;
        this.setState({ dataSource: data, total });
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  formatValues = values => {
    const params = {};
    Object.keys(values).forEach(prop => {
      if (values[prop]) {
        if (prop === 'time') {
          params.createdAtFrom = values[prop][0];
          params.createdAtTill = values[prop][1];
        } else {
          params[prop] = values[prop].key;
        }
      }
    });
    return params;
  }

  render() {
    const { form: { getFieldDecorator, getFieldsValue } } = this.props;
    const { dataSource, total, loading, page } = this.state;
    const columns = [
      { title: '操作时间', width: 200, dataIndex: 'createdAt', render: time => formatUnix(time) },
      {
        title: '更换备件',
        width: 300,
        dataIndex: 'materialCode',
        render: (materialCode, record) => <div>{`${record.materialName}（${materialCode}）`}</div>,
      },
      { title: '数量', width: 200, dataIndex: 'amount', render: (amount, record) => <div>{amount}{record.unit || replaceSign}</div> },
      { title: '操作人', width: 200, dataIndex: 'operatorName' },
      { title: '描述', dataIndex: 'remark', render: remark => <Tooltip text={remark || replaceSign} length={20} /> },
    ];
    return (
      <div>
        <FilterSortSearchBar searchDisabled>
          <ItemList>
            <Item label="备件">
              {getFieldDecorator('searchMaterialCode')(
                <SearchSelect type="spareParts" />,
              )}
            </Item>
            <Item label="操作人">
              {getFieldDecorator('searchOperatorId')(
                <SearchSelect type="account" />,
              )}
            </Item>
            <Item label="时间范围">
              {getFieldDecorator('time')(<RangePicker />)}
            </Item>
          </ItemList>
          <Button
            icon="search"
            onClick={() => {
              const values = getFieldsValue();
              if (values.time) {
                values.time = [values.time[0] && formatToUnix(values.time[0]), values.time[1] && formatToUnix(values.time[1])];
              }
              setLocation(this.props, () => ({ page: 1, size: 10, ...values }));
              const params = this.formatValues(values);
              this.setDataSource({ ...params, page: 1 });
            }}
          >
            查询
          </Button>
        </FilterSortSearchBar>
        <div>
          <SimpleTable
            columns={columns}
            rowKey="id"
            dataSource={dataSource}
            pagination={{
              current: page,
              total,
              onChange: page => {
                this.setDataSource({ page });
                this.setState({ page });
              },
            }}
            loading={loading}
          />
        </div>
      </div>
    );
  }
}

export default withForm({}, SparePartsChangeLog);
