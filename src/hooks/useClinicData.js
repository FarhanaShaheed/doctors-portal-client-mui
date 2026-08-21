import { useCallback, useEffect, useState } from 'react';
import { getAppointments, getDoctors, getUsers } from '../api/demoApi';

/* One load for the whole dashboard: appointments, doctors and users.
   `reload()` is what the write flows call so new records show up immediately.

   What comes back depends on who is asking. An administrator loads the clinic;
   a patient loads their own bookings and nothing else — the request itself is
   scoped, so their browser never receives another patient's record to begin
   with. The API applies the same rule; this is not the only thing enforcing it. */
const useClinicData = ({ email, admin = false, token = '', ready = true } = {}) => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!ready) return;
    const [a, d, u] = await Promise.all([
      getAppointments({ email: admin ? undefined : email, token }),
      getDoctors(),
      admin ? getUsers(token) : Promise.resolve([]),   // the patient list is clinic data
    ]);
    setAppointments(Array.isArray(a) ? a : []);
    setDoctors(Array.isArray(d) ? d : []);
    setUsers(Array.isArray(u) ? u : []);
    setLoading(false);
  }, [email, admin, token, ready]);

  useEffect(() => {
    let alive = true;
    load().catch(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [load]);

  return { appointments, doctors, users, loading, reload: load };
};

export default useClinicData;
