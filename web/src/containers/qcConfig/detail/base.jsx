import React from 'react';
import { withRouter } from 'react-router-dom';
import { Table, Tooltip, Attachment, Link, openModal, Text, Row, Col } from 'components';
import _ from 'lodash';
import { replaceSign } from 'src/constants';
import {
  RECORD_TYPE,
  CHECK_TYPE,
  AQL_CHECK,
  CHECKCOUNT_TYPE,
  CHECKITEM_CHECK,
  QCCONFIG_STATE,
  CHECK_ENTITY_TYPE,
  SAMPLE_RESULT_TYPE,
  RECORD_CHECKITEM_TYPE,
} from 'src/views/qualityManagement/constants';
import { isQcItemCodingManually } from 'utils/organizationConfig';
import { restCheckItemConfigToDisplay } from 'utils/defects';
import EditQcConfig from 'src/views/qualityManagement/qcConfigs/edit/editQcConfig';
import { isQcReportRecordCountSettable, isOrganizationUseQrCode } from 'src/utils/organizationConfig';
import styles from './styles.scss';

const AttachmentFile = Attachment.AttachmentFile;
const colStyle = {
  width: '70%',
};

const render = ({
  qcConfig,
  type,
  submit,
  unitsForSelect,
}: {
  qcConfig: Object,
  hideCheckType: Boolean,
  type: string,
  submit: () => {},
  unitsForSelect: [],
}) => {
  if (!qcConfig) {
    return null;
  }
  const {
    id,
    code: qcConfigCode,
    name,
    state,
    checkCountType,
    recordType,
    checkCount,
    checkType,
    qcUnit,
    qcCheckItemConfigs,
    qcConfigMaterials,
    autoCreateQcTask,
    attachmentDetails,
    taskCreateType,
    scrapInspection,
    taskCreateCount,
    taskCreateInterval,
    checkEntityType,
    checkEntityUnitCount,
    checkEntityUnitUnit,
    recordSampleResultType,
    recordCheckItemType,
  } = qcConfig;
  const useQrCode = isOrganizationUseQrCode();
  const qcReportRecordCountSettable = isQcReportRecordCountSettable();

  const showQcConfigModal = () => {
    openModal({
      title: '编辑质检方案',
      children: (
        <EditQcConfig
          id={id}
          type={type}
          unitsForSelect={unitsForSelect}
          handleExtraSubmit={value => {
            submit(value);
          }}
        />
      ),
      footer: null,
      style: { maxHeight: '80%', overflow: 'scroll' },
      width: '70%',
    });
  };

  let columns = [
    isQcItemCodingManually()
      ? {
          title: '质检项编号',
          dataIndex: 'checkItem.code',
          width: 100,
          key: 'code',
          render: code => <Tooltip text={code} width={90} />,
        }
      : null,
    {
      title: '质检项名称',
      dataIndex: 'checkItem.name',
      width: 150,
      key: 'name',
      render: name => <Tooltip text={name} width={130} />,
    },
    {
      title: '分类',
      width: 100,
      dataIndex: 'checkItem.group.name',
      key: 'groupName',
      render: name => <Tooltip text={name} width={80} />,
    },
  ];
  if (checkCountType === CHECKITEM_CHECK) {
    columns = columns.concat([
      {
        title: '抽检类型',
        dataIndex: 'checkCountType',
        width: 100,
        key: 'checkCountType',
        render: data => <Tooltip text={data ? CHECKCOUNT_TYPE[data] : replaceSign} length={20} />,
      },
      {
        title: '抽检数值',
        width: 180,
        dataIndex: 'checkNums',
        key: 'checkNums',
        render: (checkNums, record) => {
          const { qcAqlInspectionLevelName, qcAqlValue, checkCountType } = record;
          return checkCountType === 4 ? (
            qcAqlInspectionLevelName && qcAqlValue ? (
              <div>
                <div>
                  <Text>检验水平</Text>：{qcAqlInspectionLevelName}
                </div>
                <div>
                  <Text>接收质量限</Text>：{qcAqlValue}
                </div>
              </div>
            ) : (
              replaceSign
            )
          ) : (
            <Tooltip
              text={typeof checkNums === 'number' ? (checkCountType === 1 ? `${checkNums}%` : checkNums) : replaceSign}
              length={20}
            />
          );
        },
      },
    ]);
  }
  // AQL质检
  if (checkCountType === AQL_CHECK) {
    columns = columns.concat([
      {
        title: '检验水平',
        dataIndex: 'qcAqlInspectionLevelName',
        width: 130,
        key: 'inspectionLevel',
        render: name => <Tooltip text={name || replaceSign} width={120} />,
      },
      {
        title: '接收质量限',
        width: 100,
        dataIndex: 'qcAqlValue',
        key: 'qcAqlValue',
        render: name => <Tooltip text={name || replaceSign} width={90} />,
      },
    ]);
  }
  columns = columns.concat([
    {
      title: '标准',
      dataIndex: 'logicDisplay',
      key: 'logicDisplay',
      width: 200,
      render: logicDisplay => <Tooltip text={logicDisplay} width={180} />,
    },
    {
      title: '不良原因细分',
      dataIndex: 'qcDefectConfigs',
      key: 'qcDefectConfigs',
      width: 200,
      render: qcDefectConfigs => (
        <Tooltip
          text={(qcDefectConfigs && qcDefectConfigs.map(n => n.qcDefectReasonName).join('，')) || replaceSign}
          width={180}
        />
      ),
    },
    {
      title: '备注',
      dataIndex: 'checkItem.desc',
      width: 170,
      key: 'desc',
      render: desc => <Tooltip text={desc} width={150} />,
    },
  ]);
  const dataSource =
    qcCheckItemConfigs &&
    _.sortBy(
      qcCheckItemConfigs.map(qcCheckItemConfig => ({
        ...qcCheckItemConfig,
        logicDisplay: restCheckItemConfigToDisplay(qcCheckItemConfig),
      })),
      'seq',
    );
  let checkTypeDetailDisplay = replaceSign;
  if (taskCreateType === 0) {
    if (taskCreateInterval % (60 * 60 * 1000) === 0) {
      checkTypeDetailDisplay = `每${taskCreateInterval / 60 / 60 / 1000}小时 质检一次`;
    } else if (taskCreateInterval % (60 * 1000) === 0) {
      checkTypeDetailDisplay = `每${taskCreateInterval / 60 / 1000}分钟 质检一次`;
    } else {
      checkTypeDetailDisplay = `每${taskCreateInterval / 1000}秒 质检一次`;
    }
  } else if (taskCreateType === 1) {
    if (taskCreateCount <= 0) {
      checkTypeDetailDisplay = '全部质检';
    } else {
      checkTypeDetailDisplay = `每生产 ${taskCreateCount}单位 质检一次`;
    }
  } else if (taskCreateType === 2) {
    checkTypeDetailDisplay = `${taskCreateCount}次`;
  } else if (taskCreateType === 3) {
    checkTypeDetailDisplay = `${taskCreateCount}个二维码`;
  }
  let materials = replaceSign;
  if (qcConfigMaterials && Array.isArray(qcConfigMaterials) && qcConfigMaterials.length) {
    materials = qcConfigMaterials.map(n => `${n.materialName} ${n.qcUnitName}`).join('，');
  }

  return (
    <div className={styles.detail}>
      {type ? (
        <Link style={{ position: 'absolute', right: 30, top: 5 }} icon={'form'} onClick={showQcConfigModal}>
          编辑
        </Link>
      ) : null}
      <Row>
        <Col type={'title'}>编号</Col>
        <Col style={colStyle} type={'content'}>
          {qcConfigCode}
        </Col>
      </Row>
      <Row>
        <Col type={'title'}>名称</Col>
        <Col style={colStyle} type={'content'}>
          {name || replaceSign}
        </Col>
      </Row>
      <Row>
        <Col type={'title'}>状态</Col>
        <Col style={colStyle} type={'content'}>
          {typeof state === 'number' ? QCCONFIG_STATE[state] : replaceSign}
        </Col>
      </Row>
      <Row>
        <Col type={'title'}>质检类型</Col>
        <Col style={colStyle} type={'content'}>
          {CHECK_TYPE[checkType] || replaceSign}
        </Col>
      </Row>
      {checkType === 3 && autoCreateQcTask ? (
        <Row>
          <Col type={'title'}>质检频次</Col>
          <Col style={colStyle} type={'content'}>
            {checkTypeDetailDisplay}
          </Col>
        </Row>
      ) : null}
      <Row>
        <Col type={'title'}>质检方式</Col>
        <Col style={colStyle} type={'content'}>
          {CHECKCOUNT_TYPE[checkCountType] || replaceSign}
        </Col>
      </Row>
      {checkCountType === 1 || checkCountType === 2 ? (
        <Row>
          <Col type={'title'}>质检数量</Col>
          <Col style={colStyle} type={'content'}>
            {checkCount}
            {checkCountType === 1 ? '%' : ''}
          </Col>
        </Row>
      ) : null}
      {qcUnit ? (
        <Row>
          <Col type={'title'}>质检单位</Col>
          <Col style={colStyle} type={'content'}>
            {qcUnit && qcUnit.qcUnitName}
          </Col>
        </Row>
      ) : null}
      <Row>
        <Col type={'title'}>记录方式</Col>
        <Col style={colStyle} type={'content'}>
          {(RECORD_TYPE[recordType] && RECORD_TYPE[recordType].display) || replaceSign}
        </Col>
      </Row>
      {qcReportRecordCountSettable ? (
        <Row>
          <Col type={'title'}>报告记录数量</Col>
          <Col style={colStyle} type={'content'}>
            {_.get(CHECK_ENTITY_TYPE, `${checkEntityType}.label`)}
          </Col>
        </Row>
      ) : null}
      {checkEntityType === 2 ? (
        <Row>
          <Col type={'title'}>自定义单体</Col>
          <Col style={colStyle} type={'content'}>
            {`${checkEntityUnitCount} ${checkEntityUnitUnit}`}
          </Col>
        </Row>
      ) : null}
      <Row>
        <Col type={'title'}>可适用物料</Col>
        <Col style={colStyle} type={'content'}>
          {materials}
        </Col>
      </Row>
      {useQrCode ? (
        <React.Fragment>
          <Row>
            <Col type={'title'}>报废性检查</Col>
            <Col style={colStyle} type={'content'}>
              {scrapInspection ? '是' : '否'}
            </Col>
          </Row>
          <Row>
            <Col type={'title'}>样本判定维度</Col>
            <Col style={colStyle} type={'content'}>
              {_.get(SAMPLE_RESULT_TYPE, `${recordSampleResultType}.label`)}
            </Col>
          </Row>
        </React.Fragment>
      ) : null}
      <Row>
        <Col type={'title'}>自动生成任务</Col>
        <Col style={colStyle} type={'content'}>
          {autoCreateQcTask ? '是' : '否'}
        </Col>
      </Row>
      <Row>
        <Col type={'title'}>质检项填写规则</Col>
        <Col style={colStyle} type={'content'}>
          {RECORD_CHECKITEM_TYPE[recordCheckItemType]}
        </Col>
      </Row>
      <Row>
        <Col type={'title'}>质检项列表</Col>
        <Col style={colStyle} type={'content'}>
          <Table
            scroll={{ x: true }}
            pagination={false}
            columns={_.compact(columns)}
            dataSource={dataSource}
            style={{ margin: 0 }}
          />
        </Col>
      </Row>
      <Row>
        <Col type={'title'}>附件</Col>
        <Col style={colStyle} type={'content'}>
          {attachmentDetails && attachmentDetails.length !== 0 ? AttachmentFile(attachmentDetails) : replaceSign}
        </Col>
      </Row>
    </div>
  );
};

export default withRouter(render);
