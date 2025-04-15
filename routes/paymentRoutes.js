const express = require('express');
const { body } = require('express-validator');
const paymentController = require('../controllers/paymentController');
const tokenController = require('../controllers/createToken')

const router = express.Router();

router.post(
  '/',
  [
    body('name').isString().notEmpty().withMessage('El nombre es obligatorio'),
    body('nameId').isString().notEmpty().withMessage('El nameId es obligatorio'),
    body('details').isObject().notEmpty().withMessage('Los detalles son obligatorios'),
    body('credentials.privateKey').isString().notEmpty().withMessage('El privateKey es obligatorio'),
  ],
  paymentController.createPaymentMethod
);
router.get('/', paymentController.getPaymentsByDomain);

router.put(
  '/:id',
  [
    body('name').optional().isString().withMessage('El nombre debe ser un texto válido'),
    body('details').optional().isObject().withMessage('Los detalles deben ser un objeto válido'),
    body('credentials.privateKey')
      .optional()
      .isString()
      .withMessage('El privateKey debe ser un texto válido'),
  ],
  paymentController.updatePaymentMethod
);

router.delete('/:id', paymentController.deletePaymentMethod);
router.get('/:nameId', paymentController.getPaymentByNameId);
router.post('/token/:methodPayment',  tokenController.createToken)

module.exports = router;
