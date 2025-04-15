require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// 📌 Conexión a MongoDB con manejo de errores mejorado
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('🟢 Conectado a MongoDB'))
  .catch(err => {
    console.error('🔴 Error en conexión a MongoDB:', err.message);
    process.exit(1); // 🔴 Detiene la app si la BD no se conecta
  });

// 📌 Rutas de pagos
app.use('/api/payments', paymentRoutes);

// 📌 Middleware de manejo de errores detallado
app.use((err, req, res, next) => {
  console.error('⚠️ Error en servidor:', err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Error interno del servidor',
      details: err.stack, // 📌 Muestra el stack trace en desarrollo
    },
  });
});

const PORT = process.env.PORT || 5100;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`));
