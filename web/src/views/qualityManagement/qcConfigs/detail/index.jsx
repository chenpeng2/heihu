import * as React from 'react';
import { Link, openModal } from 'components';
import { getQcConfigDetail } from 'src/services/qcConfig';
import _ from 'lodash';
import PropTypes from 'prop-types';
import DetailBase from 'containers/qcConfig/detail/base';
import { changeChineseToLocaleWithoutIntl } from 'utils/locale/utils';
import ApplyModal from './applyModal';
import styles from './index.scss';
import { toCopyQcConfig, toEditQcConfig, toQcConfigOperationLog } from '../../navigation';

type QcConfigDetailType = {
  children: any,
  routeParams: {
    id: string,
  },
  qcConfig: {},
  match: {
    params: any,
  },
};

type stateType = {};

class QcConfigDetail extends React.Component<QcConfigDetailType, stateType> {
  state = {
    popoverVisible: false,
    popoverContent: null,
    data: {},
  };

  componentDidMount() {
    if (this.props.qcConfig) {
      this.setState({ data: this.props.qcConfig });
    } else {
      this.fetchData();
    }
  }

  fetchData = () => {
    const {
      match: {
        params: { id },
      },
    } = this.props;
    getQcConfigDetail({ id }).then(({ data: { data } }) => {
      this.setState({ data });
    });
  };

  render(): React.Node {
    const { children } = this.props;
    const { data } = this.state;
    const { id, checkType, refId } = data;
    return (
      children || (
        <div className={styles.detailHeader}>
          {refId === -1 ? (
            <div className={styles.operation}>
              {/* 只有出入厂检能应用 */}
              {checkType === 0 || checkType === 1 ? (
                <Link
                  icon="file-add"
                  onClick={() => {
                    openModal(
                      {
                        title: '应用质检方案',
                        footer: null,
                        width: '60%',
                        children: <ApplyModal qcConfig={data} />,
                      },
                      this.context,
                    );
                  }}
                >
                  应用
                </Link>
              ) : null}
              <Link style={{ marginLeft: 40 }} icon="copy" to={toCopyQcConfig(id)}>
                复制
              </Link>
              <Link style={{ marginLeft: 40 }} icon="edit" to={toEditQcConfig(id)}>
                编辑
              </Link>
              <Link icon="bars" style={{ marginLeft: 40 }} to={toQcConfigOperationLog(id)}>
                查看操作记录
              </Link>
            </div>
          ) : null}
          <div className={styles.title}>{changeChineseToLocaleWithoutIntl('质检方案详情')}</div>
          <DetailBase qcConfig={data} />
        </div>
      )
    );
  }
}

QcConfigDetail.contextTypes = {
  router: PropTypes.object,
};

export default QcConfigDetail;
