import os from 'node:os';

const originalUserInfo = os.userInfo;

os.userInfo = (options) => {
  try {
    return originalUserInfo(options);
  } catch (error) {
    if (error?.code !== 'ERR_SYSTEM_ERROR' && error?.info?.code !== 'ENOMEM') {
      throw error;
    }

    return {
      username: process.env.USERNAME || process.env.USER || 'user',
      uid: -1,
      gid: -1,
      shell: null,
      homedir: os.homedir(),
    };
  }
};
