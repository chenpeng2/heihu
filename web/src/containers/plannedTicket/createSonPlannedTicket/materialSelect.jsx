import * as React from 'react';
import PropTypes from 'prop-types';
import _, { debounce } from 'lodash';

import { Select, Link, OpenModal } from 'src/components';
import CreateMaterialForm from 'src/views/bom/materials/create';
import { queryMaterialList } from 'src/services/bom/material';
import { queryPlannedTicketDetail } from 'src/services/cooperate/plannedTicket';
import { getEbomByMaterialCodeAndVersion } from 'src/services/bom/ebom';
import { getMbomByMaterialCodeAndVersion } from 'src/services/bom/mbom';

const Option = Select.Option;

type MaterialSelectType = {
  style: any,
  className: string,
  disabledValues: Array<string>,
  hideCreateButton: boolean,
  params: {
    from: Number,
    first: Number,
    code: String,
    name: String,
    search: String,
    status: 'all' | 1 | 0,
  },
  value: any,
  onChange: any,
  onlyId: boolean,
  plannedTicketCode: string,
};

type MaterialSelectStateType = {
  materials: Array<mixed>,
  search: string,
};

const getFatherPlannedTicketCreateAccording = projectData => {
  return projectData ? projectData.selectType : null;
};

class MaterialSelect extends React.Component<MaterialSelectType, MaterialSelectStateType> {
  constructor(props) {
    super(props);
    this.getMaterials = debounce(this.getMaterials, 800);
    this.lastFetchId = 0;
  }

  state = {
    materials: [],
    basicInfo: {},
    search: '',
    value: undefined,
  };

  componentDidMount() {
    this.getMaterials(null, this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(this.props.plannedTicketCode, nextProps.plannedTicketCode)) {
      this.getMaterials(null, nextProps);
    }
  }

  getMaterials = async (search, props) => {
    const { plannedTicketCode } = props || this.props;
    console.log(search);

    this.lastFetchId += 1;
    const fetchId = this.lastFetchId;
    this.setState({ search });
    if (fetchId !== this.lastFetchId) {
      return null;
    }
    let materials = [];

    if (plannedTicketCode) {
      const plannedTicketDetailRes = await queryPlannedTicketDetail(plannedTicketCode);

      const fatherPlannedTicketData = _.get(plannedTicketDetailRes, 'data.data');
      const createdAccordingType = getFatherPlannedTicketCreateAccording(fatherPlannedTicketData);

      // 父计划工单是根据工艺路线创建的, 则可选择全部启用中的物料
      if (createdAccordingType === 'processRoute') {
        queryMaterialList({ page: 1, size: 50, search, status: 1 }).then(res => {
          const data = _.get(res, 'data.data');
          materials = Array.isArray(data)
            ? data.map(data => ({
                key: data.code,
                label: `${data.code}/${data.name}`,
                value: data.code,
              }))
            : [];

          this.setState({
            materials,
          });
        });

        return;
      }

      // 父计划工单是根据mbom创建的, 则可选择父项目的投入物料
      if (createdAccordingType === 'mbom') {
        const { processInfoList, mbomVersion, materialCode } = fatherPlannedTicketData || {};

        const mBomDetailRes = await getMbomByMaterialCodeAndVersion({ code: materialCode, version: mbomVersion });
        const { ebomVersion } = _.get(mBomDetailRes, 'data.data');

        if (!ebomVersion) {
          if (!Array.isArray(processInfoList)) return;
          materials = [];
          processInfoList.forEach(i => {
            if (!i || !Array.isArray(i.inputMaterialDTO)) return null;

            i.inputMaterialDTO.forEach(j => {
              const { materialCode, materialName } = j || {};
              materials.push({
                label: `${materialCode}/${materialName}`,
                value: materialCode,
              });
            });
          });
          this.setState({
            materials: materials.filter(i => !!i),
          });
        } else {
          getEbomByMaterialCodeAndVersion({ code: materialCode, version: ebomVersion }).then(res => {
            const materialData = _.get(res, 'data.data.rawMaterialList');
            materials = Array.isArray(materialData)
              ? materialData
                  .filter(i => {
                    return _.get(i, 'material.status') === 1;
                  })
                  .map(i => {
                    const { code, name } = _.get(i, 'material') || {};

                    return {
                      label: `${code}/${name}`,
                      value: code,
                      key: code,
                    };
                  })
              : [];
            this.setState({
              materials,
            });
          });
        }
      }

      // 父计划工单是根据工艺路线和物料清单创建的, 则可选择父项目的物料清单中的物料
      if (createdAccordingType === 'processRouteEbom') {
        const { ebomVersion, materialCode } = fatherPlannedTicketData;
        getEbomByMaterialCodeAndVersion({ code: materialCode, version: ebomVersion }).then(res => {
          const materialData = _.get(res, 'data.data.rawMaterialList');
          materials = Array.isArray(materialData)
            ? materialData
                .filter(i => {
                  return _.get(i, 'material.status') === 1;
                })
                .map(i => {
                  const { code, name } = _.get(i, 'material') || {};

                  return {
                    label: `${code}/${name}`,
                    value: code,
                    key: code,
                  };
                })
            : [];
          this.setState({
            materials,
          });
        });
      }
    }
  };

  getOptions = () => {
    const { materials } = this.state;
    const { hideCreateButton, params } = this.props;

    let options = [];
    options = options.concat(
      materials.map(node => {
        const { label, value } = node || {};

        return (
          <Option key={value} value={value} title={label}>
            {label}
          </Option>
        );
      }),
    );

    if (!hideCreateButton) {
      options.unshift(
        <Option value="create" key="add" disabled>
          <Link
            icon="plus-circle-o"
            onClick={() => {
              this.setState({ createModal: true }, () => {
                OpenModal(
                  {
                    title: '创建物料',
                    footer: null,
                    children: (
                      <CreateMaterialForm
                        inModal="true"
                        status={params && params.status}
                        onSuccess={data => {
                          const value = {
                            key: JSON.stringify(data),
                            label: `${data.code}/${data.name}`,
                          };
                          this.setState({ value }, () => {
                            if (this.props.onChange) {
                              this.props.onChange({ ...value, material: data });
                            }
                          });
                        }}
                      />
                    ),
                  },
                  this.context,
                );
              });
            }}
            style={{ width: '100%' }}
          >
            添加新物料
          </Link>
        </Option>,
      );
    }

    return options;
  };

  render() {
    const options = this.getOptions();

    return (
      <Select
        style={{ width: 200 }}
        placeholder="请选择物料"
        value={this.state.value}
        onSearch={this.getMaterials}
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

const convert = data => JSON.parse(data.key);
MaterialSelect.convert = convert;
MaterialSelect.contextTypes = {
  router: PropTypes.object,
};

export default MaterialSelect;
