const express = require('express')
const router = express.Router()
const {authenticateUser, authorizedPermission} = require('../middleware/authentication')

const {
    createProduct,
    getAllProducts,
    getSingleProduct,
    updateProduct,
    deleteProduct,
    uploadImage,
} = require('../controllers/productController')

const {getSingleProductReviews} = require('../controllers/reviewController')

router.route('/').post(authenticateUser,authorizedPermission('admin'),createProduct).get(getAllProducts)
router.route('/uploadImage').post(authenticateUser,authorizedPermission('admin'),uploadImage)

router.route('/:id').get(getSingleProduct)
.patch(authenticateUser,authorizedPermission('admin'),updateProduct)
.delete(authenticateUser,authorizedPermission('admin'),deleteProduct)


router.route('/:id/reviews').get(getSingleProductReviews)

module.exports = router