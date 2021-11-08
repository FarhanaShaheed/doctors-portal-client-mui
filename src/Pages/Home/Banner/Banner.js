import React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import chair from '../../../images/chair.png';
import bg from '../../../images/bg.png';
import { Typography, Button,Container } from '@mui/material';

const bannerBg = {
    background: `url(${bg})`,
    height:450
}
const verticalCenter = {
    display: 'flex',
    height:400,
    alignItems: 'center'
}

const Banner = () => {
    return (
        <Container style={{bannerBg}} sx={{ flexGrow: 1 }}>
        <Grid container spacing={2}>
          <Grid item style={{...verticalCenter,textAlign:'left'}} xs={12} md={5}>
         <Box>
         <Typography variant="h3">
              Your New Smile <br />
              Starts Here
          </Typography>
          <Typography variant="h6" sx={{ my:5,fontSize:13 , fontWeight:300, color:'gray'}}>           
              Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ullam voluptate perferendis libero nihil sint aliquid beatae quis? Nihil, hic fugit.
          </Typography>
          <Button variant="contained" style={{backgroundColor:'#5CE7ED'}}>Get Appointment</Button>
         </Box>
          </Grid>
          <Grid item xs={12} md={7} style={verticalCenter}>
            <img style={{width:'350px'}} src={chair} alt="" />
          </Grid>

        </Grid>
      </Container>
    );
};

export default Banner;