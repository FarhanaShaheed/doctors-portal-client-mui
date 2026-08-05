import React from 'react';
import Calender from './../../Shared/Calender/Calender';
import { prettyDate } from '../../../api/demoApi';
import { IconCalendar } from '../../Shared/Icons/Icons';

const AppointmentHeader = ({ date, setDate }) => (
  <section className="dp-appt-head">
    <div className="dp-wrap">
      <div className="dp-appt-grid">
        <div>
          <span className="dp-eyebrow">Book a visit</span>
          <h1>Pick the day that suits you</h1>
          <p>
            Choose a date on the calendar and the open slots update instantly.
            You will get a confirmation the moment you submit — and the clinic
            sees it in the dashboard straight away.
          </p>
          <div className="dp-chip" style={{ marginTop: 22, background: 'rgba(255,255,255,.12)', color: '#e2defc' }}>
            <IconCalendar size={16} /> {prettyDate(date)}
          </div>
        </div>

        <div>
          <Calender date={date} setDate={setDate} />
        </div>
      </div>
    </div>
  </section>
);

export default AppointmentHeader;
