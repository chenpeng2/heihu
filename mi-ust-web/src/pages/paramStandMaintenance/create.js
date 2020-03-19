import React, { PureComponent } from 'react';
import request from 'util/http'
import { Select, Breadcrumb, Form, message } from 'antd';
import EditableTable from 'components/antdEditTable/editTable'
const { Option } = Select;
// 等于：e
// 不等于：ue
// 大于：g
// 大于等于：ge
// 小于：l
// 小于等于：le
// 范围内：bt

// 标准，设备，产品表单
class NormalForm extends React.Component {
  handleSubmit = () => {

  }
  render() {
    const { getFieldDecorator } = this.props.form;
    const { equips, products, selectEquip, selectProduct } = this.props
    return (
      <Form layout="inline" onSubmit={this.handleSubmit} className="default-form">
        {/* <Form.Item label="标准名称">
          {getFieldDecorator('standardName', {
            rules: [{ required: false, message: '请输入标准名称' }],
          })(<Input />)}
        </Form.Item> */}
        <Form.Item label="设备">
          {getFieldDecorator('equipmentCode', {
            rules: [{ required: true, message: '请选择设备!' }],
          })(
            <Select showSearch onSelect={(id) => selectEquip(id)} style={{ width: 200 }}>{equips}</Select>
          )}
        </Form.Item>
        <Form.Item label="产品">
          {getFieldDecorator('productCode', {
            rules: [{ required: true, message: '请选择产品!' }],
          })(
            <Select showSearch onSelect={(id) => selectProduct(id)} style={{ width: 200 }}>{products}</Select>
          )}
        </Form.Item>
      </Form>
    );
  }
}
const WrappedNormalForm = Form.create({ name: 'normal_login' })(NormalForm);


class StandCreate extends PureComponent {
  constructor(props) {
    super(props)
    const params = this.props.match.params;  // url params
    const level = {
      'e': '等于',
      'ue': '不等于',
      'g': '大于',
      'ge': '大于等于',
      'l': '小于',
      'le': '小于等于',
      'bt': '范围内'
    };
    this.state = {
      type: params.type,  // 创建 or 编辑 or 复制
      id: params.id,  // 被编辑 or 被复制 的设备id
      equipList: [],
      productList: [],
      columns: [{
        title: <span><span className="required-mark">*</span>参数名称</span>,
        field: 'parameterName',
        editable: 'never',
      }, {
        title: <span><span className="required-mark">*</span>Measurement ID</span>,
        field: 'measurementId',
        editable: 'never',
      }, {
        title: <span><span className="required-mark">*</span>条件</span>,
        field: 'condition',
        lookup: level,
      }, {
        title: '数值1(默认必填)',
        field: 'value1',
        type: 'numeric'
      }, {
        title: '数值2',
        field: 'value2',
        type: 'numeric'
      }],
      data: [],
      mergeData:[],
      standards: [],
      isFetching: false,
      editingKey: '',
      hideBtn: false,
      measureIdArr: [],
      selectEquip: ''
    }
  }

  getRowItem(key, item) {
    return {
      key: key,
      index: key + 1,
      parameterName: item.parameterName,
      measurementId: item.measurementId,
      condition: item.condition,
      value1: item.value1,
      value2: item.value2,
    }
  }
  //只需要条件、数值默认的数据
  getRowItem2(key, item, parameterName) {
    return {
      condition: item.condition,
      equipmentCode: item.equipmentCode,
      productCode: item.productCode,
      standardId: item.standardId,
      parameterName: item.parameterName,
      value1: item.value1,
      value2: item.value2,
    }
  }
  // 获取设备编码列表
  getEquipmentCodeList() {
    request({
      url: `/equipment/getEquipmentCodeList`,
      method: 'GET',
      success: res => {
        if (!res || res.code !== 0) {
          return
        }
        this.setState({ equipList: res.data })
      },
      error: () => {
        message.error('请求失败！')
      }
    })
  }

  // 获取产品编码列表
  getProductCodeList() {
    request({
      url: `/product/getProductCodeList`,
      method: 'GET',
      success: res => {
        if (!res || res.code !== 0) {
          return
        }
        this.setState({ productList: res.data })
      },
      error: () => {
        message.error('请求失败！')
      }
    })
  }

