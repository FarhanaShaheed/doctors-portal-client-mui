import React, { useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ClinicContext } from '../DashBoard/Dashboard';
import useReveal from '../../../hooks/useReveal';
import useAuth from '../../../hooks/useAuth';
import { IconPlus, IconStethoscope } from '../../Shared/Icons/Icons';

const Doctors = () => {
  const { doctors, appointments, loading, search } = useContext(ClinicContext);
  const { admin } = useAuth();

  const rows = useMemo(() => {
    if (!search) return doctors;
    const needle = search.toLowerCase();
    return doctors.filter((d) =>
      [d.name, d.speciality, d.email].filter(Boolean).some((v) => String(v).toLowerCase().includes(needle))
    );
  }, [doctors, search]);

  useReveal([loading, rows.length]);

  if (loading) {
    return (
      <div className="dash-loading">
        <span className="spinner" />
        <span>Loading the rota…</span>
      </div>
    );
  }

  return (
    <>
      <h1 className="dash-title">Doctors</h1>
      <p className="dash-lead">
        {doctors.length} specialists on the rota.{' '}
        {admin
          ? 'Booking load is calculated from the live schedule.'
          : 'Pick any of them on the booking page — the counter is your own visits.'}
      </p>

      {admin && (
        <Link to="/dashboard/addDoctor" className="dp-btn dp-btn-primary dp-btn-sm" style={{ marginBottom: 22 }}>
          <IconPlus size={16} /> Add a doctor
        </Link>
      )}

      {rows.length === 0 ? (
        <div className="panel">
          <div className="dash-empty">
            <div className="ic"><IconStethoscope size={26} /></div>
            <b>No doctors match</b>
            <span style={{ fontSize: '.88rem' }}>Clear the search box to see the whole rota.</span>
          </div>
        </div>
      ) : (
        <div className="dgrid-3">
          {rows.map((doc, i) => {
            const booked = appointments.filter((a) => a.doctor === doc.name).length;
            return (
              <article className={`doc-card dp-reveal dp-d${(i % 3) + 1}`} key={doc.id || doc.email}>
                <div className="top">
                  <span className={`davatar ${doc.tone || ''}`}>{doc.initials || 'DR'}</span>
                  <div>
                    <h4>{doc.name}</h4>
                    <div className="sp">{doc.speciality}</div>
                  </div>
                  <span className={`pill ${doc.status === 'On leave' ? 'pending' : 'confirmed'}`} style={{ marginLeft: 'auto' }}>
                    {doc.status || 'Active'}
                  </span>
                </div>
                <div className="stats">
                  <div><b>{doc.experience || 1}y</b><span>Experience</span></div>
                  <div><b>{doc.rating || 5}★</b><span>Rating</span></div>
                  <div><b>{booked}</b><span>{admin ? 'Booked' : 'Your visits'}</span></div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
};

export default Doctors;
