import React, { PureComponent } from 'react';
import { Select, Button, Form, DatePicker, Input } from 'antd';
import {MDCFormField} from '@material/form-field';
import {MDCCheckbox} from '@material/checkbox';
const { Option } = Select;
class addUser extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {

        }
    }
    handleSubmit = e => {
        e.preventDefault();

        this.props.form.validateFields((err, fieldsValue) => {
            if (err) {
                return;
            }

            // Should format date value before submit.
            const rangeValue = fieldsValue['range-picker'];
            const rangeTimeValue = fieldsValue['range-time-picker'];
            const values = {
                ...fieldsValue,
                'date-picker': fieldsValue['date-picker'].format('YYYY-MM-DD'),
                'date-time-picker': fieldsValue['date-time-picker'].format('YYYY-MM-DD HH:mm:ss'),
                'month-picker': fieldsValue['month-picker'].format('YYYY-MM'),
                'range-picker': [rangeValue[0].format('YYYY-MM-DD'), rangeValue[1].format('YYYY-MM-DD')],
                'range-time-picker': [
                    rangeTimeValue[0].format('YYYY-MM-DD HH:mm:ss'),
                    rangeTimeValue[1].format('YYYY-MM-DD HH:mm:ss'),
                ],
                'time-picker': fieldsValue['time-picker'].format('HH:mm:ss'),
            };
            console.log('Received values of form: ', values);
        });
    };
    render() {
        const {maskShow, width,height} = this.props
        const W = width?width:540
        const H = height?height:320
        const { getFieldDecorator } = this.props.form;
        return (
            <div className={maskShow?'define-modal-mask':''}>
                <div className="modal-wrap">
                    <div className="modal-content" style={{width:width+'px',height:height+'px',marginLeft:-W/2+'px',marginTop:-H/2+'px'}}>
                        <div class="mdc-form-field mdc-form-field--align-end">
                            <div class="mdc-checkbox">
                                <input type="checkbox" id="my-checkbox" class="mdc-checkbox__native-control"/>
                                <div class="mdc-checkbox__background">
                                    ...
                                </div>
                            </div>
                            <label for="my-checkbox">This is my checkbox</label>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
const WrappedAddUser = Form.create({ name: 'add-user' })(addUser);

export default WrappedAddUser;
