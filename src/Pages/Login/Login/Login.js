import { Button, CircularProgress, Container, Grid, TextField, Typography, Alert } from '@mui/material';
import React, { useState } from 'react';
import { NavLink, useHistory,useLocation } from 'react-router-dom';
import login from '../../../images/login.png';
import useAuth from './../../../hooks/useAuth';

const Login = () => {
    const [loginData, setLoginData] = useState({});
    const {user,loginUser,isLoading,signInWithGoogle ,authError} = useAuth();

    const location = useLocation();
    const history = useHistory();

const handleOnChange = e =>{
        const field = e.target.name;
        const value = e.target.value;
        const newLoginData = {...loginData};
        newLoginData[field] = value;
        setLoginData(newLoginData);
    }

    const handleLoginSubmit = e =>{
       loginUser(loginData.email, loginData.password,location, history);
        e.preventDefault();
    }

    const handleGoogleSignIn = e =>{
        signInWithGoogle(location,history)
    }
    return (
        <Container>
        <Grid container spacing={2}>
            <Grid item sx={{ mt: 8 }} xs={12} md={6}>
               <Typography variant="body1" gutterBottom>Login</Typography>
               <form onSubmit={handleLoginSubmit}>
                   <TextField 
                   sx={{width:'75%',m:1}}
                   id="standard-basic" label="Your Email" 
                   name="email"
                   onBlur={handleOnChange}
                   variant="standard">
                   </TextField>
                   <TextField 
                   sx={{width:'75%',m:1}}
                   id="standard-basic" label="Your Password" 
                   name="password"
                   onBlur={handleOnChange}
                   type="password"
                   variant="standard">
                   </TextField>
                   
                   <Button variant="contained" sx={{width:'75%',m:1}} type="submit">Login</Button>

                   <NavLink
                   style={{textDecoration:'none'}}
                   to="/register">
                      <Button variant="text">New User? Please Register</Button>
                   </NavLink>
                   {isLoading && <CircularProgress></CircularProgress>
               }
               {user?.email && <Alert severity="success">Login successfully</Alert>}
               {authError && <Alert severity="error">{authError}</Alert>}
               </form>
               <p>---------------------</p>
               <Button onClick={handleGoogleSignIn} variant="contained">Google Sign In</Button>
               
            </Grid>
            <Grid item xs={12} md={6}>
                <img style={{width:'100%'}} src={login} alt="" />
            </Grid>
            </Grid>
        </Container>
    );
};

export default Login;