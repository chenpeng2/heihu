import React from 'react';
import _ from 'lodash';
import { getOrganizationConfigFromLocalStorage } from 'src/utils/organizationConfig';
import Document from './document';
import Attachment from '../attachment';

const JudgeAttachmentOrDocument = props => {
  const config = getOrganizationConfigFromLocalStorage();
  const configDocumentManagement = _.get(config, 'config_document_management.configValue') === 'true';
  return configDocumentManagement ? <Document {...props} /> : <Attachment {...props} />;
};

export default JudgeAttachmentOrDocument;
