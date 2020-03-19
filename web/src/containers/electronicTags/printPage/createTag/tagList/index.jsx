import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { Spin, Checkbox, Icon } from 'src/components';
import { primary, error } from 'src/styles/color';
import { getQuery, getLocation } from 'src/routes/getRouteParams';
import { setLocation } from 'utils/url';
import {
  changeSelectAllTags,
  saveSelectedTagIds,
  fetchElectronicTagTagList,
  fetchElectronicTagProjectList,
} from 'src/store/redux/actions';

import Table from './table';
import Filter from './filter';
import ExportModal from './exportModal';
import DeleteModal from './deleteModal';

type Props = {
  style: {},
  match: {},
  electronicTagPrint: any,
  changeSelectAllTags: any,
  saveSelectedTagIds: any,
  fetchElectronicTagProjectList: any,
  fetchElectronicTagTagList: any,
};

class TagList extends Component {
  state = {
    exportModalVisible: false,
    deleteModalVisible: false,
  };
  props: Props;

  componentDidMount() {
    this.fetchAndSetData();
  }

  componentWillReceiveProps(nextProps) {
    if (
      !_.isEqual(
        _.get(nextProps, 'electronicTagPrint.selectedProjectInfo'),
        _.get(this.props, 'electronicTagPrint.selectedProjectInfo'),
      )
    ) {
      this.fetchAndSetData(null, nextProps);
    }
  }

  fetchAndSetData = (params, props) => {
    const { electronicTagPrint, fetchElectronicTagTagList, match } = props || this.props;
    const { productCode, projectCode } = _.get(electronicTagPrint, 'selectedProjectInfo') || {};
    if (!productCode || !productCode) return;

    const query = getQuery(match);
    const _params = {
      ...query,
      sorts: [{ sortByField: 'labelSeq', sortAsc: false }],
      ...params,
      searchKeys: [{ projectCode, productCode }],
      size: 10,
    };
    const { tagPage, ...rest } = _params;

    if (typeof fetchElectronicTagTagList === 'function') {
      fetchElectronicTagTagList({ ...rest, page: tagPage || 1 });
    }

    const location = getLocation(match) || {};
    location.query = { ...location.query, ..._params };
    setLocation(this.props, () => location.query);
  };

  renderTable = () => {
    const { saveSelectedTagIds, electronicTagPrint, match } = this.props;
    const { selectedTagIds, selectAllTags, tagList } = electronicTagPrint || {};
    const { tagListData: data, tagListDataTotalAmount: totalAmount } = tagList || {};

    return (
      <Table
        match={match}
        saveSelectedTagIds={saveSelectedTagIds}
        selectedAll={selectAllTags}
        selectedLabelIds={selectedTagIds}
        data={Array.isArray(data) ? data : []}
        totalAmount={totalAmount || 0}
        fetchData={variables => this.fetchAndSetData(variables)}
      />
    );
  };

  renderHeader = () => {
    const { electronicTagPrint, changeSelectAllTags } = this.props;
    const { changeChineseToLocale } = this.context;
    const { selectedTagIds, selectAllTags } = electronicTagPrint || {};

    const disableStatus = (!Array.isArray(selectedTagIds) || !selectedTagIds.length) && !selectAllTags;

    return (
      <div
        style={{
          margin: '20px 0px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
          <Checkbox
            style={{ display: 'inline-block' }}
            checked={selectAllTags}
            onChange={v => {
              const checked = v.target.checked;
              if (typeof changeSelectAllTags === 'function') changeSelectAllTags(checked);
            }}
          >
            全选
          </Checkbox>
          <div
            style={{ display: 'inline-block', color: primary, margin: '0px 10px', cursor: 'pointer' }}
            onClick={() => {
              if (disableStatus) return;
              this.setState({ exportModalVisible: true });
            }}
          >
            <Icon type={'upload'} />
            <span>{changeChineseToLocale('导出')}</span>
          </div>
          <div
            style={{ display: 'inline-block', color: error, margin: '0px 10px', cursor: 'pointer' }}
            onClick={() => {
              if (disableStatus) return;
              this.setState({ deleteModalVisible: true });
            }}
          >
            <Icon type={'delete'} />
            <span>{changeChineseToLocale('删除')}</span>
          </div>
        </div>
        <div>
          <Filter fetchData={this.fetchAndSetData} />
        </div>
      </div>
    );
  };

  render() {
    const { exportModalVisible, deleteModalVisible } = this.state;
    const { electronicTagPrint, fetchElectronicTagProjectList, fetchElectronicTagTagList } = this.props;
    const { selectedProjectInfo, tagList, projectList } = electronicTagPrint || {};
    const { productCode, projectCode } = selectedProjectInfo || {};
    const { loading } = tagList || {};

    // 如果没有选中项目那么不展示
    if (!(projectCode && productCode)) return null;

    return (
      <Spin spinning={loading}>
        <div>
          {this.renderHeader()}
          {this.renderTable()}
        </div>
        <ExportModal
          electronicTagPrint={electronicTagPrint}
          cbForExport={p => this.fetchAndSetData({ ...p }, this.props)}
          visible={exportModalVisible}
          closeModal={() => {
            this.setState({ exportModalVisible: false });
          }}
        />
        <DeleteModal
          electronicTagPrint={electronicTagPrint}
          visible={deleteModalVisible}
          closeModal={() => {
            this.setState({ deleteModalVisible: false });
          }}
          cbForDelete={() => {
            // 删除后需要重新拉取项目列表和标签列表的数据
            if (typeof fetchElectronicTagProjectList === 'function') {
              fetchElectronicTagProjectList(projectList ? projectList.params : {});
            }

            // this.fetchAndSetData(null, this.props);
            if (typeof fetchElectronicTagTagList === 'function') {
              fetchElectronicTagTagList(tagList ? tagList.params : {});
            }
          }}
        />
      </Spin>
    );
  }
}

TagList.contextTypes = {
  changeChineseToLocale: PropTypes.any,
};

export default connect(
  ({ electronicTagPrint }) => {
    return { electronicTagPrint };
  },
  { changeSelectAllTags, saveSelectedTagIds, fetchElectronicTagProjectList, fetchElectronicTagTagList },
)(withRouter(TagList));
