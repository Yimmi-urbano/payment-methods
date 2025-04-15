const { generateIzipayToken } = require('../providers/izipayProvider');
// const { generateCulqiToken } = require('./providers/culqiProvider');

const tokenProviders = {
  izipay: generateIzipayToken,
  // culqi: generateCulqiToken,
  // niubiz: generateNiubizToken,
};

exports.createToken = async (req, res) => {
  const { methodPayment } = req.params;
  const providerKey = methodPayment.toLowerCase();
  const generateToken = tokenProviders[providerKey];

  if (!generateToken) {
    return res.status(400).json({ error: `Método de pago '${methodPayment}' no soportado` });
  }

  try {
    
    const tokenResponse = await generateToken(req);
    res.status(200).json(tokenResponse);

  } catch (err) {
    console.error(`Error al generar token con ${methodPayment}:`, err.message);
    res.status(500).json({
      error: `Error al generar token con ${methodPayment}`,
      details: err.response?.data || err.message,
    });
  }
};
