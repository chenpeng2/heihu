import React, { Component } from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Popconfirm, Tooltip, message, Spin } from 'antd';

import moment from 'utils/time';
import { Icon, Attachment, Link, Row, Col, openModal, Table, FormattedMessage } from 'components';
import { content, primary, error } from 'styles/color/index';
import { arrayIsEmpty } from 'utils/array';
import { replaceSign } from 'constants';
import QcConfigDetailBase from 'containers/qcConfig/detail/base';
import { queryMaterialDetail, updateMaterialStatus } from 'services/bom/material';
import CustomFieldsTable from 'containers/material/detail/customFieldsTable';
import UnitSettingModal from 'containers/material/commonComponent/form/convertUnit/unitSettingModal';
import auth from 'utils/auth';
import { getMaterialCheckDateConfig, useFrozenTime, isOrganizationUseQrCode } from 'utils/organizationConfig';
import { changeChineseToLocaleWithoutIntl } from 'utils/locale/utils';
import MaterialSpecificationsTable from '../baseComponent/materailSpecificationsTable';
import LinkToCopyMaterial from '../baseComponent/linkToCopyMaterial';
import { NEEDREQUESTMATERIAL_VALUE_DISPLAY_MAP, qualityOptions } from '../utils';
import styles from './styles.scss';
import MaterialStatus from '../baseComponent/MaterialStatus';

const AttachmentFile = Attachment.AttachmentFile;

type Props = {
  match: any,
  match: {
    params: {
      materialCode: string,
    },
  },
  location: {
    pathname: String,
  },
};

class MaterialDetail extends Component {
  props: Props;
  state = {
    successVisible: false,
    failedVisible: false,
    loading: false,
    updateMessage: null,
    data: [],
  };

  componentDidMount() {
    this.setState({ loading: true });
    const {
      match: {
        params: { materialCode },
      },
    } = this.props;
    this.fetchData(decodeURIComponent(materialCode));
  }

  fetchData = async code => {
    const {
      data: { data },
    } = await queryMaterialDetail(code);
    this.setState({
      data,
      loading: false,
    });
  };

  confirm = () => {
    this.setState({ failedVisible: false });
  };

  cancel = () => {
    message.error('Click on No');
  };

  getConvert = data => {
    const { unitConversions, unitName } = data;
    return unitConversions.map(({ masterUnitCount, slaveUnitCount, slaveUnitName }, index) => {
      const display = `${masterUnitCount} ${unitName} = ${slaveUnitCount} ${slaveUnitName}`;
      return <p key={`unitConversions-${index}`}>{display}</p>;
    });
  };

  getReplaceMaterialColumns = () => {
    return [
      {
        title: '物料编号／名称',
        render: record => {
          const { code, name } = record;
          return `${code}/${name}`;
        },
      },
    ];
  };

  getUnitForSelect = data => {
    const { unitId, unitName, unitConversions } = data;
    return [
      {
        key: 'mainUnit',
        unit: {
          id: unitId,
          name: unitName,
        },
      },
    ].concat(
      unitConversions &&
        unitConversions.map(({ slaveUnitName, slaveUnitId }) => ({
          unit: {
            id: slaveUnitId,
            name: slaveUnitName,
          },
        })),
    );
  };

  renderButton = (code, status) => {
    return (
      <MaterialStatus
        style={{ marginLeft: 10 }}
        code={code}
        status={status}
        callback={() => {
          const {
            match: {
              params: { materialCode },
            },
          } = this.props;
          this.fetchData(decodeURIComponent(materialCode));
        }}
      />
    );
  };

  renderStatus = status => {
    return (
      <Tooltip
        visible={this.state.successVisible}
        onVisibleChange={visible => {
          this.setState({ successVisible: visible });
        }}
        overlayStyle={{ width: 116 }}
        trigger="click"
        placement="top"
        getPopupContainer={() => document.getElementById('material_detail')}
        title={
          <div style={{ color: content, padding: '10px 0' }}>
            <Icon type={'check-circle'} style={{ color: primary, margin: '0 4px 0 15px' }} />
            {status === 1 ? '启用成功！' : '停用成功！'}
          </div>
        }
      >
        <span>{changeChineseToLocaleWithoutIntl(status === 1 ? '启用中' : '停用中')}</span>
      </Tooltip>
    );
  };

