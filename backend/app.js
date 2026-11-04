const express= require("express")
const app=express()
require("dotenv").config()
const port = process.env.PORT
const connectdb=require("./config")
const errorHandler =require("./middleware/errorhandler")
const cors=require("cors")
const cookieParser = require("cookie-parser");


app.use(cors({
    origin:"http://localhost:5173",
     credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/uploads",express.static("uploads"))

app.use("/api/book",require("./routes/bookRoutes"))
app.use("/api/users",require("./routes/userRoutes"))
app.use(errorHandler)

connectdb();

app.listen(port,()=>{
    console.log(`server listening at  http://localhost:${port}`)
})