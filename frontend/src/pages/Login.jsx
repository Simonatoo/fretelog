import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import axios from '../services/api'; // This is actually the axios instance, maybe I should use it or just direct axios for login if needed, but google gives token directly.

const Login = () => {
    const navigate = useNavigate();

    const handleSuccess = (credentialResponse) => {
        localStorage.setItem('google_token', credentialResponse.credential);
        navigate('/');
    };

    const handleError = () => {
        console.log('Login Failed');
    };

    return (
        <div className="flex h-screen items-center justify-center bg-gray-100">
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg text-center">
                <h1 className="text-2xl font-bold mb-6 text-gray-800">Frelog Login</h1>
                <div className="flex justify-center">
                    <GoogleLogin
                        onSuccess={handleSuccess}
                        onError={handleError}
                    />
                </div>
            </div>
        </div>
    );
};

export default Login;
