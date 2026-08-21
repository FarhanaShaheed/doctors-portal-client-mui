import React, { useContext, useState } from 'react';
import { ClinicContext } from '../Dashboard';
import useReveal from '../../../../hooks/useReveal';
import useAuth from '../../../../hooks/useAuth';
import { createDoctor } from '../../../../api/demoApi';
import { IconCheck, IconPlus } from '../../../Shared/Icons/Icons';

const SPECIALITIES = [
  'Orthodontics',
  'Oral Surgery',
  'Pediatric Dentistry',
  'Cosmetic Dentistry',
  'Endodontics',
  'Periodontics',
];

const empty = { name: '', speciality: SPECIALITIES[0], email: '', phone: '', experience: 5 };

const AddDoctor = () => {
  const { doctors, reload } = useContext(ClinicContext);
  const { token } = useAuth();
  const [form, setForm] = useState(empty);
  const [busy, setBusy] = useState(false);
  const [added, setAdded] = useState('');

  useReveal([added]);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    const created = await createDoctor({ ...form, experience: Number(form.experience) || 1 }, token);
    await reload();
    setBusy(false);
    setAdded(created.name);
    setForm(empty);
  };

  return (
    <>
      <h1 className="dash-title">Add a doctor</h1>
      <p className="dash-lead">New specialists appear on the rota and become bookable immediately.</p>

      <div className="dash-cols">
        <section className="panel dp-reveal">
          <div className="panel-head">
            <div>
              <h3>Doctor details</h3>
              <div className="sub">{doctors.length} currently on the rota</div>
            </div>
          </div>

          <form className="dash-form" onSubmit={submit}>
            <div>
              <label htmlFor="ad-name">Full name</label>
              <input id="ad-name" className="dinput" name="name" required placeholder="Dr. Jane Doe" value={form.name} onChange={change} />
            </div>

            <div>
              <label htmlFor="ad-spec">Speciality</label>
              <select id="ad-spec" className="dinput" name="speciality" value={form.speciality} onChange={change}>
                {SPECIALITIES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label htmlFor="ad-email">Email</label>
              <input id="ad-email" className="dinput" name="email" type="email" required placeholder="jane.doe@doctorsportal.demo" value={form.email} onChange={change} />
            </div>

            <div>
              <label htmlFor="ad-phone">Phone</label>
              <input id="ad-phone" className="dinput" name="phone" required placeholder="+49 69 1200 4400" value={form.phone} onChange={change} />
            </div>

            <div>
              <label htmlFor="ad-exp">Years of experience</label>
              <input id="ad-exp" className="dinput" name="experience" type="number" min="1" max="50" value={form.experience} onChange={change} />
            </div>

            <button type="submit" className="dp-btn dp-btn-primary" disabled={busy}>
              {busy ? 'Saving…' : <><IconPlus size={17} /> Add to rota</>}
            </button>

            {added && (
              <div className="dash-alert ok"><IconCheck size={16} /> {added} was added to the rota.</div>
            )}
          </form>
        </section>

        <section className="panel dp-reveal dp-d1">
          <div className="panel-head">
            <div>
              <h3>Current rota</h3>
              <div className="sub">Newest first</div>
            </div>
          </div>
          <div className="bars">
            {doctors.slice(0, 8).map((d) => (
              <div className="bar-row" key={d.id || d.email} style={{ alignItems: 'center' }}>
                <span className="nm" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className={`davatar ${d.tone || ''}`} style={{ width: 28, height: 28, fontSize: '.66rem' }}>{d.initials}</span>
                  {d.name}
                </span>
                <span className="vl">{d.speciality}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
};

export default AddDoctor;
