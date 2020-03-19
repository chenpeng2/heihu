import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { withForm, FilterSortSearchBar, Input, Select, Button, DatePicker } from 'components';
import WorkstationAndAreaSelect, { WORKSTATION_TYPES } from 'components/select/workstationAndAreaSelect';
import LocalStorage from 'src/utils/localStorage';
import SearchSelect from 'src/components/select/searchSelect';
import { white } from 'src/styles/color/index';
import { PROJECT_STATUS } from 'src/constants';
import { formatToUnix } from 'utils/time';

const ItemList = FilterSortSearchBar.ItemList;
const Item = FilterSortSearchBar.Item;
const RangePicker = DatePicker.RangePicker;
const Option = Select.Option;

type Props = {
  onFilter: () => {},
  form: any,
  match: {},
};

class Filter extends Component {
  props: Props;
  state = {};

  componentDidMount() {
    const filterDistribute = LocalStorage.get('taskScheduleProcessTableFilterDistribute');
    this.props.form.setFieldsValue({ filterDistribute: filterDistribute || 'all' });
  }

  onSearch = () => {
    const { form, onFilter } = this.props;
    const { getFieldsValue } = form;
    const value = getFieldsValue();
    console.log(value);
    if (!value.name) {
      value.name = undefined;
    }
    if (value.parent && typeof value.parent.value === 'string') {
      const [type, id] = value.parent.value.split('-');
      if (type === WORKSTATION_TYPES.PRODUCTION_LINE) {
        value.productionLineId = id;
      } else if (type === WORKSTATION_TYPES.WORKSHOP) {
        value.workshopId = id;
      }
    }
    if (onFilter && value) {
      onFilter({ ...value, page: 1 });
    }
  };

  render() {
    const { form } = this.props;
    const { getFieldDecorator } = form || {};

    return (
      <FilterSortSearchBar style={{ backgroundColor: white, width: '100%' }} searchFn={this.onSearch}>
        <ItemList>
          <Item label="工位名称">{getFieldDecorator('name')(<Input className="select-input" />)}</Item>
          <Item label="上级区域">{getFieldDecorator('parent')(<WorkstationAndAreaSelect onlyParent />)}</Item>
        </ItemList>
        <Button icon="search" onClick={this.onSearch}>
          查询
        </Button>
      </FilterSortSearchBar>
    );
  }
}

Filter.contextTypes = {
  account: PropTypes.object,
};

export default withForm({}, withRouter(Filter));
