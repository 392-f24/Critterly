import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Map() {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate('/create_post'); 
    };

    return (
        <div>Map
            <button onClick={handleClick}>
                <i className="fa-solid fa-plus"></i>Create
            </button>
        </div>
    )
}
