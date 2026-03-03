const mongoose = require('mongoose');

const finanzaSchema = new mongoose.Schema({
  fecha: {
    type: Date,
    required: true,
    default: Date.now
  },
  tipo: {
    type: String,
    enum: ['ingreso', 'egreso'],
    required: true
  },
  categoria: {
    type: String,
    enum: ['Ofrenda Dominical', 'Diezmo', 'Donación Especial', 'Evento', 'Mantenimiento', 'Servicios', 'Misión', 'Otro'],
    required: true
  },
  monto: {
    type: Number,
    required: [true, 'El monto es obligatorio'],
    min: [0, 'El monto no puede ser negativo']
  },
  descripcion: {
    type: String,
    required: [true, 'La descripción es obligatoria']
  },
  metodoPago: {
    type: String,
    enum: ['Efectivo', 'Transferencia', 'Tarjeta', 'Depósito', 'Otro'],
    default: 'Efectivo'
  },
  referencia: {
    type: String // Número de transferencia, etc.
  },
  miembro: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Miembro',
    default: null // Para diezmos/ofrendas de miembros específicos
  },
  registradoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  comprobanteUrl: String,
  notas: String
}, {
  timestamps: true
});

// Índices para reportes
finanzaSchema.index({ fecha: -1 });
finanzaSchema.index({ tipo: 1, categoria: 1 });
finanzaSchema.index({ miembro: 1 });

module.exports = mongoose.model('Finanza', finanzaSchema);