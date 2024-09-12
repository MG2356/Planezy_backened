const mongoose=require('mongoose')

const OrderSchema=new mongoose.Schema({
    productImage:String,
    productName:String,
    productMRP:String,
    productPrice:String,
    productType:String,
    productDescription:String,
})
const OrderModel=mongoose.model("OrderDetail",OrderSchema)
module.exports=OrderModel