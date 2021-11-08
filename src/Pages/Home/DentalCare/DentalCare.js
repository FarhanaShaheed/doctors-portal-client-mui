import React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import treatment from '../../../images/treatment.png';
import { Button, Container, Typography } from '@mui/material';

const DentalCare = () => {
    return (
        <Container sx={{ flexGrow: 1, m:5 }}>
      <Grid container spacing={2}>
    <Grid item xs={12 } md={6}>
            <img style={{width:'300px'}} src={treatment} alt="" />
        </Grid>
        <Grid item xs={12} md={6} style={{textAlign:'left'}}>
         <Typography variant="h4">
             Exceptional Dental <br /> Care,on Your Terms
         </Typography>
         <Typography variant="caption" display="block" color="text.secondary">
         Lorem ipsum dolor sit amet consectetur, adipisicing elit. Quasi consequuntur libero voluptatibus asperiores ea doloremque accusamus inventore ipsam rem. Repudiandae reiciendis, qui beatae harum est aut sunt commodi at dolorum sequi, quis, delectus quas doloremque molestiae aperiam repellendus praesentium excepturi.
        </Typography>
        <Button variant="contained" style={{backgroundColor:'#5CE7ED'}}>Learn More</Button>
        </Grid>
      </Grid>
      </Container>
    );
};

export default DentalCare;