const asyncHandler = require("express-async-handler");
const Order = require("../data/models/orderModel");

//@desc Create new order
//@route POST /api/orders
//@access Private
//@api http://localhost:5000/api/orders
const addOrderItems = asyncHandler(async (req,res) =>{
    const {
        orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice
    } = req.body;

    if(orderItems && orderItems.length === 0){
        res.status(400);
        throw new Error('No order items');
    } else {
        const order = new Order({
            orderItems: orderItems.map((x) =>({
                ...x,
                product: x._id,
                _id: undefined
            })),
            user: req.user._id,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice
        });
        const createOrder = await order.save();
        res.status(200).json(createOrder);
    }
});


//@desc Get logged in user orders
//@route GET /api/orders/myorders
//@access Private
//@api http://localhost:5000/api/orders/mine
const getMyOrders = asyncHandler(async (req,res) =>{
    const orders = await Order.find({user: req.user._id});
    res.status(200).json(orders);
});


//@desc Get order by ID
//@route GET /api/orders/:id
//@access Private
//@api http://localhost:5000/api/orders/9
const getOrderById = asyncHandler(async (req,res) =>{
    const order = await Order.findById(req.params.id).populate('user',
    'name email');
    if(order){
        res.status(200).json(order);
    } else {
        res.status(404);
        throw new Error('order not found');
    }
});


//@desc Update order to paid
//@route PUT /api/orders/:id/pay
//@access Private
//@api http://localhost:5000/api/orders/5/pay
const updateOrderToPaid = asyncHandler(async (req,res) =>{
   const order = await Order.findById(req.params.id);
   if(order){
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
        id: req.body.id,
        status: req.body.status,
        update_time: req.body.update_time,
        email_address: req.body.payer.email_address //this will come from paypal
    };
    const updateOrder = await order.save();
    res.status(200).json(updateOrder);
   } else {
    res.status(404);
    throw new Error('Order not found');
   }
});


//@desc Update order to delivered
//@route PUT /api/orders/:id/deliver
//@access Private/Admin
//@api http://localhost:5000/api/orders/5/deliver
const updateOrderToDelivered = asyncHandler(async (req,res) =>{
    const order = await Order.findById(req.params.id);
    if(order){
        order.isDelivered = true;
        order.deliveredAt = Date.now();

        const updateOrder = await order.save();
        res.status(200).json(updateOrder);
    }
    else{
       res.status(404);
       throw new Error('Order not found');
    }l
});


//@desc Get all orders
//@route GET /api/orders
//@access Private/Admin
//@api http://localhost:5000/api/orders/mine
const getOrders = asyncHandler(async (req,res) =>{
   const orders = await Order.find({}).populate('user', 'id name');
   res.status(200).json(orders);
});

module.exports = {
 addOrderItems,
 getMyOrders,
 getOrderById,
 updateOrderToPaid,
 updateOrderToDelivered,
 getOrders   
}