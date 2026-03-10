const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const crypto = require('crypto');
const PasswordResetToken = require('../models/PasswordResetToken');
const emailService = require('../services/emailService');

const generarToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

exports.registrar = async (req, res, next) => {
  try {
    const { nombre, email, password, rol } = req.body;

    // Verificar si email existe
    const usuarioExistente = await Usuario.findOne({ email });
    if (usuarioExistente) {
      return res.status(400).json({
        status: 'fail',
        message: 'El email ya está registrado'
      });
    }

    const usuario = await Usuario.create({
      nombre,
      email,
      password,
      rol: rol || 'secretario'
    });

    const token = generarToken(usuario._id);

    res.status(201).json({
      status: 'success',
      token,
      data: {
        usuario: {
          id: usuario._id,
          nombre: usuario.nombre,
          email: usuario.email,
          rol: usuario.rol
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Verificar email y password existan
    if (!email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Por favor proporcione email y contraseña'
      });
    }

    // Buscar usuario y seleccionar password
    const usuario = await Usuario.findOne({ email }).select('+password');

    if (!usuario || !(await usuario.compararPassword(password, usuario.password))) {
      return res.status(401).json({
        status: 'fail',
        message: 'Email o contraseña incorrectos'
      });
    }

    // Actualizar último acceso
    usuario.ultimoAcceso = Date.now();
    await usuario.save({ validateBeforeSave: false });

    const token = generarToken(usuario._id);

    res.status(200).json({
      status: 'success',
      token,
      data: {
        usuario: {
          id: usuario._id,
          nombre: usuario.nombre,
          email: usuario.email,
          rol: usuario.rol
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

exports.obtenerPerfil = async (req, res, next) => {
  try {
    const usuario = await Usuario.findById(req.usuario.id);

    res.status(200).json({
      status: 'success',
      data: {
        usuario
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.actualizarPassword = async (req, res, next) => {
  try {
    const { passwordActual, passwordNuevo } = req.body;

    const usuario = await Usuario.findById(req.usuario.id).select('+password');

    if (!(await usuario.compararPassword(passwordActual, usuario.password))) {
      return res.status(401).json({
        status: 'fail',
        message: 'Contraseña actual incorrecta'
      });
    }

    usuario.password = passwordNuevo;
    await usuario.save();

    const token = generarToken(usuario._id);

    res.status(200).json({
      status: 'success',
      token,
      message: 'Contraseña actualizada correctamente'
    });

  } catch (error) {
    next(error);
  }
};




// Solicitar recuperación de contraseña
exports.solicitarRecuperacion = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: 'fail',
        message: 'El email es obligatorio'
      });
    }

    const usuario = await Usuario.findOne({ email });

    // Por seguridad, no revelar si el email existe o no
    if (!usuario) {
      return res.status(200).json({
        status: 'success',
        message: 'Si el email existe, recibirás instrucciones para recuperar tu contraseña'
      });
    }

    // Invalidar tokens anteriores del usuario
    await PasswordResetToken.updateMany(
      { usuario: usuario._id, used: false },
      { used: true }
    );

    // Generar token seguro
    const token = crypto.randomBytes(32).toString('hex');
    
    // Crear registro de token
    await PasswordResetToken.create({
      usuario: usuario._id,
      token: token,
      expiresAt: new Date(Date.now() + 3600000) // 1 hora
    });

    // Enviar email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password`;
    await emailService.sendPasswordResetEmail(
      usuario.email,
      usuario.nombre,
      resetUrl,
      token
    );

    res.status(200).json({
      status: 'success',
      message: 'Si el email existe, recibirás instrucciones para recuperar tu contraseña'
    });

  } catch (error) {
    next(error);
  }
};

// Verificar token de recuperación
exports.verificarToken = async (req, res, next) => {
  try {
    const { token } = req.params;

    const resetToken = await PasswordResetToken.findOne({
      token: token,
      used: false,
      expiresAt: { $gt: Date.now() }
    }).populate('usuario', 'email nombre');

    if (!resetToken) {
      return res.status(400).json({
        status: 'fail',
        message: 'Token inválido o expirado'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        email: resetToken.usuario.email,
        valid: true
      }
    });

  } catch (error) {
    next(error);
  }
};

// Restablecer contraseña
exports.restablecerPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Token y nueva contraseña son obligatorios'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        status: 'fail',
        message: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    const resetToken = await PasswordResetToken.findOne({
      token: token,
      used: false,
      expiresAt: { $gt: Date.now() }
    }).populate('usuario');

    if (!resetToken) {
      return res.status(400).json({
        status: 'fail',
        message: 'Token inválido o expirado'
      });
    }

    // Actualizar contraseña
    const usuario = resetToken.usuario;
    usuario.password = password;
    await usuario.save();

    // Marcar token como usado
    resetToken.used = true;
    await resetToken.save();

    // Enviar confirmación
    await emailService.sendPasswordChangedConfirmation(usuario.email, usuario.nombre);

    res.status(200).json({
      status: 'success',
      message: 'Contraseña actualizada exitosamente'
    });

  } catch (error) {
    next(error);
  }
};