const jwt = require('jsonwebtoken');

const proteger = async (req, res, next) => {
  const Usuario = require('../models/Usuario');
  try {
    const token = req.header('i-token')
    
    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'No estás autorizado para acceder a esta ruta'
      });
    }

    try {
      // Verificar token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Verificar que el usuario aún existe
      const usuario = await Usuario.findById(decoded.id);
      
      if (!usuario) {
        return res.status(401).json({
          status: 'fail',
          message: 'El usuario ya no existe'
        });
      }

      if (!usuario.activo) {
        return res.status(401).json({
          status: 'fail',
          message: 'Usuario desactivado'
        });
      }

      // Agregar usuario al request
      req.usuario = usuario;
      next();

    } catch (error) {
      return res.status(401).json({
        status: 'fail',
        message: 'Token inválido'
      });
    }

  } catch (error) {
    next(error);
  }
};

// Restringir a ciertos roles
const restringirA = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.usuario.rol)) {
      return res.status(403).json({
        status: 'fail',
        message: 'No tienes permiso para realizar esta acción'
      });
    }
    next();
  };
};

module.exports = { proteger, restringirA };