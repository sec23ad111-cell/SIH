import React from 'react';

const WorkerList = ({ workers, setSelectedWorker, deleteWorker }) => {
    return (
        <div>
            <h2>Workers</h2>
            <button onClick={() => setSelectedWorker({})}>Add Worker</button>
            <ul>
                {workers.map(worker => (
                    <li key={worker.id}>
                        {worker.name} ({worker.email})
                        <button onClick={() => setSelectedWorker(worker)}>Edit</button>
                        <button onClick={() => deleteWorker(worker.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default WorkerList;
