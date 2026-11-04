
import axios from 'axios';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BASE_URL from '../config';
import '../App.css';

function ViewBooks() {

    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    const fetchBooks = async () => {
    try {
        let token = localStorage.getItem("accessToken");

        let res;

        try {
            
            res = await axios.get(
                `${BASE_URL}/api/book/`,
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
                `${BASE_URL}/api/book/`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
        }

        setBooks(res.data);

    } catch (error) {
        console.log(error);

        localStorage.removeItem("accessToken");
        navigate("/login");

    } finally {
        setLoading(false);
    }
};

    useEffect(() => {
        fetchBooks();
    }, []);

    if (loading) {
        return <h2>Loading books...</h2>;
    }

    const logout = async () => {

        try {
            // Request backend logout
            await axios.post(
                `${BASE_URL}/api/users/logout`,
                {},
                {
                    withCredentials: true
                }
            );

        } catch (error) {
            console.log(error);

        } finally {

            // Remove access token
            localStorage.removeItem("accessToken");

            // Redirect to login
            navigate("/login");
        }
    };

   

    return (
        <div className="book-container">

            <h1>Available Books</h1>

            <div className="book-grid">

                {books.length === 0 ? (
                    <p>No books available.</p>
                ) : (

                    books.map((book) => (

                        <div className="book-card" key={book._id}>

                            <img
                                src={`${BASE_URL}${book.image}`}
                                alt={book.book_name}
                            />

                            <h3>{book.book_name}</h3>

                            <p>Price: ₹{book.book_price}</p>

                            <p>Stock: {book.stock}</p>

                            <button
                                onClick={() => navigate(`/book/${book._id}`)}
                            >
                                View Details
                            </button>

                        </div>

                    ))

                )}

            </div>

            <div>
            <button onClick={logout}>
                Logout
            </button>
        </div>

        </div>
    );
}

export default ViewBooks;