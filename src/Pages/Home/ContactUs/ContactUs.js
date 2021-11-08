import React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { Container, Typography } from '@mui/material';
import bg from '../../../images/appointment-bg.png';


const contactBackground = {
    background: `url(${bg})`,
    backgroundColor: 'rgba(45,58,74, .85)' ,
    backgroundBlendMode:'darken,luminosity',
   width:'700px',
   height:'500px',
   marginLeft: '200px'
}

const ContactUs = () => {
    return (
        <Container>
            <Box style={contactBackground} sx={{ flexGrow: 1}}>
             <Typography variant="h6" sx={{mb:2}} style={{color:'#5CE7ED'}}>
         CONTACT US
      </Typography>
      <Typography variant="h4" sx={{mb:2, fontWeight: '500',color:'white'}} gutterBottom component="div">
        Always Connect With Us
      </Typography>
          <form>
        <TextField
          sx={{width:'70%',backgroundColor:"white", m:1}}
          id="outlined-size-small"
          defaultValue="Email Address"
          size="small"
        />
        <TextField
          sx={{width:'70%',backgroundColor:"white",m:1}}
          id="outlined-size-small"
          defaultValue="Subject"
          size="small"
        />
        <TextField
          sx={{width:'70%',backgroundColor:"white", m:1}}
          id="outlined-multiline-static"
          multiline
          rows={4}
          defaultValue="Your Message"
        />
      </form>
      </Box>
        </Container>
    );
};

export default ContactUs;