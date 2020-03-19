import React from 'react';
import { DetailPageItemContainer, Row, Col } from 'src/components';
import { replaceSign } from 'src/constants';
import { arrayIsEmpty } from 'src/utils/array';
import styles from './styles.scss';

type Props = {
  data: any,
};

const colStyle = { width: '80%' };

const EquipBind = (props: Props) => {
  const { data } = props;
  if (!data) {
    return null;
  }

  const itemHeaderTitle = '设备绑定';
  const { boundEquipments } = data;

  const getBoundEquipmentsStr = () => {
    if (!arrayIsEmpty(boundEquipments)) {
      const boundEquipmentsArr = boundEquipments.map(n => `${n.equipmentProdCode}|${n.equipmentProdName}`);
      return boundEquipmentsArr.join('，');
    }
    return replaceSign;
  };

  return (
    <div className={styles.itemContainerStyle}>
      <DetailPageItemContainer contentStyle={{ width: '100%', display: 'block' }} itemHeaderTitle={itemHeaderTitle}>
        <Row style={{ marginRight: 20 }}>
          <Col type={'title'}>{'当前设备'}</Col>
          <Col style={colStyle} type={'content'}>
            {getBoundEquipmentsStr()}
          </Col>
        </Row>
      </DetailPageItemContainer>
    </div>
  );
};

export default EquipBind;
