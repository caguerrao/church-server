const Evento = require('../models/Evento');

exports.obtenerEventos = async (req, res, next) => {
  try {
    const { estado, tipo, proximos } = req.query;
    const query = {};

    if (estado) query.estado = estado;
    if (tipo) query.tipo = tipo;
    
    if (proximos === 'true') {
      query.fechaInicio = { $gte: new Date() };
      query.estado = { $in: ['planificado', 'en_curso'] };
    }

    const eventos = await Evento.find(query)
      .populate('organizador', 'nombre')
      .populate('inscritos.miembro', 'nombre apellido')
      .sort({ fechaInicio: 1 });

    res.status(200).json({
      status: 'success',
      results: eventos.length,
      data: {
        eventos
      }
    });

  } catch (error) {
    next(error);
  }
};

exports.obtenerEvento = async (req, res, next) => {
  try {
    const evento = await Evento.findById(req.params.id)
      .populate('organizador', 'nombre email')
      .populate('inscritos.miembro', 'nombre apellido email telefono');

    if (!evento) {
      return res.status(404).json({
        status: 'fail',
        message: 'Evento no encontrado'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        evento
      }
    });

  } catch (error) {
    next(error);
  }
};

exports.crearEvento = async (req, res, next) => {
  try {
    req.body.organizador = req.usuario.id;
    
    const evento = await Evento.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        evento
      }
    });

  } catch (error) {
    next(error);
  }
};

exports.actualizarEvento = async (req, res, next) => {
  try {
    const evento = await Evento.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!evento) {
      return res.status(404).json({
        status: 'fail',
        message: 'Evento no encontrado'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        evento
      }
    });

  } catch (error) {
    next(error);
  }
};

exports.inscribirMiembro = async (req, res, next) => {
  try {
    const { miembroId } = req.body;
    const evento = await Evento.findById(req.params.id);

    if (!evento) {
      return res.status(404).json({
        status: 'fail',
        message: 'Evento no encontrado'
      });
    }

    // Verificar capacidad
    if (evento.capacidad > 0 && evento.inscritos.length >= evento.capacidad) {
      return res.status(400).json({
        status: 'fail',
        message: 'El evento ha alcanzado su capacidad máxima'
      });
    }

    // Verificar si ya está inscrito
    const yaInscrito = evento.inscritos.some(i => i.miembro.toString() === miembroId);
    if (yaInscrito) {
      return res.status(400).json({
        status: 'fail',
        message: 'El miembro ya está inscrito en este evento'
      });
    }

    evento.inscritos.push({ miembro: miembroId });
    await evento.save();

    res.status(200).json({
      status: 'success',
      message: 'Miembro inscrito correctamente',
      data: {
        evento
      }
    });

  } catch (error) {
    next(error);
  }
};

exports.cancelarInscripcion = async (req, res, next) => {
  try {
    const { miembroId } = req.body;
    const evento = await Evento.findById(req.params.id);

    if (!evento) {
      return res.status(404).json({
        status: 'fail',
        message: 'Evento no encontrado'
      });
    }

    evento.inscritos = evento.inscritos.filter(
      i => i.miembro.toString() !== miembroId
    );
    await evento.save();

    res.status(200).json({
      status: 'success',
      message: 'Inscripción cancelada',
      data: {
        evento
      }
    });

  } catch (error) {
    next(error);
  }
};

exports.eliminarEvento = async (req, res, next) => {
  try {
    await Evento.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null
    });

  } catch (error) {
    next(error);
  }
};