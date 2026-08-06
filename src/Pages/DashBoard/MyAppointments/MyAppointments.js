import React, { useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ClinicContext } from '../DashBoard/Dashboard';
import AppointmentsTable from '../components/AppointmentsTable';
import StatCard from '../components/StatCard';
import useReveal from '../../../hooks/useReveal';
import useAuth from '../../../hooks/useAuth';
import { dateKey, prettyDate } from '../../../api/demoApi';
import { durationLabel, money, timeRange } from '../../../api/schedule';
import { IconCalendar, IconClock, IconCheck, IconArrow, IconPlus } from '../../Shared/Icons/Icons';

/* The patient-side view of the same store the admin tables read: whatever you
   book on /appointment is here the moment you land. */
const MyAppointments = () => {
  const { appointments, loading } = useContext(ClinicContext);
  const { user } = useAuth();
  const email = (user?.email || '').toLowerCase();
  const todayKey = dateKey(new Date());

  const mine = useMemo(
    () =>
      appointments
        .filter((a) => (a.email || '').toLowerCase() === email)
        .sort((a, b) => `${b.dateKey}${b.startTime}`.localeCompare(`${a.dateKey}${a.startTime}`)),
    [appointments, email]
  );

  const upcoming = useMemo(() => mine.filter((a) => a.dateKey >= todayKey).reverse(), [mine, todayKey]);
  const past = useMemo(() => mine.filter((a) => a.dateKey < todayKey), [mine, todayKey]);
  const spend = mine.reduce((sum, a) => sum + (Number(a.price) || 0), 0);

  useReveal([loading, mine.length]);

  if (loading) {
    return (
      <div className="dash-loading">
        <span className="spinner" />
        <span>Loading your visits…</span>
      </div>
    );
  }

  const nextOne = upcoming[0];

  return (
    <>
      <h1 className="dash-title">My appointments</h1>
      <p className="dash-lead">
        Everything booked with <b style={{ color: '#fff' }}>{user?.email}</b>.
      </p>

      <div className="kpi-grid">
        <StatCard icon={<IconCalendar size={21} />} label="Upcoming" value={upcoming.length} />
        <StatCard icon={<IconCheck size={21} />} label="Total visits" value={mine.length} tone="t-mint" duration={1250} />
        <StatCard icon={<IconClock size={21} />} label="Past visits" value={past.length} tone="t-sky" duration={1350} />
        <StatCard icon={<IconCalendar size={21} />} label="Total fees (BDT)" value={spend} tone="t-amber" duration={1450} />
      </div>

      {nextOne && (
        <section className="panel dp-reveal next-visit">
          <div className="panel-head">
            <div>
              <h3>Your next visit</h3>
              <div className="sub">{prettyDate(new Date(`${nextOne.dateKey}T00:00:00`))}</div>
            </div>
            <Link to="/appointment" className="dp-btn dp-btn-primary dp-btn-sm">
              <IconPlus size={15} /> Book another
            </Link>
          </div>
          <div className="next-visit-body">
            <div>
              <span className="lbl">Service</span>
              <b>{nextOne.serviceName}</b>
            </div>
            <div>
              <span className="lbl">Doctor</span>
              <b>{nextOne.doctor}</b>
            </div>
            <div>
              <span className="lbl">Time</span>
              <b>{nextOne.startTime ? timeRange(nextOne.startTime, nextOne.duration || 30) : nextOne.time}</b>
            </div>
            <div>
              <span className="lbl">Duration</span>
              <b>{durationLabel(nextOne.duration || 30)}</b>
            </div>
            <div>
              <span className="lbl">Fee</span>
              <b>{nextOne.price ? money(nextOne.price) : '—'}</b>
            </div>
          </div>
        </section>
      )}

      <section className="panel dp-reveal dp-d1" style={{ marginTop: 18 }}>
        <div className="panel-head">
          <div>
            <h3>Upcoming</h3>
            <div className="sub">{upcoming.length} scheduled</div>
          </div>
        </div>
        <AppointmentsTable
          rows={upcoming}
          emptyTitle="No upcoming visits"
          emptyText="Pick a slot on the booking page and it will appear here instantly."
        />
        {upcoming.length === 0 && (
          <Link to="/appointment" className="dp-btn dp-btn-primary dp-btn-sm" style={{ marginTop: 14 }}>
            Find a slot <IconArrow size={15} />
          </Link>
        )}
      </section>

      {past.length > 0 && (
        <section className="panel dp-reveal dp-d2" style={{ marginTop: 18 }}>
          <div className="panel-head">
            <div>
              <h3>History</h3>
              <div className="sub">{past.length} past visit{past.length === 1 ? '' : 's'}</div>
            </div>
          </div>
          <AppointmentsTable rows={past} />
        </section>
      )}
    </>
  );
};

export default MyAppointments;
