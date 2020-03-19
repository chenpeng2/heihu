import React from 'react';
import { DatePicker, Button, SimpleTable, FormItem, withForm, Badge } from 'components';
import { formatUnix, formatToUnix, formatUnixMoment } from 'utils/time';
import _ from 'lodash';
import moment from 'moment';
import { getWorkshopLogs } from 'services/knowledgeBase/workshop';
import { getWorkstationLogs } from 'services/knowledgeBase/workstation';
import { getProdLineLogs } from 'services/knowledgeBase/prodLine';
import { setLocation, getParams } from 'utils/url';
import styles from './logList.scss';

type propsType = {
  form: any,
  type: String,
  match: {
    params: {
      id: string,
    },
  },
};

const RangePicker = DatePicker.RangePicker;

class LogList extends React.PureComponent<propsType> {
  state = {
    dataSource: [],
  };

  componentDidMount() {
    const { form: { setFieldsValue } } = this.props;
    const { fromAt, toAt, page } = _.get(getParams(), 'queryObj', {});
    const params = {
      times: [fromAt && formatUnixMoment(fromAt), toAt && formatUnixMoment(toAt)],
    };
    setFieldsValue(params);
    this.setDataSource({ ...params, page });
  }

  setDataSource = (params = {}) => {
    const { type, match: { params: { id } } } = this.props;
    const fetchDefine = {
      workstation: getWorkstationLogs,
      workshop: getWorkshopLogs,
      prodLine: getProdLineLogs,
    };
    const _params = {
      page: params.page || 1,
    };
    if (Array.isArray(params.times)) {
      _params.fromAt = params.times[0] && formatToUnix(params.times[0]);
      _params.toAt = params.times[1] && formatToUnix(params.times[1]);
    }
    const fetchParams = setLocation(this.props, p => ({ size: 10, ...p, ..._params }));
    fetchDefine[type](id, fetchParams).then(({ data: { data, count } }) => {
      this.setState({ dataSource: data, count });
    });
  };

  getColumns = () => {
    const { type } = this.props;
    const typeDefine = {
      workstation: '工位',
      workshop: '车间',
      prodLine: '产线',
    };
    return [
      {
        title: '操作时间',
        dataIndex: 'createdAt',
        key: 'createdAt',
        render: time => formatUnix(time),
      },
      { title: '操作用户', dataIndex: 'user', key: 'user' },
      { title: `${typeDefine[type]}名称`, dataIndex: 'area', key: 'area' },
      { title: '操作类型', dataIndex: 'type', key: 'type' },
      {
        title: '操作详情',
        dataIndex: 'content',
        key: 'content',
        render: (content, { status }) => (
          <Badge text={content} status={status === 1 ? 'success' : 'error'} />
        ),
      },
    ];
  };

  render() {
    const { form: { getFieldDecorator, getFieldValue } } = this.props;
    const { dataSource, count } = this.state;
    console.log(1);
    return (
      <div>
        <div className={styles.filterWrapper}>
          <FormItem label="操作时间">
            {getFieldDecorator('times')(
              <RangePicker
                showTime={{
                  defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment()],
                }}
                format="YYYY-MM-DD HH:mm:ss"
              />,
            )}
          </FormItem>
          <Button
            icon="search"
            className={styles.searchButton}
            onClick={() => {
              this.setDataSource({ times: getFieldValue('times'), page: 1 });
            }}
          >
            查询
          </Button>
        </div>
        <SimpleTable
          columns={this.getColumns()}
          dataSource={dataSource}
          rowKey="createdAt"
          pagination={{
            total: count,
            onChange: page => this.setDataSource({ page }),
          }}
        />
      </div>
    );
  }
}

export default withForm({}, LogList);
