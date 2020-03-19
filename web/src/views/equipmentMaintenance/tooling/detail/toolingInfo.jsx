import React, { useState } from 'react';
import _ from 'lodash';
import {
  Attachment,
  Link,
  DetailPageItemContainer,
  Row,
  Col,
  message,
  Popconfirm,
  Spin,
  buttonAuthorityWrapper,
  haveAuthority,
  Button,
} from 'src/components';
import moment from 'src/utils/time';
import { injectIntl } from 'react-intl';
import { changeChineseToLocale } from 'utils/locale/utils';
import { updateToolingStatus } from 'src/services/equipmentMaintenance/base';
import { replaceSign } from 'src/constants';
import { arrayIsEmpty } from 'src/utils/array';
import { alertYellow, primary } from 'styles/color';
import { getCreateRepairTaskByTargetUrl } from 'src/views/equipmentMaintenance/repairTask//utils';
import auth from 'utils/auth';
import { getEditToolingUrl } from '../utils';
import { TOOLING_STATUS, findStatusByLabel } from '../constants';
import styles from './styles.scss';

const LinkWithAuth = buttonAuthorityWrapper(Link);

type Props = {
  data: any,
  intl: any,
  history: any,
  fetchToolingOperationLog: () => {},
};
const colStyle = { width: 400 };

