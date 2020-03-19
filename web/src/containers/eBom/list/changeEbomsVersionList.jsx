import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import PropTypes from 'prop-types';

import { getQuery, getLocation } from 'src/routes/getRouteParams';
import { setLocation } from 'utils/url';
import { black } from 'src/styles/color/index';
import { message, FormItem, RestPagingTable, Button, withForm, Input } from 'src/components/index';
import { replaceSign } from 'src/constants';
import { getEbomAndMbomByEbomIds, replaceEbomMaterial } from 'src/services/bom/ebom';
import { formatValueForUpdateMaterial } from 'src/containers/eBom/util';

const DEFAULT_PAGE_SIZE = 10;

class ChangeEbomsVersionList extends Component {
  state = {
    data: [],
    total: 0,
    pagination: {},
  };

  async componentDidMount() {
    await this.fetchAndSetData();

    this.setState({
      pagination: {
        current: 1,
        total: this.state.total || 0,
        pageSize: DEFAULT_PAGE_SIZE,
      },
    });
  }

  componentWillReceiveProps({ match: nextMatch }) {
    const { match } = this.props;
    const { ebomPage } = getQuery(match);
    const { ebomPage: nextPage } = getQuery(nextMatch);
    const { pagination } = this.state;
    if (ebomPage !== nextPage) {
      this.setState({
        pagination: {
          ...pagination,
          current: nextPage || 1,
          pageSize: DEFAULT_PAGE_SIZE,
        },
      });
    }
  }

  fetchAndSetData = async params => {
    const { ebomIds, selectedAllEbom, formValue } = this.props;

    const { match } = this.props;
    const query = getQuery(match);
    const location = getLocation(match) || {};

    const { productCode, projectCode, status } = query;
    const variables = { productCode, projectCode, status, ...params, size: DEFAULT_PAGE_SIZE };
    location.query = { ...location.query, ...variables };
    setLocation(this.props, () => location.query);

    const { materialsNeedToChange } = formValue || {};
    const res = await getEbomAndMbomByEbomIds({
      ids: Array.isArray(ebomIds) ? ebomIds.join(',') : null,
      rawMaterialCodeForExact: selectedAllEbom && materialsNeedToChange ? materialsNeedToChange.key : null, // 如果全选那么就传物料
      checkAll: selectedAllEbom,
      page: params ? params.ebomPage : 1,
    });
    const { data, count } = _.get(res, 'data');

    this.setState({ data, total: count });
  };

  getColumns = () => {
    const { form } = this.props;
    const currentPage = _.get(this.state, 'pagination.current');
    const { getFieldDecorator } = form || {};

    return [
      {
        title: '类型',
        dataIndex: 'type',
        render: (data, record, index) => {
          const text = data === 1 ? '物料清单' : '生产bom';

          const _index = (currentPage - 1) * DEFAULT_PAGE_SIZE;
          if (Number.isNaN(_index + index)) return null;
          // 需要id作为数据
          getFieldDecorator(`data[${index + _index}].id`, { initialValue: record ? record.id : null });
          getFieldDecorator(`data[${index + _index}].type`, { initialValue: data });
          return <span>{text}</span>;
        },
      },
      {
        title: '成品物料编号/名称',
        key: 'material',
        render: (__, record, index) => {
          const { productMaterialCode, productMaterialName } = record || {};

          const _index = (currentPage - 1) * DEFAULT_PAGE_SIZE;
          if (Number.isNaN(_index + index)) return null;
          getFieldDecorator(`data[${index + _index}].productMaterialCode`, { initialValue: productMaterialCode });
          getFieldDecorator(`data[${index + _index}].productMaterialName`, { initialValue: productMaterialName });

          return (
            <span>
              {productMaterialCode && productMaterialName
                ? `${productMaterialCode}/${productMaterialName}`
                : replaceSign}
            </span>
          );
        },
      },
      {
        title: '原版本号',
        dataIndex: 'version',
        render: (data, __, index) => {
          const _index = (currentPage - 1) * DEFAULT_PAGE_SIZE;
          if (Number.isNaN(_index + index)) return null;
          getFieldDecorator(`data[${index + _index}].oldVersion`, { initialValue: data });

          return <span>{data || replaceSign}</span>;
        },
      },
      {
        title: '新版本号',
        key: 'newVersion',
        render: (data, __, index) => {
          const _index = (currentPage - 1) * DEFAULT_PAGE_SIZE;
          if (Number.isNaN(_index + index)) return null;

          // 因为被decorator的组件不渲染的时候。fieldStore会删除这个field。所以需要用这种方式在翻页的时候保存数据
          getFieldDecorator(`data[${index + _index}].newVersion`, { initialValue: this.state[`data[${index + _index}].newVersion`] });

          return (
            <div>
              <FormItem>
                {getFieldDecorator(`data[${index + _index}]._newVersion`, {
                  initialValue: this.state[`data[${index + _index}].newVersion`],
                  rules: [{ required: true, message: '版本号必填' }],
                  onChange: (value) => {
                    this.setState({ [`data[${index + _index}].newVersion`]: value });
                  },
                })(<Input style={{ width: 200 }} />)}
              </FormItem>
            </div>
          );
        },
      },
    ];
  };

