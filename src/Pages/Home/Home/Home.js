import React from 'react';
import Navigation from '../../Shared/Navigation/Navigation';
import AppointmentBanner from '../AppointmentBanner/AppointmentBanner';
import DentalCare from '../DentalCare/DentalCare';
import Services from '../Services/Services';
import Testimonial from '../Testimonial/Testimonial';
import Banner from './../Banner/Banner';
import ContactUs from './../ContactUs/ContactUs';

const Home = () => {
    return (
        <div>
          <Navigation></Navigation>
          <Banner></Banner>
          <Services></Services>
          <DentalCare></DentalCare>
          <AppointmentBanner></AppointmentBanner>
          <Testimonial></Testimonial>
        </div>
    );
};

export default Home;