
import axios from 'axios';
import { useState } from 'react';
import BASE_URL from '../config';
import '../App.css';

function Login() {

    const [data, setData] = useState({
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
                `${BASE_URL}/api/users/login`,
                data,
                {
                    withCredentials: true
                }
            );

            // Store access token in localStorage
            localStorage.setItem(
                "accessToken",
                res.data.accessToken
            );

            setMessage('Login successful!');

            setData({
                email: '',
                password: ''
            });

        }
        catch (error) {
            console.log(error);

            setMessage(
                error.response?.data?.message ||
                'Login failed. Please try again.'
            );
        }
        finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">

            <div className="auth-card">

                <h1>Login</h1>

                <p className="auth-subtitle">
                    Login to access your book management system
                </p>

                <form onSubmit={sendData}>

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
                        />
                    </div>

                    {message && (
                        <p className="auth-message">
                            {message}
                        </p>
                    )}

                    <button type="submit" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>

                </form>

            </div>

        </div>
    );
}

export default Login;