const ToolingInfo = (props: Props) => {
  const { data, history, fetchToolingOperationLog, intl } = props;
  const [loading, setLoading] = useState(false);
  if (!data) {
    return null;
  }
  const itemHeaderTitle = '模具信息';

  const {
    id,
    name,
    code,
    qrcode,
    manufacturer,
    model,
    serialNumber,
    deliverDate,
    admitDate,
    firstEnableDate,
    attachmentsFile,
    createdAt,
    updatedAt,
    operator,
    enableStatus,
  } = data;

  const renderChangeStatusButton = () => {
    const isIdle = TOOLING_STATUS[enableStatus].label === '已闲置';
    const buttonText = isIdle ? '启用' : '闲置';
    return (
      <div style={{ marginLeft: 20 }}>
        {TOOLING_STATUS[enableStatus].label !== '已报废' && (
          <span
            className="switch-close"
            onClick={() => {
              const status = isIdle ? findStatusByLabel('已启用').key : findStatusByLabel('已闲置').key;
              setLoading(true);
              updateToolingStatus(id, status)
                .then(() => {
                  fetchToolingOperationLog();
                  message.success(`${buttonText}成功`);
                  data.enableStatus = Number(status);
                })
                .finally(() => {
                  setLoading(false);
                });
            }}
            style={{
              backgroundColor: isIdle ? primary : alertYellow,
              marginRight: 10,
            }}
          >
            {changeChineseToLocale(buttonText, intl)}
          </span>
        )}
        {isIdle && haveAuthority(auth.WEB_SCRAP_TOOLING) ? (
          <Popconfirm
            title={changeChineseToLocale('模具报废后，将无法重新启用，请确认！', intl)}
            cancelText="放弃"
            onConfirm={() => {
              const status = findStatusByLabel('已报废').key;
              setLoading(true);
              updateToolingStatus(id, status)
                .then(() => {
                  message.success('报废成功');
                  data.enableStatus = Number(status);
                  fetchToolingOperationLog();
                })
                .finally(() => {
                  setLoading(false);
                });
            }}
          >
            <span className="switch-close">{changeChineseToLocale('报废', intl)}</span>
          </Popconfirm>
        ) : null}
      </div>
    );
  };

  return (
    <Spin spinning={loading}>
      <div className={styles.itemContainerStyle}>
        <DetailPageItemContainer
          contentStyle={{ width: '100%', position: 'relative' }}
          action={
            <LinkWithAuth
              auth={auth.WEB_EDIT_TOOLING}
              style={{ width: 80 }}
              icon="edit"
              onClick={() => {
                history.push(getEditToolingUrl(id));
              }}
            >
              编辑
            </LinkWithAuth>
          }
          itemHeaderTitle={itemHeaderTitle}
        >
          <div style={{ position: 'absolute', top: 20, right: 20 }}>
            <Button
              icon="plus-circle-o"
              onClick={() => {
                history.push(getCreateRepairTaskByTargetUrl('tooling', id, name));
              }}
            >
              创建维修任务
            </Button>
          </div>
          <Row style={{ marginRight: 20 }}>
            <Col type={'title'}>{'模具编号'}</Col>
            <Col style={colStyle} type={'content'}>
              {code || replaceSign}
            </Col>
          </Row>
          <Row style={{ marginRight: 20 }}>
            <Col type={'title'}>{'电子标签'}</Col>
            <Col style={colStyle} type={'content'}>
              {qrcode || replaceSign}
            </Col>
          </Row>
          <Row style={{ marginRight: 20 }}>
            <Col type={'title'}>{'模具名称'}</Col>
            <Col style={colStyle} type={'content'}>
              {name || replaceSign}
            </Col>
          </Row>
          <Row style={{ marginRight: 20 }}>
            <Col type={'title'}>{'制造商'}</Col>
            <Col style={colStyle} type={'content'}>
              {(manufacturer && manufacturer.name) || replaceSign}
            </Col>
          </Row>
          <Row style={{ marginRight: 20 }}>
            <Col type={'title'}>{'型号'}</Col>
            <Col style={colStyle} type={'content'}>
              {model || replaceSign}
            </Col>
          </Row>
          <Row style={{ marginRight: 20 }}>
            <Col type={'title'}>{'序列号'}</Col>
            <Col style={colStyle} type={'content'}>
              {serialNumber || replaceSign}
            </Col>
          </Row>
          <Row style={{ marginRight: 20 }}>
            <Col type={'title'}>{'供应商出厂日期'}</Col>
            <Col style={colStyle} type={'content'}>
              {(deliverDate && moment(deliverDate).format('YYYY/MM/DD')) || replaceSign}
            </Col>
          </Row>
          <Row style={{ marginRight: 20 }}>
            <Col type={'title'}>{'入厂日期'}</Col>
            <Col style={colStyle} type={'content'}>
              {(admitDate && moment(admitDate).format('YYYY/MM/DD')) || replaceSign}
            </Col>
          </Row>
          <Row style={{ marginRight: 20 }}>
            <Col type={'title'}>{'首次启用日期'}</Col>
            <Col style={colStyle} type={'content'}>
              {(firstEnableDate && moment(firstEnableDate).format('YYYY/MM/DD')) || replaceSign}
            </Col>
          </Row>
          <Row style={{ marginRight: 20 }}>
            <Col type={'title'}>{'更新日期'}</Col>
            <Col style={colStyle} type={'content'}>
              {(updatedAt && moment(updatedAt).format('YYYY/MM/DD')) || replaceSign}
            </Col>
          </Row>
          <Row style={{ marginRight: 20 }}>
            <Col type={'title'}>{'操作人'}</Col>
            <Col style={colStyle} type={'content'}>
              {(operator && operator.name) || replaceSign}
            </Col>
          </Row>
          <Row style={{ marginRight: 20 }}>
            <Col type={'title'}>{'创建时间'}</Col>
            <Col style={colStyle} type={'content'}>
              {(createdAt && moment(createdAt).format('YYYY/MM/DD')) || replaceSign}
            </Col>
          </Row>
          <Row style={{ marginRight: 20 }}>
            <Col type={'title'}>{'当前状态'}</Col>
            <Col style={{ ...colStyle, display: 'flex' }} type={'content'}>
              {typeof enableStatus === 'number'
                ? changeChineseToLocale(_.get(TOOLING_STATUS[enableStatus], 'label'), intl)
                : replaceSign}
              {renderChangeStatusButton()}
            </Col>
          </Row>
          <Row style={{ marginRight: 20 }}>
            <Col type={'title'}>{'附件'}</Col>
            <Col type={'content'} style={colStyle}>
              {(!arrayIsEmpty(attachmentsFile) &&
                Attachment.AttachmentFile(attachmentsFile, null, { filesStyle: { marginRight: 20 } })) ||
                replaceSign}
            </Col>
          </Row>
        </DetailPageItemContainer>
      </div>
    </Spin>
  );
};

export default injectIntl(ToolingInfo);
