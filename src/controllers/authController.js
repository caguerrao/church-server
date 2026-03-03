const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

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
    console.log('req.body', req.body)
   // console.log('password', password)
    //console.log('email', email)

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