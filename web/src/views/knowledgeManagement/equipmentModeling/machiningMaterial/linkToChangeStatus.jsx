import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { disableMachiningMaterial, enableMachiningMaterial } from 'src/services/knowledgeBase/equipment';
import { Link, buttonAuthorityWrapper, Popconfirm, openModal } from 'src/components';
import { changeChineseToLocaleWithoutIntl } from 'utils/locale/utils';
import { getCustomLanguage } from 'src/utils/customLanguage';
import MBomConfirmModal from './mBomConfirmModal';

const customLanguage = getCustomLanguage();
const LinkWithAuth = buttonAuthorityWrapper(Link);

type Props = {
  record: {},
  onUpdate: () => {},
  style: {},
};

class LinkToChangeStatus extends Component {
  props: Props;
  state = {
    visible: false,
  };

  onConfirm = () => {
    const { record, onUpdate } = this.props;
    const { code } = record || {};
    if (record.status === 1) {
      disableMachiningMaterial(code).then(res => {
        const {
          data: { data, statusCode },
        } = res;
        if (statusCode === 400) {
          const versions = data.map(n => ({ version: n.version }));
          openModal({
            width: 500,
            footer: null,
            children: <MBomConfirmModal mBomVersion={versions} />,
          });
        } else {
          record.status = 0;
          onUpdate(0);
        }
      });
    } else {
      enableMachiningMaterial(code).then(() => {
        record.status = 1;
        record.draft = false;
        onUpdate(1);
      });
    }
  };

  render() {
    const { record, style } = this.props;
    const { changeChineseTemplateToLocale } = this.context;
    const { status, type, draft } = record || {};

    return (
      <span style={{ ...style }}>
        {status === 0 ? (
          <Popconfirm
            title={
              <div style={{ width: 170 }}>
                {changeChineseTemplateToLocale(
                  '该{machiningMaterial}启用后，类型、编码、单位、{type}生命周期管理及电子标签管理不可更改，确定启用吗？',
                  {
                    machiningMaterial: customLanguage.equipment_machining_material,
                    type: `${`${type}` === '2' ? changeChineseToLocaleWithoutIntl('工装类型、') : ''}`,
                  },
                )}
              </div>
            }
            okText={'确定启用'}
            cancelText={'暂不启用'}
            visible={this.state.visible && draft}
            onVisibleChange={value => {
              this.setState({ visible: value });
            }}
            onConfirm={this.onConfirm}
          >
            <LinkWithAuth onClick={draft ? () => {} : this.onConfirm}>启用</LinkWithAuth>
          </Popconfirm>
        ) : (
          <LinkWithAuth onClick={this.onConfirm}>停用</LinkWithAuth>
        )}
      </span>
    );
  }
}

LinkToChangeStatus.contextTypes = {
  changeChineseTemplateToLocale: PropTypes.any,
};

export default LinkToChangeStatus;
