import React from 'react';
import { IconClock } from '../../Shared/Icons/Icons';

const Booking = ({ booking, onBook }) => {
  const { name, time, space } = booking;

  return (
    <article className="dp-slot">
      <h3>{name}</h3>
      <div className="time" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
        <IconClock size={15} />
        {time}
      </div>
      <div className="space">{space} space{space === 1 ? '' : 's'} available</div>
      <button
        type="button"
        className="dp-btn dp-btn-primary"
        onClick={() => onBook(booking)}
        disabled={space === 0}
      >
        {space === 0 ? 'Fully booked' : 'Book appointment'}
      </button>
    </article>
  );
};

export default Booking;
