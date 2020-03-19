import React, { PureComponent } from 'react';
import { Button, Block } from 'framework7-react';

export default class extends PureComponent {
    constructor(props) {
      super(props);
      this.state = {
          name: this.props.filterItem.name,
          items: this.props.filterItem.items,
          checked: ''
        //   hash: {}
      }
    }

    handleClick(item, e) {
        this.setState({
            checked: item
        })
        this.props.getChecked(item);
        // const [target, CLASSNAME] = [e.target, 'unchecked'];
        // target.classList.toggle(CLASSNAME);
        // let temp = {}; temp[item] = !target.classList.contains(CLASSNAME);
        // let hash = Object.assign({}, this.state.hash, temp);
        // this.setState({ hash: hash });
        // console.log(this.state.hash)
    }

    getCheckedList() {
        return this.state.checked;
        // const list = [], hash = this.state.hash;
        // for(let key in hash) {
        //     if(hash[key]) list.push(key)
        // }
        // return list
    }

    render() {
        return (
            <Block strong>
                <div className="label">{ this.state.name }</div>
                <div className="filter-buttons">
                { 
                    this.state.items && this.state.items.map( (item, key) =>
                        <Button 
                            onClick={ (e) => this.handleClick(item, e) }
                            className={ this.state.checked === item ? '' : 'unchecked' }
                            outline key={ key }
                        >{ item.name }</Button>
                    ) 
                }
                </div>
            </Block>
        )
    }
  };  