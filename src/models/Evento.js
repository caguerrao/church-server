const mongoose = require('mongoose');

const eventoSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: [true, 'El título es obligatorio'],
    trim: true
  },
  descripcion: {
    type: String,
    required: true
  },
  tipo: {
    type: String,
    enum: ['Retiro', 'Conferencia', 'Taller', 'Cena del Señor', 'Bautismo', 'Boda', 'Funeral', 'Especial', 'Otro'],
    required: true
  },
  fechaInicio: {
    type: Date,
    required: true
  },
  fechaFin: {
    type: Date,
    required: true
  },
  hora: {
    type: String,
    required: true
  },
  ubicacion: {
    nombre: String,
    direccion: String,
    coordenadas: {
      lat: Number,
      lng: Number
    }
  },
  capacidad: {
    type: Number,
    default: 0 // 0 = ilimitado
  },
  inscritos: [{
    miembro: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Miembro'
    },
    fechaInscripcion: {
      type: Date,
      default: Date.now
    }
  }],
  costo: {
    type: Number,
    default: 0
  },
  imagenUrl: String,
  organizador: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  estado: {
    type: String,
    enum: ['planificado', 'en_curso', 'completado', 'cancelado'],
    default: 'planificado'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true }
});

// Virtual para cantidad de inscritos
eventoSchema.virtual('totalInscritos').get(function() {
  return this.inscritos.length;
});

module.exports = mongoose.model('Evento', eventoSchema);
