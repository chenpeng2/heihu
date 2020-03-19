import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';

import { withForm, Modal, FormItem, TreeSelect } from 'src/components';
import { exportBarcodeLabel } from 'src/services/barCodeLabel';
import { exportCsvFileByString } from 'src/utils/exportFile';
import styles from './styles.scss';

import { EXPORT_COLUMN } from '../../../constant';

const AntModal = Modal.AntModal;
const ALL_SELECT_VALUE = 'all';

type Props = {
  style: {},
  form: any,
  visible: boolean,
  closeModal: () => {},
  cbForExport: () => {},
  electronicTagPrint: any,
};

class ExportModal extends Component {
  state = {};
  props: Props;

  renderColumnChooseModal = () => {
    const { form, visible, closeModal, cbForExport, electronicTagPrint } = this.props;
    const { changeChineseToLocale } = this.context;
    const {
      queryParamsForTagList: selectParams,
      selectAllTags: exportAll,
      selectedProjectInfo,
      selectedTagIds: barcodeLabelIds,
    } = electronicTagPrint || {};
    const { projectCode, productCode } = selectedProjectInfo || {};
    const { getFieldDecorator, validateFieldsAndScroll } = form || {};

    const getTreeData = () => {
      const children = Object.values(EXPORT_COLUMN).map((i, index) => {
        const { value, name } = i || {};

        return {
          title: changeChineseToLocale(name),
          value,
          key: `1-${index}`,
        };
      });

      return [
        {
          title: changeChineseToLocale('全选'),
          value: ALL_SELECT_VALUE,
          key: '0-0',
          children,
        },
      ];
    };

    return (
      <div>
        <AntModal
          title={changeChineseToLocale('导出栏位选择')}
          visible={visible}
          onOk={() => {
            if ((!Array.isArray(barcodeLabelIds) || !barcodeLabelIds.length) && !exportAll) return;

            validateFieldsAndScroll((err, value) => {
              if (err) return;

              const _value = {
                exportFields: [],
                barcodeLabelIds,
                exportAll,
                search: selectParams,
              };

              const columns = value ? value.columns : null;

              if (columns === ALL_SELECT_VALUE || (Array.isArray(columns) && columns[0] === ALL_SELECT_VALUE)) {
                _value.exportFields = Object.values(EXPORT_COLUMN).map(i => i.value);
              } else {
                _value.exportFields = columns;
              }
              _value.search.searchKeys = [{ projectCode, productCode }];

              exportBarcodeLabel(_value)
                .then(res => {
                  const csvString = _.get(res, 'data');
                  exportCsvFileByString(csvString, '条码标签');

                  if (typeof cbForExport === 'function') cbForExport({ page: 1 });
                })
                .finally(() => {
                  if (typeof closeModal === 'function') closeModal();
                });
            });
          }}
          onCancel={() => {
            if (typeof closeModal === 'function') closeModal();
          }}
          okText={changeChineseToLocale('确认')}
          cancelText={changeChineseToLocale('取消')}
          wrapClassName={styles.deleteModal}
        >
          <FormItem label={'栏位'}>
            {getFieldDecorator('columns', {
              rules: [
                {
                  required: true,
                  message: '栏位必填',
                },
              ],
              initialValue: ALL_SELECT_VALUE,
            })(
              <TreeSelect
                showCheckedStrategy={TreeSelect.AntTreeSelect.SHOW_PARENT}
                allowClear
                treeCheckable
                style={{ width: 300 }}
                treeData={getTreeData()}
                treeDefaultExpandAll
              />,
            )}
          </FormItem>
        </AntModal>
      </div>
    );
  };

  render() {
    return <div>{this.renderColumnChooseModal()}</div>;
  }
}

ExportModal.contextTypes = {
  changeChineseToLocale: PropTypes.any,
};

export default withForm({}, ExportModal);
