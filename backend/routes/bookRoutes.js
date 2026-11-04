const express=require("express")
const router=express.Router()
const {GetBooks,AddBook,getOneBook,UpdateBook,DeleteBook}=require("../controller/BookController.js")
const bookMulter=require("../middleware/bookMulter.js")
const validate=require("../middleware/validateToken.js")
router.use(validate);
router.route("/").get(GetBooks).post(bookMulter.single("image"),AddBook);
router.route("/:id").get(getOneBook).put(bookMulter.single("image"),UpdateBook).delete(DeleteBook)

module.exports=router;
