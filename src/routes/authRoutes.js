const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { proteger } = require('../middleware/auth');

router.post('/registrar', [
  body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
], authController.registrar);

router.post('/login', authController.login);

router.get('/perfil', proteger, authController.obtenerPerfil);

router.patch('/actualizar-password', proteger, [
  body('passwordActual').notEmpty(),
  body('passwordNuevo').isLength({ min: 6 })
], authController.actualizarPassword);

module.exports = router;