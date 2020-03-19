import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';

import { message, Modal, Icon, RestPagingTable } from 'src/components';
import { black, alertYellow } from 'src/styles/color';
import { deleteBarcodeLabel, getBarcodeLabelList } from 'src/services/barCodeLabel';
import styles from './styles.scss';

import { getColumns } from './table';

const AntModal = Modal.AntModal;

type Props = {
  style: {},
  visible: boolean,
  closeModal: () => {},
  cbForDelete: () => {},
  electronicTagPrint: any,
};

class DeleteModal extends Component {
  state = {
    selectedLabels: [],
    total: 0,
  };
  props: Props;

  componentDidMount() {
    this.getSelectedLabels(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(nextProps.electronicTagPrint, this.props.electronicTagPrint)) {
      this.getSelectedLabels(nextProps);
    }
  }

  getSelectedLabels = (props, extraParams) => {
    const { electronicTagPrint } = props || this.props;
    const {
      queryParamsForTagList: selectParams,
      selectAllTags: deleteAll,
      selectedProjectInfo,
      selectedTagIds: selectedLabelIds,
    } = electronicTagPrint || {};
    const { projectCode, productCode } = selectedProjectInfo || {};

    if (!projectCode) return;

    if ((!Array.isArray(selectedLabelIds) || !selectedLabelIds.length) && !deleteAll) {
      this.setState({ selectedLabels: [] });
      return;
    }

    let params = {};
    if (!deleteAll) {
      params.searchBarcodeLabelIds = selectedLabelIds;
    }
    if (deleteAll) {
      params = selectParams || {};
    }
    params.searchKeys = [{ projectCode, productCode }];

    getBarcodeLabelList({ ...extraParams, ...params, size: 5 }).then(res => {
      const data = _.get(res, 'data.data');
      const total = _.get(res, 'data.total');

      this.setState({
        selectedLabels: data,
        total,
      });
    });
  };

  renderHeader = () => {
    const { total } = this.state;
    const { changeChineseTemplateToLocale, changeChineseToLocale } = this.context;

    return (
      <div style={{ marginBottom: 20 }}>
        <Icon style={{ fontSize: '40px', color: alertYellow, marginRight: 20 }} type={'exclamation-circle'} />
        <div style={{ display: 'inline-block' }}>
          <div style={{ color: black, fontSize: 16 }}>{changeChineseToLocale('确认删除')}</div>
          <div>
            {changeChineseTemplateToLocale('确认删除以下{amount}个条码标签吗？删除后将不能恢复!', { amount: total })}
          </div>
        </div>
      </div>
    );
  };

  renderTable = () => {
    const { selectedLabels, total } = this.state;
    const columns = getColumns();

    return (
      <RestPagingTable
        pageSize={5}
        scroll={{ x: 1800 }}
        style={{ margin: 0 }}
        columns={columns}
        dataSource={selectedLabels || []}
        total={total}
        refetch={p => {
          this.getSelectedLabels(null, p);
        }}
      />
    );
  };

  render() {
    const { electronicTagPrint, visible, closeModal, cbForDelete } = this.props;
    const { queryParamsForTagList: selectParams, selectAllTags: deleteAll, selectedTagIds: selectedLabelIds } =
      electronicTagPrint || {};
    const { selectedLabels } = this.state;
    const { changeChineseToLocale } = this.context;

    return (
      <div>
        <AntModal
          onCancel={() => {
            if (typeof closeModal === 'function') closeModal();
          }}
          onOk={() => {
            if (!Array.isArray(selectedLabels) || !selectedLabels.length) {
              message.error('没有条码标签');
              if (typeof closeModal === 'function') closeModal();

              return;
            }

            const params = {
              barcodeLabelIds: selectedLabelIds,
              deleteAll,
              search: selectParams,
            };

            deleteBarcodeLabel(params).then(() => {
              this.setState(
                {
                  selectedLabels: [],
                  total: 0,
                },
                () => {
                  if (typeof cbForDelete === 'function') cbForDelete();
                  if (typeof closeModal === 'function') closeModal();
                },
              );
              message.success('删除条码标签成功');
            });
          }}
          visible={visible}
          width={600}
          okText={changeChineseToLocale('确认删除')}
          cancelText={changeChineseToLocale('取消')}
          wrapClassName={styles.deleteModal}
        >
          {this.renderHeader()}
          <div style={{ paddingBottom: 30 }}>{this.renderTable()}</div>
        </AntModal>
      </div>
    );
  }
}

DeleteModal.contextTypes = {
  changeChineseToLocale: PropTypes.any,
  changeChineseTemplateToLocale: PropTypes.any,
};

export default DeleteModal;
