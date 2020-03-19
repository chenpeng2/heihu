import React from 'react';
import { Attachment, DetailPageItemContainer, Row, Col, ImagePreview } from 'src/components';
import { arrayIsEmpty } from 'src/utils/array';
import { replaceSign } from 'src/constants';
import { injectIntl } from 'react-intl';
import { changeChineseToLocale } from 'utils/locale/utils';
import { getCustomLanguage } from 'src/utils/customLanguage';
import styles from './styles.scss';

type Props = {
  intl: any,
  machiningMaterial: any,
};

const customLanguage = getCustomLanguage();
const colStyle = { width: '80%' };

const MachiningMaterialInfo = (props: Props) => {
  const { machiningMaterial, intl } = props;
  if (!machiningMaterial) {
    return null;
  }
  const itemHeaderTitle = `${customLanguage.equipment_machining_material}${changeChineseToLocale('信息', intl)}`;
  const {
    pictureFiles,
    typeDisplay,
    code,
    name,
    status,
    unitName,
    unitPrice,
    attachmentFiles,
    mgmtElectronicLabel,
    mgmtLifeCycle,
    specification,
    toolingTypeDisplay,
  } = machiningMaterial;

  return (
    <div className={styles.itemContainerStyle}>
      <DetailPageItemContainer contentStyle={{ width: '100%', display: 'block' }} itemHeaderTitle={itemHeaderTitle}>
        <Row style={{ marginRight: 20 }}>
          <Col type={'title'}>{'图片'}</Col>
          <Col style={colStyle} type={'content'}>
            {(pictureFiles &&
              pictureFiles.length &&
              pictureFiles.map(picture => <ImagePreview url={picture.id} filename={picture.original_filename} />)) ||
              replaceSign}
          </Col>
        </Row>
        <Row style={{ marginRight: 20 }}>
          <Col type={'title'}>{'类型'}</Col>
          <Col style={colStyle} type={'content'}>
            {typeDisplay || replaceSign}
          </Col>
        </Row>
        <Row style={{ marginRight: 20 }}>
          <Col type={'title'}>{'工装类型'}</Col>
          <Col style={colStyle} type={'content'}>
            {toolingTypeDisplay || replaceSign}
          </Col>
        </Row>
        <Row style={{ marginRight: 20 }}>
          <Col type={'title'}>{`${customLanguage.equipment_machining_material}${changeChineseToLocale(
            '编号',
            intl,
          )}`}</Col>
          <Col style={colStyle} type={'content'}>
            {code || replaceSign}
          </Col>
        </Row>
        <Row style={{ marginRight: 20 }}>
          <Col type={'title'}>{`${customLanguage.equipment_machining_material}${changeChineseToLocale(
            '名称',
            intl,
          )}`}</Col>
          <Col style={colStyle} type={'content'}>
            {name || replaceSign}
          </Col>
        </Row>
        <Row style={{ marginRight: 20 }}>
          <Col type={'title'}>{'单位'}</Col>
          <Col style={colStyle} type={'content'}>
            {unitName || replaceSign}
          </Col>
        </Row>
        <Row style={{ marginRight: 20 }}>
          <Col type={'title'}>{'参考单价'}</Col>
          <Col style={colStyle} type={'content'}>
            {unitPrice || replaceSign}
          </Col>
        </Row>
        <Row style={{ marginRight: 20 }}>
          <Col type={'title'}>{'规格描述'}</Col>
          <Col style={colStyle} type={'content'}>
            {specification || replaceSign}
          </Col>
        </Row>
        <Row style={{ marginRight: 20 }}>
          <Col type={'title'}>{'定义状态'}</Col>
          <Col style={colStyle} type={'content'}>
            {status === 1 ? '启用中' : '停用中'}
          </Col>
        </Row>
        <Row style={{ marginRight: 20 }}>
          <Col type={'title'}>{'生命周期管理'}</Col>
          <Col style={colStyle} type={'content'}>
            {mgmtLifeCycle ? '有' : '无'}
          </Col>
        </Row>
        <Row style={{ marginRight: 20 }}>
          <Col type={'title'}>{'电子标签管理'}</Col>
          <Col style={colStyle} type={'content'}>
            {mgmtElectronicLabel ? '有' : '无'}
          </Col>
        </Row>
        <Row style={{ marginRight: 20 }}>
          <Col type={'title'}>{'定义附件'}</Col>
          <Col type={'content'} style={colStyle}>
            {(!arrayIsEmpty(attachmentFiles) &&
              Attachment.AttachmentFile(attachmentFiles, null, { filesStyle: { marginRight: 20 } })) ||
              replaceSign}
          </Col>
        </Row>
      </DetailPageItemContainer>
    </div>
  );
};

export default injectIntl(MachiningMaterialInfo);
