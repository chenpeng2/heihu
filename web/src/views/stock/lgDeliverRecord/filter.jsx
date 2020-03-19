import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import withForm, { trimWholeValue } from 'components/form';
import { white, fontSub, borderGrey } from 'src/styles/color/index';
import { Link, Button, FilterSortSearchBar, Searchselect, Input, DatePicker, Icon, StorageSelect } from 'src/components';

const { RangePicker } = DatePicker;
const ItemList = FilterSortSearchBar.ItemList;
const Item = FilterSortSearchBar.Item;
const resetButton = {
  float: 'right',
  width: 60,
  color: fontSub,
  height: 28,
  lineHeight: '28px',
  textAlign: 'center',
  cursor: 'pointer',
};

type Props = {
  form: any,
  handleSearch: () => {},
  handleReset: () => {},
  userQrCode: Boolean,
  match: any,
};

class FilterForLgTransfers extends Component {
  props: Props;
  state = {
    config: null,
  };

  renderButton = () => {
    const { handleSearch, handleReset } = this.props;
    const { changeChineseToLocale } = this.context;

    return (
      <div>
        <Button onClick={handleSearch}>
          <Icon type={'search'} />
          {changeChineseToLocale('查询')}
        </Button>
        <Link style={{ ...resetButton }} onClick={handleReset}>
          重置
        </Link>
      </div>
    );
  };

  render() {
    const { form, match, userQrCode } = this.props;
    const { getFieldDecorator } = form;
    const { changeChineseToLocale } = this.context;

    return (
      <div className="search-select-input">
        <FilterSortSearchBar
          style={{ backgroundColor: white, width: '100%', borderBottom: `1px solid ${borderGrey}` }}
          searchDisabled
        >
          <ItemList>
            <Item label="出厂仓位">{getFieldDecorator('storage')(<StorageSelect match={match} />)}</Item>
            {userQrCode ? (
              <Item label="二维码">
                {getFieldDecorator('qrcode', {
                  normalize: trimWholeValue,
                })(<Input placeholder={changeChineseToLocale('请输入二维码')} key="qrcode" />)}
              </Item>
            ) : null}
            {userQrCode ? (
              <Item label="包装二维码">
                {getFieldDecorator('containerQrcode', {
                  normalize: trimWholeValue,
                })(<Input placeholder={changeChineseToLocale('请输入包装二维码')} key="containerQrcode" />)}
              </Item>
            ) : null}
            <Item label="物料">
              {getFieldDecorator('materialCode', {
                normalize: trimWholeValue,
              })(
                <Searchselect placeholder={changeChineseToLocale('请输入物料编码或名称')} type={'materialBySearch'} />,
              )}
            </Item>
            <Item label="操作人">
              {getFieldDecorator('operatorId', {
                normalize: trimWholeValue,
              })(<Searchselect placeholder={changeChineseToLocale('请输入操作人')} type={'account'} />)}
            </Item>
            <Item label="操作时间">{getFieldDecorator('duration')(<RangePicker />)}</Item>
            <Item label={'生产批次'}>{getFieldDecorator('productBatch')(<Input />)}</Item>
            <Item label={'客户'}>{getFieldDecorator('customer')(<Searchselect type={'customerByCode'} />)}</Item>
          </ItemList>
          {this.renderButton()}
        </FilterSortSearchBar>
      </div>
    );
  }
}

FilterForLgTransfers.contextTypes = {
  changeChineseToLocale: PropTypes.func,
};

export default withForm({}, withRouter(FilterForLgTransfers));
