import React from 'react';
import _ from 'lodash';
import { Link, Spin } from 'components';
import { withRouter } from 'react-router-dom';
import { replaceSign } from 'src/constants';
import classNames from 'classnames';
import styles from './detail.scss';

type propsType = {
  data: {},
  columns: [],
  editable: boolean,
  editPath: string,
  logPath: string,
  title: string,
};
class Detail extends React.PureComponent<propsType> {
  state = {};
  render() {
    const { data, columns, editPath, logPath, title, handleDelete } = this.props;
    return (
      <Spin spinning={!data.id}>
        <div>
          <div className={styles.detailHeader}>
            <div className={classNames(styles.operation, 'child-gap20')}>
              {data.status === 2 && (
                <Link
                  type="error"
                  icon="delete"
                  onClick={() => {
                    if (typeof handleDelete) {
                      handleDelete();
                    }
                  }}
                >
                  删除
                </Link>
              )}
              <Link icon="edit" to={editPath} disabled={data.status === 1}>
                编辑
              </Link>
              <Link icon="bars" to={logPath}>
                查看操作记录
              </Link>
            </div>
            <div className={styles.title}>{title}</div>
            <div className={styles.detail}>
              {data &&
                columns.map(({ title, dataIndex, render }) => {
                  const desc = _.get(data, dataIndex);
                  return (
                    <div className={styles.row} key={dataIndex}>
                      <span>{title}</span>
                      <span>{(typeof render === 'function' ? render(desc, data) : desc) || replaceSign}</span>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </Spin>
    );
  }
}

export default withRouter(Detail);
