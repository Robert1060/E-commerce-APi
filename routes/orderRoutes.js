const express = require('express')
const router = express.Router()
const {authenticateUser,authorizedPermission} = require('../middleware/authentication')


const {
createOrder,
getAllOrders,
getSingleOrder,
updateOrder,
getCurrentUserOrders
} = require('../controllers/orderController')

router.route('/').post(authenticateUser,createOrder).get(authenticateUser,authorizedPermission('admin'),getAllOrders)

router.route('/showAllMyOrders').get(authenticateUser,getCurrentUserOrders)

router.route('/:id').get(authenticateUser,getSingleOrder).patch(authenticateUser,updateOrder)

module.exports = router