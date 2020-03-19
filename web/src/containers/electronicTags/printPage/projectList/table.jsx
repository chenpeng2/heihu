import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';

import { getQuery, getLocation } from 'src/routes/getRouteParams';
import { Badge, Link, Tooltip, RestPagingTable } from 'src/components';
import { replaceSign } from 'src/constants';
import { primary, error, blueViolet, warning, border, fontSub } from 'src/styles/color';
import moment from 'src/utils/time';

const MyBadge = Badge.MyBadge;

type Props = {
  style: {},
  data: [],
  match: {},
  total: Number,
  fetchData: () => {},
  electronicTagSelectProject: any,
  changeSelectAllTags: any,
  saveQueryParamsForTagList: any,
  saveSelectedTagIds: any,
  selectedProjectInfo: any,
  pageSize: number,
};

class Table extends Component {
  state = {
    loading: false,
    pagination: {},
  };

  props: Props;

  componentWillReceiveProps({ total: nextTotal, match: nextMatch }) {
    const { match, total, pageSize } = this.props;
    const { projectPage } = getQuery(match);
    const { projectPage: nextPage } = getQuery(nextMatch);
    const { pagination } = this.state;
    if (total !== nextTotal || projectPage !== nextPage) {
      this.setState({
        pagination: {
          ...pagination,
          current: nextPage || 1,
          total: nextTotal,
          pageSize,
        },
      });
    }
  }

  getColumns = () => {
    return [
      {
        title: '项目编号',
        dataIndex: 'projectCode',
        width: 100,
        render: data => {
          return (
            <Link to={`/cooperate/projects/${data}/detail`}>
              <Tooltip style={{ color: primary }} text={data || replaceSign} length={20} />
            </Link>
          );
        },
      },
      {
        title: '成品物料编号/名称',
        dataIndex: 'product',
        key: 'materialCodeAndName',
        width: 150,
        render: data => {
          const { code, name } = data || {};
          const _text = code && name ? `${code}/${name}` : replaceSign;

          return <Tooltip text={_text} length={20} />;
        },
      },
      {
        title: '数量/单位',
        dataIndex: 'amountProductPlanned',
        key: 'amountAndUnit',
        width: 80,
        render: (data, record) => {
          const unitName = _.get(record, 'product.unit');
          const _text = `${data} ${unitName}`;

          return <Tooltip text={_text} length={20} />;
        },
      },
      {
        title: '计划开始时间',
        dataIndex: 'startTimePlanned',
        key: 'planStartTime',
        width: 100,
        render: data => {
          const text = data ? moment(data).format('YYYY/MM/DD HH:mm') : replaceSign;
          return <Tooltip text={text} length={20} />;
        },
      },
      {
        title: '计划结束时间',
        dataIndex: 'endTimePlanned',
        key: 'planEndTime',
        width: 100,
        render: data => {
          const text = data ? moment(data).format('YYYY/MM/DD HH:mm') : replaceSign;
          return <Tooltip text={text} length={20} />;
        },
      },
      {
        title: '状态',
        dataIndex: 'status',
        width: 100,
        key: 'status',
        render: data => {
          const { display, code } = data || {};
          if (!code || !display) return replaceSign;
          if (code === 'paused') {
            return <MyBadge text={display} color={warning} />;
          }
          if (code === 'running') {
            return <MyBadge text={display} color={blueViolet} />;
          }
          if (code === 'created') {
            return <MyBadge text={display} color={border} />;
          }
          if (code === 'done') {
            return <MyBadge text={display} color={error} />;
          }
          if (code === 'aborted') {
            return <MyBadge text={display} color={fontSub} />;
          }

          return replaceSign;
        },
      },
      {
        title: '已生成数量/单位',
        key: 'createdAmount',
        width: 100,
        render: (__, record) => {
          const { productAmount } = record || {};
          const unitName = _.get(record, 'product.unit');

          const _test = !Number.isNaN(productAmount) && unitName ? `${productAmount} ${unitName}` : replaceSign;

          return <Tooltip text={_test} length={20} />;
        },
      },
      {
        title: '已打印数量/单位',
        key: 'printAmount',
        width: 100,
        render: (__, record) => {
          const { printAmount } = record || {};
          const unitName = _.get(record, 'product.unit');

          const _text = !Number.isNaN(printAmount) && unitName ? `${printAmount} ${unitName}` : replaceSign;

          return <Tooltip text={_text} length={20} />;
        },
      },
      {
        title: '操作',
        key: 'operation',
        width: 100,
        render: (__, record) => {
          const {
            electronicTagSelectProject,
            changeSelectAllTags,
            saveQueryParamsForTagList,
            saveSelectedTagIds,
            selectedProjectInfo,
          } = this.props;
          const { changeChineseToLocale } = this.context;
          const { projectCode, product, status } = record || {};

          const selectedProjectCode = _.get(selectedProjectInfo, 'projectCode');
          const projectInfo = {
            projectCode,
            productCode: product ? product.code : null,
            productName: product ? product.name : null,
          };

          // 项目是否可用
          const statusCode = _.get(status, 'code');
          const projectUseful = !(statusCode === 'done' || statusCode === 'aborted');

          return (
            <span
              onClick={() => {
                if (!projectUseful) return;

                // 改变redux store中的state
                // 将选中的project改变,将全选设置为false,将选中的tag清空，将查询的参数清空,拉取列表的数据
                if (typeof electronicTagSelectProject === 'function') electronicTagSelectProject(projectInfo);
                if (typeof changeSelectAllTags === 'function') changeSelectAllTags(false);
                if (typeof saveQueryParamsForTagList === 'function') saveQueryParamsForTagList({});
                if (typeof saveSelectedTagIds === 'function') saveSelectedTagIds([]);
              }}
              style={{ color: projectUseful ? primary : fontSub, cursor: 'pointer' }}
            >
              {selectedProjectCode === projectCode ? changeChineseToLocale('已选中') : changeChineseToLocale('选中')}
            </span>
          );
        },
      },
    ];
  };

  handleTableChange = async (pagination, filters, sorter) => {
    this.setState({ loading: true });
    await this.props.fetchData({ projectPage: pagination.current });
    this.setState({ loading: false, pagination });
  };

  render() {
    const { loading, pagination } = this.state;
    const { data } = this.props;
    const columns = this.getColumns();

    const _data = Array.isArray(data)
      ? data.map(i => {
          i.id = i.projectCode;
          return i;
        })
      : [];

    return (
      <RestPagingTable
        loading={loading}
        highLightRowId={this.state.selectedProjectCode}
        scroll={{ y: 273 }}
        style={{ margin: 0 }}
        columns={columns}
        dataSource={_data}
        pagination={pagination}
        onChange={this.handleTableChange}
      />
    );
  }
}

Table.contextTypes = {
  changeChineseToLocale: PropTypes.any,
};

export default Table;
