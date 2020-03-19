import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { Spin, message } from 'src/components';
import Table from 'src/containers/exceptionalEvent/subjectDefinition/table';
import { getSubjectList, updateSubjectStatus } from 'src/services/knowledgeBase/exceptionalEvent';
import Filter from 'src/containers/exceptionalEvent/subjectDefinition/filter';
import { setLocation } from 'utils/url';
import { getLocation, getQuery } from 'src/routes/getRouteParams';

const fetchData = async params => {
  const res = await getSubjectList(params);
  return _.get(res, 'data');
};

type Props = {
  style: {},
  match: {},
};

class SubjectDefinitionList extends Component {
  props: Props;
  state = {
    loading: false,
    data: null,
    totalAmount: null,
  };

  componentDidMount() {
    this.fetchAndSetState();
  }

  fetchAndSetState = async params => {
    const { match } = this.props;

    this.setState({ loading: true });

    // 将url中的值获取到, 设置为参数
    const query = getQuery(match);

    // size的默认值为10
    const _params = { ...query, ...params, size: 10 };
    const nextParams = { ..._params, size: 10 };
    // 将参数设置到url中
    const location = getLocation(match);
    location.query = nextParams;
    setLocation(this.props, () => location.query);
    fetchData(nextParams)
      .then(res => {
        const { data, total } = res || {};
        this.setState({
          data,
          totalAmount: total,
        });
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  changeSubjectStatus = (id, nexStatus) => {
    if (!id) return;
    const { changeChineseTemplateToLocale, changeChineseToLocale } = this.context;

    this.setState({ loading: true });

    const text = changeChineseToLocale(nexStatus === 0 ? '停用' : '启用');
    updateSubjectStatus(id, { status: nexStatus })
      .then(() => {
        message.success(changeChineseTemplateToLocale('{text}异常主题成功', { text }));
        this.fetchAndSetState();
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  renderFilter = () => {
    return <Filter fetchData={this.fetchAndSetState} />;
  };

  renderTable = () => {
    const { data, totalAmount } = this.state;

    return (
      <Table
        data={data}
        totalAmount={totalAmount}
        fetchData={this.fetchAndSetState}
        changeStatus={this.changeSubjectStatus}
      />
    );
  };

  render() {
    const { loading } = this.state;

    return (
      <div style={{ padding: '0 20px' }}>
        {this.renderFilter()}
        <Spin spinning={loading}>{this.renderTable()}</Spin>
      </div>
    );
  }
}

SubjectDefinitionList.contextTypes = {
  changeChineseTemplateToLocale: PropTypes.any,
  changeChineseToLocale: PropTypes.any,
};

export default withRouter(SubjectDefinitionList);
