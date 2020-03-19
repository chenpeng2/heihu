import React, { Component } from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';

import { Link, Button, Searchselect, Select, FilterSortSearchBar } from 'components';
import { getQuery } from 'src/routes/getRouteParams';
import { changeChineseToLocaleWithoutIntl } from 'utils/locale/utils';

import { WEIGHING_TASK_STATUS } from '../../constants';
import { WorkstationSelect, ProjectSelect } from '../../base';

const Option = Select.Option;
const ItemList = FilterSortSearchBar.ItemList;
const Item = FilterSortSearchBar.Item;
const baseFormItemStyle = { width: 200 };

type Props = {
  form: any,
  match: any,
  fetchData: () => {},
};

class FilterForList extends Component {
  props: Props;
  state = {};

  componentDidMount = () => {
    this.props.fetchData();
  };

  setLastFilterData = () => {
    const { match } = this.props;
    const lastQuery = getQuery(match);
    this.props.form.setFieldsValue(lastQuery);
  };

  onSearch = () => {
    const values = this.props.form.getFieldsValue();
    this.props.fetchData({ ...values, page: 1, size: 10 });
  };
  render() {
    const {
      form: { getFieldDecorator, resetFields },
    } = this.props;

    return (
      <div
        style={{ borderBottom: '1px solid rgb(232, 232, 232)', marginBottom: 20 }}
        onKeyDown={e => {
          if (e.keyCode === 13) {
            this.onSearch();
          }
        }}
      >
        <FilterSortSearchBar>
          <ItemList>
            <Item label="工位">
              {getFieldDecorator('workstationId')(
                <WorkstationSelect style={baseFormItemStyle} placeholder="请选择工位" />,
              )}
            </Item>
            <Item label="项目">
              {getFieldDecorator('projectCode')(<ProjectSelect style={baseFormItemStyle} placeholder="请选择项目" />)}
            </Item>
            <Item label="任务状态">
              {getFieldDecorator('status', {})(
                <Select allowClear style={baseFormItemStyle} placeholder="请选择任务状态">
                  {Object.keys(WEIGHING_TASK_STATUS).map(key => (
                    <Option key={key} value={key}>
                      {changeChineseToLocaleWithoutIntl(WEIGHING_TASK_STATUS[key])}
                    </Option>
                  ))}
                </Select>,
              )}
            </Item>
            <Item label="执行人">
              {getFieldDecorator('executorId', {})(
                <Searchselect
                  style={baseFormItemStyle}
                  type="account"
                  placeholder="请选择执行人"
                  labelInValue={false}
                />,
              )}
            </Item>
          </ItemList>
          <div>
            <Button onClick={this.onSearch}>查询</Button>
            <Link
              style={{
                color: '#8C8C8C',
                paddingLeft: 10,
              }}
              onClick={() => {
                resetFields();
                this.onSearch();
              }}
            >
              重置
            </Link>
          </div>
        </FilterSortSearchBar>
      </div>
    );
  }
}

export default withRouter(FilterForList);
