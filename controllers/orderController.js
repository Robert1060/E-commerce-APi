const Product = require('../models/Product')
const Order = require('../models/Order')

const stripe = require('stripe')(process.env.STRIPE_KEY)

const {StatusCodes} = require('http-status-codes')
const CustomError = require('../errors')

const {checkPermissions} = require('../utils')

const StripeAPI = async ({amount,currency})=> {
    return {client_secret,amount}
}

const createOrder = async (req,res)=>{
   const {items:cartItems,tax,shippingFee} = req.body
    if(!cartItems || cartItems.length < 1){
        throw new CustomError.BadRequestError('No items in cart')
    }else if(!tax || !shippingFee){
        throw new CustomError.BadRequestError('Please provide tax and shipping fee')
    }
    
    let orderItems = []
    let subtotal = 0
    for(const item of cartItems){
        const dbProduct = await Product.findOne({_id:item.product})
        if(!dbProduct){
            throw new CustomError.NotFoundError(`No item found with id: ${item.product}`)
        }
        const {name,price,image,_id} = dbProduct
        const singleOrderItem = {
        amount:item.amount,
        name,
        price,
        image,
        product:_id,
        } 
        // add item to cart
        orderItems = [...orderItems,singleOrderItem]
        // count cart value
        subtotal += price * item.amount
    }
    // calculate total
    const total = tax + shippingFee + subtotal
    //get client secret
    const paymentIntent = await stripe.paymentIntents.create({
        amount:total,
        currency:'pln'
    })

    const order = await Order.create({
        orderItems,
        total,
        subtotal,
        tax,
        shippingFee,
        clientSecret:paymentIntent.client_secret,
        user:req.user.userId
    })
  res.status(StatusCodes.CREATED).json({ order,clientSecret:order.clientSecret })
}

const getAllOrders = async (req,res) => {
    const orders = await Order.find({})
    res.status(StatusCodes.OK).json({ orders, count:orders.length })
}

const getSingleOrder = async (req,res) => {
    const {id:orderId} = req.params
    const order = await Order.findOne({_id:orderId})
    if(!order){
        throw new CustomError.NotFoundError(`No order found with id: ${orderId}`)
    }
    checkPermissions(req.user,order.user)
    res.status(StatusCodes.OK).json({ order })
}

const updateOrder = async (req,res) => {
    const {id:orderId} = req.params
    const {paymentIntentId} = req.body
    const order = await Order.findOne({_id:orderId})
    if(!order){
        throw new CustomError.NotFoundError(`No order found with id: ${orderId}`)
    }
    checkPermissions(req.user,order.user)
    order.paymentIntentId = paymentIntentId
    order.status='paid'
    await order.save()
    res.status(StatusCodes.OK).json({ order })
}

const getCurrentUserOrders = async (req,res) => {
    const user = req.user.userId
    const orders = await Order.find({user})
    res.status(StatusCodes.OK).json({ orders , count:orders.length})
}


module.exports = {
    createOrder,getAllOrders,getSingleOrder,updateOrder,getCurrentUserOrders
}