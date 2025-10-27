import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Attendance = ({ token, fetchWorkers }) => {
    const [attendees, setAttendees] = useState([]);
    const [workers, setWorkers] = useState([]);
    const [selectedWorker, setSelectedWorker] = useState('');

    const fetchAttendees = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/attendees', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAttendees(response.data.data);
        } catch (error) {
            console.error('Failed to fetch attendees', error);
        }
    };

    useEffect(() => {
        const fetchInitialData = async () => {
            await fetchAttendees();
            const response = await axios.get('http://localhost:8000/api/workers', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setWorkers(response.data.data);
        }
        fetchInitialData();
    }, [token]);

    const handleCheckIn = async () => {
        try {
            await axios.post('http://localhost:8000/api/checkin', { worker_id: selectedWorker }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchAttendees();
        } catch (error) {
            console.error('Check-in failed', error);
        }
    };

    const handleCheckOut = async () => {
        try {
            await axios.post('http://localhost:8000/api/checkout', { worker_id: selectedWorker }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchAttendees();
        } catch (error) {
            console.error('Check-out failed', error);
        }
    };

    return (
        <div>
            <h2>Attendance</h2>
            <select onChange={(e) => setSelectedWorker(e.target.value)}>
                <option value="">Select Worker</option>
                {workers.map(worker => (
                    <option key={worker.id} value={worker.id}>{worker.name}</option>
                ))}
            </select>
            <button onClick={handleCheckIn}>Check In</button>
            <button onClick={handleCheckOut}>Check Out</button>

            <ul>
                {attendees.map(attendee => (
                    <li key={attendee.id}>
                        Worker ID: {attendee.worker_id} - Check In: {attendee.check_in} - Check Out: {attendee.check_out}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Attendance;
