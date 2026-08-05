import React, { useState } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import loginArt from '../../../images/login.png';
import useAuth from './../../../hooks/useAuth';
import { IconArrow, IconGoogle, IconTooth } from '../../Shared/Icons/Icons';

const Login = () => {
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [submitted, setSubmitted] = useState(false);
  const { user, loginUser, isLoading, signInWithGoogle, authError, demoMode } = useAuth();
  const location = useLocation();
  const history = useHistory();

  const change = (e) => setLoginData({ ...loginData, [e.target.name]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    loginUser(loginData.email, loginData.password, location, history);
  };

  return (
    <div className="dp-auth">
      <aside className="dp-auth-side">
        <Link to="/" className="dp-brand" style={{ color: '#fff' }}>
          <span className="dp-logo"><IconTooth size={21} /></span>
          <span>Doctors Portal<small>Dental care</small></span>
        </Link>

        <div>
          <h2>Welcome back to<br />your dental care.</h2>
          <p>
            Sign in to see your upcoming appointments, book a new slot or open the
            clinic dashboard.
          </p>
          <img src={loginArt} alt="" />
        </div>

        <p style={{ fontSize: '.82rem', color: '#8189ad' }}>© {new Date().getFullYear()} Doctors Portal</p>
      </aside>

      <main className="dp-auth-main">
        <div className="dp-auth-card">
          <h2>Log in</h2>
          <p className="sub">Enter your details to continue.</p>

          {demoMode && (
            <div className="dp-alert dp-alert-info dp-demo-note">
              <b>Demo mode.</b> No Firebase keys are configured, so <b>any</b> email and
              password will sign you in — and the demo account has admin rights, so the
              full dashboard is explorable.
            </div>
          )}

          <form onSubmit={submit}>
            <div className="dp-field">
              <label htmlFor="l-email">Email address</label>
              <input
                id="l-email" className="dp-input" name="email" type="email" required
                autoComplete="username" placeholder="you@example.com"
                value={loginData.email} onChange={change}
              />
            </div>
            <div className="dp-field">
              <label htmlFor="l-password">Password</label>
              <input
                id="l-password" className="dp-input" name="password" type="password" required
                autoComplete="current-password" placeholder="••••••••"
                value={loginData.password} onChange={change}
              />
            </div>

            {authError && <div className="dp-alert dp-alert-err">{authError}</div>}
            {submitted && user?.email && <div className="dp-alert dp-alert-ok">Signed in as {user.email}</div>}

            <button type="submit" className="dp-btn dp-btn-primary dp-btn-block" disabled={isLoading}>
              {isLoading ? 'Signing in…' : <>Log in <IconArrow size={18} /></>}
            </button>
          </form>

          <div className="dp-divider">or</div>

          <button
            type="button"
            className="dp-btn dp-btn-ghost dp-btn-block"
            onClick={() => signInWithGoogle(location, history)}
          >
            <IconGoogle size={18} /> Continue with Google
          </button>

          <p className="dp-auth-foot">
            New here? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Login;
