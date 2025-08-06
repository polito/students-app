export const isEnvProduction =
  process.env.NODE_ENV === 'production' ||
  process.env.NODE_ENV === 'fake_production';
