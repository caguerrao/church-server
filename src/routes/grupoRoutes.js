const express = require('express');
const router = express.Router();
const grupoController = require('../controllers/grupoController');
const { proteger, restringirA } = require('../middleware/auth');

router.use(proteger);

router.get('/', grupoController.obtenerGrupos);
router.get('/:id', grupoController.obtenerGrupo);

router.post('/', restringirA('admin', 'pastor', 'lider'), grupoController.crearGrupo);
router.patch('/:id', restringirA('admin', 'pastor', 'lider'), grupoController.actualizarGrupo);

router.post('/:id/miembros', restringirA('admin', 'pastor', 'lider'), grupoController.agregarMiembroAGrupo);
router.delete('/:id/miembros', restringirA('admin', 'pastor', 'lider'), grupoController.eliminarMiembroDeGrupo);

router.delete('/:id', restringirA('admin', 'pastor'), grupoController.eliminarGrupo);

module.exports = router;