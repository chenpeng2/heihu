import * as React from 'react';
import PropTypes from 'prop-types';
import _, { debounce } from 'lodash';

import { Select, Link, OpenModal } from 'src/components';
import CreateMaterialForm from 'src/views/bom/materials/create';
import { queryMaterialList, getMaterialsDetail } from 'src/services/bom/material';
import { getProject, getProjectProcureMaterial } from 'src/services/cooperate/project';
import { getEbomByMaterialCodeAndVersion } from 'src/services/bom/ebom';

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
  purchaseOrderCode: string,
  fatherProjectCode: string,
};

type MaterialSelectStateType = {
  materials: Array<mixed>,
  search: string,
};

const getFatherProjectCreatedAccording = projectData => {
  return projectData ? projectData.createdType : null;
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
    this.getMaterials();
  }

  getMaterials = async search => {
    const { fatherProjectCode } = this.props;

    this.lastFetchId += 1;
    const fetchId = this.lastFetchId;
    this.setState({ search });
    if (fetchId !== this.lastFetchId) {
      return null;
    }
    let materials = [];

    if (fatherProjectCode) {
      const projectDetailRes = await getProject({ code: decodeURIComponent(fatherProjectCode) });

      const fatherProjectData = _.get(projectDetailRes, 'data.data');
      const createdAccordingType = getFatherProjectCreatedAccording(fatherProjectData);

      // 父项目是根据工艺路线创建的, 则可选择全部启用中的物料
      if (createdAccordingType === 'processRouting') {
        queryMaterialList({ page: 1, size: 50, search }).then(res => {
          const data = _.get(res, 'data.data');
          materials = Array.isArray(data)
            ? data.map(data => ({
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

      // 父项目是根据mbom创建的, 则可选择父项目的投入物料
      if (createdAccordingType === 'mbom') {
        const { product, ebom } = fatherProjectData || {};
        const productCode = product ? product.code : null;

        if (productCode) {
          if (ebom && ebom.version) {
            // 如果父项目选择的是生产 BOM + 物料清单，则可选择父项目的物料清单中的物料
            const ebomDetailRes = await getEbomByMaterialCodeAndVersion({ code: productCode, version: ebom.version });
            const materialData = _.get(ebomDetailRes, 'data.data.rawMaterialList') || {};

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
                    };
                  })
              : [];
            this.setState({
              materials,
            });
          } else {
            // 如果父项目选择的是生产 BOM + 物料，则可选择父项目的投入物料
            getProjectProcureMaterial({
              projectCode: decodeURIComponent(fatherProjectCode),
              filterByProjectStatus: false,
            }).then(res => {
              const data = _.get(res, 'data.data');
              materials = Array.isArray(data)
                ? data.map(i => {
                    const { materialCode, materialName } = _.get(i, 'material') || {};
                    return {
                      label: `${materialCode}/${materialName}`,
                      value: materialCode,
                    };
                  })
                : [];
              this.setState({
                materials,
              });
            });
          }
        }
      }

      // 父项目是根据工艺路线和物料清单创建的, 则可选择父项目的物料清单中的物料
      if (createdAccordingType === 'processRoutingAndEbom') {
        const { materialIds } = fatherProjectData;

        getMaterialsDetail(materialIds).then(res => {
          const data = _.get(res, 'data.data');
          materials = Array.isArray(data)
            ? data.map(i => {
                const { code, name } = i || {};
                return {
                  label: `${code}/${name}`,
                  value: code,
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
                          const { code, name } = data || {};

                          const value = {
                            value: code,
                            label: `${code}/${name}`,
                          };
                          this.setState({ value, materials: this.state.materials.concat([value]) }, () => {
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
