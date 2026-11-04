const mongoose=require("mongoose")

const Bookschema=mongoose.Schema({
    book_name:String,
    book_price:String,
    stock:Number,
    image:{
        type:String,
        default:null
    }
})

module.exports=mongoose.model("Book",Bookschema)