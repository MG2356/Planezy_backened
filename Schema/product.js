const mongoose=require('mongoose')

const ProductSchema=new mongoose.Schema({
    productImage:String,
    productName:String,
    productType:String,
    productDescription:String,
})
const ProductModel=mongoose.model("ProductDetail",ProductSchema)
module.exports=ProductModel