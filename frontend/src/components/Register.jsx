import axios from 'axios';
import { useState } from 'react';
import BASE_URL from '../config';
import '../App.css';
import { useNavigate } from 'react-router-dom';

function Register() {
    const navigate=useNavigate()
    const [data, setData] = useState({
        username: '',
        email: '',
        password: ''
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const changedata = (e) => {
        const { name, value } = e.target;

        setData({
            ...data,
            [name]: value
        });
    };

    const sendData = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            setMessage('');

            const res = await axios.post(
                `${BASE_URL}/api/users/register`,
                data
            );

            console.log(res.data);

            setMessage('Registration successful!');

            setData({
                username: '',
                email: '',
                password: ''
            });
           navigate("/login")
        }
        catch (error) {
            console.log(error);

            setMessage(
                error.response?.data?.message ||
                'Registration failed. Please try again.'
            );
        }
        finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">

            <div className="auth-card">

                <h1>Create Account</h1>

                <p className="auth-subtitle">
                    Register to access your book management system
                </p>

                <form onSubmit={sendData}>

                    <div className="auth-form-group">
                        <label>Username</label>

                        <input
                            type="text"
                            name="username"
                            placeholder="Enter username"
                            value={data.username}
                            onChange={changedata}
                            required
                        />
                    </div>

                    <div className="auth-form-group">
                        <label>Email</label>

                        <input
                            type="email"
                            name="email"
                            placeholder="Enter email address"
                            value={data.email}
                            onChange={changedata}
                            required
                        />
                    </div>

                    <div className="auth-form-group">
                        <label>Password</label>

                        <input
                            type="password"
                            name="password"
                            placeholder="Enter password"
                            value={data.password}
                            onChange={changedata}
                            required
                            minLength="6"
                        />
                    </div>

                    {message && (
                        <p className="auth-message">
                            {message}
                        </p>
                    )}

                    <button type="submit" disabled={loading}>
                        {loading ? 'Registering...' : 'Register'}
                    </button>

                </form>

            </div>

        </div>
    );
}

export default Register;