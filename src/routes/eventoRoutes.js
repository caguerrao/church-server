const express = require('express');
const router = express.Router();
const eventoController = require('../controllers/eventoController');
const { proteger, restringirA } = require('../middleware/auth');

router.use(proteger);

router.get('/', eventoController.obtenerEventos);
router.get('/:id', eventoController.obtenerEvento);

router.post('/', restringirA('admin', 'pastor', 'secretario'), eventoController.crearEvento);
router.patch('/:id', restringirA('admin', 'pastor', 'secretario'), eventoController.actualizarEvento);

router.post('/:id/inscribir', eventoController.inscribirMiembro);
router.post('/:id/cancelar', eventoController.cancelarInscripcion);

router.delete('/:id', restringirA('admin', 'pastor'), eventoController.eliminarEvento);

module.exports = router;