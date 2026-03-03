const Grupo = require('../models/Grupo');

exports.obtenerGrupos = async (req, res, next) => {
  try {
    const grupos = await Grupo.find({ activo: true })
      .populate('lider', 'nombre apellido telefono')
      .populate('coLider', 'nombre apellido')
      .populate('miembros', 'nombre apellido');

    res.status(200).json({
      status: 'success',
      results: grupos.length,
      data: {
        grupos
      }
    });

  } catch (error) {
    next(error);
  }
};

exports.obtenerGrupo = async (req, res, next) => {
  try {
    const grupo = await Grupo.findById(req.params.id)
      .populate('lider', 'nombre apellido email telefono')
      .populate('coLider', 'nombre apellido')
      .populate('miembros', 'nombre apellido email telefono ministerio');

    if (!grupo) {
      return res.status(404).json({
        status: 'fail',
        message: 'Grupo no encontrado'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        grupo
      }
    });

  } catch (error) {
    next(error);
  }
};

exports.crearGrupo = async (req, res, next) => {
  try {
    const grupo = await Grupo.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        grupo
      }
    });

  } catch (error) {
    next(error);
  }
};

exports.actualizarGrupo = async (req, res, next) => {
  try {
    const grupo = await Grupo.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!grupo) {
      return res.status(404).json({
        status: 'fail',
        message: 'Grupo no encontrado'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        grupo
      }
    });

  } catch (error) {
    next(error);
  }
};

exports.agregarMiembroAGrupo = async (req, res, next) => {
  try {
    const { miembroId } = req.body;
    const grupo = await Grupo.findById(req.params.id);

    if (!grupo) {
      return res.status(404).json({
        status: 'fail',
        message: 'Grupo no encontrado'
      });
    }

    if (grupo.estaLleno) {
      return res.status(400).json({
        status: 'fail',
        message: 'El grupo ha alcanzado su capacidad máxima'
      });
    }

    if (grupo.miembros.includes(miembroId)) {
      return res.status(400).json({
        status: 'fail',
        message: 'El miembro ya está en este grupo'
      });
    }

    grupo.miembros.push(miembroId);
    await grupo.save();

    // Actualizar referencia en miembro
    await Miembro.findByIdAndUpdate(miembroId, { grupoCelula: grupo._id });

    res.status(200).json({
      status: 'success',
      message: 'Miembro agregado al grupo',
      data: {
        grupo
      }
    });

  } catch (error) {
    next(error);
  }
};

exports.eliminarMiembroDeGrupo = async (req, res, next) => {
  try {
    const { miembroId } = req.body;
    const grupo = await Grupo.findById(req.params.id);

    if (!grupo) {
      return res.status(404).json({
        status: 'fail',
        message: 'Grupo no encontrado'
      });
    }

    grupo.miembros = grupo.miembros.filter(m => m.toString() !== miembroId);
    await grupo.save();

    // Remover referencia en miembro
    await Miembro.findByIdAndUpdate(miembroId, { grupoCelula: null });

    res.status(200).json({
      status: 'success',
      message: 'Miembro removido del grupo',
      data: {
        grupo
      }
    });

  } catch (error) {
    next(error);
  }
};

exports.eliminarGrupo = async (req, res, next) => {
  try {
    const grupo = await Grupo.findByIdAndUpdate(
      req.params.id,
      { activo: false },
      { new: true }
    );

    if (!grupo) {
      return res.status(404).json({
        status: 'fail',
        message: 'Grupo no encontrado'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Grupo eliminado correctamente'
    });

  } catch (error) {
    next(error);
  }
};