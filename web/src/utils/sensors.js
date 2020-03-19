import { getUserInfo } from 'src/services/auth/user';

const orgTypes = {
  0: '默认类型',
  1: '商用',
  2: '内部',
  3: '合作伙伴',
};

export const setSensorsUserProfile = async () => {
  if (!sensors) return;

  const {
    data: { data },
  } = await getUserInfo();
  console.log(data);
  const {
    id,
    username,
    roles,
    org: {
      id: orgId,
      enterprise: { name: companyName } = {},
      globalUniqueName,
      name: orgName,
      code: orgCode,
      type,
      quota,
      expiration,
      used,
    },
  } = data;
  if (sensors) {
    sensors.login(id);
    sensors.registerPage({
      UserID: String(id),
      UserAccount: username,
      UserType: '已注册',
      UserRole: roles.map(e => e.name),
      CompanyName: companyName,
      OrgName: globalUniqueName || orgName,
      OrgID: String(orgId),
      OrgCode: orgCode,
      OrgType: orgTypes[type],
      quota,
      expiration,
      used,
    });
    sensors.setProfile({
      UserId: String(id),
      UserAccount: username,
      UserType: '已注册',
      UserRole: roles.map(e => e.name),
      CompanyName: companyName,
      orgName: globalUniqueName || orgName,
      orgId: String(orgId),
      orgCode,
      orgType: orgTypes[type],
      quota,
      expiration,
      used,
    });
  }
};

export default 'dummy';
