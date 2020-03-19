// import React, { Component } from 'react';
// import { Input, FormItem, Form, withForm, Attachment } from 'components';
// import { checkStringLength } from 'components/form';
// import { graphql } from 'react-relay';
// import { createQueryRenderer } from 'store/relay/relayApi';
// import { updateCustomerMutation } from 'store/relay/mutation';
// // test

// type Props = {
//   location: {},
//   variables: {
//     unitId: string,
//   },
//   viewer: {
//     organization: {},
//   },
//   relay: {},
//   form: {
//     getFieldDecorator: () => {},
//     setFieldsValue: () => {},
//   },
// };

// class EditCustomer extends Component {
//   props: Props;
//   state = {};

//   componentDidMount() {
//     const { viewer, form } = this.props;
//     const { organization } = viewer;
//     const { customer } = organization;
//     if (customer) {
//       const { name, attachment } = customer;
//       form.setFieldsValue({
//         name,
//         note: attachment && attachment.note,
//         files: attachment && attachment.files,
//       });
//     }
//   }

//   submit(value) {
//     const { variables: params } = this.props;
//     value.files = value.files ? value.files.map(file => ({ fileId: file.id })) : [];
//     const variables = {
//       ...value,
//       id: params && params.customerId,
//     };
//     return updateCustomerMutation({ variables })();
//   }

//   render() {
//     const { form } = this.props;
//     const { getFieldDecorator } = form;
//     return (
//       <Form layout="vertical">
//         <FormItem label="名称">
//           {getFieldDecorator('name', {
//             rules: [{ required: true, message: '请输入客户名称' }, { min: 0, max: 12, message: '单位长度不能超过12个字' }],
//           })(<Input />)}
//         </FormItem>
//         <FormItem label={'备注'}>
//           {getFieldDecorator('note', {
//             rules: [{ validator: checkStringLength() }],
//           })(<Input.TextArea />)}
//         </FormItem>
//         <FormItem label={'附件'}>{getFieldDecorator('files', {
//           valuePropName: 'myFileList',
//         })(<Attachment />)}</FormItem>
//       </Form>
//     );
//   }
// }

// const EditCustomerForm = withForm({ showFooter: true }, EditCustomer);

// const query = graphql`
//   query edit_customer_Query($customerId: ID!) {
//     viewer {
//       organization {
//         customer(id: $customerId) {
//           id
//           name
//           attachment {
//             note
//             files {
//               id
//               url
//               originalFileName
//             }
//           }
//         }
//       }
//     }
//   }
// `;

// export const EditCustomerFormWithQueryRenderer = createQueryRenderer(EditCustomerForm, query);

// export default 'dummy';
