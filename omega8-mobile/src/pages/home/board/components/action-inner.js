import React, { PureComponent } from 'react';
import { List, ListItem } from 'framework7-react';

export default class ActionInner extends PureComponent {
    constructor(props) {
        super(props);
    }

    handleClick(item, key, e) {
        e && e.stopPropagation();
        this.props.handleClick(item, key, e) 
    }

    render() {
        const { list, name } = this.props;
        return (
            <List>
                {
                    list.map( (item, key) =>
                        <ListItem
                            radio
                            key={key}
                            title={ item } 
                            name={ name ? name : "select"}
                            value={ item } 
                            defaultChecked ={ key === 0 ? true : false }
                            onClick= { (e) => this.handleClick(item, key, e) }
                        ></ListItem>
                    )
                }
            </List>
        )
    }
}