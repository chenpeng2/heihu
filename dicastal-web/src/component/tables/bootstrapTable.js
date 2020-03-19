import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import React from "react"
import $ from 'jquery'
import 'bootstrap-table/dist/bootstrap-table'
// import 'bootstrap-table/dist/themes/materialize/bootstrap-table-materialize.js'
import 'bootstrap-table/dist/extensions/group-by-v2/bootstrap-table-group-by'
import 'bootstrap/scss/bootstrap.scss'
import 'bootstrap-table/dist/bootstrap-table.min.css'

class BootstrapTableComponent extends React.Component {

    // componentWillMount() {
    //   this.props.history.listen(route => {
    //     this.props.changeRoute && this.props.changeRoute(route.pathname)
    //   })
    // }
    componentDidMount() {
    $(this.refs.table).bootstrapTable({
        columns: [
            {
              title: 'Item ID',
              field: 'id'
            },
            {
              field: 'name',
              title: 'Item Name'
            }, {
              field: 'price',
              title: 'Item Price'
            }
          ],
          data: [
            {
              id: 1,
              name: 'Item 1',
              price: '$1'
            },
              {
                id: 3,
                name: 'Item 2',
                price: '$1'
              },
              {
                id: 4,
                name: 'Item 2',
                price: '$1'
              }
          ],
        striped: true,
        search: true,
        showColumns: true,
        groupBy: true,
        groupByField: 'name',
        sortable: true,
        checkboxHeader: true,
        showToggle: true,
    })
    }
    render() {
        const products = [{
            id: 1,
            name: "Product1",
            price: 120
        }, {
            id: 2,
            name: "Product1",
            price: 120
        }, {
            id: 3,
            name: "Product1",
            price: 120
        }, {
            id: 4,
            name: "Product2",
            price: 120
        }, {
            id: 5,
            name: "Product2",
            price: 80
        }, {
            id: 6,
            name: "Product3",
            price: 80
        }, {
            id: 7,
            name: "Product3",
            price: 80
        }]
    return (
        // <BootstrapTable 
        //     data={products} 
        //     data-group-by={true} 
        //     data-group-by-field="name" 
        //     scrollTop={ 'Bottom' } 
        //     bordered={ true }
        // >
        //     <TableHeaderColumn isKey dataField='id'>Product ID</TableHeaderColumn>
        //     <TableHeaderColumn dataField='name'>Product Name</TableHeaderColumn>
        //     <TableHeaderColumn dataField='price'>Product Price</TableHeaderColumn>
        // </BootstrapTable>
        <div>
            <div id="table" ref="table"></div>
        </div>
        ) 
    }
}

export default BootstrapTableComponent