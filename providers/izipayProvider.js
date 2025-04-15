const axios = require('axios');
const PaymentMethod = require('../models/paymentMethodModel');
require('dotenv').config();

const { API_URL_IZIPAY_PROD, API_URL_IZIPAY_QA } = process.env;

exports.generateIzipayToken = async (req) => {
    const transactionid = req.headers['transactionid'];
    const domain = req.headers['domain'];
    const orderNumber = req.headers['ordernumber'];
    const amount = req.headers['amount'];

    if (!transactionid || !domain || !orderNumber || !amount) {
        throw new Error('Faltan headers obligatorios: transactionid, domain, orderNumber, amount');
    }

    try {

        const paymentMethod = await PaymentMethod.findOne({
            domain,
            nameId: 'izipay_ya',
            isActive: true
        });

        if (!paymentMethod) {
            throw new Error(`No se encontró el método de pago Izipay activo para el dominio: ${domain}`);
        }

        const { merchantId, publicKey } = paymentMethod.credentials;
        const isDev = paymentMethod.isDev ?? true;
        const urlApi = isDev ? API_URL_IZIPAY_QA : API_URL_IZIPAY_PROD;

        if (!merchantId || !publicKey) {
            throw new Error('Faltan credenciales: merchantId o publicKey no están configurados');
        }

        const headers = {
            transactionid,
            'Content-Type': 'application/json'
        };

        const body = {
            requestSource: 'ECOMMERCE',
            merchantCode: merchantId,
            orderNumber,
            publicKey,
            amount
        };

        const response = await axios.post(
            `${urlApi}/security/v1/Token/Generate`,
            body,
            { headers }
        );

        return response.data;
    } catch (error) {
        console.error('Error al generar el token de Izipay:', error.message || error);
        throw new Error(
            `Error al generar el token: ${error.response ? JSON.stringify(error.response.data) : error.message}`
        );
    }
};
