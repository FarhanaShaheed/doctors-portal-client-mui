import { useCallback, useEffect, useState } from 'react';
import { getAppointments, getDoctors, getUsers } from '../api/demoApi';

/* One load for the whole dashboard: appointments, doctors and users.
   `reload()` is what the write flows call so new records show up immediately. */
const useClinicData = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [a, d, u] = await Promise.all([getAppointments(), getDoctors(), getUsers()]);
    setAppointments(Array.isArray(a) ? a : []);
    setDoctors(Array.isArray(d) ? d : []);
    setUsers(Array.isArray(u) ? u : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    let alive = true;
    load().catch(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [load]);

  return { appointments, doctors, users, loading, reload: load };
};

export default useClinicData;
