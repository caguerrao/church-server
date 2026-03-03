
const express = require('express');
const router = express.Router();
const finanzaController = require('../controllers/finanzaController');
const { proteger, restringirA } = require('../middleware/auth');

router.use(proteger);

router.get('/reporte-mensual', restringirA('admin', 'pastor', 'tesorero'), finanzaController.obtenerReporteMensual);
router.get('/', finanzaController.obtenerFinanzas);
router.get('/:id', finanzaController.obtenerFinanza);

router.post('/', restringirA('admin', 'pastor', 'tesorero'), finanzaController.crearFinanza);
router.patch('/:id', restringirA('admin', 'pastor', 'tesorero'), finanzaController.actualizarFinanza);
router.delete('/:id', restringirA('admin', 'pastor'), finanzaController.eliminarFinanza);

module.exports = router;