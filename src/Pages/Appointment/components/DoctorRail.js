import React from 'react';
import DoctorAvatar from '../../Shared/DoctorAvatar/DoctorAvatar';
import { IconSearch, IconStethoscope, IconCheck } from '../../Shared/Icons/Icons';

/* Step 1 of the booking flow: choose who you want to see.
   Search + speciality filter, then a grid of doctor cards each showing the
   real next opening computed from their rota. */
const DoctorRail = ({
  doctors,
  specialities,
  speciality,
  onSpeciality,
  query,
  onQuery,
  selectedId,
  onSelect,
  nextLabelFor,
}) => (
  <section className="sch-card sch-doctors">
    <header className="sch-card-head">
      <div>
        <span className="sch-step">Step 1</span>
        <h2>Choose your specialist</h2>
        <p>{doctors.length} of the clinic&rsquo;s team match your filters.</p>
      </div>

      <div className="sch-search">
        <IconSearch size={17} />
        <input
          type="search"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Search by name or speciality…"
          aria-label="Search doctors"
        />
      </div>
    </header>

    <div className="sch-filters" role="group" aria-label="Filter by speciality">
      {specialities.map((s) => (
        <button
          key={s}
          type="button"
          className={`sch-filter${speciality === s ? ' is-on' : ''}`}
          onClick={() => onSpeciality(s)}
          aria-pressed={speciality === s}
        >
          {s}
        </button>
      ))}
    </div>

    {doctors.length === 0 ? (
      <div className="sch-empty sm">
        <span className="ic"><IconStethoscope size={22} /></span>
        <b>No specialist matches that search</b>
        <span>Try another name, or pick “All specialities”.</span>
      </div>
    ) : (
      <div className="sch-doc-grid">
        {doctors.map((doc) => {
          const on = doc.id === selectedId;
          const next = nextLabelFor(doc);
          const away = doc.status === 'On leave';
          return (
            <button
              type="button"
              key={doc.id || doc.email}
              className={`sch-doc${on ? ' is-on' : ''}${away ? ' is-away' : ''}`}
              onClick={() => onSelect(doc)}
              aria-pressed={on}
            >
              <DoctorAvatar doctor={doc} size={54} dot />
              <span className="sch-doc-main">
                <span className="sch-doc-name">
                  {doc.name}
                  {on && <i className="sch-doc-tick"><IconCheck size={12} weight={3} /></i>}
                </span>
                <span className="sch-doc-spec">{doc.speciality}</span>
                <span className="sch-doc-meta">
                  <b>{doc.rating || 5}★</b>
                  <span>{doc.reviews || 0} reviews</span>
                  <i />
                  <span>{doc.experience || 1} yrs exp.</span>
                </span>
                <span className={`sch-doc-next${away || next === 'No openings' ? ' is-none' : ''}`}>
                  {away ? 'On leave' : `Next: ${next}`}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    )}
  </section>
);

export default DoctorRail;
