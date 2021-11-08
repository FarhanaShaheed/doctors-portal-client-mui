import React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Service from './../Service/Service';
import fluoride from '../../../images/fluoride.png'
import cavity from '../../../images/cavity.png'
import whitening from '../../../images/whitening.png'
import { Container } from '@mui/material';

const services = [
    {
    name: 'Fluoride Treatment',
    description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Totam magnam dolore qui iste, repellat asperiores adipisci quidem dolorum veniam nobis debitis. Corporis suscipit libero at, assumenda nostrum officiis a ipsum!',
    img: fluoride
    },
    {
    name: 'Cavity Fillig',
    description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Totam magnam dolore qui iste, repellat asperiores adipisci quidem dolorum veniam nobis debitis. Corporis suscipit libero at, assumenda nostrum officiis a ipsum!',
    img: cavity
    },
    {
    name: 'Teeth Whitening',
    description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Totam magnam dolore qui iste, repellat asperiores adipisci quidem dolorum veniam nobis debitis. Corporis suscipit libero at, assumenda nostrum officiis a ipsum!',
    img: whitening
    },
]



const Services = () => {
    return (
        <Box sx={{ flexGrow: 1 }}>
      <Container>
      <Typography sx={{fontWeight: 500, m:2, color:'success.main'}} variant="h6" component="div">
          Our Services  
        </Typography>
      <Typography sx={{fontWeight: 600, m:5}} variant="h4" component="div">
          Services We Provide
        </Typography>
      <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
        {
            services.map(service =><Service
            key = {service.key}
            service = {service}
            ></Service> )
        }
      </Grid>
      </Container>
    </Box>
    );
};

export default Services;