const mongoose = require('mongoose');

const grupoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre del grupo es obligatorio'],
    unique: true,
    trim: true
  },
  descripcion: {
    type: String,
    maxlength: 500
  },
  lider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Miembro',
    required: [true, 'El líder es obligatorio']
  },
  coLider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Miembro',
    default: null
  },
  diaReunion: {
    type: String,
    enum: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
    required: true
  },
  hora: {
    type: String,
    required: [true, 'La hora es obligatoria']
  },
  direccion: {
    calle: String,
    ciudad: String,
    referencias: String
  },
  capacidad: {
    type: Number,
    default: 15,
    min: [2, 'La capacidad mínima es 2'],
    max: [50, 'La capacidad máxima es 50']
  },
  miembros: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Miembro'
  }],
  activo: {
    type: Boolean,
    default: true
  },
  observaciones: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual para cantidad de miembros
grupoSchema.virtual('cantidadMiembros').get(function() {
  return this.miembros.length;
});

// Virtual para verificar si está lleno
grupoSchema.virtual('estaLleno').get(function() {
  return this.miembros.length >= this.capacidad;
});

module.exports = mongoose.model('Grupo', grupoSchema);