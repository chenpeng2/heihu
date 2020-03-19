import React, { Component } from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import { Link, openModal, Icon } from 'components';
import QcConfigDetailBase from 'src/containers/qcConfig/detail/base';
import { getQcConfigDetail } from 'src/services/qcConfig';
import styles from './styles.scss';
import ImportQcConfigModal from '../qcConfigBase/importQcConfig';

export { formatInitialValue, formatValues } from '../qcConfigBase';

type Props = {
  form: any,
  style: {},
  type: string,
  onChange: () => {},
  unitsForSelect: [],
  value: [],
};

class QcConfigList extends Component {
  props: Props;
  state = {
    value: [],
  };

  componentWillReceiveProps(nextProps) {
    const { value } = nextProps;
    if (!_.isEqual(value, this.state.value)) {
      this.setState({ value: value || [] });
    }
  }

  addCheckItem = () => {
    const { value } = this.state;
    const { type, onChange, unitsForSelect } = this.props;
    openModal(
      {
        title: '选择质检方案',
        footer: null,
        width: '60%',
        wrapClassName: 'importQcConfig',
        onOk: selectedRows => {
          if (selectedRows && selectedRows.length) {
            const { value: qcConfigDetails } = this.state;
            const newQcConfigDetails = qcConfigDetails.concat(selectedRows);
            this.setState({ value: newQcConfigDetails });
            if (typeof onChange === 'function') onChange(newQcConfigDetails);
          }
        },
        getContainer: () => document.getElementById('qcConfigList'),
        children: (
          <ImportQcConfigModal
            qcConfigDetails={value}
            unitsForSelect={unitsForSelect}
            submit={this.handleSubmit}
            type={type}
          />
        ),
      },
      this.context,
    );
  };

  handleSubmit = async value => {
    const { onChange } = this.props;
    const { value: qcConfigDetails } = this.state;
    const { id } = value;
    const res = await getQcConfigDetail({ id });
    const newQcConfigDetail = _.get(res, 'data.data');
    qcConfigDetails.push(newQcConfigDetail);
    this.setState({ value: qcConfigDetails });
    if (typeof onChange === 'function') onChange(qcConfigDetails);
  };

  handleEdit = async value => {
    const { onChange } = this.props;
    const { value: qcConfgDetails } = this.state;
    const { id, newId } = value;
    // 有newId为编辑质检方案时保存为了新的质检方案
    const res = await getQcConfigDetail({ id: newId || id });
    const newQcConfigDetail = _.get(res, 'data.data');
    const index = qcConfgDetails.findIndex(n => n.id === id);
    qcConfgDetails[index] = newQcConfigDetail;
    this.setState({ value: qcConfgDetails });
    if (typeof onChange === 'function') onChange(qcConfgDetails);
  };

  handleDelete = id => {
    const { onChange } = this.props;
    const { value } = this.state;
    const newQcConfigDetails = value.filter(n => n.id !== id);
    this.setState({ value: newQcConfigDetails });
    if (typeof onChange === 'function') onChange(newQcConfigDetails);
  };

  render() {
    const { style, type, unitsForSelect } = this.props;
    const { value: qcConfigDetails } = this.state;
    return (
      <div id={'qcConfigList'} style={style}>
        {qcConfigDetails && Array.isArray(qcConfigDetails) && qcConfigDetails.length > 0 ? (
          <div
            style={{
              width: '100%',
              border: '1px solid rgba(0, 20, 14, 0.1)',
              backgroundColor: '#fafafa',
              padding: '10px 20px 10px 10px',
              fontSize: 12,
            }}
          >
            {qcConfigDetails.map((qcConfig, index) => (
              <div
                key={qcConfig.id}
                style={{
                  border: '1px solid rgba(0, 20, 14, 0.1)',
                  backgroundColor: '#fff',
                  margin: 10,
                  padding: 20,
                  position: 'relative',
                }}
                className={this.state.qcCheckItemHoverIndex === qcConfig.id ? styles.qcCheckPointContainerOnDel : ''}
              >
                <Icon
                  type="minus-circle"
                  className={styles.removeIcon}
                  onClick={() => {
                    this.handleDelete(qcConfig.id);
                    this.setState({ qcCheckItemHoverIndex: -1 });
                  }}
                  onMouseEnter={() => this.setState({ qcCheckItemHoverIndex: qcConfig.id })}
                  onMouseLeave={() => this.setState({ qcCheckItemHoverIndex: -1 })}
                />
                <div className={styles.index}>{index + 1}</div>
                <QcConfigDetailBase
                  handleDelete={this.handleDelete}
                  qcConfig={qcConfig}
                  type={type}
                  submit={this.handleEdit}
                  unitsForSelect={unitsForSelect}
                />
              </div>
            ))}
          </div>
        ) : null}
        <div className="add-item" style={{ marginTop: 10 }}>
          <Link icon="plus-circle-o" onClick={this.addCheckItem}>
            新增方案
          </Link>
        </div>
      </div>
    );
  }
}

export default QcConfigList;
