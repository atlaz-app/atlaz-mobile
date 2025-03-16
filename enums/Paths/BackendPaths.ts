export enum BackendPaths {
  AuthLogin = '/auth/login',
  AuthRegister = '/auth/register',
  AuthVerifyEmail = '/auth/verify-email',
  AuthRefresh = '/auth/refresh',

  UserInfo = '/user/info',
  UserPresets = '/user/presets',
}

export namespace BackendPaths {
  export const UserPresetById = (id: number) => BackendPaths.UserPresets + '/' + id;
}
