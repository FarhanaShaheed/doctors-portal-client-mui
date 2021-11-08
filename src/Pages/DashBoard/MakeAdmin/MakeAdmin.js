import { Email } from '@mui/icons-material';
import { Alert, Button, TextField } from '@mui/material';
import React, { useState } from 'react';
import useAuth from '../../../hooks/useAuth';

const MakeAdmin = () => {
    const[email,setEmail] = useState('');
    const[success,setSuccess] = useState(false);
    const {token} =useAuth();
    const handleOnBlur = e =>{
        setEmail(e.target.value);
    }

    const handleAdminSubmit = e =>{
        const user= {email}
        fetch('https://morning-cliffs-43827.herokuapp.com/users/admin',{
            method: 'PUT',
            headers:{
                'authorization': `Bearer ${token}`,
                'content-type': 'application/json'
            },
            body:JSON.stringify(user)
        })
        .then(res => res.json())
        .then(data => {
            if(data.modifiedCount){
                console.log(data);
                setSuccess(true);
            }
        })
        e.preventDefault()
    }
    return (
        <div>
            <h2>MakeAdmin</h2>
            <form onSubmit={handleAdminSubmit}>
             <TextField
             sx={{width: '50%'}}
             label="Email"
             type="email"
             variant="standard"
             onBlur={handleOnBlur}
             >
             </TextField>
             <Button type="submit" variant="contained">Make Admin</Button>
            </form>
            {success && <Alert severity="success">Made Admin successfully</Alert>}
        </div>
    );
};

export default MakeAdmin;