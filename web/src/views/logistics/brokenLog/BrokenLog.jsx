import React from 'react';
import {
  Input,
  SimpleTable,
  Button,
  FilterSortSearchBar,
  withForm,
  DatePicker,
  Link,
} from 'components';
import SearchSelect from 'components/select/searchSelect';
import { setLocation, getParams } from 'utils/url';
import { format, formatToUnix, formatUnixMoment } from 'utils/time';
import { getReceiveDamageRecords } from 'services/shipment/receiptTask';
import { getSendDamageRecords } from 'services/shipment/sendTask';
import AttachmentLink from '../component/AttachmentLink';

const ItemList = FilterSortSearchBar.ItemList;
const Item = FilterSortSearchBar.Item;
const RangePicker = DatePicker.RangePicker;

class BrokenLog extends React.PureComponent<any> {
  state = {
    dataSource: [],
    total: 0,
  };

  componentDidMount() {
    const { queryObj } = getParams();
    const { createdAtFrom, createdAtTill } = queryObj || {};
    const init = { page: 1, ...queryObj };
    this.props.form.setFieldsValue({
      ...init,
      time: createdAtFrom ? [formatUnixMoment(createdAtFrom), formatUnixMoment(createdAtTill)] : [],
    });
    this.setDataSource();
  }

  setDataSource = async _params => {
    const { type } = this.props;
    const params = { page: 1, ...getParams().queryObj, ..._params };
    setLocation(this.props, params);
    const fetchData = type === 'receipt' ? getReceiveDamageRecords : getSendDamageRecords;
    const { data: { data, total } } = await fetchData({ size: 10, ...params });
    this.setState({ dataSource: data, total });
  };

  getColumns = ({ type }) => {
    return [
      {
        title: '物料类型',
        dataIndex: 'materialCode',
        render: (materialCode, { materialName }) => `${materialCode}/${materialName}`,
      },
      { title: '破损原因', dataIndex: 'damageReasonName', key: 'damageReasonName' },
      {
        title: '破损数量',
        dataIndex: 'amount',
        key: 'amount',
        render: (amount, { damageReasonUnit }) => `${amount} ${damageReasonUnit || ''}`,
      },
      { title: '记录人员', dataIndex: 'operatorName', key: 'operatorName' },
      { title: '记录时间', dataIndex: 'createdAt', render: time => format(time), key: 'createdAt' },
      {
        title: '上传照片',
        dataIndex: 'attachments',
        render: attachments => <AttachmentLink attachments={attachments} />,
      },
      {
        title: `${type === 'send' ? '发运' : '收货'}任务ID`,
        dataIndex: 'taskId',
        render: taskId => <Link to={`/logistics/${type}-task/detail/${taskId}`}>{taskId}</Link>,
      },
    ];
  };

  render() {
    const { form: { getFieldDecorator, getFieldsValue }, type } = this.props;
    const { dataSource, total } = this.state;
    return (
      <div>
        <FilterSortSearchBar searchDisabled>
          <ItemList>
            <Item label="物料类型">
              {getFieldDecorator('searchMaterialCode')(
                <SearchSelect type="materialBySearch" labelInValue={false} />,
              )}
            </Item>
            <Item label="破损原因">
              {getFieldDecorator('searchDamageReasonId')(
                <SearchSelect type="receiveDamageReason" labelInValue={false} />,
              )}
            </Item>
            <Item label="记录人员">
              {getFieldDecorator('searchOperatorId')(
                <SearchSelect type="user" labelInValue={false} />,
              )}
            </Item>
            <Item label="记录时间">
              {getFieldDecorator('time')(<RangePicker showTime format="YYYY-MM-DD HH:mm:ss" />)}
            </Item>
            <Item label={`${type === 'send' ? '发运' : '收货'}任务ID`}>
              {getFieldDecorator('searchTaskId')(<Input />)}
            </Item>
          </ItemList>
          <Button
            icon="search"
            onClick={() => {
              const params = getFieldsValue();
              const { time } = params;
              const searchParams = {
                ...params,
                createdAtFrom: time && time[0] && formatToUnix(time[0]),
                createdAtTill: time && time[1] && formatToUnix(time[1]),
              };
              this.setDataSource({ page: 1, ...searchParams });
            }}
          >
            搜索
          </Button>
        </FilterSortSearchBar>
        <SimpleTable
          columns={this.getColumns({ type })}
          dataSource={dataSource}
          rowKey="id"
          pagination={{
            total,
            onChange: page => {
              this.setDataSource({ page });
            },
          }}
        />
      </div>
    );
  }
}

export default withForm({}, BrokenLog);
