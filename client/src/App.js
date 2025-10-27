import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Login from './components/Login';
import WorkerList from './components/WorkerList';
import WorkerForm from './components/WorkerForm';
import Attendance from './components/Attendance';
import './App.css';

function App() {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [workers, setWorkers] = useState([]);
    const [selectedWorker, setSelectedWorker] = useState(null);
    const [error, setError] = useState(null);

    const fetchWorkers = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/workers', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setWorkers(response.data.data);
        } catch (error) {
            setError('Failed to fetch workers');
        }
    };

    useEffect(() => {
        if (token) {
            fetchWorkers();
        }
    }, [token]);

    const saveWorker = async (worker) => {
        try {
            if (worker.id) {
                await axios.put(`http://localhost:8000/api/workers/${worker.id}`, worker, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post('http://localhost:8000/api/workers', worker, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            setSelectedWorker(null);
            fetchWorkers();
        } catch (error) {
            setError('Failed to save worker');
        }
    };

    const deleteWorker = async (id) => {
        try {
            await axios.delete(`http://localhost:8000/api/workers/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchWorkers();
        } catch (error) {
            setError('Failed to delete worker');
        }
    };

    const handleLogin = (token) => {
        localStorage.setItem('token', token);
        setToken(token);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setToken(null);
    };

    if (!token) {
        return <Login setToken={handleLogin} setError={setError} />;
    }

    return (
        <div className="App">
            <h1>Factory Worker Management</h1>
            <button onClick={handleLogout}>Logout</button>
            {error && <p className="error">{error}</p>}
            <WorkerList workers={workers} setSelectedWorker={setSelectedWorker} deleteWorker={deleteWorker} />
            {selectedWorker && <WorkerForm selectedWorker={selectedWorker} saveWorker={saveWorker} setSelectedWorker={setSelectedWorker} />}
            <Attendance token={token} fetchWorkers={fetchWorkers} />
        </div>
    );
}

export default App;
