import React, { useContext, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClinicContext } from '../DashBoard/Dashboard';
import MiniMonth from './../../Shared/MiniMonth/MiniMonth';
import StatCard from '../components/StatCard';
import AppointmentsTable from '../components/AppointmentsTable';
import useReveal from '../../../hooks/useReveal';
import useAuth from '../../../hooks/useAuth';
import { dateKey, prettyDate } from '../../../api/demoApi';
import { durationLabel, money, timeRange } from '../../../api/schedule';
import { IconCalendar, IconCheck, IconClock, IconPlus, IconArrow } from '../../Shared/Icons/Icons';

/* What a patient sees when they open the dashboard.

   The console used to open the same page for everyone: clinic-wide counters, the
   full schedule, every patient's name and email address. A patient's own visits
   are the only clinic data that is theirs, so that is what this page is — the
   figures, the calendar and the table are all their own record. */
const PatientHome = () => {
  const { appointments, doctors, loading } = useContext(ClinicContext);
  const { user } = useAuth();
  const [date, setDate] = useState(new Date());

  const todayKey = dateKey(new Date());
  const selected = dateKey(date);

  const mine = useMemo(
    () => [...appointments].sort((a, b) => `${a.dateKey}${a.startTime}`.localeCompare(`${b.dateKey}${b.startTime}`)),
    [appointments]
  );
  const upcoming = useMemo(() => mine.filter((a) => a.dateKey >= todayKey), [mine, todayKey]);
  const past = useMemo(() => mine.filter((a) => a.dateKey < todayKey), [mine, todayKey]);
  const onSelectedDay = useMemo(() => mine.filter((a) => a.dateKey === selected), [mine, selected]);
  const spend = mine.reduce((sum, a) => sum + (Number(a.price) || 0), 0);
  const next = upcoming[0];

  useReveal([loading, selected]);

  if (loading) {
    return (
      <div className="dash-loading">
        <span className="spinner" />
        <span>Loading your visits…</span>
      </div>
    );
  }

  return (
    <>
      <h1 className="dash-title">
        Good day{user?.displayName ? `, ${user.displayName}` : ''} 👋
      </h1>
      <p className="dash-lead">
        {next
          ? <>Your next visit is {prettyDate(new Date(`${next.dateKey}T00:00:00`))} with {next.doctor}.</>
          : <>You have nothing booked at the moment — pick a slot whenever it suits you.</>}
      </p>

      <div className="kpi-grid">
        <StatCard icon={<IconCalendar size={21} />} label="Upcoming" value={upcoming.length} />
        <StatCard icon={<IconCheck size={21} />} label="Total visits" value={mine.length} tone="t-mint" duration={1250} />
        <StatCard icon={<IconClock size={21} />} label="Past visits" value={past.length} tone="t-sky" duration={1350} />
        <StatCard icon={<IconCalendar size={21} />} label="Total fees (EUR)" value={spend} tone="t-amber" duration={1450} />
      </div>

      {next && (
        <section className="panel dp-reveal next-visit">
          <div className="panel-head">
            <div>
              <h3>Your next visit</h3>
              <div className="sub">{prettyDate(new Date(`${next.dateKey}T00:00:00`))}</div>
            </div>
            <Link to="/appointment" className="dp-btn dp-btn-primary dp-btn-sm">
              <IconPlus size={15} /> Book another
            </Link>
          </div>
          <div className="next-visit-body">
            <div><span className="lbl">Service</span><b>{next.serviceName}</b></div>
            <div><span className="lbl">Doctor</span><b>{next.doctor}</b></div>
            <div><span className="lbl">Time</span><b>{next.startTime ? timeRange(next.startTime, next.duration || 30) : next.time}</b></div>
            <div><span className="lbl">Duration</span><b>{durationLabel(next.duration || 30)}</b></div>
            <div><span className="lbl">Fee</span><b>{next.price ? money(next.price) : '—'}</b></div>
          </div>
        </section>
      )}

      <div className="dash-cols-2">
        <section className="panel dp-reveal">
          <div className="panel-head">
            <div>
              <h3>Your calendar</h3>
              <div className="sub">{prettyDate(date)}</div>
            </div>
          </div>
          <MiniMonth
            value={date}
            onChange={setDate}
            dark
            disablePast={false}
            dimEmpty={false}
            availability={(d) => mine.filter((a) => a.dateKey === dateKey(d)).length}
          />
        </section>

        <section className="panel dp-reveal dp-d1">
          <div className="panel-head">
            <div>
              <h3>That day</h3>
              <div className="sub">
                {onSelectedDay.length === 0
                  ? 'Nothing booked'
                  : `${onSelectedDay.length} visit${onSelectedDay.length === 1 ? '' : 's'}`}
              </div>
            </div>
            <Link to="/appointment" className="dp-btn dp-btn-primary dp-btn-sm">
              <IconPlus size={15} /> Book a slot
            </Link>
          </div>
          <AppointmentsTable
            rows={onSelectedDay}
            compact
            emptyTitle="Nothing on this day"
            emptyText="Pick another date in the calendar, or book a new slot."
          />
        </section>
      </div>

      <section className="panel dp-reveal dp-d2" style={{ marginTop: 18 }}>
        <div className="panel-head">
          <div>
            <h3>Everything you have booked</h3>
            <div className="sub">
              {mine.length === 0
                ? `Nothing yet — ${doctors.length} doctors are taking bookings`
                : `${mine.length} visit${mine.length === 1 ? '' : 's'} with ${new Set(mine.map((a) => a.doctor)).size} of our doctors`}
            </div>
          </div>
          <Link to="/dashboard/my-appointments" className="dp-btn dp-btn-ghost dp-btn-sm">
            Full history <IconArrow size={15} />
          </Link>
        </div>
        <AppointmentsTable
          showPay
          rows={upcoming}
          emptyTitle="No upcoming visits"
          emptyText="Pick a slot on the booking page and it will appear here instantly."
        />
      </section>
    </>
  );
};

export default PatientHome;
