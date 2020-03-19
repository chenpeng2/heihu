import React from 'react';
import { SimpleTable, Button, DatePicker, withForm, FormattedMessage } from 'components';
import moment from 'moment';
import { formatRangeUnix, formatUnixMoment } from 'utils/time';
import { setLocation, getParams } from 'utils/url';
import styles from './index.scss';

const RangerPicker = DatePicker.RangePicker;

class SearchTableLayout extends React.PureComponent<any> {
  state = {
    dataSource: [],
    total: 0,
  };

  componentDidMount() {
    const {
      form: { setFieldsValue },
    } = this.props;
    const { createdAtFromAt, createdAtFromTill, ...rest } = getParams() && getParams().queryObj;
    setFieldsValue({
      time: createdAtFromAt && [formatUnixMoment(createdAtFromAt), formatUnixMoment(createdAtFromTill)],
    });
    this.setDataSource();
  }

  setDataSource = async params => {
    const {
      fetchData,
      form: { getFieldsValue },
      formatParams,
    } = this.props;
    const { time } = getFieldsValue();
    const createdAtFromAt = time && formatRangeUnix(time)[0];
    const createdAtFromTill = time && formatRangeUnix(time)[1];
    let _params = setLocation(this.props, p => ({
      page: 1,
      size: 10,
      ...p,
      ...params,
      createdAtFromAt,
      createdAtFromTill,
    }));
    if (typeof formatParams === 'function') {
      _params = formatParams(_params);
    }
    const {
      data: { data, count },
    } = await fetchData(_params);
    this.setState({ dataSource: data, total: count });
  };

  render() {
    const {
      tableProps,
      form: { getFieldDecorator },
    } = this.props;
    const { dataSource, total } = this.state;
    return (
      <div>
        <div className={styles.logsHeader}>
          <FormattedMessage defaultMessage={'操作时间'} />
          {getFieldDecorator('time', {
            initialValue: [moment().subtract(1, 'month'), moment()],
          })(<RangerPicker />)}
          <Button
            onClick={() => {
              this.setDataSource({ page: 1 });
            }}
          >
            查询
          </Button>
        </div>
        <SimpleTable
          {...tableProps}
          rowKey="importId"
          dataSource={dataSource}
          pagination={{ onChange: page => this.setDataSource({ page }), total }}
        />
      </div>
    );
  }
}

export default withForm({}, SearchTableLayout);
