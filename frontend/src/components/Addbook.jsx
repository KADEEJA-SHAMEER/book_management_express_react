import axios from 'axios';
import { useState } from 'react';
import BASE_URL from '../config';
import '../App.css';
import { useNavigate } from 'react-router-dom';
function AddData() {
   const navigate=useNavigate()
    const token = localStorage.getItem("accessToken");
if (!token) {
    navigate("/login")
}
    const [data, setData] = useState({
        bookname: '',
        bookprice: '',
        image: null,
        stock: ''
    });

    const [loading, setLoading] = useState(false);

    const changedata = (e) => {
        const { name, value, files } = e.target;

        if (name === 'image') {
            setData({ ...data, image: files[0] });
        }
        else {
            setData({ ...data, [name]: value });
        }
    };

    const sendData = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            const formData = new FormData();

            formData.append('bookname', data.bookname);
            formData.append('bookprice', data.bookprice);
            formData.append('stock', data.stock);
            formData.append('image', data.image);
           
            const res = await axios.post(`${BASE_URL}/api/book/`,formData ,{
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
           
            setData({
                bookname: '',
                bookprice: '',
                image: null,
                stock: ''
            });

            e.target.reset();

        }
        catch (error) {
           if (error.response?.status === 401) {
        localStorage.removeItem("accessToken");
       navigate("/login")
    } else {
        alert(error.response?.data?.message || 'Failed to add book');
    }
    }finally{
        setLoading(false);
    };
    }
    return (
        <div className="book-container">

            <div className="book-form-card">

                <h1>Add New Book</h1>
                <p className="form-subtitle">
                    Enter the details of your new book
                </p>

                <form onSubmit={sendData}>

                    <div className="form-group">
                        <label>Book Name</label>
                        <input
                            type="text"
                            placeholder="Enter book name"
                            name="bookname"
                            value={data.bookname}
                            onChange={changedata}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Book Price</label>
                        <input
                            type="number"
                            placeholder="Enter book price"
                            name="bookprice"
                            value={data.bookprice}
                            onChange={changedata}
                            min="0"
                            required
                        />
                    </div>

                    

                    <div className="form-group">
                        <label>Available Stock</label>
                        <input
                            type="number"
                            placeholder="Enter stock quantity"
                            name="stock"
                            value={data.stock}
                            onChange={changedata}
                            min="0"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Book Cover Image</label>
                        <input
                            type="file"
                            name="image"
                            accept="image/*"
                            onChange={changedata}
                            required
                        />
                    </div>

                    <button type="submit" disabled={loading}>
                        {loading ? 'Adding Book...' : 'Add Book'}
                    </button>

                </form>

            </div>

        </div>
    );
}

export default AddData;