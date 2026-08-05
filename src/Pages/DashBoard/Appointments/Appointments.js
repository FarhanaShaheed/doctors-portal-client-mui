import React, { useContext, useMemo, useState } from 'react';
import { ClinicContext } from '../DashBoard/Dashboard';
import AppointmentsTable from '../components/AppointmentsTable';
import StatCard from '../components/StatCard';
import useReveal from '../../../hooks/useReveal';
import { dateKey, appointmentsByDay } from '../../../api/demoApi';
import { IconCalendar, IconCheck, IconClock } from '../../Shared/Icons/Icons';

const FILTERS = ['All', 'Confirmed', 'Pending', 'Completed'];

const matches = (row, q) => {
  if (!q) return true;
  const needle = q.toLowerCase();
  return [row.patientName, row.email, row.serviceName, row.doctor, row.status]
    .filter(Boolean)
    .some((v) => String(v).toLowerCase().includes(needle));
};

const Appointments = () => {
  const { appointments, loading, search } = useContext(ClinicContext);
  const [filter, setFilter] = useState('All');

  const today = dateKey(new Date());
  const weekKeys = useMemo(() => appointmentsByDay(appointments, 7, new Date()).map((d) => d.key), [appointments]);

  const rows = useMemo(() => {
    const sorted = [...appointments].sort((a, b) => String(a.dateKey).localeCompare(String(b.dateKey)));
    return sorted
      .filter((r) => (filter === 'All' ? true : (r.status || 'Confirmed') === filter))
      .filter((r) => matches(r, search));
  }, [appointments, filter, search]);

  useReveal([loading, filter]);

  if (loading) {
    return (
      <div className="dash-loading">
        <span className="spinner" />
        <span>Loading appointments…</span>
      </div>
    );
  }

  return (
    <>
      <h1 className="dash-title">Appointments</h1>
      <p className="dash-lead">Every booking in the system, newest schedule first.</p>

      <div className="kpi-grid">
        <StatCard icon={<IconCalendar size={21} />} label="Total" value={appointments.length} delta={9} deltaLabel="all time" />
        <StatCard icon={<IconClock size={21} />} label="Today" value={appointments.filter((a) => a.dateKey === today).length} delta={12} deltaLabel="vs yesterday" tone="t-sky" duration={1250} />
        <StatCard icon={<IconCheck size={21} />} label="Confirmed" value={appointments.filter((a) => (a.status || 'Confirmed') === 'Confirmed').length} delta={6} tone="t-mint" duration={1350} />
        <StatCard icon={<IconClock size={21} />} label="Pending" value={appointments.filter((a) => a.status === 'Pending').length} delta={-3} tone="t-amber" duration={1450} />
      </div>

      <section className="panel dp-reveal">
        <div className="panel-head">
          <div>
            <h3>All appointments</h3>
            <div className="sub">
              {rows.length} shown · {appointments.filter((a) => weekKeys.includes(a.dateKey)).length} in the next seven days
            </div>
          </div>
          <div className="dash-seg">
            {FILTERS.map((f) => (
              <button key={f} type="button" className={filter === f ? 'on' : ''} onClick={() => setFilter(f)}>{f}</button>
            ))}
          </div>
        </div>

        <AppointmentsTable
          rows={rows}
          emptyTitle="No appointments match"
          emptyText="Clear the search box or pick a different status filter."
        />
      </section>
    </>
  );
};

export default Appointments;
