import { getUserInfo } from 'src/services/auth/user';

export const setGrowingioCSConfigs = async () => {
  const { data: { data } } = await getUserInfo();
  const { id, name, roles, org: { id: orgId, name: orgName, used, quota, expiration } } = data;
  gio('setUserId', id);
  gio('people.set', 'orgId', orgId);
  gio('people.set', 'userName', name);
  gio('people.set', 'roleName', roles.map(e => e.name).join(','));
  gio('people.set', 'orgName', orgName);
  gio('people.set', 'quota', quota);
  gio('people.set', 'usedAccounts', used);
  gio('people.set', 'expiration', expiration);
};

export default 'dummy';