  // 获取参数列表
  getParameterList(id, callback) {
    request({
      url: `/parameter/getParameterList?equipmentCode=${id}`,
      method: 'GET',
    }).then(res => {
      if (!res || res.code !== 0) {
        return
      }
      let param = [], measureIdArr = [];
      res.data.map((item, key) => {
        const obj = this.getRowItem(key, item)
        delete obj.tableData
        param.push(obj)
        measureIdArr.push(item.measurementId)
      })
      this.setState({ data: param, measureIdArr }, () => {
        callback && callback()
      })
    })
  }
  // 标准列表
  getStandardList(equipmentCode, productCode) {
    request({
      url: `/standard/getStandardList?equipmentCode=${equipmentCode}&productCode=${productCode}`,
      method: 'GET',
    }).then(res => {
      if (!res || res.code !== 0) {
        return
      }
      let param = [],paramArr = [];
      res.data.forEach((item, key) => {
        const { data } = this.state
        if (key <= data.length - 1) {
          param.push(this.getRowItem2(key, item, data[key].parameterName))
          paramArr.push(item.measurementId)
        }
      })
      //合并设备默认的和产品私有的
      const { data } = this.state
      const newParam = data.map((item, index) => {
          const newDa = Object.assign({},item)
          if(param.length){
              const paramIndex = paramArr.indexOf(item.measurementId)
              const ObjItem = paramIndex>-1 ?  Object.assign(newDa, param[paramIndex]) : item
              return ObjItem
          }else{
              return item
          }
      })
      this.setState({ mergeData: newParam, isFetching: false })
    })
  }

  isEquipProduct() {
    const { form } = this.formRef.props;
    const { productCode, equipmentCode } = form.getFieldsValue();
    if (productCode && equipmentCode) {
        this.getStandardList(equipmentCode, productCode)
    }
  }

  selectProduct() {
    this.isEquipProduct()
  }

  selectEquip(id) {
    this.setState({ selectEquip: id })
    this.getParameterList(id, () => {
      this.isEquipProduct()
    })
  }

  saveFormRef = formRef => {
    this.formRef = formRef;
  };

  componentDidMount() {
    this.getEquipmentCodeList();
    this.getProductCodeList();
  }
  updateData = (data) => {
    const { form } = this.formRef.props;
    const isEdit = data.standardId
    form.validateFields((errors, values) => {
      if (errors) {
        return 
      }
    })
    if (!data.condition || !data.value1) {
        message.error('必须输入条件和数值1')
        return
    }
    const { equipmentCode, productCode } = form.getFieldsValue();
      data.equipmentCode = equipmentCode
      data.productCode = productCode
      data.createDate = new Date()
      if(data.condition==='bt' && !data.value2){
          message.error('数值2不能为空');
          return
      }
      if(!data.value2){
          data.value2=''
      }
      delete data.index
      delete data.key
      return request({
        url: `/standard/${isEdit ? 'updateStandardList' : 'addStandard'}`,
        method: 'POST',
        data: [data],
        success: res => {
          if (!res || res.code !== 0) {
            return
          } else {
            if (isEdit) {
              message.success('编辑成功')
            } else {
              message.success('创建成功')
            }
            this.isEquipProduct()
            return res
          }
        },
        error: (err) => {
          if (err.response.data.code === -2) {
            message.error('数值2不能为空');
          } else {
            message.error('网络请求错误');
          }
        }
      })
  }
  render() {
    const { equipList, productList, columns, data, mergeData, type, isFetching } = this.state;
    const { history } = this.props;
    const equips = equipList.map((item) => { return <Option key={item}>{item}</Option> });
    const products = productList.map((item) => { return <Option key={item}>{item}</Option> });
    return (
      <div className="create-device-page create-param">
        <div className="fixed-panel">
          <Breadcrumb>
            <Breadcrumb.Item><a href="#" onClick={(e) => { history.go(type !== 'add' ? -2 : -1) }}>报警策略</a></Breadcrumb.Item>
            {
              type === 'add' ? <Breadcrumb.Item>标准</Breadcrumb.Item> : ''
            }
            {
              type !== 'add' ? <Breadcrumb.Item><a href="#" onClick={(e) => { history.goBack() }}>标准</a></Breadcrumb.Item> : ''
            }
            {
              type === 'edit' ? <Breadcrumb.Item>标准</Breadcrumb.Item> : ''
            }
          </Breadcrumb>
        </div>
        <WrappedNormalForm
          wrappedComponentRef={this.saveFormRef}
          equips={equips}
          products={products}
          selectProduct={(id) => this.selectProduct(id)}
          selectEquip={(id) => this.selectEquip(id)}
        />
        <div className="title">参数标准</div>
        <div className="main-panel" style={{ marginBottom: '40px' }}>
          <EditableTable
            title={"标准列表（" + data.length + '）' }
            hasPaging={false} columns={columns}
            updateData={this.updateData}
            createData={false}
            data={{ list: mergeData.length>0?mergeData:data, isFetching }}
            deleteData={false}
            getTableList={null}
          />
        </div>
      </div>
    );
  }
}

export default StandCreate;
