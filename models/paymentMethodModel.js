const mongoose = require('mongoose');
const { encryptAES } = require('../utils/encryption');

const PaymentMethodSchema = new mongoose.Schema(
    {
        domain: { type: String, required: true },
        name: { type: String, required: true },
        nameId: { type: String, required: true },
        details: { type: Object, required: true },
        isActive: { type: Boolean, default: false },
        customField: { type: Object },
        credentials: {
            publicKey: { type: String },
            privateKey: { type: String, select: false }, // 🔐 Ahora encriptado con AES
            clientId: { type: String },
            secretKey: { type: String },
            merchantId: { type: String }
        }
    },
    { timestamps: true }
);

// 🔐 Encriptar privateKey antes de guardar
PaymentMethodSchema.pre('save', async function (next) {
    if (this.isModified('credentials.privateKey') && this.credentials.privateKey) {
        this.credentials.privateKey = encryptAES(this.credentials.privateKey);
    }
    next();
});

module.exports = mongoose.model('Payment_Method', PaymentMethodSchema);
