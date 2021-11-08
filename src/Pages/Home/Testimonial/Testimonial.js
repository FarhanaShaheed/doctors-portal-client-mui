import React from 'react';
import Typography from '@mui/material/Typography';
import  Box  from '@mui/material/Box';
import { Container } from '@mui/material';


const Testimonial = () => {
    return (
        <div>
          <Container>
          <Box sx={{ width: '100%', maxWidth: 500,m:5,textAlign:'left' }}>
      <Typography variant="h6" sx={{mb:2}} style={{color:'#5CE7ED'}}>
      Testimonial
      </Typography>
      <Typography variant="h4" sx={{mb:2, fontWeight: '500'}} gutterBottom component="div">
        What's Our Patients <br /> Say
      </Typography>
    </Box>
          </Container>
        </div>
    );
};

export default Testimonial;