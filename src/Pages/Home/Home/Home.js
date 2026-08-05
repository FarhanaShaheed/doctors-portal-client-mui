import React from 'react';
import Navigation from '../../Shared/Navigation/Navigation';
import Footer from '../../Shared/Footer/Footer';
import Banner from './../Banner/Banner';
import Services from '../Services/Services';
import DentalCare from '../DentalCare/DentalCare';
import CareStage3D from '../CareStage3D/CareStage3D';
import AppointmentBanner from '../AppointmentBanner/AppointmentBanner';
import Testimonial from '../Testimonial/Testimonial';
import ContactUs from './../ContactUs/ContactUs';
import useReveal from '../../../hooks/useReveal';

const Home = () => {
  useReveal([]);

  return (
    <>
      <Navigation />
      <main>
        <Banner />
        <Services />
        <DentalCare />
        <CareStage3D />
        <AppointmentBanner />
        <Testimonial />
        <ContactUs />
      </main>
      <Footer />
    </>
  );
};

export default Home;
