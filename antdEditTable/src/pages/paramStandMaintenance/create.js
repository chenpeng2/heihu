import React, { PureComponent } from 'react';
import request from 'util/http'
import { Input, Select, Breadcrumb, Button, Form, message, Table  } from 'antd';
import EditableTable from 'components/antdEditTable/editFormTableCreateParma'
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
  handleSubmit = ()=> {

  }
  render() {
    const { getFieldDecorator } = this.props.form;
    const { equips, products, selectEquip, selectProduct } = this.props
    return (
      <Form layout="inline" onSubmit={ this.handleSubmit } className="default-form">
        <Form.Item label="标准名称">
          { getFieldDecorator('standardName', {
            rules: [{ required: true, message: '请输入标准名称' }],
          })( <Input /> )}
        </Form.Item>
        <Form.Item label="设备">
          {getFieldDecorator('equipmentCode', {
            rules: [{ required: true, message: '请选择设备!' }],
          })(
            <Select showSearch onSelect={ (id) => selectEquip(id) } style={{ width: 200 }}>{ equips }</Select>
          )}
        </Form.Item>
        <Form.Item label="产品">
          {getFieldDecorator('productCode', {
            rules: [{ required: true, message: '请选择产品!' }],
          })(
            <Select showSearch onSelect={ (id) => selectProduct(id) } style={{ width: 200 }}>{ products }</Select>
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
      const level = [
        <Option key='e'>等于</Option>,
        <Option key='ue'>不等于</Option>,
        <Option key='g'>大于</Option>,
        <Option key='ge'>大于等于</Option>,
        <Option key='l'>小于</Option>,
        <Option key='le'>小于等于</Option>,
        <Option key='bt'>范围内</Option>
      ];
    this.state = {
        type: params.type,  // 创建 or 编辑 or 复制
        id: params.id,  // 被编辑 or 被复制 的设备id
        equipList: [],
        productList: [],
        columns: [{
            title: '#',
            dataIndex: 'index'
          }, {
            title: <span><span className="required-mark">*</span>参数名称</span>,
            dataIndex: 'name',
            required: true,
          }, {
            title: <span><span className="required-mark">*</span>Measurement ID</span>,
            dataIndex: 'measurementId',
            required: true,
          }, {
            title: <span><span className="required-mark">*</span>条件</span>,
            dataIndex: 'condition',
            inputtype: 'select',
            options: level,
            editable: true,
            required: true,
          }, {
            title: <span><span className="required-mark">*</span>数值1(默认必填)</span>,
            dataIndex: 'value1',
            editable: true,
            required:true,
          }, {
            title: '数值2',
            dataIndex: 'value2',
            editable: true
          }, {
            title: '操作',
            dataIndex: 'operate',
        }],
        dataV:[],
        data: [],
        standards: [],

        editingKey:'',
        hideBtn:false,
        measureIdArr:[],
        onlyShowTable:true,
        selectEquip:''
    }
  }

  getRowItem(key, item) {
    return {
        key: key,
        index: key+1,
        name: item.parameterName,
        measurementId: item.measurementId,
        condition: item.condition,
        value1: item.value1,
        value2: item.value2,
    }
  }
  getRowItem2(key, item, name) {
      return {
          key: key,
          index: key+1,
          name: name,
          condition: item.condition,
          equipmentCode: item.equipmentCode,
          measurementId: item.measurementId,
          productCode: item.productCode,
          standardId:item.standardId,
          standardName:item.standardName,
          value1: item.value1,
          value2: item.value2,
      }
  }
  handleInputChange = (e, key) => {
    const item = {}; item[key] = e.target.value;
    let stand = Object.assign({}, this.state.stand, item )
     this.setState({ stand })
  }

  // 获取设备编码列表
  getEquipmentCodeList() {
    request({
      url: `/equipment/getEquipmentCodeList`,
      method: 'GET',
      success: res => {
        if(!res || res.code !== 0) {
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
        if(!res || res.code !== 0) {
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
      url: `/parameter/getParameterList?equipmentCode=${ id }`,
      method: 'GET',
    }).then( res => {
      if(!res || res.code !== 0) {
        return
      }
      let param = [],measureIdArr = [];
      res.data.forEach( (item, key) => {
        param.push( this.getRowItem(key, item) )
        measureIdArr.push(item.measurementId)
      })
      this.setState({ data: param, measureIdArr }, () => {
        callback && callback()
      })
    })
  }
  // 标准列表
  getStandardList(equipmentCode, productCode ) {
    request({
      url: `/standard/getStandardList?equipmentCode=${ equipmentCode }&productCode=${ productCode }`,
      method: 'GET',
    }).then( res => {
      if(!res || res.code !== 0) {
        return
      }
      let param = [];
      res.data.forEach( (item, key) => {
          const {data} = this.state
          if(key<=data.length-1){
              param.push( this.getRowItem2(key, item,data[key].name ) )
          }
      })
      //合并设备默认的和产品私有的
      const {data} = this.state
      const newParam = data.map((item,index)=>{
            return Object.assign(item,param[index])
      })
      this.setState({ data: newParam, onlyShowTable:false })
    })
  }
  // 新增标准
  addStandard(data) {
    request({
      url: `/standard/addStandard`,
      method: 'POST',
      data
    }).then( res => {
      if(!res || res.code !== 0) {
        return
      }
      this.props.history.go(-1)
    })
  }

  isEquipProduct() {
    const { form } = this.formRef.props;
    const { productCode, equipmentCode } = form.getFieldsValue();
    if( productCode && equipmentCode ) {
      this.getStandardList(equipmentCode, productCode)
    }
  }

  selectProduct() {
    this.isEquipProduct()
  }

  selectEquip(id) {
    this.setState({selectEquip:id})
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
  updateParameter(param, callback) {
        request({
            url: `/standard/updateStandardList`,
            method: 'POST',
            data: param,
            success: res => {
                if(!res || res.code !== 0) {
                    return
                }
                callback && callback()
            },
            error: () => {
                message.error('请求失败');
            }
        })
  }
  _setDataSource = (data,editingKey,type,changeTable)=> {
      if(changeTable==='changeTable'){
          let {columns}=this.state
          if(data[editingKey].condition==='bt'){
              columns[5].title=<span><span className="required-mark">*</span>数值2</span>
              columns[5].required=true
              this.setState({columns})
          }
          this.setState({data})
          return
      }
      // 模拟添加成功前台添加
      this.setState({data,editingKey:''})
      if(type!=='nosave'){
          // 添加和更新，去请求刷新下measureIdArr
          const param = {},oneArr = []
          const newData = data[editingKey]
          param.condition=newData.condition
          param.createDate=new Date()
          param.equipmentCode=newData.equipmentCode
          param.measurementId=newData.productCode
          param.standardId=newData.standardId
          param.standardName=newData.standardName
          param.value1=newData.value1
          param.value2=newData.value2
          oneArr.push(param)
          this.updateParameter(oneArr)
      }

  }
  _hideBtn = (type)=> {
      // if(type==='show'){
      //     this.setState({hideBtn:false})
      // }else{
      //     this.setState({hideBtn:true})
      // }
  }
  getRowItemNew(key) {
        return {
            key: key,
            index:key+1,
            condition: "ge",
            createDate: "2019-10-12T02:50:41.429+0000",
            equipmentCode: "YDSC049",
            measurementId: "",
            productCode: "6C1011211032008",
            standardId: 53,
            standardName: "standard_test",
            value1: "420",
            value2: ""
        }
  }
  // 添加参数行
  addRow(e) {
        e && e.preventDefault();
        const { data } = this.state;
        this.setState({
            data: [...data, this.getRowItemNew(data.length)],
        },()=>{
            this.setState({editingKey:this.state.data.length-1,hideBtn:true})
        });
  }
  render() {
    const { equipList, productList, columns, data, type, onlyShowTable } = this.state;
    const { history } = this.props;
    const equips = equipList.map( (item) => { return <Option key={ item }>{ item }</Option> } );
    const products = productList.map( (item) => { return <Option key={ item }>{ item }</Option> } );
    return (
      <div className="create-device-page create-param">
        <div className="fixed-panel">
            <Breadcrumb>
                <Breadcrumb.Item><a href="#" onClick={ (e) => { history.go(type !== 'add' ? -2 : -1) } }>管理标准</a></Breadcrumb.Item>
                {
                    type === 'add' ? <Breadcrumb.Item>设备参数标准</Breadcrumb.Item> : ''
                }
                {
                    type !== 'add'  ? <Breadcrumb.Item><a  href="#" onClick={ (e) => { history.goBack() } }>设备参数标准</a></Breadcrumb.Item> : ''
                }
                {
                   type === 'edit' ? <Breadcrumb.Item>设备参数标准</Breadcrumb.Item> : ''
                }
            </Breadcrumb>
        </div>
        <WrappedNormalForm
          wrappedComponentRef={ this.saveFormRef }
          equips={equips} 
          products={products}
          selectProduct={ (id) => this.selectProduct(id) }
          selectEquip={ (id) => this.selectEquip(id) } />
        <div className="title">参数标准</div>
        <div className="main-panel" style={{ marginBottom: '40px' }}>
          <div className="operate">
            <span>参数标准 ({ data.length })</span>
          </div>
            <EditableTable onlyShowTable={onlyShowTable} hideBtn={this._hideBtn} editingKey={this.state.editingKey} setDataSource={this._setDataSource}  dataSource={ data } columns={ columns }></EditableTable>
        </div>
      </div>
    );
  }
}

export default StandCreate;