  render() {
    const materialCode = _.get(this.props, 'match.params.materialCode');
    const { data } = this.state;
    const {
      materialCustomFields,
      attachmentDetails,
      attachments,
      qcConfigDetails,
      replaceMaterialList,
      code,
      name,
      status,
      unitName,
      proUseUnitId,
      proHoldUnitId,
      inputFactoryUnitId,
      desc,
      fifo,
      materialTypes,
      validTime,
      warningTime,
      specifications,
      createdAt,
      checkDate,
      preCheckDays,
      needRequestMaterial,
      frozenTime,
      safeStorageAmount,
      qcStatus,
      issueWarehouseName,
      qcOperator,
    } = data || {};

    const rowsRender = [
      { label: '名称', render: name || replaceSign },
      { label: '编号', render: code || replaceSign },
      {
        label: '状态',
        render: (
          <React.Fragment>
            {this.renderStatus(status)}
            {this.renderButton(code, status)}
          </React.Fragment>
        ),
      },
      {
        label: '物料类型',
        render:
          Array.isArray(materialTypes) && materialTypes.length
            ? materialTypes
                .map(i => i && i.name)
                .filter(i => i)
                .join(',')
            : replaceSign,
      },
      {
        label: '主单位',
        render: (
          <React.Fragment>
            {unitName || replaceSign}
            <Link
              style={{ paddingLeft: 10 }}
              onClick={() => {
                openModal({
                  title: '查看单位设置',
                  children: (
                    <UnitSettingModal
                      disabled
                      units={this.getUnitForSelect(data)}
                      proUseUnitId={proUseUnitId}
                      proHoldUnitId={proHoldUnitId}
                      inputFactoryUnitId={inputFactoryUnitId}
                    />
                  ),
                  footer: null,
                });
              }}
            >
              查看单位设置
            </Link>
          </React.Fragment>
        ),
      },
      { label: '转换单位', render: _.get(data, 'unitConversions.length') ? this.getConvert(data) : replaceSign },
      { label: '先进先出', render: fifo ? '是' : '否' },
      { label: '存储有效期', render: typeof validTime === 'number' ? `${validTime} 天` : replaceSign },
      { label: '预警提前期', render: typeof warningTime === 'number' ? `${warningTime} 天` : replaceSign },
      isOrganizationUseQrCode() && {
        label: '安全库存',
        render: (
          <React.Fragment>
            {typeof safeStorageAmount === 'number' ? `${safeStorageAmount} ${unitName}` : replaceSign}
            {!arrayIsEmpty(qcStatus) ? (
              <span style={{ paddingLeft: 10 }}>
                {changeChineseToLocaleWithoutIntl('包含质量状态')}：
                {qualityOptions
                  .filter(e => qcStatus.find(status => e.value === status))
                  .map(e => changeChineseToLocaleWithoutIntl(e.label))
                  .join(',')}
              </span>
            ) : null}
          </React.Fragment>
        ),
      },
      { label: '发料仓库', render: issueWarehouseName || replaceSign },
      { label: '入厂规格', render: <MaterialSpecificationsTable data={specifications} /> },
      { label: '规格描述', render: desc === '' ? replaceSign : desc },
      {
        label: '替代物料',
        render: _.get(data, 'replaceMaterialList.length') ? (
          <Table
            pagination={false}
            style={{ margin: 0, minWidth: 360 }}
            columns={this.getReplaceMaterialColumns()}
            total={replaceMaterialList.length}
            dataSource={replaceMaterialList}
          />
        ) : (
          replaceSign
        ),
      },
      {
        label: '附件',
        render: attachments && attachments.length > 0 ? AttachmentFile(attachmentDetails) : replaceSign,
      },
      getMaterialCheckDateConfig() && {
        label: '物料审核日期',
        render: checkDate ? moment(checkDate).format('YYYY/MM/DD') : replaceSign,
      },
      getMaterialCheckDateConfig() && {
        label: '审核预警提前期',
        render: typeof preCheckDays === 'number' ? `${preCheckDays} 天` : replaceSign,
      },
      useFrozenTime() && {
        label: '冻结时间',
        render: (
          <React.Fragment>
            {frozenTime || replaceSign} <FormattedMessage defaultMessage={'小时'} />
          </React.Fragment>
        ),
      },
      { label: '请料方式', render: NEEDREQUESTMATERIAL_VALUE_DISPLAY_MAP[needRequestMaterial] },
      { label: '自定义字段', render: <CustomFieldsTable data={materialCustomFields} /> },
      { label: '出入厂检质检员', render: qcOperator ? qcOperator.name : replaceSign },
      {
        label: '质检方案',
        style: {
          width: 920,
          border: '1px solid rgba(0, 20, 14, 0.1)',
          backgroundColor: '#fafafa',
          padding: 10,
          fontSize: 12,
        },
        render:
          Array.isArray(data && data.qcConfigDetails) && data.qcConfigDetails.length > 0
            ? qcConfigDetails.map((qcConfig, index) => (
                <div
                  key={qcConfig.id}
                  style={{
                    border: '1px solid rgba(0, 20, 14, 0.1)',
                    backgroundColor: '#fff',
                    margin: 10,
                    padding: 20,
                  }}
                >
                  <div className={styles.index}>{index + 1}</div>
                  <QcConfigDetailBase material={data} qcConfig={qcConfig} />
                </div>
              ))
            : replaceSign,
      },
      { label: '创建时间', render: createdAt ? moment(createdAt).format('YYYY/MM/DD HH:mm:ss') : replaceSign },
    ].filter(n => n);
    return (
      <Spin spinning={this.state.loading}>
        <div id="material_detail" className={styles.materialDetail} style={{ paddingBottom: 50 }}>
          <Row style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 0 30px 20px' }}>
            <Col>
              <p className={styles.header}>{changeChineseToLocaleWithoutIntl('物料详情')}</p>
            </Col>
            <Col>
              <Link
                auth={auth.WEB_EDIT_MATERIAL_DEF}
                icon="form"
                style={{ marginRight: 40 }}
                onClick={() => {
                  this.context.router.history.push(`/bom/materials/${encodeURIComponent(data.code)}/edit`);
                }}
              >
                编辑
              </Link>
              <LinkToCopyMaterial withIcon materialCode={code} />
              <Link
                icon="bars"
                onClick={() => {
                  this.context.router.history.push(
                    `/bom/materials/${encodeURIComponent(materialCode)}/detail/operationHistory`,
                  );
                }}
              >
                查看操作记录
              </Link>
            </Col>
          </Row>
          <div>
            {rowsRender.map(({ label, render }) => (
              <Row key={label}>
                <Col type="title">{label}</Col>
                <Col type="content" style={{ width: 620 }}>
                  {render}
                </Col>
              </Row>
            ))}
          </div>
        </div>
      </Spin>
    );
  }
}

MaterialDetail.contextTypes = {
  router: PropTypes.object.isRequired,
};

export default withRouter(MaterialDetail);
