const Finanza = require('../models/Finanza');

exports.obtenerFinanzas = async (req, res, next) => {
  try {
    const { 
      tipo, 
      categoria, 
      fechaInicio, 
      fechaFin, 
      page = 1, 
      limit = 20 
    } = req.query;

    const query = {};
    
    if (tipo) query.tipo = tipo;
    if (categoria) query.categoria = categoria;
    if (fechaInicio && fechaFin) {
      query.fecha = {
        $gte: new Date(fechaInicio),
        $lte: new Date(fechaFin)
      };
    }

    const finanzas = await Finanza.find(query)
      .populate('miembro', 'nombre apellido')
      .populate('registradoPor', 'nombre')
      .sort({ fecha: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Calcular totales
    const totales = await Finanza.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$tipo',
          total: { $sum: '$monto' }
        }
      }
    ]);

    const totalIngresos = totales.find(t => t._id === 'ingreso')?.total || 0;
    const totalEgresos = totales.find(t => t._id === 'egreso')?.total || 0;

    res.status(200).json({
      status: 'success',
      results: finanzas.length,
      data: {
        finanzas,
        resumen: {
          totalIngresos,
          totalEgresos,
          balance: totalIngresos - totalEgresos
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

exports.obtenerFinanza = async (req, res, next) => {
  try {
    const finanza = await Finanza.findById(req.params.id)
      .populate('miembro', 'nombre apellido')
      .populate('registradoPor', 'nombre');

    if (!finanza) {
      return res.status(404).json({
        status: 'fail',
        message: 'Registro no encontrado'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        finanza
      }
    });

  } catch (error) {
    next(error);
  }
};

exports.crearFinanza = async (req, res, next) => {
  try {
    req.body.registradoPor = req.usuario.id;
    
    const finanza = await Finanza.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        finanza
      }
    });

  } catch (error) {
    next(error);
  }
};

exports.actualizarFinanza = async (req, res, next) => {
  try {
    const finanza = await Finanza.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!finanza) {
      return res.status(404).json({
        status: 'fail',
        message: 'Registro no encontrado'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        finanza
      }
    });

  } catch (error) {
    next(error);
  }
};

exports.eliminarFinanza = async (req, res, next) => {
  try {
    await Finanza.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null
    });

  } catch (error) {
    next(error);
  }
};

exports.obtenerReporteMensual = async (req, res, next) => {
  try {
    const { año, mes } = req.query;
    
    const fechaInicio = new Date(año, mes - 1, 1);
    const fechaFin = new Date(año, mes, 0);

    const reporte = await Finanza.aggregate([
      {
        $match: {
          fecha: { $gte: fechaInicio, $lte: fechaFin }
        }
      },
      {
        $group: {
          _id: {
            categoria: '$categoria',
            tipo: '$tipo'
          },
          total: { $sum: '$monto' },
          cantidad: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.tipo': 1, total: -1 }
      }
    ]);

    // Calcular totales generales
    const totales = await Finanza.aggregate([
      {
        $match: {
          fecha: { $gte: fechaInicio, $lte: fechaFin }
        }
      },
      {
        $group: {
          _id: '$tipo',
          total: { $sum: '$monto' }
        }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        periodo: `${mes}/${año}`,
        detalle: reporte,
        totales: {
          ingresos: totales.find(t => t._id === 'ingreso')?.total || 0,
          egresos: totales.find(t => t._id === 'egreso')?.total || 0
        }
      }
    });

  } catch (error) {
    next(error);
  }
};