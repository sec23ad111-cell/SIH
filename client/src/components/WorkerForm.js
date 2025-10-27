import React, { useState, useEffect } from 'react';

const WorkerForm = ({ selectedWorker, saveWorker, setSelectedWorker }) => {
    const [worker, setWorker] = useState({ name: '', email: '', password: '' });

    useEffect(() => {
        if (selectedWorker) {
            setWorker(selectedWorker);
        }
    }, [selectedWorker]);

    const handleChange = (e) => {
        setWorker({ ...worker, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        saveWorker(worker);
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>{worker.id ? 'Edit' : 'Add'} Worker</h2>
            <input
                type="text"
                name="name"
                placeholder="Name"
                value={worker.name || ''}
                onChange={handleChange}
            />
            <input
                type="email"
                name="email"
                placeholder="Email"
                value={worker.email || ''}
                onChange={handleChange}
            />
            <input
                type="password"
                name="password"
                placeholder="Password"
                onChange={handleChange}
            />
            <button type="submit">Save</button>
            <button onClick={() => setSelectedWorker(null)}>Cancel</button>
        </form>
    );
};

export default WorkerForm;
