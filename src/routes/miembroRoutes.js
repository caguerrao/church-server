const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const miembroController = require('../controllers/miembroController');
const { proteger, restringirA } = require('../middleware/auth');

router.use(proteger); // Todas las rutas protegidas

router.get('/estadisticas', restringirA('admin', 'pastor'), miembroController.obtenerEstadisticas);

router.get('/', miembroController.obtenerMiembros);
router.get('/:id', miembroController.obtenerMiembro);

router.post('/', [
  body('nombre').notEmpty(),
  body('apellido').notEmpty(),
  body('fechaNacimiento').isISO8601(),
  body('fechaConversion').isISO8601()
], restringirA('admin', 'pastor', 'secretario'), miembroController.crearMiembro);

router.patch('/:id', restringirA('admin', 'pastor', 'secretario'), miembroController.actualizarMiembro);
router.delete('/:id', restringirA('admin', 'pastor'), miembroController.eliminarMiembro);

module.exports = router;