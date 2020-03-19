import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { Link, Searchselect, FormItem, Table, Icon, FormattedMessage } from 'src/components';
import { requiredRule } from 'components/form';

const tableFormItem = { padding: 0, height: 66 };

class ReplaceMaterial extends Component {
  state = {
    mainMaterial: {},
    replaceMaterialList: [],
  };

  componentDidMount() {
    this.setInitialValue(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(nextProps.replaceMaterialList, this.props.replaceMaterialList)) {
      this.setInitialValue(nextProps);
    }
  }

  setInitialValue = props => {
    const { edit, replaceMaterialList, mainMaterial } = props;

    if (Array.isArray(replaceMaterialList) && edit) {
      this.setState({
        mainMaterial,
        replaceMaterialList: replaceMaterialList.map((i, index) => {
          const { material } = i || {};
          const { key, label } = material || {};
          return { key, label, index };
        }),
      });
    }
  };

  setDisabledMaterial = data => {
    const { replaceMaterialList, mainMaterial } = this.state;
    let codes = replaceMaterialList && replaceMaterialList.map(x => x && x.key);
    codes = codes.filter(x => x).concat(mainMaterial.code);

    return (
      data &&
      data.map(x => {
        if (_.findIndex(codes, code => code === x.key) >= 0) {
          x.disabled = true;
        }
        return x;
      })
    );
  };

  getReplaceMaterialListColumns = () => {
    const {
      form: { getFieldDecorator },
    } = this.props;
    return [
      {
        width: 15,
        key: 'operation',
        render: (text, record) => {
          const { index } = record || {};
          return (
            <div style={tableFormItem}>
              <Icon
                onClick={() => this.deleteReplaceMaterial(index)}
                style={{ height: 40, lineHeight: '40px', margin: '0 10px', cursor: 'pointer' }}
                type="minus-circle"
              />
            </div>
          );
        },
      },
      {
        title: '物料编码/名称',
        key: 'replaceMaterial',
        render: (__, record) => {
          const { index, key, label } = record || {};

          return (
            <div style={tableFormItem}>
              <FormItem style={{ width: 200, paddingRight: 0 }}>
                {getFieldDecorator(`replaceMaterialList[${index}].material`, {
                  rules: [requiredRule('物料')],
                  onChange: v => {
                    const { replaceMaterialList } = this.state;
                    const list =
                      replaceMaterialList &&
                      replaceMaterialList.map(x => {
                        if (x && x.index === index) {
                          x = { ...x, ...v };
                        }
                        return x;
                      });
                    this.setState({
                      replaceMaterialList: list,
                    });
                    return v;
                  },
                  initialValue: key && label ? { key, label } : undefined,
                })(
                  <Searchselect
                    type="materialBySearch"
                    params={{ status: 1, size: 50 }}
                    handleData={this.setDisabledMaterial}
                    allowClear
                    key={`replaceMaterialList-${index}`}
                    placeholder="请选择物料"
                    style={{ width: 200 }}
                  />,
                )}
              </FormItem>
            </div>
          );
        },
      },
    ];
  };

  getReplaceMaterialListFooter = () => {
    return (
      <Link icon="plus-circle-o" onClick={() => this.addReplaceMaterial()}>
        添加物料
      </Link>
    );
  };

  addReplaceMaterial = () => {
    const { replaceMaterialList } = this.state;
    const prevIndex = _.get(replaceMaterialList, `[${replaceMaterialList.length - 1}].index`);
    const list = replaceMaterialList.concat({ index: typeof prevIndex === 'number' ? prevIndex + 1 : 0 });
    this.setState({
      replaceMaterialList: list,
    });
  };

  deleteReplaceMaterial = index => {
    const { replaceMaterialList } = this.state;
    const _replaceMaterialList = _.difference(replaceMaterialList, [replaceMaterialList[index]]);
    this.setState({
      replaceMaterialList: _replaceMaterialList,
    });
  };

  render() {
    const { replaceMaterialList } = this.state;
    const replaceMaterialListColumns = this.getReplaceMaterialListColumns();

    const replaceMaterialListProps = {
      style: { marginLeft: 0, width: 300 },
      columns: replaceMaterialListColumns,
      dataSource: replaceMaterialList,
      total: Array.isArray(replaceMaterialList) ? replaceMaterialList.length : 0,
      footer: () => this.getReplaceMaterialListFooter(),
      pagination: false,
      rowKey: record => record.index,
    };

    return (
      <div>
        <Table {...replaceMaterialListProps} />
      </div>
    );
  }
}

ReplaceMaterial.propTypes = {
  style: PropTypes.object,
  form: PropTypes.any,
  edit: PropTypes.any,
  replaceMaterialList: PropTypes.any,
  mainMaterial: PropTypes.any,
};

export default ReplaceMaterial;
