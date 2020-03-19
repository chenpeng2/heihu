import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { getQuery } from 'src/routes/getRouteParams';
import { Select, Button, Input, withForm } from 'src/components';
import { middleGrey, fontSub } from 'src/styles/color';
import { saveQueryParamsForTagList } from 'src/store/redux/actions';

import { PRINT_SIGN, EXPORT_SIGN } from '../../../constant';

const INPUT_WIDTH = 180;

type Props = {
  style: {},
  form: any,
  fetchData: () => {},
  match: {},
  saveQueryParamsForTagList: any,
};

class Filter extends Component {
  state = {};
  props: Props;

  componentDidMount() {
    const { match, form } = this.props;
    const query = getQuery(match);
    const { searchExports, searchPrints, searchBarcodeLabelSeq } = query || {};

    form.setFieldsValue({
      exportSign: Array.isArray(searchExports) ? searchExports[0] : null,
      printSign: Array.isArray(searchPrints) ? searchPrints[0] : null,
      labelId: searchBarcodeLabelSeq,
    });
  }

  onSearch = () => {
    const { form, fetchData, saveQueryParamsForTagList } = this.props;
    const value = form.getFieldsValue();

    const { labelId, exportSign, printSign } = value || {};

    const params = {
      searchExports: typeof exportSign === 'number' ? [exportSign] : null,
      searchPrints: typeof printSign === 'number' ? [printSign] : null,
      searchBarcodeLabelSeq: labelId,
    };

    if (typeof fetchData === 'function') {
      fetchData({ ...params, page: 1 });
      if (typeof saveQueryParamsForTagList === 'function') saveQueryParamsForTagList(params);
    }
  };

  render() {
    const { form } = this.props;
    const { changeChineseToLocale } = this.context;
    const { getFieldDecorator, resetFields } = form || {};

    const itemStyle = {
      color: fontSub,
      margin: '0px 10px',
      verticalAlign: 'middle',
    };
    const inputStyle = {
      width: INPUT_WIDTH,
      verticalAlign: 'middle',
    };

    return (
      <div>
        <div style={{ display: 'inline-block', whiteSpace: 'nowrap', marginRight: 10 }}>
          <span style={{ ...itemStyle, marginLeft: 0 }}>{changeChineseToLocale('条码标签编号')}</span>
          {getFieldDecorator('labelId')(<Input style={inputStyle} />)}
          <span style={itemStyle}>{changeChineseToLocale('导出标识')}</span>
          {getFieldDecorator('exportSign')(
            <Select style={inputStyle} allowClear placeholder={'请选择'}>
              {Object.values(EXPORT_SIGN).map(i => {
                const { name, value } = i;

                return (
                  <Select.Option value={value} key={value}>
                    {changeChineseToLocale(name)}
                  </Select.Option>
                );
              })}
            </Select>,
          )}
          <span style={itemStyle}>{changeChineseToLocale('打印标识')}</span>
          {getFieldDecorator('printSign')(
            <Select style={inputStyle} allowClear placeholder={'请选择'}>
              {Object.values(PRINT_SIGN).map(i => {
                const { name, value } = i;

                return (
                  <Select.Option value={value} key={value}>
                    {changeChineseToLocale(name)}
                  </Select.Option>
                );
              })}
            </Select>,
          )}
        </div>
        <div style={{ display: 'inline-block' }}>
          <Button icon="search" onClick={this.onSearch}>
            查询
          </Button>
          <span
            style={{ color: middleGrey, margin: '0 10px', cursor: 'pointer', verticalAlign: 'middle' }}
            onClick={() => {
              resetFields();
              this.onSearch();
            }}
          >
            {changeChineseToLocale('重置')}
          </span>
        </div>
      </div>
    );
  }
}

Filter.contextTypes = {
  changeChineseToLocale: PropTypes.any,
};

export default connect(
  null,
  { saveQueryParamsForTagList },
)(withForm({}, withRouter(Filter)));
