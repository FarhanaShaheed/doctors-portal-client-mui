import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import Navigation from '../../Shared/Navigation/Navigation';
import Footer from '../../Shared/Footer/Footer';
import DoctorRail from '../components/DoctorRail';
import WeekStrip from '../components/WeekStrip';
import SlotBoard from '../components/SlotBoard';
import SummaryPanel from '../components/SummaryPanel';
import BookingModal from '../components/BookingModal';

import useAuth from '../../../hooks/useAuth';
import { getDoctors, getAppointments, prettyDate, addDays, dateKey } from '../../../api/demoApi';
import {
  startOfDay, startOfWeek, weekDates, isSameDay, isPastDay,
  servicesOf, daySlots, openSlots, groupByPeriod, availabilityOn,
  nextAvailable, nextAvailableLabel,
} from '../../../api/schedule';
import { IconCheck, IconArrow, IconStethoscope } from '../../Shared/Icons/Icons';

const ALL = 'All specialities';

const Appointment = () => {
  const { user } = useAuth();

  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState('');
  const [speciality, setSpeciality] = useState(ALL);
  const [doctorId, setDoctorId] = useState(null);
  const [serviceName, setServiceName] = useState(null);

  const [date, setDate] = useState(startOfDay(new Date()));
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date()));
  const [slot, setSlot] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(null);
  const [slotsLoading, setSlotsLoading] = useState(true);

  const doctorsRef = useRef(null);
  const slotsRef = useRef(null);

  /* ------------------------------- data ---------------------------------- */

  const load = useCallback(async () => {
    const [d, a] = await Promise.all([getDoctors(), getAppointments()]);
    setDoctors(Array.isArray(d) ? d : []);
    setAppointments(Array.isArray(a) ? a : []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const doctor = useMemo(
    () => doctors.find((d) => d.id === doctorId) || null,
    [doctors, doctorId]
  );

  const services = useMemo(() => (doctor ? servicesOf(doctor) : []), [doctor]);
  const service = useMemo(
    () => services.find((s) => s.name === serviceName) || services[0] || null,
    [services, serviceName]
  );

  /* Pick a sensible starting point: the first doctor who is actually working,
     on their first free day — exactly what a receptionist would offer. */
  useEffect(() => {
    if (doctorId || !doctors.length) return;
    const pick = doctors.find((d) => d.status !== 'On leave') || doctors[0];
    const first = servicesOf(pick)[0];
    const next = nextAvailable(pick, appointments, first.duration);
    setDoctorId(pick.id);
    setServiceName(first.name);
    if (next) {
      setDate(startOfDay(next.date));
      setWeekStart(startOfWeek(next.date));
    }
  }, [doctors, appointments, doctorId]);

  /* ------------------------------ derived -------------------------------- */

  const specialities = useMemo(
    () => [ALL, ...Array.from(new Set(doctors.map((d) => d.speciality).filter(Boolean)))],
    [doctors]
  );

  const visibleDoctors = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return doctors.filter((d) => {
      const bySpec = speciality === ALL || d.speciality === speciality;
      const byText =
        !needle ||
        [d.name, d.speciality, d.bio].filter(Boolean).some((v) => v.toLowerCase().includes(needle));
      return bySpec && byText;
    });
  }, [doctors, query, speciality]);

  const step = service ? service.duration : 30;

  const availabilityFor = useCallback(
    (day) => (doctor && !isPastDay(day) ? availabilityOn(doctor, day, appointments, step) : 0),
    [doctor, appointments, step]
  );

  const slots = useMemo(
    () => (doctor ? daySlots(doctor, date, appointments, step) : []),
    [doctor, date, appointments, step]
  );
  const groups = useMemo(() => groupByPeriod(slots), [slots]);
  const openCount = openSlots(slots).length;

  const next = useMemo(
    () => (doctor ? nextAvailable(doctor, appointments, step, addDays(date, 1)) : null),
    [doctor, appointments, step, date]
  );

  const nextLabelFor = useCallback(
    (doc) => nextAvailableLabel(nextAvailable(doc, appointments, servicesOf(doc)[0].duration)),
    [appointments]
  );

  const mine = useMemo(() => {
    const email = (user?.email || '').toLowerCase();
    if (!email) return [];
    const todayKey = dateKey(new Date());
    return appointments
      .filter((a) => (a.email || '').toLowerCase() === email && a.dateKey >= todayKey)
      .sort((a, b) => `${a.dateKey}${a.startTime}`.localeCompare(`${b.dateKey}${b.startTime}`));
  }, [appointments, user]);

  /* A short, deliberate "checking availability" beat whenever the query
     changes — the slot grid then animates in instead of snapping. */
  useEffect(() => {
    if (!doctor) return undefined;
    setSlotsLoading(true);
    const t = setTimeout(() => setSlotsLoading(false), 320);
    return () => clearTimeout(t);
  }, [doctorId, serviceName, dateKey(date)]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ------------------------------ actions -------------------------------- */

  const goToDay = (day) => {
    setDate(startOfDay(day));
    setWeekStart(startOfWeek(day));
    setSlot(null);
  };

  const chooseDoctor = (doc) => {
    const first = servicesOf(doc)[0];
    setDoctorId(doc.id);
    setServiceName(first.name);
    setSlot(null);
    const stillFine = !isPastDay(date) && availabilityOn(doc, date, appointments, first.duration) > 0;
    if (!stillFine) {
      const n = nextAvailable(doc, appointments, first.duration);
      if (n) { setDate(startOfDay(n.date)); setWeekStart(startOfWeek(n.date)); }
    }
    if (typeof window !== 'undefined' && window.innerWidth < 1024 && slotsRef.current) {
      const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      slotsRef.current.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    }
  };

  const chooseService = (s) => { setServiceName(s.name); setSlot(null); };

  const pickSlot = (s) => { setSlot(s); setModalOpen(true); };

  /* The modal stays mounted to show its success state, so the slot is only
     released once the dialog is actually dismissed. */
  const bookedRef = useRef(false);

  const handleBooked = async (appointment) => {
    bookedRef.current = true;
    setConfirmed(appointment);
    const fresh = await getAppointments();
    setAppointments(Array.isArray(fresh) ? fresh : []);
  };

  const closeModal = () => {
    setModalOpen(false);
    if (bookedRef.current) { bookedRef.current = false; setSlot(null); }
  };

  const shiftWeek = (delta) => {
    const nextStart = addDays(weekStart, delta * 7);
    setWeekStart(nextStart);
    const candidate = isSameDay(nextStart, startOfWeek(new Date())) ? startOfDay(new Date()) : nextStart;
    setDate(isPastDay(candidate) ? startOfDay(new Date()) : candidate);
    setSlot(null);
  };

  const today = () => goToDay(new Date());

  const days = useMemo(() => weekDates(weekStart), [weekStart]);
  const canGoBack = weekStart.getTime() > startOfWeek(new Date()).getTime();

  /* -------------------------------- render -------------------------------- */

  return (
    <>
      <Navigation />

      <main className="sch-page">
        <section className="sch-hero">
          <div className="dp-wrap">
            <span className="dp-eyebrow">Book a visit</span>
            <h1>Real availability, booked in under a minute.</h1>
            <p>
              Pick your specialist, see their live calendar and take a slot. No phone
              calls, no waiting — the clinic gets your booking the second you confirm.
            </p>
            <ol className="sch-steps">
              <li><b>1</b> Choose a specialist</li>
              <li><b>2</b> Pick a day &amp; time</li>
              <li><b>3</b> Confirm in one screen</li>
            </ol>
          </div>
        </section>

        <div className="dp-wrap sch-layout">
          <div className="sch-main" ref={doctorsRef}>
            {confirmed && (
              <div className="sch-banner" role="status">
                <span className="ic"><IconCheck size={18} weight={2.4} /></span>
                <span>
                  <b>Booked.</b> {confirmed.serviceName} with {confirmed.doctor} ·{' '}
                  {prettyDate(new Date(`${confirmed.dateKey}T00:00:00`))} at {confirmed.time}.
                </span>
                <Link to="/dashboard/my-appointments" className="dp-btn dp-btn-ghost dp-btn-sm">
                  My appointments <IconArrow size={15} />
                </Link>
              </div>
            )}

            {loading ? (
              <div className="sch-card sch-loading">
                <span className="spinner dark" />
                <span>Loading the clinic calendar…</span>
              </div>
            ) : (
              <>
                <DoctorRail
                  doctors={visibleDoctors}
                  specialities={specialities}
                  speciality={speciality}
                  onSpeciality={setSpeciality}
                  query={query}
                  onQuery={setQuery}
                  selectedId={doctorId}
                  onSelect={chooseDoctor}
                  nextLabelFor={nextLabelFor}
                />

                <div ref={slotsRef}>
                  {doctor && service ? (
                    <SlotBoard
                      doctor={doctor}
                      date={date}
                      service={service}
                      services={services}
                      onService={chooseService}
                      groups={groups}
                      openCount={openCount}
                      loading={slotsLoading}
                      onPick={pickSlot}
                      selectedTime={slot?.time}
                      next={next}
                      onJumpNext={() => next && goToDay(next.date)}
                      onOtherDoctor={() =>
                        doctorsRef.current && doctorsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
                      }
                      calendar={
                        <WeekStrip
                          weekStart={weekStart}
                          days={days}
                          selected={date}
                          onSelect={goToDay}
                          onShiftWeek={shiftWeek}
                          onToday={today}
                          canGoBack={canGoBack}
                          availabilityFor={availabilityFor}
                        />
                      }
                    />
                  ) : (
                    <section className="sch-card">
                      <div className="sch-empty">
                        <span className="ic"><IconStethoscope size={24} /></span>
                        <b>Choose a specialist to see their calendar</b>
                        <span>Their free slots for the next four weeks will appear right here.</span>
                      </div>
                    </section>
                  )}
                </div>
              </>
            )}
          </div>

          {!loading && doctor && service && (
            <SummaryPanel
              doctor={doctor}
              date={date}
              service={service}
              slot={slot}
              user={user}
              mine={mine}
              onReview={() => setModalOpen(true)}
            />
          )}
        </div>
      </main>

      <Footer />

      {modalOpen && doctor && service && slot && (
        <BookingModal
          doctor={doctor}
          date={date}
          service={service}
          slot={slot}
          user={user}
          onClose={closeModal}
          onBooked={handleBooked}
        />
      )}
    </>
  );
};

export default Appointment;
