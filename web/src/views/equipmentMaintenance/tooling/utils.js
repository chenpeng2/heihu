import moment from 'utils/time';
import { arrayIsEmpty } from 'src/utils/array';

export const getCreateToolingUrl = () => '/equipmentMaintenance/tooling/create';

export const getToolingListUrl = () => '/equipmentMaintenance/tooling';

export const getToolingDetailUrl = id => `/equipmentMaintenance/tooling/detail?id=${id}`;

export const getEditToolingUrl = id => `/equipmentMaintenance/tooling/edit?id=${id}`;

export const getToolingImportLogUrl = () => '/equipmentMaintenance/tooling/importLog';

export const getToolingImportLogDetailUrl = id => `/equipmentMaintenance/tooling/importLog/detail?id=${id}`;

export const getFormatParams = value => {
  const { deliverDate, admitDate, firstEnableDate, attachments, ...rest } = value;
  const params = {
    deliverDate: deliverDate && Date.parse(deliverDate),
    admitDate: admitDate && Date.parse(admitDate),
    firstEnableDate: firstEnableDate && Date.parse(firstEnableDate),
    ...rest,
  };
  if (!arrayIsEmpty(attachments)) {
    params.attachments = attachments.map(n => n.id);
  }
  return params;
};

export const getFormatSearchParams = values => {
  const { page, size, enable, firstEnabledTime, ...rest } = values;
  const params = {
    searchEnableStatus: enable && enable.key,
    searchFirstEnableDateStartTime: !arrayIsEmpty(firstEnabledTime) ? Date.parse(firstEnabledTime[0]) : undefined,
    searchFirstEnableDateEndTime: !arrayIsEmpty(firstEnabledTime) ? Date.parse(firstEnabledTime[1]) : undefined,
    page: page || 1,
    size: size || 10,
    ...rest,
  };
  return params;
};

export const getFormatFormValue = value => {
  const { deliverDate, admitDate, firstEnableDate, attachmentsFile, ...rest } = value;
  let attachments = [];
  if (!arrayIsEmpty(attachmentsFile)) {
    attachments = attachmentsFile.map(attachment => ({
      originalExtension: attachment.original_extension,
      originalFileName: attachment.original_filename,
      url: attachment.url,
      id: attachment.id,
    }));
  }
  return {
    ...rest,
    deliverDate: deliverDate && moment(deliverDate),
    admitDate: admitDate && moment(admitDate),
    firstEnableDate: firstEnableDate && moment(firstEnableDate),
    attachments,
  };
};

export default 'dummy';