  handleTableChange = async (pagination, filters, sorter) => {
    this.setState({ loading: true, pagination });
    await this.fetchAndSetData({ ebomPage: pagination.current });
    this.setState({ loading: false, pagination });
  };

  renderTable = () => {
    const { data, total, pagination } = this.state;
    const columns = this.getColumns();

    return (
      <RestPagingTable
        style={{ margin: 0 }}
        showTotalAmount
        columns={columns}
        dataSource={data}
        total={total}
        onChange={this.handleTableChange}
        pagination={pagination} // 在ebomList中存在两个table。他们的pagination会重叠
      />
    );
  };

  renderFooter = () => {
    const { total } = this.state;
    const { close, form, formValue } = this.props;
    const BUTTON_WIDTH = 120;

    return (
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Button
          type={'default'}
          style={{ width: BUTTON_WIDTH }}
          onClick={() => {
            this.setState({ data: [], total: 0 }, () => {
              if (typeof close === 'function') close();
            });
          }}
        >
          取消
        </Button>
        <Button
          style={{ width: BUTTON_WIDTH, marginLeft: 10 }}
          onClick={() => {
            form.validateFieldsAndScroll((err, value) => {
              // 需要判断列表中的数据是否都是填上了版本号
              const { data } = value || {};

              if (err) {
                message.error('请为所有的数据填写新的版本号');
                return;
              }

              if (!Array.isArray(data)) {
                message.error('发生未知错误');
                return;
              }

              const _data = _.uniqBy(data, (e) => {
                return e.id;
              });
              if (Array.isArray(_data) && _data.length < total) {
                message.error('请为所有的数据填写新的版本号');
                return;
              }

              const _formValue = formatValueForUpdateMaterial(formValue);
              replaceEbomMaterial({ ..._formValue, data: _data }).then(() => {
                if (typeof close === 'function') close(true);
              });
            });
          }}
        >
          确定
        </Button>
      </div>
    );
  };

  render() {
    return (
      <div style={{ padding: 20 }}>
        <div style={{ color: black, fontSize: 18, marginBottom: 20 }}>输入新版本号</div>
        {this.renderTable()}
        {this.renderFooter()}
      </div>
    );
  }
}

ChangeEbomsVersionList.propTypes = {
  style: PropTypes.object,
  ebomIds: PropTypes.array,
  selectedAllEbom: PropTypes.bool,
  close: PropTypes.func,
  form: PropTypes.any,
  formValue: PropTypes.any,
  match: PropTypes.any,
};

export default withForm({}, withRouter(ChangeEbomsVersionList));
