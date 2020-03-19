import React from 'react';
import {
  SimpleTable,
  FilterSortSearchBar,
  withForm,
  Input,
  DatePicker,
  Button,
  Checkbox,
  Link,
  Tooltip,
  Select,
  SingleStorageSelect,
  FormattedMessage,
} from 'src/components';
import SearchSelect from 'components/select/searchSelect';
import { getMaterialTraceList } from 'services/systemConfig/materialTrace';
import { setLocation } from 'utils/url';
import { formatToUnix, formatUnixMoment, format } from 'utils/time';
import { replaceSign } from 'src/constants';
import PropTypes from 'prop-types';
import { QUALITY_STATUS, qcStatus } from 'src/views/qualityManagement/constants';
import { MaterialStatus } from './constant';

const ItemList = FilterSortSearchBar.ItemList;
const Item = FilterSortSearchBar.Item;
const RangerPicker = DatePicker.RangePicker;
const CheckboxGroup = Checkbox.Group;
const Option = Select.Option;

class MaterialTraceList extends React.PureComponent<any> {
  state = {
    dataSource: [],
    total: 0,
    loading: false,
  };

  componentDidMount() {
    const {
      match: {
        location: { query },
      },
      form,
    } = this.props;
    const { setFieldsValue } = form;
    const { qcMaterial } = query || {};
    const params = {};
    if (qcMaterial) {
      const name = qcMaterial.split('-')[0];
      const code = qcMaterial.split('-')[1];
      params.materialLots = [code];
      setFieldsValue({ materialLots: [{ key: code, label: `${code}/${name}` }] });
    }
    this.setDataSource({}, true, params);
  }

  setDataSource = async (params, isFirst, initialParams = {}) => {
    this.setState({ loading: true });
    const {
      form: { setFieldsValue },
    } = this.props;
    const { page, ...search } = setLocation(this.props, p => ({ page: 1, ...p, ...params }));
    if (isFirst) {
      setFieldsValue({
        ...search,
        time: search.beginTime && [formatUnixMoment(search.beginTime), formatUnixMoment(search.endTime)],
      });
    }
    const {
      workStationId,
      materialLots,
      lastOperatorId,
      status,
      projectCode,
      purchaseOrderCode,
      qcStatus,
      storageId,
      ...rest
    } = search;
    const {
      data: {
        data: { hits, total },
      },
    } = await getMaterialTraceList(
      { page: page || 1, size: 10 },
      {
        ...rest,
        workStationId: workStationId && workStationId.key,
        materialLots: materialLots && materialLots.map(({ key }) => key),
        lastOperatorId: lastOperatorId && lastOperatorId.key,
        projectCode: projectCode && projectCode.key,
        purchaseOrderCode: purchaseOrderCode && purchaseOrderCode.key,
        status: status && status.indexOf('1') !== -1 ? ['2', '5', '7', ...status] : status,
        qcStatus: qcStatus && [+qcStatus],
        storageId: storageId && storageId.split(',')[0],
        ...initialParams,
      },
    );
    this.setState({ dataSource: hits, total, loading: false });
  };

  renderQcStatusSelect() {
    const { changeChineseToLocale } = this.context;
    const options = Object.entries(QUALITY_STATUS).map(([value, content]) => {
      const { name } = content || {};
      return (
        <Option key={value} value={value}>
          {changeChineseToLocale(name)}
        </Option>
      );
    });
    options.unshift(
      <Option value={null} key={'all'}>
        {changeChineseToLocale('全部')}
      </Option>,
    );

    return <Select>{options}</Select>;
  }

