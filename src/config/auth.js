module.exports = {
  jwtSecret: process.env.JWT_SECRET || 'clave_secreta_desarrollo',
  jwtExpire: process.env.JWT_EXPIRE || '7d',
  bcryptSaltRounds: 12
};