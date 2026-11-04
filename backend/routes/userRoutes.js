const express=require("express")
const router=express.Router()
const {Register,Login,Logout,Refresh}=require("../controller/userController")
router.post("/register",Register)
router.post("/login", Login);
router.post("/logout", Logout);
router.post("/refresh", Refresh);
module.exports=router;