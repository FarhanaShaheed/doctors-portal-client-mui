import React, { useContext, useState } from 'react';
import { ClinicContext } from '../DashBoard/Dashboard';
import useAuth from '../../../hooks/useAuth';
import useReveal from '../../../hooks/useReveal';
import { makeAdmin } from '../../../api/demoApi';
import { IconShieldUser, IconCheck } from '../../Shared/Icons/Icons';

const initials = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?';

const MakeAdmin = () => {
  const { users, reload, loading } = useContext(ClinicContext);
  const { token } = useAuth();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  useReveal([loading, users.length]);

  const promote = async (value) => {
    if (!value) return;
    setBusy(true);
    await makeAdmin(value, token);
    await reload();
    setBusy(false);
    setStatus(`${value} now has administrator access.`);
    setEmail('');
  };

  return (
    <>
      <h1 className="dash-title">Make admin</h1>
      <p className="dash-lead">Grant a registered user administrator access to the clinic console.</p>

      <div className="dash-cols">
        <section className="panel dp-reveal">
          <div className="panel-head">
            <div>
              <h3>Promote by email</h3>
              <div className="sub">The user must already have an account.</div>
            </div>
          </div>

          <form
            className="dash-form"
            onSubmit={(e) => { e.preventDefault(); promote(email); }}
          >
            <div>
              <label htmlFor="ma-email">Email address</label>
              <input
                id="ma-email" className="dinput" type="email" required
                placeholder="name@example.com" value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button type="submit" className="dp-btn dp-btn-primary" disabled={busy}>
              {busy ? 'Granting…' : <><IconShieldUser size={17} /> Make admin</>}
            </button>
            {status && <div className="dash-alert ok"><IconCheck size={16} /> {status}</div>}
          </form>
        </section>

        <section className="panel dp-reveal dp-d1">
          <div className="panel-head">
            <div>
              <h3>Registered users</h3>
              <div className="sub">{users.filter((u) => u.admin).length} of {users.length} are administrators</div>
            </div>
          </div>

          <div className="dtable-wrap">
            <table className="dtable" style={{ minWidth: 420 }}>
              <thead>
                <tr><th>User</th><th>Role</th><th /></tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.email}>
                    <td>
                      <div className="who">
                        <span className="davatar">{initials(u.displayName)}</span>
                        <div>
                          <div style={{ fontWeight: 700 }}>{u.displayName}</div>
                          <div className="em">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className={`pill ${u.admin ? 'completed' : 'pending'}`}>{u.admin ? 'Admin' : 'Patient'}</span></td>
                    <td style={{ textAlign: 'right' }}>
                      {!u.admin && (
                        <button type="button" className="dp-btn dp-btn-ghost dp-btn-sm" onClick={() => promote(u.email)} disabled={busy}>
                          Promote
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
};

export default MakeAdmin;
