const mongoose = require('mongoose');

const asistenciaSchema = new mongoose.Schema({
  fecha: {
    type: Date,
    required: [true, 'La fecha es obligatoria'],
    default: Date.now
  },
  tipoReunion: {
    type: String,
    enum: ['Culto Dominical', 'Reunión de Jóvenes', 'Estudio Bíblico', 'Oración', 'Grupo de Varones', 'Grupo de Damas', 'Especial'],
    required: true
  },
  miembros: [{
    miembro: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Miembro',
      required: true
    },
    presente: {
      type: Boolean,
      default: false
    },
    horaLlegada: {
      type: String
    },
    observaciones: String
  }],
  totalPresentes: {
    type: Number,
    default: 0
  },
  totalAusentes: {
    type: Number,
    default: 0
  },
  registradoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  observacionesGenerales: String
}, {
  timestamps: true
});

// Middleware pre-save para calcular totales
asistenciaSchema.pre('save', function(next) {
  this.totalPresentes = this.miembros.filter(m => m.presente).length;
  this.totalAusentes = this.miembros.filter(m => !m.presente).length;
  next();
});

// Índice compuesto para evitar duplicados
asistenciaSchema.index({ fecha: 1, tipoReunion: 1 }, { unique: true });

module.exports = mongoose.model('Asistencia', asistenciaSchema);