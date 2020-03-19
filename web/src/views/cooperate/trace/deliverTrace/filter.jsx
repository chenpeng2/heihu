import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import withForm from 'components/form';
import Proptypes from 'prop-types';
import Button from 'components/button';
import { FilterSortSearchBar, Searchselect, Input, DatePicker, Icon } from 'components';
import { setLocation } from 'utils/url';
import { white, fontSub, borderGrey } from 'src/styles/color/index';
import { getPathname, getQuery } from 'src/routes/getRouteParams';
import { queryDeliverTraceFields, queryDeliverTrace } from 'src/services/cooperate/trace';

const { RangePicker } = DatePicker;
const { Option } = Searchselect;
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
  form: {
    getFieldDecorator: () => {},
    getFieldsValue: () => {},
  },
  children: any,
  match: {
    location: {},
  },
};

class FilterForDeliverTrace extends Component {
  props: Props;
  state = {
    data: null,
    allFields: null,
    loading: false,
  };

  componentDidMount() {
    const { match, form } = this.props;
    const queryMatch = getQuery(match);
    this.getAndSetData({ ...queryMatch });
    queryDeliverTraceFields()
      .then(res => {
        this.setState({ allFields: res.data.data });
      })
      .finally(() => {
        form.setFieldsValue(getQuery(match));
      });
  }

  setFormValue = () => {
    const { form } = this.props;
    const value = form.getFieldsValue();
    Object.keys(value).forEach(prop => {
      if (prop === 'out_time') {
        value[prop] = [];
      } else {
        value[prop] = '';
      }
    });
    form.setFieldsValue(value);
  };

