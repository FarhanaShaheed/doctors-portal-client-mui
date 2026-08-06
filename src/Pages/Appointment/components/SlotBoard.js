import React from 'react';
import { IconClock, IconCalendar, IconArrow } from '../../Shared/Icons/Icons';
import {
  openingLabel, durationLabel, money, nextAvailableLabel,
} from '../../../api/schedule';
import { prettyDate } from '../../../api/demoApi';

const Skeletons = () => (
  <div className="sch-slot-grid">
    {Array.from({ length: 10 }).map((_, i) => (
      <span key={i} className="sch-slot is-skeleton" style={{ '--i': i }} />
    ))}
  </div>
);

/* Step 2: the day's slot board. Slots are generated from the doctor's rota
   and crossed out where an appointment already occupies the interval. */
const SlotBoard = ({
  doctor, date, service, services, onService, groups, openCount, loading,
  onPick, selectedTime, next, onJumpNext, onOtherDoctor, calendar,
}) => {
  const away = doctor.status === 'On leave';
  const closed = openingLabel(doctor, date) === 'Closed';
  const nothingFree = !loading && openCount === 0;

  const emptyState = () => {
    if (away) {
      return {
        title: `${doctor.name} is on leave`,
        text: 'Their calendar reopens after the break. Another specialist in the same field can usually see you this week.',
        action: onOtherDoctor && { label: 'See other specialists', fn: onOtherDoctor },
      };
    }
    if (closed) {
      return {
        title: `No clinic on ${date.toLocaleDateString(undefined, { weekday: 'long' })}`,
        text: `${doctor.name} does not hold consultations that day.`,
        action: next && { label: `Jump to ${nextAvailableLabel(next)}`, fn: onJumpNext },
      };
    }
    return {
      title: 'Fully booked on this day',
      text: `Every ${durationLabel(service.duration)} slot in ${openingLabel(doctor, date)} is taken.`,
      action: next && { label: `Jump to ${nextAvailableLabel(next)}`, fn: onJumpNext },
    };
  };

  return (
    <section className="sch-card sch-slots">
      <header className="sch-card-head">
        <div>
          <span className="sch-step">Step 2</span>
          <h2>Pick a time with {doctor.name.replace(/^Dr\.?\s*/, 'Dr. ')}</h2>
          <p>{prettyDate(date)} · {openingLabel(doctor, date)}</p>
        </div>

        <span className={`sch-count${openCount === 0 ? ' is-zero' : ''}`}>
          <IconClock size={15} />
          {loading ? 'Checking availability…' : `${openCount} slot${openCount === 1 ? '' : 's'} available`}
        </span>
      </header>

      {calendar}

      <div className="sch-reason">
        <span className="sch-reason-label">Reason for visit</span>
        <div className="sch-reason-chips">
          {services.map((s) => (
            <button
              key={s.name}
              type="button"
              className={`sch-reason-chip${s.name === service.name ? ' is-on' : ''}`}
              onClick={() => onService(s)}
              aria-pressed={s.name === service.name}
            >
              <span>{s.name}</span>
              <i>{durationLabel(s.duration)} · {money(s.price)}</i>
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Skeletons />
      ) : nothingFree ? (
        (() => {
          const e = emptyState();
          return (
            <div className="sch-empty">
              <span className="ic"><IconCalendar size={24} /></span>
              <b>{e.title}</b>
              <span>{e.text}</span>
              {e.action && (
                <button type="button" className="dp-btn dp-btn-ghost dp-btn-sm" onClick={e.action.fn}>
                  {e.action.label} <IconArrow size={15} />
                </button>
              )}
            </div>
          );
        })()
      ) : (
        <>
          <div className="sch-legend">
            <span><i className="dot free" /> Available</span>
            <span><i className="dot taken" /> Booked</span>
            <span className="sch-legend-note">Times shown in clinic time (GMT+6)</span>
          </div>

          {groups.map((group) => (
            <div className="sch-period" key={group.key}>
              <div className="sch-period-head">
                <h3>{group.label}</h3>
                <span>{group.hint}</span>
                <i />
                <span>{group.slots.filter((s) => !s.booked && !s.past).length} free</span>
              </div>
              <div className="sch-slot-grid">
                {group.slots.map((slot, i) => {
                  const disabled = slot.booked || slot.past;
                  const classes = [
                    'sch-slot',
                    slot.booked ? 'is-booked' : '',
                    slot.past && !slot.booked ? 'is-past' : '',
                    selectedTime === slot.time ? 'is-on' : '',
                  ].filter(Boolean).join(' ');
                  return (
                    <button
                      type="button"
                      key={slot.time}
                      className={classes}
                      style={{ '--i': i }}
                      disabled={disabled}
                      title={
                        slot.booked
                          ? 'Already booked'
                          : slot.past
                            ? 'This time has passed'
                            : `Book ${slot.time}–${slot.endTime} with ${doctor.name}`
                      }
                      onClick={() => onPick(slot)}
                    >
                      {slot.time}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </>
      )}
    </section>
  );
};

export default SlotBoard;
