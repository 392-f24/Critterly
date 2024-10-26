import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Map() {
    const navigate = useNavigate();
    const Create_Post = () => {
        navigate('/create_post'); 
    };
    const View_Post = () => {
        navigate('/view_post'); 
    };

    return (
        <div>Map
            <button onClick={Create_Post}>
                <i className="fa-solid fa-plus"></i>Create
            </button>
            <button onClick={View_Post}>
                View Post X
            </button>
        </div>
    )
}
