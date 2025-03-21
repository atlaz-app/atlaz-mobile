export enum BackendPaths {
  AuthLogin = '/auth/login',
  AuthRegister = '/auth/register',
  AuthVerifyEmail = '/auth/verify-email',
  AuthRefresh = '/auth/refresh',

  UserInfo = '/user/info',

  Presets = '/presets',
  PresetsCreate = '/presets/create',

  Traces = '/traces',
  TracesCreate = '/traces/create',
}

export namespace BackendPaths {
  export const PresetById = (id: number) => BackendPaths.Presets + '/' + id;
}
