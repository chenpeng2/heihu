import React, { Component } from 'react';
import _, { debounce } from 'lodash';

import { Select } from 'src/components';
import { getProjectProcesses, getProject } from 'src/services/cooperate/project';
import { getMbomByMaterialCodeAndVersion } from 'src/services/bom/mbom';

const Option = Select.Option;

type Props = {
  style: {},
  parentProjectCode: string,
  materialCode: string,
  onChange: () => {},
  value: any,
};

class FatherProjectProcessSelect extends Component {
  constructor(props) {
    super(props);
    this.handleSearch = debounce(this.handleSearch, 800);
    this.lastFetchId = 0;
  }
  state = {};
  props: Props;

  componentDidMount() {
    this.handleSearch(null, this.props, this.setDefaultValue);
  }

  componentWillReceiveProps(nextProps) {
    if (!this.state.value || !_.isEqual(this.state.value, nextProps.value)) {
      const searchRes = this.handleSearch(null, nextProps, this.setDefaultValue);
      if (searchRes) {
        searchRes.then(() => {
          this.setState({ value: nextProps.value });
        });
      }
    }

    if (!_.isEqual(this.props.materialCode, nextProps.materialCode)) {
      this.handleSearch(null, nextProps, this.setDefaultValue);
    }
  }

  handleSearch = async (search, props, cb) => {
    const { parentProjectCode, materialCode } = props || this.props;

    this.lastFetchId += 1;
    const fetchId = this.lastFetchId;
    this.setState({ search });
    if (fetchId !== this.lastFetchId) {
      // for fetch callback order
      return null;
    }

    if (!parentProjectCode || !materialCode) return;

    const projectDetail = await getProject({ code: decodeURIComponent(parentProjectCode) });
    const { createdType, mbomVersion, product } = _.get(projectDetail, 'data.data') || {};
    const productCode = product ? product.code : null;

    if (createdType === 'mbom' && productCode) {
      const mBomDetailRes = await getMbomByMaterialCodeAndVersion({ code: productCode, version: mbomVersion });
      const { ebomVersion, bindEBomToProcessRouting } = _.get(mBomDetailRes, 'data.data') || {};

      // 生产 BOM + 物料清单 + 组件分配为否）,则可选择工艺路线或生产 BOM 中的全部工序
      if (!bindEBomToProcessRouting && ebomVersion) {
        return getProjectProcesses({ projectCode: decodeURIComponent(parentProjectCode), productCode: materialCode, size: 20 }).then(
          res => {
            const data = _.get(res, 'data.data');

            this.setState(
              {
                processes: data.map(i => {
                  const { processName, processSeq } = i || {};

                  return {
                    label: processName,
                    value: processSeq,
                  };
                }),
              },
              cb,
            );
          },
        );
      }

      // 如果父项目选择的是生产 BOM + 物料或生产 BOM + 物料清单 + 组件分配为是，则可选择投入物料为「产出物料」字段的工序，如果只有一个则直接带入
      if ((bindEBomToProcessRouting && ebomVersion) || !ebomVersion) {
        return getProjectProcesses({ projectCode: decodeURIComponent(parentProjectCode), productCode: materialCode, size: 20 }).then(
          res => {
            const data = _.get(res, 'data.data');

            this.setState(
              {
                processes: data
                  .filter(i => {
                    const { inputMaterials } = i || {};

                    return Array.isArray(inputMaterials) && inputMaterials.length
                      ? inputMaterials.find(i => {
                          return i && i.materialCode === materialCode;
                        })
                      : false;
                  })
                  .map(i => {
                    const { processName, processSeq } = i || {};

                    return {
                      label: processName,
                      value: processSeq,
                    };
                  }),
              },
              cb,
            );
          },
        );
      }
    }

    // 父项目选择的是工艺路线或（工艺路线 + 物料清单）,则可选择工艺路线或生产。
    return getProjectProcesses({ projectCode: decodeURIComponent(parentProjectCode), productCode: materialCode, size: 20 }).then(res => {
      const data = _.get(res, 'data.data');

      this.setState(
        {
          processes: data.map(i => {
            const { processName, processSeq } = i || {};

            return {
              label: processName,
              value: processSeq,
            };
          }),
        },
        cb,
      );
    });
  };

  getOptions = () => {
    const { processes } = this.state;
    let options = [];
    if (!Array.isArray(processes) || !processes.length) return options;

    options = options.concat(
      processes.map(node => {
        const { label, value } = node || {};

        return (
          <Option key={value} value={value}>
            {label}
          </Option>
        );
      }),
    );

    return options;
  };

  getDefaultValue = () => {
    const { processes } = this.state;
    if (Array.isArray(processes) && processes.length === 1) {
      const { value, label } = processes[0] || {};
      return { key: value, label };
    }
  };

  setDefaultValue = () => {
    const defaultValue = this.getDefaultValue();
    if (!defaultValue) return;

    this.setState({ value: defaultValue });
    if (this.props.onChange) {
      this.props.onChange(defaultValue);
    }
  };

  render() {
    const options = this.getOptions();

    return (
      <Select
        style={{ width: 200 }}
        placeholder="请选择物料"
        value={this.state.value}
        onSearch={this.handleSearch}
        labelInValue
        filterOption={false}
        {...this.props}
        onChange={value => {
          this.setState({ value });
          if (this.props.onChange) {
            this.props.onChange(value);
          }
        }}
      >
        {options}
      </Select>
    );
  }
}

export default FatherProjectProcessSelect;
