import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { FilterSortSearchBar, Input, Select, Button, Link } from 'src/components';
import { white } from 'src/styles/color/index';
import { setLocation } from 'utils/url';
import { changeChineseToLocaleWithoutIntl } from 'src/utils/locale/utils';
import { CHECKCOUNT_TYPE, QCCONFIG_STATE, QCCONFIG_VALID } from 'src/views/qualityManagement/constants';
import styles from './styles.scss';

const ItemList = FilterSortSearchBar.ItemList;
const Item = FilterSortSearchBar.Item;
const Option = Select.Option;

type Props = {
  onFilter: () => {},
  form: any,
  match: {},
};

class FilterForQcConfig extends Component {
  props: Props;
  state = {};

  onSearch = () => {
    const { form, onFilter } = this.props;
    const { getFieldsValue } = form;
    const value = getFieldsValue();
    if (onFilter && value) {
      onFilter(value);
    }
    if (sensors) {
      sensors.track('web_quanlity_schemeList_search', {
        FilterCondition: value,
      });
    }
    setLocation(this.props, () => value);
  };

  renderStatusElement = () => {
    const statusElement = _.map(CHECKCOUNT_TYPE, (value, key) => {
      return (
        <Option key={key} value={Number(key)}>
          {changeChineseToLocaleWithoutIntl(value)}
        </Option>
      );
    });
    statusElement.unshift(
      <Option key={'all'} value={''}>
        {changeChineseToLocaleWithoutIntl('全部')}
      </Option>,
    );
    return statusElement;
  };

  render() {
    const { form } = this.props;
    const { getFieldDecorator } = form || {};

    return (
      <div
        className={styles.projectFilter}
        onKeyDown={e => {
          if (e.keyCode === 13) {
            this.onSearch();
          }
        }}
      >
        <FilterSortSearchBar style={{ backgroundColor: white, width: '100%' }} searchDisabled>
          <ItemList>
            <Item label="编号">
              {getFieldDecorator('codeSearch')(<Input className="select-input" placeholder="请输入编号" />)}
            </Item>
            <Item label="名称">
              {getFieldDecorator('nameSearch')(<Input className="select-input" placeholder="请输入名称" />)}
            </Item>
            <Item label="质检方式">
              {getFieldDecorator('checkCountType')(
                <Select className={styles.selectInput} allowClear>
                  {this.renderStatusElement()}
                </Select>,
              )}
            </Item>
            <Item label="状态">
              {getFieldDecorator('state', {
                initialValue: QCCONFIG_VALID,
              })(
                <Select>
                  {_.map(QCCONFIG_STATE, (display, value) => (
                    <Option key={Number(value)} value={Number(value)}>
                      {changeChineseToLocaleWithoutIntl(display)}
                    </Option>
                  ))}
                </Select>,
              )}
            </Item>
          </ItemList>
          <Button icon="search" onClick={this.onSearch}>
            查询
          </Button>
          <Link
            style={{ color: '#8C8C8C', cursor: 'pointer', padding: '5px 20px' }}
            onClick={() => {
              form.resetFields();
              this.onSearch();
            }}
          >
            重置
          </Link>
        </FilterSortSearchBar>
      </div>
    );
  }
}

FilterForQcConfig.contextTypes = {
  account: PropTypes.object,
};

export default withRouter(FilterForQcConfig);
