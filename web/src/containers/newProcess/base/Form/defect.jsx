/*
次品分类创建组件
* */
import React, { Component } from 'react';
import _ from 'lodash';

import { Table, openModal, Icon } from 'src/components';
import { primary, error } from 'src/styles/color';
import { arrayIsEmpty } from 'src/utils/array';
import { replaceSign } from 'src/constants';
import { changeChineseToLocaleWithoutIntl } from 'utils/locale/utils';
import DefectsTableSelect from './defectsTableSelect/index';


type Props = {
  style: {},
  form: any,
  initialValue: any,
};

class Defect extends Component {
  props: Props;

  state = {
    defectsData: [], // { id, name, defectGroupName} 组成的数组
  };

  componentDidMount() {
    this.setInitialValue(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(this.props.initialValue, nextProps.initialValue)) {
      this.setInitialValue(nextProps);
    }
  }

  setInitialValue = props => {
    const { initialValue } = props || this.props;
    if (initialValue) {
      this.setState({ defectsData: initialValue });
    }
  };

  remove = k => {
    const { defectsData } = this.state;
    const nextDefectsData = arrayIsEmpty(defectsData)
      ? []
      : defectsData.filter(i => {
          return i && i.id !== k;
        });

    this.setState({ defectsData: nextDefectsData });
  };

  add = data => {
    this.setState({ defectsData: data });
  };

  getColumns = () => {
    const { form } = this.props;
    const { getFieldDecorator } = form || {};
    return [
      {
        key: 'remove',
        width: 50,
        render: (__, record) => {
          const { id } = record || {};
          return (
            <div>
              <Icon onClick={() => this.remove(id)} type={'minus-circle'} style={{ color: error }} />
            </div>
          );
        },
      },
      {
        title: '次品分类',
        width: 150,
        dataIndex: 'defectGroupName',
        render: data => data || replaceSign,
      },
      {
        title: '次品项名称',
        dataIndex: 'name',
        width: 150,
        render: (data, record) => {
          const { id } = record || {};
          return (
            <div>
              {getFieldDecorator(`processDefects[${id}]`, {
                initialValue: id,
              })(<span>{data || replaceSign}</span>)}
            </div>
          );
        },
      },
    ];
  };

  render() {
    const { defectsData } = this.state;

    return (
      <div>
        <Table
          style={{ marginLeft: 0 }}
          columns={this.getColumns()}
          dataSource={defectsData}
          pagination={false}
          scroll={{ y: 250 }}
          footer={() => (
            <span
              style={{ cursor: 'pointer' }}
              onClick={() => {
                openModal({
                  title: '添加次品项',
                  children: (
                    <DefectsTableSelect
                      selectedDefects={defectsData}
                      cbForConfirm={data => {
                        this.add(data);
                      }}
                    />
                  ),
                  footer: null,
                });
              }}
            >
              <Icon type={'plus-circle-o'} style={{ marginRight: 5, color: primary }} />
              <span>{changeChineseToLocaleWithoutIntl('添加分类')}</span>
            </span>
          )}
        />
      </div>
    );
  }
}

export default Defect;
