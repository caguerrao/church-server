const mongoose = require('mongoose');

const miembroSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true
  },
  apellido: {
    type: String,
    required: [true, 'El apellido es obligatorio'],
    trim: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    sparse: true,
    unique: true
  },
  telefono: {
    type: String,
    trim: true
  },
  fechaNacimiento: {
    type: Date,
    required: [true, 'La fecha de nacimiento es obligatoria']
  },
  fechaConversion: {
    type: Date,
    required: [true, 'La fecha de conversión es obligatoria']
  },
  direccion: {
    calle: String,
    ciudad: String,
    estado: String,
    codigoPostal: String,
    pais: { type: String, default: 'México' }
  },
  grupoCelula: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Grupo',
    default: null
  },
  ministerio: {
    type: String,
    enum: ['Alabanza', 'Intercesión', 'Enseñanza', 'Evangelismo', 'Multimedia', 'Servicio', 'Ushers', 'Niños', 'Ninguno'],
    default: 'Ninguno'
  },
  estadoCivil: {
    type: String,
    enum: ['Soltero', 'Casado', 'Divorciado', 'Viudo', 'Unión Libre'],
    default: 'Soltero'
  },
  fotoUrl: {
    type: String,
    default: null
  },
  activo: {
    type: Boolean,
    default: true
  },
  bautizado: {
    type: Boolean,
    default: false
  },
  fechaBautismo: {
    type: Date
  },
  notas: {
    type: String,
    maxlength: [1000, 'Las notas no pueden exceder 1000 caracteres']
  },
  contactoEmergencia: {
    nombre: String,
    telefono: String,
    relacion: String
  },
  historialAsistencia: [{
    fecha: Date,
    presente: Boolean,
    tipoReunion: String
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual para nombre completo
miembroSchema.virtual('nombreCompleto').get(function() {
  return `${this.nombre} ${this.apellido}`;
});

// Virtual para edad
miembroSchema.virtual('edad').get(function() {
  const hoy = new Date();
  const nacimiento = new Date(this.fechaNacimiento);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }
  return edad;
});

// Índices para búsquedas frecuentes
miembroSchema.index({ nombre: 'text', apellido: 'text', email: 'text' });
miembroSchema.index({ grupoCelula: 1 });
miembroSchema.index({ activo: 1 });

module.exports = mongoose.model('Miembro', miembroSchema);