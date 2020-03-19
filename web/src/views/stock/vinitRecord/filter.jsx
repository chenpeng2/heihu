import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Input, DatePicker } from 'antd';
import { withRouter } from 'react-router-dom';
import moment, { formatRangeUnix } from 'utils/time';
import { setLocation } from 'utils/url';
import { getOrganizationConfigFromLocalStorage } from 'utils/organizationConfig';
import { getQuery } from 'src/routes/getRouteParams';
import { queryVinitRecordList } from 'src/services/stock/vinitRecord';
import { Link, withForm, Button, FilterSortSearchBar, Icon, Searchselect, StorageSelect } from 'src/components';
import { white, borderGrey, fontSub } from 'src/styles/color/index';
import { trimWholeValue } from 'components/form';

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
const InitialTimeValue = [moment().subtract(1, 'months'), moment().add(60, 'minutes')];

type Props = {
  form: {
    getFieldDecorator: () => {},
    getFieldsValue: () => {},
  },
  children: any,
  match: {},
};

class FilterForLgTransfers extends Component {
  props: Props;
  state = {
    config: null,
    loading: false,
    data: null,
    isReset: false,
    exportParams: null,
  };

  componentWillMount() {
    const config = getOrganizationConfigFromLocalStorage();
    this.setState({ config });
  }

  componentDidMount() {
    const { match, form } = this.props;
    const queryMatch = getQuery(match);
    if (queryMatch) {
      if (queryMatch.duration && queryMatch.duration.length > 0) {
        queryMatch.duration[0] = moment(queryMatch.duration[0]);
        queryMatch.duration[1] = moment(queryMatch.duration[1]);
      } else {
        queryMatch.duration = InitialTimeValue;
      }
      form.setFieldsValue(queryMatch);
      this.setState({ exportParams: this.getFormatParams(queryMatch), storage: queryMatch.storage });
    }
    this.getAndSetData(queryMatch);
  }

  getAndSetData = (params, query) => {
    const { match } = this.props;
    const _query = query || this.getFormatParams(getQuery(match));
    const _params = this.getFormatParams(params);
    const variables = Object.assign({}, { ..._query, ..._params });
    this.setState({ loading: true });
    setLocation(this.props, () => params);
    queryVinitRecordList(variables)
      .then(res => {
        this.setState({ data: res.data });
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  getFormatParams = value => {
    const params = {};
    if (value) {
      Object.keys(value).forEach(prop => {
        if (value[prop]) {
          switch (prop) {
            case 'account':
            case 'operatorId':
            case 'materialCode':
              params[prop] = value[prop].key;
              break;
            case 'supplier':
              params.supplierCode = value[prop].key;
              break;
            case 'duration':
              if (value.duration.length > 0) {
                const _duration = formatRangeUnix(value.duration);
                params.createdAtFrom = _duration[0];
                params.createdAtTill = _duration[1];
              }
              break;
            case 'storage':
              if (value[prop].length) {
                if (value[prop][0]) {
                  let id = '';
                  const level = value[prop][0].split(',')[2];
                  if (level === '3') {
                    id = value[prop].map(n => n.split(',')[0]).join(',');
                  } else {
                    id = value[prop][0].split(',')[0];
                  }
                  switch (level) {
                    case '1':
                      params.houseId = id;
                      break;
                    case '2':
                      params.firstStorageId = id;
                      break;
                    case '3':
                      params.secondStorageId = id;
                      break;
                    default:
                      break;
                  }
                }
              }
              break;
            default:
              params[prop] = value[prop];
          }
        }
      });
    }
    return params;
  };

  resetFormValue = () => {
    const { form } = this.props;
    const value = form.getFieldsValue();
    Object.keys(value).forEach(prop => {
      if (prop === 'duration') {
        value[prop] = InitialTimeValue;
      } else {
        value[prop] = [];
      }
    });
    this.setState({ isReset: true }, () => {
      this.setState({ isReset: false });
    });
    form.setFieldsValue(value);
  };

  renderButton = () => {
    const { changeChineseToLocale } = this.context;
    const { form } = this.props;
    const { getFieldsValue } = form;
    return (
      <div>
        <Button
          onClick={() => {
            const value = getFieldsValue();
            this.setState({ exportParams: this.getFormatParams(value) });
            this.getAndSetData({ ...value, size: 10, page: 1 }, {});
          }}
        >
          <Icon type={'search'} />
          {changeChineseToLocale('查询')}
        </Button>
        <Link
          style={{ ...resetButton }}
          onClick={() => {
            location.query = {};
            setLocation(this.props, p => ({}));
            this.resetFormValue();

            const value = getFieldsValue();
            this.getAndSetData({ ...value, size: 10, page: 1 }, {});
          }}
        >
          重置
        </Link>
      </div>
    );
  };

  render() {
    const { changeChineseToLocale } = this.context;
    const { form, children, match } = this.props;
    const { getFieldDecorator } = form;
    const { data, loading, config, exportParams, isReset, storage } = this.state;
    const _children = React.cloneElement(children, {
      data,
      exportParams,
      refetch: this.getAndSetData,
      loading,
      userQrCode: config.config_use_qrcode.configValue === 'true',
    });

    return (
      <div className="search-select-input">
        <FilterSortSearchBar
          style={{ backgroundColor: white, width: '100%', borderBottom: `1px solid ${borderGrey}` }}
          searchDisabled
        >
          <ItemList>
            <Item label="入厂仓位">
              {getFieldDecorator('storage')(<StorageSelect value={storage} match={match} />)}
            </Item>
            {config.config_use_qrcode.configValue === 'true' ? (
              <Item label="二维码">
                {getFieldDecorator('qrcode', {
                  normalize: trimWholeValue,
                })(<Input placeholder={changeChineseToLocale('请输入二维码')} key="qrcode" />)}
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
            <Item label="操作时间">{getFieldDecorator('duration')(<RangePicker allowClear={false} />)}</Item>
            <Item label="供应商批次">
              {getFieldDecorator('mfgBatchNo')(<Input placeholder={'请输入供应商批次'} />)}
            </Item>
            <Item label="供应商">{getFieldDecorator('supplier')(<Searchselect type={'supplier'} />)}</Item>
          </ItemList>
          {this.renderButton()}
        </FilterSortSearchBar>
        {_children}
      </div>
    );
  }
}

FilterForLgTransfers.contextTypes = {
  changeChineseToLocale: PropTypes.any,
};

export default withForm({}, withRouter(FilterForLgTransfers));