  getAndSetData = (params, query) => {
    const { match } = this.props;
    const _query = query || this.getFormatParams(getQuery(match));
    const _params = this.getFormatParams(params);
    const variables = Object.assign({}, { ..._query, ..._params });
    setLocation(this.props, p => {
      return { ...p, ...params };
    });
    this.setState({ loading: true });
    queryDeliverTrace(variables)
      .then(res => {
        this.setState({
          data: res.data.data,
          pagination: {
            current: variables && variables.page,
            pageSize: (variables && variables.size) || 10,
            total: res.data.data.total,
          },
        });
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  getFormatParams = value => {
    let conditions = '';
    Object.keys(value).forEach(prop => {
      if (value[prop] && prop !== 'page' && prop !== 'size') {
        switch (prop) {
          case 'out_time': {
            if (value.out_time.length > 0) {
              conditions += `out_time:${String(Date.parse(value.out_time[0]))};${String(
                Date.parse(value.out_time[1]),
              )}#`;
            }
            break;
          }
          case 'mfg_batches': {
            if (value.mfg_batches.length > 0) {
              conditions += `mfg_batches:${value.mfg_batches.join(';')}#`;
            }
            break;
          }
          default:
            conditions += `${prop}:${value[prop]}#`;
        }
      }
    });
    return Object.assign({}, { ...value, conditions });
  };

  getShowFilter = (allFields, field) => {
    const filterFieldsArr = allFields.filter(n => n.name === field);
    if (filterFieldsArr.length > 0) {
      return filterFieldsArr[0].is_filter;
    }
    return false;
  };

  renderButton = () => {
    const { form } = this.props;
    const { getFieldsValue, resetFields } = form;
    const { changeChineseToLocale } = this.context;
    return (
      <div>
        <Button
          style={{ width: 130 }}
          onClick={() => {
            const value = getFieldsValue();
            this.getAndSetData({ ...value, page: 1 });
          }}
        >
          <Icon type={'search'} />
          {changeChineseToLocale('查询')}
        </Button>
        <span
          style={{ ...resetButton }}
          onClick={() => {
            resetFields();
            const value = getFieldsValue();
            this.getAndSetData({ ...value, page: 1 });
          }}
        >
          {changeChineseToLocale('重置')}
        </span>
      </div>
    );
  };

  render() {
    const { form, children } = this.props;
    const { data, allFields, loading, pagination } = this.state;
    if (!allFields) {
      return null;
    }
    const { getFieldDecorator } = form;
    const _children = React.cloneElement(children, {
      data,
      loading,
      refetch: this.getAndSetData,
      allFields,
      pagination,
    });

    return (
      <div className="search-select-input">
        <FilterSortSearchBar
          style={{ backgroundColor: white, width: '100%', borderBottom: `1px solid ${borderGrey}` }}
          searchDisabled
        >
          <ItemList>
            {this.getShowFilter(allFields, 'qr_code') ? (
              <Item label="二维码">
                {getFieldDecorator('qr_code')(
                  <Searchselect placeholder="" type={'deliverTrace'} labelInValue={false} key="qr_code" />,
                )}
              </Item>
            ) : null}
            {this.getShowFilter(allFields, 'order_code') ? (
              <Item label="订单号">
                {getFieldDecorator('order_code')(
                  <Searchselect placeholder="" key="order_code" labelInValue={false} type={'deliverTrace'} />,
                )}
              </Item>
            ) : null}
            {this.getShowFilter(allFields, 'workstation') ? (
              <Item label="生产工位">
                {getFieldDecorator('workstation')(
                  <Searchselect type={'deliverTrace'} labelInValue={false} placeholder="" key="workstation" />,
                )}
              </Item>
            ) : null}
            {this.getShowFilter(allFields, 'material_code') ? (
              <Item label="物料编码">
                {getFieldDecorator('material_code')(
                  <Searchselect
                    type={'deliverTrace'}
                    labelInValue={false}
                    placeholder="物料编码"
                    key="material_code"
                  />,
                )}
              </Item>
            ) : null}
            {this.getShowFilter(allFields, 'material_name') ? (
              <Item label="物料名称">
                {getFieldDecorator('material_name')(
                  <Searchselect
                    type={'deliverTrace'}
                    labelInValue={false}
                    placeholder="物料名称"
                    key="material_name"
                  />,
                )}
              </Item>
            ) : null}
            {this.getShowFilter(allFields, 'project_code') ? (
              <Item label="项目号">
                {getFieldDecorator('project_code')(
                  <Searchselect placeholder="" labelInValue={false} key="project_code" type={'deliverTrace'} />,
                )}
              </Item>
            ) : null}
            {this.getShowFilter(allFields, 'process') ? (
              <Item label="生产工序">
                {getFieldDecorator('process')(
                  <Searchselect labelInValue={false} type={'deliverTrace'} placeholder="" key="process" />,
                )}
              </Item>
            ) : null}
            {this.getShowFilter(allFields, 'mfg_batches') ? (
              <Item label="供应商批次">
                {getFieldDecorator('mfg_batches')(
                  <Searchselect
                    mode="tags"
                    labelInValue={false}
                    type={'deliverTrace'}
                    placeholder=""
                    key="mfg_batches"
                  />,
                )}
              </Item>
            ) : null}
            {this.getShowFilter(allFields, 'out_time') ? (
              <Item label="出厂时间">{getFieldDecorator('out_time')(<RangePicker />)}</Item>
            ) : null}
            {this.getShowFilter(allFields, 'principal') ? (
              <Item label="生产执行人">
                {getFieldDecorator('principal')(
                  <Searchselect labelInValue={false} type={'deliverTrace'} placeholder="" key="principal" />,
                )}
              </Item>
            ) : null}
            {/* {
              this.getShowFilter(allFields, 'material_remark') ?
                <Item label="物料备注">
                  {getFieldDecorator('material_remark')(<Input placeholder="关键字" key="material_remark" />)}
                </Item>
              : null
            } */}
          </ItemList>
          {this.renderButton()}
        </FilterSortSearchBar>
        {_children}
      </div>
    );
  }
}

FilterForDeliverTrace.contextTypes = {
  changeChineseToLocale: Proptypes.func,
};

export default withForm({}, withRouter(FilterForDeliverTrace));
