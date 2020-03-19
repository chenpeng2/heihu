import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import _ from 'lodash';
import PropTypes from 'prop-types';

import {
  electronicTagSelectProject,
  changeSelectAllTags,
  saveQueryParamsForTagList,
  saveSelectedTagIds,
  fetchElectronicTagProjectList,
} from 'src/store/redux/actions';
import { black } from 'src/styles/color';
import { getQuery, getLocation } from 'src/routes/getRouteParams';
import { setLocation } from 'utils/url';
import { Spin } from 'src/components';

import Table from './table';
import Filter, { PROJECT_DEFAULT_STATUS } from './filter';

const DEFAULT_PAGE_SIZE = 5;

type Props = {
  style: {},
  match: {},
  electronicTagSelectProject: any,
  changeSelectAllTags: any,
  saveQueryParamsForTagList: any,
  saveSelectedTagIds: any,
  electronicTagPrint: any,
  fetchElectronicTagProjectList: () => {},
};

class ProjectList extends Component {
  state = {};
  props: Props;

  componentDidMount() {
    this.fetchAndSetData({ status: PROJECT_DEFAULT_STATUS });
  }

  fetchAndSetData = params => {
    const { match, fetchElectronicTagProjectList } = this.props;
    const query = getQuery(match);
    const location = getLocation(match) || {};

    const { productCode, projectCode, projectPage: queryPage, status } = query;
    const variables = { productCode, projectCode, status, ...params, size: DEFAULT_PAGE_SIZE };
    location.query = { ...location.query, ...variables };
    setLocation(this.props, () => location.query);

    const { projectPage, ...restParams } = variables;

    if (typeof fetchElectronicTagProjectList === 'function') {
      fetchElectronicTagProjectList({ ...restParams, page: projectPage || queryPage });
    }
  };

  renderTable = () => {
    const {
      match,
      electronicTagSelectProject,
      changeSelectAllTags,
      saveQueryParamsForTagList,
      saveSelectedTagIds,
      electronicTagPrint,
    } = this.props;
    const { selectedProjectInfo, projectList } = electronicTagPrint || {};
    const { projectListData, projectListDataTotalAmount } = projectList || {};

    return (
      <Table
        match={match}
        fetchData={this.fetchAndSetData}
        data={projectListData}
        total={projectListDataTotalAmount}
        selectedProjectInfo={selectedProjectInfo}
        electronicTagSelectProject={electronicTagSelectProject}
        changeSelectAllTags={changeSelectAllTags}
        saveQueryParamsForTagList={saveQueryParamsForTagList}
        saveSelectedTagIds={saveSelectedTagIds}
        pageSize={DEFAULT_PAGE_SIZE}
      />
    );
  };

  renderHeader = () => {
    const { changeChineseToLocale } = this.context;
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'nowrap',
        }}
      >
        <div style={{ color: black, fontSize: '16px', whiteSpace: 'nowrap' }}>{changeChineseToLocale('项目清单')}</div>
        <div>
          <Filter fetchData={this.fetchAndSetData} />
        </div>
      </div>
    );
  };

  render() {
    const loading = _.get(this.props, 'electronicTagPrint.projectList.loading');

    return (
      <Spin spinning={!!loading}>
        {this.renderHeader()}
        {this.renderTable()}
      </Spin>
    );
  }
}

ProjectList.contextTypes = {
  changeChineseToLocale: PropTypes.any,
};

export default connect(
  ({ electronicTagPrint }) => ({ electronicTagPrint }),
  {
    electronicTagSelectProject,
    changeSelectAllTags,
    saveQueryParamsForTagList,
    saveSelectedTagIds,
    fetchElectronicTagProjectList,
  },
)(withRouter(ProjectList));
