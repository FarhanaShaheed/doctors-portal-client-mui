import React, { useContext, useMemo, useState } from 'react';
import { ClinicContext } from '../DashBoard/Dashboard';
import PatientHome from './PatientHome';
import MiniMonth from './../../Shared/MiniMonth/MiniMonth';
import StatCard from '../components/StatCard';
import AreaChart from '../components/AreaChart';
import ServiceBars from '../components/ServiceBars';
import AppointmentsTable from '../components/AppointmentsTable';
import useReveal from '../../../hooks/useReveal';
import useAuth from '../../../hooks/useAuth';
import {
  appointmentsByDay, countByService, dateKey, prettyDate, addDays,
} from '../../../api/demoApi';
import { IconCalendar, IconUsers, IconStethoscope, IconTrend } from '../../Shared/Icons/Icons';

const matches = (row, q) => {
  if (!q) return true;
  const needle = q.toLowerCase();
  return [row.patientName, row.email, row.serviceName, row.doctor, row.status]
    .filter(Boolean)
    .some((v) => String(v).toLowerCase().includes(needle));
};

/* The front desk's view of the clinic. A patient gets PatientHome instead —
   same shell, their own record, none of anybody else's. */
const DashBoardHome = () => {
  const { appointments, doctors, users, loading, search, admin } = useContext(ClinicContext);
  const { user } = useAuth();
  const [date, setDate] = useState(new Date());
  const [scope, setScope] = useState('day');

  const today = dateKey(new Date());
  const selected = dateKey(date);

  const week = useMemo(() => appointmentsByDay(appointments, 7, new Date()), [appointments]);
  const weekKeys = useMemo(() => week.map((w) => w.key), [week]);
  const services = useMemo(() => countByService(appointments).slice(0, 6), [appointments]);

  const todayCount = appointments.filter((a) => a.dateKey === today).length;
  const weekCount = appointments.filter((a) => weekKeys.includes(a.dateKey)).length;
  const patients = new Set(appointments.map((a) => a.email)).size;

  const rows = useMemo(() => {
    const base = scope === 'day'
      ? appointments.filter((a) => a.dateKey === selected)
      : scope === 'week'
        ? appointments.filter((a) => weekKeys.includes(a.dateKey))
        : appointments;
    return base.filter((r) => matches(r, search));
  }, [appointments, scope, selected, weekKeys, search]);

  useReveal([loading]);

  // hooks above run for both roles, so this stays a plain branch
  if (!admin) return <PatientHome />;

  if (loading) {
    return (
      <div className="dash-loading">
        <span className="spinner" />
        <span>Loading the clinic…</span>
      </div>
    );
  }

  return (
    <>
      <h1 className="dash-title">
        Good day{user?.displayName ? `, ${user.displayName}` : ''} 👋
      </h1>
      <p className="dash-lead">
        Here is how the clinic looks between {prettyDate(new Date())} and {prettyDate(addDays(new Date(), 6))}.
      </p>

      <div className="kpi-grid">
        <StatCard icon={<IconCalendar size={21} />} label="Today" value={todayCount} delta={12} deltaLabel="vs yesterday" />
        <StatCard icon={<IconTrend size={21} />} label="This week" value={weekCount} delta={8} tone="t-sky" duration={1300} />
        <StatCard icon={<IconUsers size={21} />} label="Patients" value={patients || users.length} delta={5} tone="t-mint" duration={1450} />
        <StatCard icon={<IconStethoscope size={21} />} label="Doctors on rota" value={doctors.length} delta={-2} tone="t-amber" duration={1200} />
      </div>

      <div className="dash-cols">
        <section className="panel dp-reveal">
          <div className="panel-head">
            <div>
              <h3>Appointments per day</h3>
              <div className="sub">Next seven days, refreshed as bookings come in</div>
            </div>
            <span className="dash-pill" style={{ background: 'rgba(99,102,241,.16)', color: '#a5b4fc', borderColor: 'rgba(99,102,241,.3)' }}>
              {weekCount} total
            </span>
          </div>
          <AreaChart data={week} />
        </section>

        <section className="panel dp-reveal dp-d1">
          <div className="panel-head">
            <div>
              <h3>Most booked services</h3>
              <div className="sub">Across the whole schedule</div>
            </div>
          </div>
          <ServiceBars rows={services} />
        </section>
      </div>

      <div className="dash-cols-2">
        <section className="panel dp-reveal">
          <div className="panel-head">
            <div>
              <h3>Pick a date</h3>
              <div className="sub">{prettyDate(date)}</div>
            </div>
          </div>
          <MiniMonth
            value={date}
            onChange={setDate}
            dark
            disablePast={false}
            dimEmpty={false}
            availability={(d) => appointments.filter((a) => a.dateKey === dateKey(d)).length}
          />
        </section>

        <section className="panel dp-reveal dp-d1">
          <div className="panel-head">
            <div>
              <h3>Schedule</h3>
              <div className="sub">
                {rows.length} appointment{rows.length === 1 ? '' : 's'}
                {search ? ` matching “${search}”` : ''}
              </div>
            </div>
            <div className="dash-seg">
              <button type="button" className={scope === 'day' ? 'on' : ''} onClick={() => setScope('day')}>Selected day</button>
              <button type="button" className={scope === 'week' ? 'on' : ''} onClick={() => setScope('week')}>This week</button>
              <button type="button" className={scope === 'all' ? 'on' : ''} onClick={() => setScope('all')}>All</button>
            </div>
          </div>
          <AppointmentsTable
            rows={rows}
            compact={scope === 'day'}
            emptyTitle={search ? 'No matches' : 'Nothing booked for this day'}
            emptyText={
              search
                ? 'Try a different patient, service or doctor name.'
                : 'Pick another date, or book a slot on the public site — it shows up here straight away.'
            }
          />
        </section>
      </div>
    </>
  );
};

export default DashBoardHome;
