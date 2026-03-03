const Asistencia = require('../models/Asistencia');
const Miembro = require('../models/Miembro');

exports.obtenerAsistencias = async (req, res, next) => {
  try {
    const { fecha, tipoReunion, page = 1, limit = 10 } = req.query;
    
    const query = {};
    if (fecha) {
      const fechaInicio = new Date(fecha);
      const fechaFin = new Date(fecha);
      fechaFin.setDate(fechaFin.getDate() + 1);
      query.fecha = { $gte: fechaInicio, $lt: fechaFin };
    }
    if (tipoReunion) query.tipoReunion = tipoReunion;

    const asistencias = await Asistencia.find(query)
      .populate('miembros.miembro', 'nombre apellido')
      .populate('registradoPor', 'nombre')
      .sort({ fecha: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      status: 'success',
      results: asistencias.length,
      data: {
        asistencias
      }
    });

  } catch (error) {
    next(error);
  }
};

exports.obtenerAsistencia = async (req, res, next) => {
  try {
    const asistencia = await Asistencia.findById(req.params.id)
      .populate('miembros.miembro', 'nombre apellido grupoCelula')
      .populate('registradoPor', 'nombre');

    if (!asistencia) {
      return res.status(404).json({
        status: 'fail',
        message: 'Registro de asistencia no encontrado'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        asistencia
      }
    });

  } catch (error) {
    next(error);
  }
};

exports.crearAsistencia = async (req, res, next) => {
  try {
    const { fecha, tipoReunion } = req.body;

    // Verificar si ya existe asistencia para esta fecha y tipo
    const existente = await Asistencia.findOne({
      fecha: new Date(fecha),
      tipoReunion
    });

    if (existente) {
      return res.status(400).json({
        status: 'fail',
        message: 'Ya existe un registro de asistencia para esta fecha y tipo de reunión'
      });
    }

    // Obtener todos los miembros activos si no se proporciona lista
    if (!req.body.miembros) {
      const miembrosActivos = await Miembro.find({ activo: true });
      req.body.miembros = miembrosActivos.map(m => ({
        miembro: m._id,
        presente: false
      }));
    }

    req.body.registradoPor = req.usuario.id;

    const asistencia = await Asistencia.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        asistencia
      }
    });

  } catch (error) {
    next(error);
  }
};

exports.actualizarAsistencia = async (req, res, next) => {
  try {
    const asistencia = await Asistencia.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!asistencia) {
      return res.status(404).json({
        status: 'fail',
        message: 'Registro no encontrado'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        asistencia
      }
    });

  } catch (error) {
    next(error);
  }
};

exports.registrarAsistenciaMiembro = async (req, res, next) => {
  try {
    const { miembroId, presente, horaLlegada } = req.body;
    const asistencia = await Asistencia.findById(req.params.id);

    if (!asistencia) {
      return res.status(404).json({
        status: 'fail',
        message: 'Registro de asistencia no encontrado'
      });
    }

    const miembroIndex = asistencia.miembros.findIndex(
      m => m.miembro.toString() === miembroId
    );

    if (miembroIndex === -1) {
      // Agregar nuevo miembro a la lista
      asistencia.miembros.push({
        miembro: miembroId,
        presente,
        horaLlegada
      });
    } else {
      // Actualizar existente
      asistencia.miembros[miembroIndex].presente = presente;
      asistencia.miembros[miembroIndex].horaLlegada = horaLlegada;
    }

    await asistencia.save();

    res.status(200).json({
      status: 'success',
      data: {
        asistencia
      }
    });

  } catch (error) {
    next(error);
  }
};

exports.obtenerEstadisticasAsistencia = async (req, res, next) => {
  try {
    const { fechaInicio, fechaFin, tipoReunion } = req.query;
    
    const matchStage = {};
    if (fechaInicio && fechaFin) {
      matchStage.fecha = {
        $gte: new Date(fechaInicio),
        $lte: new Date(fechaFin)
      };
    }
    if (tipoReunion) matchStage.tipoReunion = tipoReunion;

    const estadisticas = await Asistencia.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          promedioAsistencia: { $avg: '$totalPresentes' },
          totalReuniones: { $sum: 1 },
          maxAsistencia: { $max: '$totalPresentes' },
          minAsistencia: { $min: '$totalPresentes' }
        }
      }
    ]);

    const porTipo = await Asistencia.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$tipoReunion',
          promedio: { $avg: '$totalPresentes' },
          total: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        generales: estadisticas[0],
        porTipo
      }
    });

  } catch (error) {
    next(error);
  }
};