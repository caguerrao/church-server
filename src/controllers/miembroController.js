const Miembro = require('../models/Miembro');

// Obtener todos los miembros con filtros y paginación
exports.obtenerMiembros = async (req, res, next) => {
  try {
    const { 
      busqueda, 
      grupo, 
      ministerio, 
      activo, 
      estadoCivil,
      page = 1, 
      limit = 10 
    } = req.query;

    // Construir query
    const queryObj = {};

    if (activo !== undefined) queryObj.activo = activo === 'true';
    if (grupo) queryObj.grupoCelula = grupo;
    if (ministerio) queryObj.ministerio = ministerio;
    if (estadoCivil) queryObj.estadoCivil = estadoCivil;

    // Búsqueda por texto
    if (busqueda) {
      queryObj.$or = [
        { nombre: { $regex: busqueda, $options: 'i' } },
        { apellido: { $regex: busqueda, $options: 'i' } },
        { email: { $regex: busqueda, $options: 'i' } }
      ];
    }

    // Ejecutar query con paginación
    const skip = (Number(page) - 1) * Number(limit);

    const miembros = await Miembro.find(queryObj)
      .populate('grupoCelula', 'nombre')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Miembro.countDocuments(queryObj);

    res.status(200).json({
      status: 'success',
      results: miembros.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      data: {
        miembros
      }
    });

  } catch (error) {
    next(error);
  }
};

// Obtener un miembro específico
exports.obtenerMiembro = async (req, res, next) => {
  try {
    const miembro = await Miembro.findById(req.params.id)
      .populate('grupoCelula', 'nombre lider')
      .populate('createdBy', 'nombre');

    if (!miembro) {
      return res.status(404).json({
        status: 'fail',
        message: 'Miembro no encontrado'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        miembro
      }
    });

  } catch (error) {
    next(error);
  }
};

// Crear nuevo miembro
exports.crearMiembro = async (req, res, next) => {
  try {
    req.body.createdBy = req.usuario.id;
    
    const miembro = await Miembro.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        miembro
      }
    });

  } catch (error) {
    next(error);
  }
};

// Actualizar miembro
exports.actualizarMiembro = async (req, res, next) => {
  try {
    const miembro = await Miembro.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!miembro) {
      return res.status(404).json({
        status: 'fail',
        message: 'Miembro no encontrado'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        miembro
      }
    });

  } catch (error) {
    next(error);
  }
};

// Eliminar miembro (soft delete)
exports.eliminarMiembro = async (req, res, next) => {
  try {
    const miembro = await Miembro.findByIdAndUpdate(
      req.params.id,
      { activo: false },
      { new: true }
    );

    if (!miembro) {
      return res.status(404).json({
        status: 'fail',
        message: 'Miembro no encontrado'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Miembro eliminado correctamente'
    });

  } catch (error) {
    next(error);
  }
};

// Obtener estadísticas de miembros
exports.obtenerEstadisticas = async (req, res, next) => {
  try {
    const stats = await Miembro.aggregate([
      {
        $group: {
          _id: null,
          totalActivos: { $sum: { $cond: ['$activo', 1, 0] } },
          totalInactivos: { $sum: { $cond: ['$activo', 0, 1] } },
          promedioEdad: { $avg: { $subtract: [{ $year: new Date() }, { $year: '$fechaNacimiento' }] } }
        }
      }
    ]);

    const porMinisterio = await Miembro.aggregate([
      { $match: { activo: true } },
      { $group: { _id: '$ministerio', cantidad: { $sum: 1 } } }
    ]);

    const porEstadoCivil = await Miembro.aggregate([
      { $match: { activo: true } },
      { $group: { _id: '$estadoCivil', cantidad: { $sum: 1 } } }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        generales: stats[0],
        porMinisterio,
        porEstadoCivil
      }
    });

  } catch (error) {
    next(error);
  }
};