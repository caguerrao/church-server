const express = require('express');
const router = express.Router();
const asistenciaController = require('../controllers/asistenciaController');
const { proteger, restringirA } = require('../middleware/auth');

router.use(proteger);

router.get('/estadisticas', asistenciaController.obtenerEstadisticasAsistencia);
router.get('/', asistenciaController.obtenerAsistencias);
router.get('/:id', asistenciaController.obtenerAsistencia);

router.post('/', restringirA('admin', 'pastor', 'secretario'), asistenciaController.crearAsistencia);
router.patch('/:id', restringirA('admin', 'pastor', 'secretario'), asistenciaController.actualizarAsistencia);
router.post('/:id/miembros', restringirA('admin', 'pastor', 'secretario'), asistenciaController.registrarAsistenciaMiembro);

module.exports = router;