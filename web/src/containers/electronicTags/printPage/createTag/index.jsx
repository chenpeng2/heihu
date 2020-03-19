import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { black } from 'src/styles/color';
import { fetchElectronicTagTagList, fetchElectronicTagProjectList } from 'src/store/redux/actions';

import TagSelect from './tagSelect';

type Props = {
  style: {},
  electronicTagPrint: any,
  fetchElectronicTagTagList: any,
  fetchElectronicTagProjectList: any,
};

class CreateTag extends Component {
  state = {};
  props: Props;

  renderTagSelect = () => {
    const { electronicTagPrint, fetchElectronicTagProjectList, fetchElectronicTagTagList } = this.props;
    const { projectList, tagList, selectedProjectInfo } = electronicTagPrint || {};

    return (
      <TagSelect
        cbForCreateTag={() => {
          // 创建完标签后需要重新拉取项目列表和标签列表的数据
          if (typeof fetchElectronicTagProjectList) {
            fetchElectronicTagProjectList(projectList ? projectList.params : {});
          }

          if (typeof fetchElectronicTagTagList) {
            fetchElectronicTagTagList(tagList ? tagList.params : {});
          }
        }}
        selectedProjectInfo={selectedProjectInfo || null}
      />
    );
  };

  render() {
    // 如果没有选中项目那么不显示
    const { electronicTagPrint } = this.props;
    const { changeChineseToLocale } = this.context;
    if (!(electronicTagPrint && electronicTagPrint.selectedProjectInfo)) return null;

    return (
      <div>
        <div style={{ color: black, margin: '20px 0px', fontSize: '16px' }}>{changeChineseToLocale('条码标签生成')}</div>
        <div style={{ marginBottom: 20 }}>{this.renderTagSelect()}</div>
      </div>
    );
  }
}

CreateTag.contextTypes = {
    changeChineseToLocale: PropTypes.any,
};

export default connect(
  ({ electronicTagPrint }) => {
    return { electronicTagPrint };
  },
  {
    fetchElectronicTagTagList,
    fetchElectronicTagProjectList,
  },
)(CreateTag);
