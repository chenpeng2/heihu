import React, { Component } from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { openModal, Checkbox, Button, FormattedMessage } from 'src/components';
import { black, primary, fontSub, greyWhite, border } from 'src/styles/color';
import { getLabelInfoForPrint } from 'src/services/barCodeLabel';
import { fetchElectronicTagProjectList, fetchElectronicTagTagList } from 'src/store/redux/actions';

import NormalPrintModel from './normalPrintModel';
import ZebraPrintModel from './zebraModel';
import { saveUseDefaultTemplate, getUseDefaultTemplate } from '../utils';

const itemStyle = {
  color: fontSub,
  margin: '0px 10px',
  verticalAlign: 'middle',
};

type Props = {
  style: {},
  electronicTagPrint: any,
  fetchElectronicTagProjectList: any,
  fetchElectronicTagTagList: any,
};

class ChoosePrint extends Component {
  state = {
    showQrCodeModal: false,
    qrCodeType: null,
    qrCodeModalType: null,
    selectedLabels: [],
    printTemplateType: 1,
    useDefaultTemplate: getUseDefaultTemplate() || false,
  };
  props: Props;

  componentDidMount() {
    this.getSelectedLabels(this.props, this.state.printTemplateType);
  }

  componentWillReceiveProps(nextProps) {
    this.getSelectedLabels(nextProps, this.state.printTemplateType);
  }

  getSelectedLabels = (props, printTemplateType) => {
    if (!props) return;

    const { electronicTagPrint } = props;
    const {
      selectedProjectInfo,
      selectAllTags,
      selectedTagIds: selectedLabelIds,
      queryParamsForTagList: selectLabelParams,
    } = electronicTagPrint || {};

    if ((!Array.isArray(selectedLabelIds) || !selectedLabelIds.length) && !selectAllTags) {
      this.setState({ selectedLabels: [] });
      return;
    }
    if (typeof printTemplateType !== 'number') {
      this.setState({ selectedLabels: [] });
      return;
    }

    const params = { returnProjectInfo: true, printTemplateType, printAll: selectAllTags };
    if (!selectAllTags) {
      params.barcodeLabelIds = selectedLabelIds;
    }
    if (selectAllTags) {
      params.search = selectLabelParams || {};
      params.search.searchKeys = [selectedProjectInfo];
    }

    getLabelInfoForPrint(params).then(res => {
      const data = _.get(res, 'data.data');

      this.setState({
        selectedLabels: data,
      });
    });
  };

  render() {
    const { selectedLabels } = this.state;
    const { changeChineseToLocale } = this.context;
    const { electronicTagPrint, fetchElectronicTagProjectList, fetchElectronicTagTagList } = this.props;
    const { selectAllTags: selectedAllLabels, selectedTagIds: selectedLabelIds, projectList, tagList } =
      electronicTagPrint || {};

    // 如果没有选择标签那么不显示
    if ((!Array.isArray(selectedLabelIds) || !selectedLabelIds.length) && !selectedAllLabels) return null;

    const amount = Array.isArray(selectedLabels) ? selectedLabels.length : 0;
    const hasSelected = Array.isArray(selectedLabels) && selectedLabels.length;

    return (
      <div style={{ marginTop: 60 }}>
        <div style={{ color: black, fontSize: 16, margin: '10px 0px' }}>{changeChineseToLocale('条码标签打印')}</div>
        <div style={{ background: greyWhite, border: `1px dashed ${border}`, padding: 20 }}>
          <span style={itemStyle}>
            <FormattedMessage
              defaultMessage={'已选择{amount}个结果'}
              values={{
                amount: <span style={{ color: primary }}> {amount || 0} </span>,
              }}
            />
          </span>
          <div style={{ display: 'inline-block', float: 'right' }}>
            <Checkbox
              checked={this.state.useDefaultTemplate}
              style={{ display: 'inline-block' }}
              onChange={e => {
                const value = e.target.checked;
                this.setState({ useDefaultTemplate: value }, () => {
                  saveUseDefaultTemplate(value);
                });
              }}
            >
              默认模版
            </Checkbox>
            <Button
              icon={'printer'}
              onClick={() => {
                if (this.state.useDefaultTemplate) {
                  openModal({
                    children: (
                      <NormalPrintModel
                        cbForPrint={() => {
                          // 打印后需要重新拉取项目列表和标签列表的数据
                          if (typeof fetchElectronicTagProjectList) {
                            fetchElectronicTagProjectList(projectList ? projectList.params : {});
                          }

                          if (typeof fetchElectronicTagTagList) {
                            fetchElectronicTagTagList(tagList ? tagList.params : {});
                          }
                        }}
                        labels={selectedLabels}
                        printAmount={amount}
                      />
                    ),
                    footer: null,
                    title: changeChineseToLocale('标签模版打印参数设置'),
                    width: 600,
                  });
                } else {
                  openModal({
                    children: (
                      <ZebraPrintModel
                        cbForPrint={() => {
                          // 打印后需要重新拉取项目列表和标签列表的数据
                          if (typeof fetchElectronicTagProjectList) {
                            fetchElectronicTagProjectList(projectList ? projectList.params : {});
                          }

                          if (typeof fetchElectronicTagTagList) {
                            fetchElectronicTagTagList(tagList ? tagList.params : {});
                          }
                        }}
                        labels={selectedLabels}
                        printAmount={amount}
                      />
                    ),
                    footer: null,
                    title: changeChineseToLocale('标签模版打印参数设置'),
                  });
                }
              }}
              disabled={!hasSelected}
            >
              打印
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

ChoosePrint.contextTypes = {
  changeChineseToLocale: PropTypes.any,
};

export default connect(
  ({ electronicTagPrint }) => {
    return { electronicTagPrint };
  },
  {
    fetchElectronicTagProjectList,
    fetchElectronicTagTagList,
  },
)(ChoosePrint);
