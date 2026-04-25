import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const styles = `
  .db-wrap {
    min-height: calc(100vh - 72px);
    background: linear-gradient(120deg, #141414 0%, #1d1d1d 42%, #f5f0e8 42%, #f5f0e8 100%);
    padding: 28px;
    font-family: 'DM Sans', sans-serif;
  }
  .db-shell {
    max-width: 1140px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1.1fr 1fr;
    border: 1px solid rgba(0,0,0,0.08);
    overflow: hidden;
    background: #fff;
    box-shadow: 0 25px 55px rgba(0,0,0,0.16);
  }
  .db-left {
    background: #141414;
    color: #fff;
    padding: 40px;
  }
  .db-kicker {
    color: #c8b89a;
    font-size: 11px;
    letter-spacing: 2px;
    text-transform: uppercase;
    margin-bottom: 14px;
    font-weight: 700;
  }
  .db-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(32px, 4vw, 50px);
    line-height: 1.04;
    letter-spacing: -1px;
    margin-bottom: 10px;
  }
  .db-title em {
    color: #c8b89a;
    font-style: italic;
    font-weight: 600;
  }
  .db-sub {
    color: rgba(255,255,255,0.65);
    line-height: 1.7;
    max-width: 460px;
    margin-bottom: 22px;
    font-size: 14px;
  }
  .db-role {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 1.4px;
    border: 1px solid rgba(200,184,154,0.35);
    color: #c8b89a;
    padding: 8px 12px;
    background: rgba(200,184,154,0.08);
    margin-bottom: 18px;
  }
  .db-stats {
    margin-top: 24px;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }
  .db-stat {
    border: 1px solid rgba(255,255,255,0.12);
    padding: 14px;
    background: rgba(255,255,255,0.02);
  }
  .db-stat strong {
    display: block;
    font-family: 'Playfair Display', serif;
    font-size: 22px;
    color: #fff;
  }
  .db-stat span {
    font-size: 11px;
    color: rgba(255,255,255,0.54);
  }
  .db-right {
    background: #f5f0e8;
    padding: 34px;
  }
  .db-grid {
    display: grid;
    gap: 14px;
  }
  .db-card {
    display: block;
    border: 1px solid #d9ccb8;
    background: #fffaf3;
    padding: 18px;
    text-decoration: none;
    color: #1a1a1a;
    transition: all 0.2s ease;
  }
  .db-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 24px rgba(0,0,0,0.1);
    border-color: #b8967a;
  }
  .db-card h3 {
    font-family: 'Syne', sans-serif;
    font-size: 17px;
    margin-bottom: 8px;
    letter-spacing: 0.2px;
  }
  .db-card p {
    font-size: 13px;
    line-height: 1.65;
    color: #67584a;
  }
  .db-card small {
    margin-top: 10px;
    display: inline-block;
    font-size: 10px;
    letter-spacing: 1.4px;
    text-transform: uppercase;
    color: #8b6340;
    font-weight: 700;
  }
  @media (max-width: 980px) {
    .db-shell { grid-template-columns: 1fr; }
  }
`;

const roleCards = {
  USER: [
    { title: 'My Bookings', desc: 'View and manage your booking requests with approval status updates.', path: '/bookings', tag: 'Module B' },
    { title: 'My Tickets', desc: 'Track incident progress, technician comments, and resolutions.', path: '/tickets', tag: 'Module C' },
    { title: 'Facilities', desc: 'Browse available rooms, labs, and equipment catalogue.', path: '/facilities', tag: 'Module A' },
  ],
  TECHNICIAN: [
    { title: 'Incident Queue', desc: 'Review assigned incidents and move them through workflow stages.', path: '/tickets', tag: 'Module C' },
    { title: 'Facilities', desc: 'Check resources linked to active incidents and faults.', path: '/facilities', tag: 'Module A' },
    { title: 'Notifications', desc: 'Stay updated with ticket changes and comment events.', path: '/', tag: 'Module D' },
  ],
  MANAGER: [
    { title: 'Operations Overview', desc: 'Review booking and incident activity across the campus.', path: '/bookings', tag: 'Operations' },
    { title: 'Facilities', desc: 'Inspect resource usage and availability trends.', path: '/facilities', tag: 'Module A' },
    { title: 'Tickets', desc: 'Track escalated issues and resolution performance.', path: '/tickets', tag: 'Module C' },
  ],
  ADMIN: [
    { title: 'User Management', desc: 'Manage roles for users, technicians, and managers.', path: '/admin/users', tag: 'Module E' },
    { title: 'All Bookings', desc: 'Review requests and approve or reject bookings.', path: '/bookings', tag: 'Module B' },
    { title: 'Incidents Overview', desc: 'Monitor ticket lifecycle and technician updates.', path: '/tickets', tag: 'Module C' },
  ],
};

export default function DashboardPage() {
  const { user } = useContext(AuthContext);
  const cards = roleCards[user?.role] || roleCards.USER;

  return (
    <div className="db-wrap">
      <style>{styles}</style>
      <div className="db-shell">
        <div className="db-left">
          <div className="db-kicker">Smart Campus Operations Hub</div>
          <h1 className="db-title">
            Role-Aware <em>Dashboard</em>
          </h1>
          <p className="db-sub">
            Each user sees a dedicated workspace based on role permissions.
            This enforces assignment-ready access control while keeping workflows clear.
          </p>
          <div className="db-role">Current Role: {user?.role || 'USER'}</div>

          <div className="db-stats">
            <div className="db-stat">
              <strong>5</strong>
              <span>Core Modules</span>
            </div>
            <div className="db-stat">
              <strong>4+</strong>
              <span>Role Endpoints</span>
            </div>
            <div className="db-stat">
              <strong>OAuth2</strong>
              <span>Secured Login</span>
            </div>
          </div>
        </div>

        <div className="db-right">
          <div className="db-grid">
            {cards.map((card) => (
              <Link key={card.title} to={card.path} className="db-card">
                <h3>{card.title}</h3>
                <p>{card.desc}</p>
                <small>{card.tag || 'Smart Campus'}</small>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
