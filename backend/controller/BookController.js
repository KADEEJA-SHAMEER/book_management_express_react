const Book =require("../model/BookModel")

const AddBook=async (req,res)=>{
    const {bookname,bookprice,stock}=req.body
    const image=`/uploads/book/${req.file.filename}`;
    if(!bookname || !bookprice || !stock || !req.file )
    {
        const error=new Error("all fileds are required")
        error.statusCode=400;
        throw error;
    }
    const data=await Book.create({book_name:bookname,book_price:bookprice,image:image,stock:stock})
    res.status(201).json(data)
}

const GetBooks = async (req, res) => {
    const data = await Book.find();
    res.status(200).json(data);
};

const getOneBook = async (req, res) => {

    const id = req.params.id;

    const data = await Book.findById(id);

    if (!data) {
        const error = new Error("Book not found");
        error.statusCode = 404;
        throw error;
    }

    res.status(200).json(data);
};

const UpdateBook = async (req, res) => {

    const id = req.params.id;
    const { bookname, bookprice, stock } = req.body;

    const book = await Book.findById(id);

    if (!book) {
        const error = new Error("Book not found");
        error.statusCode = 404;
        throw error;
    }

    book.book_name = bookname;
    book.book_price = bookprice;
    book.stock = stock;

  
    if (req.file) {
        book.image = `/uploads/book/${req.file.filename}`;
    }

    const updatedBook = await book.save();

    res.status(200).json({
        message: "Book updated successfully",
        data: updatedBook
    });
};
const DeleteBook = async (req, res) => {

    const id = req.params.id;

    const book = await Book.findById(id);

    if (!book) {
        const error = new Error("Book not found");
        error.statusCode = 404;
        throw error;
    }

    await Book.findByIdAndDelete(id);

    res.status(200).json({
        message: "Book deleted successfully"
    });
};

module.exports={AddBook,getOneBook,GetBooks,UpdateBook,DeleteBook}