const { validationResult } = require('express-validator');
const PaymentMethod = require('../models/paymentMethodModel');
const { encryptAES, decryptAES } = require('../utils/encryption');

const getDomainFromHeader = (req) => req.headers.domain || null;

exports.createPaymentMethod = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const domain = getDomainFromHeader(req);
    if (!domain) {
        return res.status(400).json({ error: 'El dominio es obligatorio en el header' });
    }

    try {
        const { nameId } = req.body;

        const existingPayment = await PaymentMethod.findOne({ domain, nameId });
        if (existingPayment) {
            return res.status(400).json({ error: 'El nameId ya está registrado en este dominio' });
        }

        const newPayment = new PaymentMethod({ ...req.body, domain });
        await newPayment.save();

        res.status(201).json({ message: 'Método de pago registrado correctamente' });

    } catch (err) {
        res.status(500).json({ error: 'Error al guardar el método de pago', details: err.message });
    }
};

exports.getPaymentsByDomain = async (req, res) => {
    const domain = getDomainFromHeader(req);
    if (!domain) {
        return res.status(400).json({ error: 'El dominio es obligatorio en el header' });
    }

    try {
        const payments = await PaymentMethod.find({ domain }).select('+credentials.privateKey').lean();

        const decryptedPayments = payments.map(payment => {
            if (payment.credentials?.privateKey) {
                payment.credentials.privateKey = decryptAES(payment.credentials.privateKey);
            }
            return payment;
        });

        res.json(decryptedPayments);

    } catch (err) {
        res.status(500).json({ error: 'Error en la consulta', details: err.message });
    }
};

exports.getPaymentByNameId = async (req, res) => {
    const domain = getDomainFromHeader(req);
    if (!domain) {
        return res.status(400).json({ error: 'El dominio es obligatorio en el header' });
    }

    const { nameId } = req.params;


    try {
        const payment = await PaymentMethod.findOne({ domain, nameId }).select('+credentials.privateKey').lean();
        if (!payment) {
            return res.status(404).json({ error: 'Método de pago no encontrado' });
        }

        if (payment.credentials?.privateKey) {
            payment.credentials.privateKey = decryptAES(payment.credentials.privateKey);
        }

        res.json(payment);

    } catch (err) {
        res.status(500).json({ error: 'Error en la consulta', details: err.message });
    }
};

exports.updatePaymentMethod = async (req, res) => {
    const { id } = req.params;
    const domain = getDomainFromHeader(req);
    if (!domain) return res.status(400).json({ error: 'El dominio es obligatorio en el header' });

    try {
        const payment = await PaymentMethod.findOne({ nameId: id, domain }).select('+credentials.privateKey');
        if (!payment) return res.status(404).json({ error: 'Método de pago no encontrado o no pertenece al dominio' });

        if (req.body.nameId && req.body.nameId !== payment.nameId) {
            return res.status(400).json({ error: 'No se permite cambiar el nameId' });
        }

        if (req.body.credentials?.privateKey) {
            req.body.credentials.privateKey = encryptAES(req.body.credentials.privateKey);
        }

        const updatedPayment = await PaymentMethod.findOneAndUpdate(
            { nameId: id, domain },
            { $set: req.body },
            { new: true }
        );

        res.json({ message: 'Método de pago actualizado correctamente', payment: updatedPayment });

    } catch (err) {
        res.status(500).json({ error: 'Error al actualizar el método de pago', details: err.message });
    }
};

exports.deletePaymentMethod = async (req, res) => {
    const { id } = req.params;
    const domain = getDomainFromHeader(req);
    if (!domain) {
        return res.status(400).json({ error: 'El dominio es obligatorio en el header' });
    }

    try {
        const deletedPayment = await PaymentMethod.findOneAndDelete({ _id: id, domain });
        if (!deletedPayment) {
            return res.status(404).json({ error: 'Método de pago no encontrado o no pertenece al dominio' });
        }

        res.json({ message: 'Método de pago eliminado correctamente' });

    } catch (err) {
        res.status(500).json({ error: 'Error al eliminar el método de pago', details: err.message });
    }
};