  render() {
    const {
      form: { getFieldDecorator, getFieldsValue },
    } = this.props;
    const { dataSource, total, loading } = this.state;
    const { changeChineseToLocale } = this.context;
    const columns = [
      {
        title: '物料类型',
        dataIndex: 'material_code',
        render: (material_code, { material_name }) => `${material_code}/${material_name}`,
      },
      {
        title: '规格描述',
        dataIndex: 'material_desc',
        render: data => {
          return <Tooltip text={data || replaceSign} length={30} />;
        },
      },
      {
        title: '数量',
        dataIndex: 'amount',
        render: (amount, { material_unit }) => `${amount} ${material_unit || replaceSign}`,
      },
      {
        title: '状态',
        dataIndex: 'status',
        render(status) {
          return <FormattedMessage defaultMessage={MaterialStatus[status]} /> || replaceSign;
        },
      },
      {
        title: '二维码',
        dataIndex: 'qrcode_display',
        render: (qrcode, { id }) => <Link to={`/stock/material-trace/${id}/qrCodeDetail`}>{qrcode}</Link>,
      },
      { title: '库存位置', dataIndex: 'storage_name' },
      {
        title: '质量状态',
        dataIndex: 'qc_status',
        render: status => <FormattedMessage defaultMessage={qcStatus[status]} />,
      },
      { title: '订单号', dataIndex: 'purchase_order_code' },
      { title: '项目号', dataIndex: 'project_code' },
      { title: '生产人员', dataIndex: 'last_operator_name' },
      { title: '生产工位', dataIndex: 'work_station_name' },
      { title: '入厂/产出时间', dataIndex: 'created_at', render: time => format(time) },
      {
        title: '供应商批次',
        dataIndex: 'mfg_batches',
        render: batches =>
          batches && <Tooltip text={batches.map(({ mfgBatchNo }) => mfgBatchNo).join('、')} length={15} />,
      },
      { title: '入厂批次', dataIndex: 'inbound_batch' },
      { title: '生产批次', dataIndex: 'product_batch' },
      {
        title: '原料批次',
        dataIndex: 'raw_product_batches',
        render: batch =>
          batch && <Tooltip text={batch.map(({ productBatch }) => productBatch).join('、')} length={15} />,
      },
    ].map(node => ({
      ...node,
      width: 200,
      render: node.render ? node.render : (text, record) => text || replaceSign,
    }));

    return (
      <div>
        <FilterSortSearchBar>
          <ItemList>
            <Item label="批次">{getFieldDecorator('mfgBatch')(<Input />)}</Item>
            <Item label="物料">
              {getFieldDecorator('materialLots')(<SearchSelect type="materialBySearch" mode="multiple" />)}
            </Item>
            <Item label="二维码">{getFieldDecorator('qrcodeDisplay')(<Input />)}</Item>
            <Item label="项目">{getFieldDecorator('projectCode')(<SearchSelect type="project" />)}</Item>
            <Item label="订单">{getFieldDecorator('purchaseOrderCode')(<SearchSelect type="purchaseOrder" />)}</Item>
            <Item label="生产人">{getFieldDecorator('lastOperatorId')(<SearchSelect type="account" />)}</Item>
            <Item label="产出工位">{getFieldDecorator('workStationId')(<SearchSelect type="workstation" />)}</Item>
            <Item label="产出/入厂时间">{getFieldDecorator('time')(<RangerPicker />)}</Item>
            <Item label="质量状态">{getFieldDecorator('qcStatus')(this.renderQcStatusSelect())}</Item>
            <Item label="库存位置">{getFieldDecorator('storageId')(<SingleStorageSelect />)}</Item>
            <Item
              label="状态"
              wrapperStyle={{ width: 500 }}
              itemWrapperStyle={{ display: 'flex', alignItems: 'center' }}
            >
              {getFieldDecorator('status', {
                initialValue: ['1', '4', '3', '6'],
              })(
                <CheckboxGroup
                  options={[
                    { label: changeChineseToLocale('厂内物料'), value: '1' },
                    { label: changeChineseToLocale('已出厂'), value: '4' },
                    { label: changeChineseToLocale('已投产'), value: '3' },
                    { label: changeChineseToLocale('已置空'), value: '6' },
                  ]}
                />,
              )}
            </Item>
          </ItemList>
          <Button
            icon="search"
            onClick={() => {
              const { time, ...rest } = getFieldsValue();
              let beginTime;
              let endTime;
              if (Array.isArray(time) && time.length > 0) {
                beginTime = formatToUnix(time[0]);
                endTime = formatToUnix(time[1]);
              }
              if (sensors) {
                sensors.track('web_stock_materialTrace_search', {
                  FilterCondition: {
                    endTime,
                    beginTime,
                    ...rest,
                  },
                });
              }
              this.setDataSource({ page: 1, endTime, beginTime, ...rest });
            }}
          >
            查询
          </Button>
        </FilterSortSearchBar>
        <SimpleTable
          loading={loading}
          columns={columns}
          dataSource={dataSource}
          scroll={{ x: columns.length * 200 }}
          pagination={{
            total,
            onChange: current => {
              this.setDataSource({ page: current });
            },
          }}
        />
      </div>
    );
  }
}

MaterialTraceList.contextTypes = {
  changeChineseToLocale: PropTypes.func,
};
export default withForm({}, MaterialTraceList);
