import React, { useState } from 'react';
import Navigation from './../../Shared/Navigation/Navigation';
import Footer from '../../Shared/Footer/Footer';
import AppointmentHeader from '../AppointmentHeader/AppointmentHeader';
import AvailableAppointments from '../AvailableAppointments/AvailableAppointments';

const Appointment = () => {
  const [date, setDate] = useState(new Date());

  return (
    <>
      <Navigation />
      <main>
        <AppointmentHeader date={date} setDate={setDate} />
        <AvailableAppointments date={date} />
      </main>
      <Footer />
    </>
  );
};

export default Appointment;
