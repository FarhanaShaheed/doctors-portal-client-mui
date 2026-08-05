import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import loginArt from '../../../images/login.png';
import useAuth from './../../../hooks/useAuth';
import { IconArrow, IconTooth } from '../../Shared/Icons/Icons';

const Register = () => {
  const [data, setData] = useState({ name: '', email: '', password: '', password2: '' });
  const [mismatch, setMismatch] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const history = useHistory();
  const { user, registerUser, isLoading, authError, demoMode } = useAuth();

  const change = (e) => setData({ ...data, [e.target.name]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    if (data.password !== data.password2) {
      setMismatch('The two passwords do not match.');
      return;
    }
    setMismatch('');
    setSubmitted(true);
    registerUser(data.email, data.password, data.name, history);
  };

  return (
    <div className="dp-auth">
      <aside className="dp-auth-side">
        <Link to="/" className="dp-brand" style={{ color: '#fff' }}>
          <span className="dp-logo"><IconTooth size={21} /></span>
          <span>Doctors Portal<small>Dental care</small></span>
        </Link>

        <div>
          <h2>One account for<br />your whole clinic.</h2>
          <p>
            Create an account to book appointments, track your treatment history
            and — if you are staff — run the clinic dashboard.
          </p>
          <img src={loginArt} alt="" />
        </div>

        <p style={{ fontSize: '.82rem', color: '#8189ad' }}>© {new Date().getFullYear()} Doctors Portal</p>
      </aside>

      <main className="dp-auth-main">
        <div className="dp-auth-card">
          <h2>Create your account</h2>
          <p className="sub">It takes about thirty seconds.</p>

          {demoMode && (
            <div className="dp-alert dp-alert-info dp-demo-note">
              <b>Demo mode.</b> No Firebase keys configured — your details stay in this
              browser only and you are signed straight in as an admin.
            </div>
          )}

          <form onSubmit={submit}>
            <div className="dp-field">
              <label htmlFor="r-name">Full name</label>
              <input id="r-name" className="dp-input" name="name" required placeholder="Your name" value={data.name} onChange={change} />
            </div>
            <div className="dp-field">
              <label htmlFor="r-email">Email address</label>
              <input id="r-email" className="dp-input" name="email" type="email" required autoComplete="username" placeholder="you@example.com" value={data.email} onChange={change} />
            </div>
            <div className="dp-two">
              <div className="dp-field">
                <label htmlFor="r-pass">Password</label>
                <input id="r-pass" className="dp-input" name="password" type="password" required autoComplete="new-password" placeholder="••••••••" value={data.password} onChange={change} />
              </div>
              <div className="dp-field">
                <label htmlFor="r-pass2">Repeat password</label>
                <input id="r-pass2" className="dp-input" name="password2" type="password" required autoComplete="new-password" placeholder="••••••••" value={data.password2} onChange={change} />
              </div>
            </div>

            {mismatch && <div className="dp-alert dp-alert-err">{mismatch}</div>}
            {authError && <div className="dp-alert dp-alert-err">{authError}</div>}
            {submitted && user?.email && <div className="dp-alert dp-alert-ok">Account created for {user.email}</div>}

            <button type="submit" className="dp-btn dp-btn-primary dp-btn-block" disabled={isLoading}>
              {isLoading ? 'Creating…' : <>Create account <IconArrow size={18} /></>}
            </button>
          </form>

          <p className="dp-auth-foot">
            Already registered? <Link to="/login">Log in instead</Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Register;
