import React, { useState } from 'react';
import Proptypes from 'prop-types';
import { DetailPageItemContainer, Row, Col, openModal, Link, Spin } from 'src/components';
import { replaceSign } from 'src/constants';
import EditToolingPlanInfoModal from './editToolingPlanInfoModal';
import styles from './styles.scss';

type Props = {
  data: any,
  fetchToolingOperationLog: () => {},
};

const colStyle = { width: '80%' };

const ToolingPlanInfo = (props: Props, context) => {
  const { data, fetchToolingOperationLog } = props;
  const { changeChineseToLocale } = context;
  if (!data) {
    return null;
  }
  const [loading, setLoading] = useState(false);
  const itemHeaderTitle = '计划信息';

  const { upTime, downTime, prepareTime } = data;

  const updatePlanInfo = bool => {
    setLoading(bool);
    fetchToolingOperationLog();
  };

  return (
    <Spin spinning={loading}>
      <div className={styles.itemContainerStyle}>
        <DetailPageItemContainer
          contentStyle={{ width: '100%', display: 'block' }}
          itemHeaderTitle={itemHeaderTitle}
          action={
            <Link
              style={{ width: 80 }}
              icon="edit"
              onClick={() => {
                openModal({
                  title: '编辑计划信息',
                  children: <EditToolingPlanInfoModal data={data} updatePlanInfo={updatePlanInfo} />,
                  footer: null,
                  width: '60%',
                });
              }}
            >
              编辑
            </Link>
          }
        >
          <Row style={{ marginRight: 20 }}>
            <Col type={'title'}>{'上模时间'}</Col>
            <Col style={colStyle} type={'content'}>
              {(upTime && `${upTime}${changeChineseToLocale('分钟')}`) || replaceSign}
            </Col>
          </Row>
          <Row style={{ marginRight: 20 }}>
            <Col type={'title'}>{'下模时间'}</Col>
            <Col style={colStyle} type={'content'}>
              {(downTime && `${downTime}${changeChineseToLocale('分钟')}`) || replaceSign}
            </Col>
          </Row>
          <Row style={{ marginRight: 20 }}>
            <Col type={'title'}>{'调机时间'}</Col>
            <Col style={colStyle} type={'content'}>
              {(prepareTime && `${prepareTime}${changeChineseToLocale('分钟')}`) || replaceSign}
            </Col>
          </Row>
        </DetailPageItemContainer>
      </div>
    </Spin>
  );
};

ToolingPlanInfo.contextTypes = {
  changeChineseToLocale: Proptypes.func,
};

export default ToolingPlanInfo;
