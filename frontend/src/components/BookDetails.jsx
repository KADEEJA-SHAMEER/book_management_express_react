import axios from 'axios';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BASE_URL from '../config';
import '../App.css';

function BookDetails() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchBook = async () => {
        try {
            const token = localStorage.getItem("accessToken");

            const res = await axios.get(
                `${BASE_URL}/api/book/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setBook(res.data);

        } catch (error) {
            console.log(error);

            if (error.response?.status === 401) {
                localStorage.removeItem("accessToken");
                navigate("/login");
            }
        } finally {
            setLoading(false);
        }
    };

   const deleteBook = async () => {

    const confirmDelete = window.confirm(
        "Are you sure you want to delete this book?"
    );

    if (!confirmDelete) {
        return;
    }

    try {
        let token = localStorage.getItem("accessToken");

        try {
            await axios.delete(
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

            await axios.delete(
                `${BASE_URL}/api/book/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
        }

        alert("Book deleted successfully!");
        navigate("/books");

    } catch (error) {
        console.log(error);

        if (error.response?.status === 401) {
            localStorage.removeItem("accessToken");
            navigate("/login");
        } else {
            alert(error.response?.data?.message || "Book deletion failed");
        }
    }
};


    useEffect(() => {
        fetchBook();
    }, [id]);

    if (loading) {
        return <h2>Loading book details...</h2>;
    }

    if (!book) {
        return <h2>Book not found</h2>;
    }

    return (
        <div className="book-details-container">

            <div className="book-details-card">

                <img
                    src={`${BASE_URL}${book.image}`}
                    alt={book.book_name}
                />

                <div className="book-details-info">

                    <h1>{book.book_name}</h1>

                    <h3>Price: ₹{book.book_price}</h3>

                    <p>Available Stock: {book.stock}</p>

                    <button onClick={() => navigate("/books")}>
                        Back to Books
                    </button>

                    <button onClick={() => navigate(`/edit-book/${id}`)}>
                        Update Book
                    </button>

                    <button onClick={deleteBook}>
                        Delete Book
                    </button>

                </div>

            </div>

        </div>
    );
}

export default BookDetails;