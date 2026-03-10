const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { proteger } = require('../middleware/auth');

// Rutas existentes...
router.post('/login', authController.login);
router.post('/registrar', [
  body('nombre').notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 })
], authController.registrar);

router.get('/perfil', proteger, authController.obtenerPerfil);

router.patch('/actualizar-password', proteger, [
  body('passwordActual').notEmpty(),
  body('passwordNuevo').isLength({ min: 6 })
], authController.actualizarPassword);

// NUEVAS RUTAS PARA RECUPERACIÓN
router.post('/recuperar-password', [
  body('email').isEmail().withMessage('Email inválido')
], authController.solicitarRecuperacion);

router.get('/verificar-token/:token', authController.verificarToken);

router.post('/restablecer-password', [
  body('token').notEmpty(),
  body('password').isLength({ min: 6 }).withMessage('Mínimo 6 caracteres')
], authController.restablecerPassword);

module.exports = router;