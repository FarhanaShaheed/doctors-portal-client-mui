import React, { createContext, useEffect, useState } from 'react';
import { Link, NavLink, Route, Switch, useLocation, useRouteMatch } from 'react-router-dom';

import DashBoardHome from './../DashBoardHome/DashBoardHome';
import Appointments from '../Appointments/Appointments';
import MyAppointments from '../MyAppointments/MyAppointments';
import Doctors from '../Doctors/Doctors';
import MakeAdmin from './../MakeAdmin/MakeAdmin';
import AddDoctor from './AddDoctor/AddDoctor';
import AdminRoute from '../../Login/AdminRoute/AdminRoute';
import useAuth from '../../../hooks/useAuth';
import useClinicData from '../../../hooks/useClinicData';
import {
  IconGrid, IconCalendar, IconStethoscope, IconShieldUser, IconPlus,
  IconSearch, IconMenu, IconTooth, IconLogout, IconArrow, IconCheck,
} from '../../Shared/Icons/Icons';

export const ClinicContext = createContext({ appointments: [], doctors: [], users: [], loading: true, reload: () => {}, search: '' });

const initialsOf = (user) => {
  const source = user?.displayName || user?.email || '';
  const parts = source.replace(/@.*/, '').split(/[.\s_-]+/).filter(Boolean);
  return (parts.slice(0, 2).map((p) => p[0]).join('') || 'U').toUpperCase();
};

function Dashboard() {
  const { path, url } = useRouteMatch();
  const location = useLocation();
  const { user, admin, logOut, demoMode } = useAuth();
  const clinic = useClinicData();

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  // close the mobile drawer whenever the route changes
  useEffect(() => { setOpen(false); }, [location.pathname]);

  const links = [
    { to: url, exact: true, label: 'Overview', icon: <IconGrid size={19} /> },
    { to: `${url}/appointments`, label: 'Appointments', icon: <IconCalendar size={19} /> },
    { to: `${url}/my-appointments`, label: 'My appointments', icon: <IconCheck size={19} /> },
    { to: `${url}/doctors`, label: 'Doctors', icon: <IconStethoscope size={19} /> },
  ];
  const adminLinks = [
    { to: `${url}/makeAdmin`, label: 'Make admin', icon: <IconShieldUser size={19} /> },
    { to: `${url}/addDoctor`, label: 'Add doctor', icon: <IconPlus size={19} /> },
  ];

  return (
    <ClinicContext.Provider value={{ ...clinic, search }}>
      <div className="dash">
        {open && <div className="dash-scrim" onClick={() => setOpen(false)} />}

        <aside className={`dash-side${open ? ' open' : ''}`}>
          <Link to="/" className="brand">
            <span className="dp-logo"><IconTooth size={21} /></span>
            <span className="nm">
              Doctors Portal
              <small>Clinic console</small>
            </span>
          </Link>

          <nav className="dash-nav">
            <div className="sec">Clinic</div>
            {links.map((l) => (
              <NavLink key={l.label} to={l.to} exact={l.exact} className="dash-link" activeClassName="active">
                {l.icon}{l.label}
              </NavLink>
            ))}

            {admin && (
              <>
                <div className="sec">Administration</div>
                {adminLinks.map((l) => (
                  <NavLink key={l.label} to={l.to} className="dash-link" activeClassName="active">
                    {l.icon}{l.label}
                  </NavLink>
                ))}
              </>
            )}

            <div className="sec">Public site</div>
            <Link to="/appointment" className="dash-link"><IconArrow size={19} />Book a slot</Link>
            <button type="button" className="dash-link" onClick={logOut} style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', font: 'inherit' }}>
              <IconLogout size={19} />Log out
            </button>
          </nav>

          <div className="dash-side-foot">
            <div className="dash-side-card">
              <b>{demoMode ? 'Demo dataset' : 'Live clinic'}</b>
              {demoMode
                ? 'Sample data ships with the app and every booking you make is saved in this browser.'
                : 'Connected to the clinic API.'}
            </div>
          </div>
        </aside>

        <div className="dash-main">
          <header className="dash-top">
            <button type="button" className="dash-burger" aria-label="Open menu" onClick={() => setOpen(true)}>
              <IconMenu size={20} />
            </button>

            <div className="dash-search">
              <IconSearch size={17} />
              <input
                type="search"
                placeholder="Search patients, services or doctors…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search the clinic"
              />
            </div>

            <div className="dash-top-right">
              {demoMode && (
                <span className="dash-pill" title="Demo mode — running on bundled sample data, no backend required">
                  <i className="dot" /><span>Demo mode</span>
                </span>
              )}
              <div className="dash-user">
                <div className="meta">
                  <div className="nm">{user?.displayName || 'Clinic user'}</div>
                  <div className="em">{admin ? 'Administrator' : 'Patient'}</div>
                </div>
                <span className="dp-avatar" title={user?.email}>{initialsOf(user)}</span>
              </div>
            </div>
          </header>

          <div className="dash-body">
            <Switch>
              <Route exact path={path}><DashBoardHome /></Route>
              <Route path={`${path}/appointments`}><Appointments /></Route>
              <Route path={`${path}/my-appointments`}><MyAppointments /></Route>
              <Route path={`${path}/doctors`}><Doctors /></Route>
              <AdminRoute path={`${path}/makeAdmin`}><MakeAdmin /></AdminRoute>
              <AdminRoute path={`${path}/addDoctor`}><AddDoctor /></AdminRoute>
            </Switch>
          </div>
        </div>
      </div>
    </ClinicContext.Provider>
  );
}

export default Dashboard;
