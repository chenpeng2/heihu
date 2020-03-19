import React, { Component } from 'react';
import _ from 'lodash';
import auth from 'utils/auth';
import moment from 'src/utils/time';
import { Table, Link, Icon, openModal, message, buttonAuthorityWrapper, haveAuthority } from 'src/components';
import { borderGrey, error, border, black, white } from 'src/styles/color';
import {
  deleteProdEquipPlanDownTime,
  deleteProdEquipRecordDownTime,
  deleteEquipModulePlanDownTime,
  deleteEquipModuleRecordDownTime,
} from 'services/equipmentMaintenance/base';
import { injectIntl } from 'react-intl';
import { changeChineseToLocale } from 'utils/locale/utils';
import { replaceSign } from 'src/constants';
import DeviceDownTimeModal from './deviceDownTimeModal';
import styles from './index.scss';

const LinkWithAuth = buttonAuthorityWrapper(Link);

type Props = {
  data: [],
  intl: any,
  taskStrategies: [],
  type: string,
  equipType: string,
  deviceId: any,
  handleSubmit: () => {},
  setPageDeviceLog: () => {},
};
let tag = 0;

class DeviceDownTime extends Component {
  props: Props;

  state = {
    deviceProp: [],
    keys: [1],
    metricList: [],
    search: '',
  };

  componentWillReceiveProps(nextProps) {
    const { data } = nextProps;
    if (data && Array.isArray(data) && data.length > 0) {
      const _keys = [];
      data.forEach((_, index) => {
        _keys.push(index + 1);
        tag += 1;
      });
      this.setState({ keys: _keys });
    }
  }

  getColumns = () => {
    const { type } = this.props;
    return [
      {
        title: `${type === 'plan' ? '计划' : '实际'}停机时间`,
        width: 380,
      },
    ];
  };

  renderFormItems = () => {
    const { data, type, equipType, deviceId, handleSubmit, setPageDeviceLog, intl } = this.props;
    const { keys } = this.state;
    let deleteDownTime = null;
    if (type === 'plan') {
      if (equipType === 'device') {
        deleteDownTime = deleteProdEquipPlanDownTime;
      } else {
        deleteDownTime = deleteEquipModulePlanDownTime;
      }
    } else if (equipType === 'device') {
      deleteDownTime = deleteProdEquipRecordDownTime;
    } else {
      deleteDownTime = deleteEquipModuleRecordDownTime;
    }
    const formItems = keys.map((n, index) => {
      const disabled = data && data[index] && data[index].endTime && data[index].endTime < Date.parse(moment());
      const modalDisabled =
        disabled || !haveAuthority(type === 'plan' ? auth.WEB_EDIT_PLAN_DOWNTIME : auth.WEB_EDIT_ACTUAL_DOWNTIME);
      return (
        <div
          style={{
            height: 46,
            lineHeight: '48px',
            border: `1px solid ${borderGrey}`,
            borderTopWidth: 0,
            marginLeft: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {!disabled && haveAuthority(type === 'plan' ? auth.WEB_DEL_PLAN_DOWNTIME : auth.WEB_DEL_ACTUAL_DOWNTIME) ? (
              <Icon
                type={'minus-circle'}
                style={{ margin: '0 7px', color: error, cursor: 'pointer', lineHeight: '46px' }}
                onClick={() => {
                  if (data && data[index] && data[index].id) {
                    deleteDownTime(deviceId, data[index].id).then(() => {
                      message.success('删除成功！');
                      data.splice(index, 1);
                      setPageDeviceLog();
                      handleSubmit();
                    });
                  }
                  this.setState({ keys: keys.filter(key => key !== n) });
                }}
              />
            ) : (
              <span style={{ width: 28, height: 46, lineHeight: 46 }} />
            )}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '60%',
                height: 32,
                padding: '0 10px',
                border: `1px solid ${modalDisabled ? '#D3D8E3' : border}`,
                backgroundColor: modalDisabled ? '#f5f5f5' : white,
                color: data && data[index] ? black : '#B8BFCF',
                cursor: modalDisabled ? 'not-allowed' : 'pointer',
              }}
              onClick={() => {
                if (!modalDisabled) {
                  openModal(
                    {
                      title: type === 'plan' ? '计划停机' : '实际停机',
                      children: (
                        <DeviceDownTimeModal
                          planId={data && data[index] && data[index].id}
                          action={data && data[index] ? 'edit' : 'create'}
                          data={data}
                          time={data && data[index]}
                          handleSubmit={handleSubmit}
                          type={type}
                          deviceId={deviceId}
                          equipType={equipType}
                          setPageDeviceLog={setPageDeviceLog}
                        />
                      ),
                      getContainer: () => document.getElementsByClassName(styles.deviceDownTime)[0],
                      footer: null,
                      width: 660,
                    },
                    this.context,
                  );
                }
              }}
            >
              <span>
                {changeChineseToLocale(
                  data && data[index]
                    ? `${moment(data[index].startTime).format('YYYY/MM/DD HH:mm')} ~ ${
                        data[index].endTime ? moment(data[index].endTime).format('YYYY/MM/DD HH:mm') : replaceSign
                      }`
                    : '开始时间~结束时间',
                  intl,
                )}
              </span>
              <Icon type="calendar" />
            </div>
          </div>
        </div>
      );
    });
    return formItems;
  };

  render() {
    const { type } = this.props;
    const { keys } = this.state;
    const columns = this.getColumns();

    return (
      <div className={styles.deviceDownTime}>
        <Table columns={columns} dataSource={[]} pagination={false} />
        <div tyle={{ maxHeight: 230, overflowY: 'scroll' }}>{this.renderFormItems()}</div>
        <div
          style={{
            height: 46,
            lineHeight: '48px',
            border: `1px solid ${borderGrey}`,
            borderTopWidth: 0,
            marginLeft: 20,
          }}
        >
          <LinkWithAuth
            style={{ marginLeft: 10 }}
            icon={'plus-circle-o'}
            auth={type === 'plan' ? auth.WEB_ADD_PLAN_DOWNTIME : auth.WEB_ADD_ACTUAL_DOWNTIME}
            onClick={() => {
              const items = document.getElementsByClassName(styles.deviceDownTime)[0];
              const nextKeys = keys.concat((tag += 1));
              this.setState({ keys: nextKeys });
              setTimeout(() => {
                items.scrollTop = items.scrollHeight - parseInt(items.style.maxHeight, 10);
              }, 100);
            }}
          >
            {`添加${type === 'plan' ? '计划' : '实际'}停机`}
          </LinkWithAuth>
        </div>
      </div>
    );
  }
}

export default injectIntl(DeviceDownTime);
