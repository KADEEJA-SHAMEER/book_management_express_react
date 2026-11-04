import axios from 'axios';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BASE_URL from '../config';
import '../App.css';

function UpdateBook() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [data, setData] = useState({
        bookname: '',
        bookprice: '',
        stock: '',
        image: null
    });

    const [loading, setLoading] = useState(true);

    // Fetch existing book details
    const fetchBook = async () => {
        try {
            let token = localStorage.getItem("accessToken");
            let res;

            try {
                res = await axios.get(
                    `${BASE_URL}/api/book/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

            } catch (error) {

                if (error.response?.status !== 401) {
                    throw error;
                }

                const refreshRes = await axios.post(
                    `${BASE_URL}/api/users/refresh`,
                    {},
                    { withCredentials: true }
                );

                token = refreshRes.data.accessToken;
                localStorage.setItem("accessToken", token);

                res = await axios.get(
                    `${BASE_URL}/api/book/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
            }

            setData({
                bookname: res.data.book_name,
                bookprice: res.data.book_price,
                stock: res.data.stock,
                image: null
            });

        } catch (error) {
            console.log(error);

            if (error.response?.status === 401) {
                localStorage.removeItem("accessToken");
                navigate("/login");
            } else {
                alert("Unable to fetch book details");
            }

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBook();
    }, [id]);

    const changedata = (e) => {
        const { name, value, files } = e.target;

        if (name === "image") {
            setData({ ...data, image: files[0] });
        } else {
            setData({ ...data, [name]: value });
        }
    };

    // Update book
    const sendData = async (e) => {
        e.preventDefault();

        try {
            let token = localStorage.getItem("accessToken");

            const formData = new FormData();

            formData.append("bookname", data.bookname);
            formData.append("bookprice", data.bookprice);
            formData.append("stock", data.stock);

            if (data.image) {
                formData.append("image", data.image);
            }

            try {
                await axios.put(
                    `${BASE_URL}/api/book/${id}`,
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

            } catch (error) {

                if (error.response?.status !== 401) {
                    throw error;
                }

                const refreshRes = await axios.post(
                    `${BASE_URL}/api/users/refresh`,
                    {},
                    { withCredentials: true }
                );

                token = refreshRes.data.accessToken;
                localStorage.setItem("accessToken", token);

                await axios.put(
                    `${BASE_URL}/api/book/${id}`,
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
            }

            alert("Book updated successfully!");
            navigate(`/book/${id}`);

        } catch (error) {
            console.log(error);

            if (error.response?.status === 401) {
                localStorage.removeItem("accessToken");
                navigate("/login");
            } else {
                alert(error.response?.data?.message || "Book update failed");
            }
        }
    };

    if (loading) {
        return <h2>Loading...</h2>;
    }

    return (
        <div className="auth-container">
            <div className="auth-card">

                <h2>Update Book</h2>

                <form onSubmit={sendData}>

                    <div className="auth-form-group">
                        <label>Book Name</label>
                        <input
                            type="text"
                            name="bookname"
                            value={data.bookname}
                            onChange={changedata}
                            required
                        />
                    </div>

                    <div className="auth-form-group">
                        <label>Book Price</label>
                        <input
                            type="number"
                            name="bookprice"
                            value={data.bookprice}
                            onChange={changedata}
                            required
                        />
                    </div>

                    <div className="auth-form-group">
                        <label>Stock</label>
                        <input
                            type="number"
                            name="stock"
                            value={data.stock}
                            onChange={changedata}
                            required
                        />
                    </div>

                    <div className="auth-form-group">
                        <label>Change Image (Optional)</label>
                        <input
                            type="file"
                            name="image"
                            accept="image/*"
                            onChange={changedata}
                        />
                    </div>

                    <button type="submit">
                        Update Book
                    </button>

                </form>
            </div>
        </div>
    );
}

export default UpdateBook;