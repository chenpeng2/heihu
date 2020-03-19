import React, { Component } from 'react';
import { Spin, Tooltip, Icon } from 'src/components';
import { oldLightGrey, borderGrey } from 'src/styles/color';
import {
  deleteFeedingStorageByWorkshop,
  deleteFeedingStorageByProdline,
  deleteFeedingStorageByWorkstation,
} from 'src/services/knowledgeBase/relatedStorage';
import styles from './styles.scss';

type Props = {
  initialStorage: [],
  record: {},
  setDeletedData: () => {},
};

class DetailModal extends Component {
  props: Props;
  state = {
    loading: false,
  };

  getTag = (value, showMore, record) => {
    const { initialStorage, setDeletedData } = this.props;
    const { code, id, name } = value;
    return (
      <span
        key={`${code}:${id}`}
        className={styles.tag}
        style={showMore ? { cursor: 'pointer', width: 32, textAlign: 'center' } : {}}
      >
        <Tooltip text={name} length={6} />
        <Icon
          type="close"
          onClick={() => {
            setDeletedData(code, record);
            this.setState({ loading: true });
            let deleteFeedingStorage = () => {};
            switch (record.type) {
              case 'WORKSHOP':
                deleteFeedingStorage = deleteFeedingStorageByWorkshop;
                break;
              case 'PRODUCTION_LINE':
                deleteFeedingStorage = deleteFeedingStorageByProdline;
                break;
              case 'WORKSTATION':
                deleteFeedingStorage = deleteFeedingStorageByWorkstation;
                break;
              default:
                deleteFeedingStorage = () => {};
            }
            deleteFeedingStorage({ code, id: id.split(':')[1] })
              .then(() => {
                initialStorage.forEach((n, index) => {
                  if (n.code === code) {
                    initialStorage.splice(index, 1);
                  }
                });
              })
              .finally(() => {
                this.setState({ loading: false });
              });
          }}
        />
      </span>
    );
  }

  render() {
    const { initialStorage, record } = this.props;

    return (
      <Spin spinning={this.state.loading}>
        <div
          style={{
            margin: '30px 50px',
            padding: '10px 10px 5px 10px',
            border: `1px solid ${borderGrey}`,
            backgroundColor: oldLightGrey,
          }}
        >
          {
            initialStorage.map(n => {
              return this.getTag(
                { name: n.name, code: n.code, id: record.id },
                false,
                record,
              );
            })
          }
        </div>
        <div style={{ height: 1 }} />
      </Spin>
    );
  }
}

export default DetailModal;
