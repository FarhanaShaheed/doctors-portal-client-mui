import React, { useState } from 'react';
import { Link, NavLink, useHistory } from 'react-router-dom';
import useAuth from './../../../hooks/useAuth';
import { IconTooth, IconMenu } from '../Icons/Icons';

const initialsOf = (user) => {
  const source = user?.displayName || user?.email || '';
  const parts = source.replace(/@.*/, '').split(/[.\s_-]+/).filter(Boolean);
  return (parts.slice(0, 2).map((p) => p[0]).join('') || 'U').toUpperCase();
};

const Navigation = () => {
  const { user, logOut } = useAuth();
  const [open, setOpen] = useState(false);
  const history = useHistory();
  const close = () => setOpen(false);

  const handleLogout = () => {
    close();
    logOut();
    history.push('/');
  };

  return (
    <header className="dp-nav">
      <div className="dp-wrap dp-nav-inner">
        <Link to="/" className="dp-brand" onClick={close}>
          <span className="dp-logo"><IconTooth size={21} /></span>
          <span>
            Doctors Portal
            <small>Dental care</small>
          </span>
        </Link>

        <button
          type="button"
          className="dp-nav-toggle"
          aria-label="Toggle navigation"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <IconMenu size={22} />
        </button>

        <nav className={`dp-nav-links${open ? ' open' : ''}`}>
          <NavLink exact to="/" className="dp-nav-link" activeClassName="active" onClick={close}>Home</NavLink>
          <Link to="/appointment" className="dp-nav-link" onClick={close}>Appointment</Link>
          <a href="/#services" className="dp-nav-link" onClick={close}>Services</a>
          <a href="/#contact" className="dp-nav-link" onClick={close}>Contact</a>

          {user?.email ? (
            <div className="dp-nav-user">
              <NavLink to="/dashboard" className="dp-btn dp-btn-primary dp-btn-sm" onClick={close}>Dashboard</NavLink>
              <button type="button" className="dp-btn dp-btn-ghost dp-btn-sm" onClick={handleLogout}>Log out</button>
              <span className="dp-avatar" title={user.email}>{initialsOf(user)}</span>
            </div>
          ) : (
            <div className="dp-nav-user">
              <NavLink to="/login" className="dp-nav-link" onClick={close}>Log in</NavLink>
              <NavLink to="/register" className="dp-btn dp-btn-primary dp-btn-sm" onClick={close}>Get started</NavLink>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navigation;
