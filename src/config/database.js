const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Estas opciones ya no son necesarias en Mongoose 6+, pero las dejo por compatibilidad
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });

    console.log(`📦 MongoDB Conectado: ${conn.connection.host}`);

    // Manejar eventos de conexión
    mongoose.connection.on('error', (err) => {
      console.error('Error de conexión MongoDB:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB desconectado');
    });

  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;