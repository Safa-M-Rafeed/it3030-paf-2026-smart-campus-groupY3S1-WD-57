import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;0,900;1,400;1,600&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=Syne:wght@600;700;800&display=swap');

  .db-wrap {
    display: grid;
    grid-template-columns: 1.1fr 0.9fr;
    min-height: calc(100vh - 72px);
    font-family: 'DM Sans', sans-serif;
    overflow: hidden;
  }

  /* ── LEFT PANEL ── */
  .db-left {
    background: #141414;
    color: #fff;
    padding: 44px 52px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
    overflow: hidden;
  }
  .db-left::after {
    content: '';
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      -55deg, transparent, transparent 80px,
      rgba(255,255,255,0.012) 80px, rgba(255,255,255,0.012) 81px
    );
    pointer-events: none;
  }
  .db-ghost {
    position: absolute;
    bottom: -40px; left: -16px;
    font-family: 'Syne', sans-serif;
    font-size: 148px; font-weight: 800;
    color: rgba(255,255,255,0.028);
    line-height: 0.85; letter-spacing: -8px;
    pointer-events: none; user-select: none;
    white-space: nowrap;
  }

  /* Brand bar */
  .db-topbar {
    display: flex; align-items: center; justify-content: space-between;
    position: relative; z-index: 2;
    animation: dbFadeUp 0.5s ease both;
  }
  .db-brand { display: flex; align-items: center; gap: 12px; }
  .db-brand-box {
    width: 36px; height: 36px;
    background: #F5F0E8;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Playfair Display', serif;
    font-size: 15px; font-weight: 900; color: #141414;
  }
  .db-brand-name {
    font-family: 'Syne', sans-serif;
    font-size: 13px; font-weight: 700;
    letter-spacing: 1.5px;
    color: rgba(255,255,255,0.55);
    text-transform: uppercase;
  }
  .db-brand-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: #C8B89A;
    box-shadow: 0 0 10px rgba(200,184,154,0.6);
    animation: dbPulse 2.5s ease-in-out infinite;
  }

  /* Hero section */
  .db-hero {
    flex: 1;
    display: flex; flex-direction: column; justify-content: center;
    padding: 40px 0 28px;
    position: relative; z-index: 2;
  }
  .db-eyebrow {
    font-size: 11px; font-weight: 600;
    letter-spacing: 2.5px; color: #C8B89A;
    text-transform: uppercase;
    margin-bottom: 18px;
    display: flex; align-items: center; gap: 10px;
    animation: dbFadeUp 0.5s 0.1s ease both;
  }
  .db-eyebrow::before {
    content: ''; display: block;
    width: 24px; height: 1px; background: #C8B89A;
  }
  .db-headline {
    font-family: 'Playfair Display', serif;
    font-size: clamp(36px, 3.5vw, 52px);
    font-weight: 900; line-height: 1.02;
    letter-spacing: -1.5px; color: #FFFFFF;
    margin-bottom: 20px;
    animation: dbFadeUp 0.5s 0.15s ease both;
  }
  .db-headline em { font-style: italic; font-weight: 600; color: #C8B89A; }

  /* Role badge */
  .db-role-badge {
    display: inline-flex;
    align-items: center; gap: 8px;
    font-size: 11px; font-weight: 600;
    letter-spacing: 1.8px; text-transform: uppercase;
    border: 1px solid rgba(200,184,154,0.3);
    color: #C8B89A;
    padding: 8px 14px;
    background: rgba(200,184,154,0.07);
    margin-bottom: 28px;
    width: fit-content;
    animation: dbFadeUp 0.5s 0.2s ease both;
  }
  .db-role-dot {
    width: 5px; height: 5px; border-radius: 50%;
    background: #C8B89A;
    animation: dbPulse 2.5s ease-in-out infinite;
  }

  /* Module list */
  .db-modules { position: relative; z-index: 2; animation: dbFadeUp 0.5s 0.25s ease both; }
  .db-modules-hdr {
    font-size: 10px; font-weight: 600; letter-spacing: 2px;
    color: rgba(255,255,255,0.2); text-transform: uppercase;
    margin-bottom: 10px;
  }
  .db-mod-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 10px 0;
    border-top: 1px solid rgba(255,255,255,0.06);
    transition: padding-left 0.2s;
    cursor: default;
  }
  .db-mod-row:last-child { border-bottom: 1px solid rgba(255,255,255,0.06); }
  .db-mod-row:hover { padding-left: 8px; }
  .db-mod-row:hover .db-mod-name { color: #fff; }
  .db-mod-left { display: flex; align-items: center; gap: 12px; }
  .db-mod-num {
    font-family: 'Playfair Display', serif;
    font-size: 11px; font-style: italic;
    color: rgba(255,255,255,0.2); width: 20px;
  }
  .db-mod-name {
    font-size: 13px; font-weight: 500;
    color: rgba(255,255,255,0.65);
    transition: color 0.2s;
  }
  .db-mod-tag {
    font-size: 9px; font-weight: 700;
    letter-spacing: 1.5px; color: rgba(200,184,154,0.6);
    text-transform: uppercase;
    background: rgba(200,184,154,0.06);
    padding: 3px 8px;
    border: 1px solid rgba(200,184,154,0.12);
  }

  /* Stats bar */
  .db-stats {
    display: flex;
    border-top: 1px solid rgba(255,255,255,0.06);
    padding-top: 22px;
    position: relative; z-index: 2;
    animation: dbFadeUp 0.5s 0.3s ease both;
  }
  .db-stat { flex: 1; text-align: center; }
  .db-stat + .db-stat { border-left: 1px solid rgba(255,255,255,0.06); }
  .db-stat-n {
    font-family: 'Playfair Display', serif;
    font-size: 20px; font-weight: 700; color: #fff;
  }
  .db-stat-l { font-size: 10px; color: rgba(255,255,255,0.25); margin-top: 3px; letter-spacing: 0.5px; }

  /* ── RIGHT PANEL ── */
  .db-right {
    background: #F5F0E8;
    padding: 44px 48px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }
  .db-deco {
    position: absolute; border-radius: 50%;
    border: 1px solid rgba(26,26,26,0.06);
    pointer-events: none;
  }
  .db-deco-1 { width: 400px; height: 400px; top: -160px; right: -160px; }
  .db-deco-2 { width: 600px; height: 600px; top: -260px; right: -260px; }
  .db-deco-3 { width: 800px; height: 800px; top: -360px; right: -360px; }

  .db-right-inner {
    position: relative; z-index: 2;
    animation: dbFadeUp 0.5s 0.2s ease both;
  }
  .db-right-eyebrow {
    font-size: 10px; font-weight: 700; letter-spacing: 2.5px;
    color: #B8967A; text-transform: uppercase;
    margin-bottom: 12px;
    display: flex; align-items: center; gap: 10px;
  }
  .db-right-eyebrow::before { content: ''; display: block; width: 20px; height: 1px; background: #B8967A; }
  .db-right-title {
    font-family: 'Playfair Display', serif;
    font-size: 32px; font-weight: 900;
    letter-spacing: -1px; color: #141414;
    margin-bottom: 4px; line-height: 1.1;
  }
  .db-right-title em { font-style: italic; font-weight: 600; color: #8B6340; }
  .db-right-sub {
    font-size: 13.5px; color: #9B8B7A;
    margin-bottom: 28px; font-weight: 300; line-height: 1.5;
  }

  /* Cards */
  .db-grid {
    display: grid;
    gap: 10px;
  }
  .db-card {
    display: block;
    border: 1.5px solid #D4C9B5;
    background: #fffaf3;
    padding: 18px 20px;
    text-decoration: none;
    color: #1a1a1a;
    position: relative;
    overflow: hidden;
    transition: all 0.25s ease;
  }
  .db-card::before {
    content: '';
    position: absolute; left: 0; top: 0; bottom: 0; width: 0;
    background: #141414;
    transition: width 0.3s ease; z-index: 0;
  }
  .db-card:hover::before { width: 4px; }
  .db-card:hover {
    transform: translateX(4px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.1);
    border-color: #8B6340;
  }
  .db-card:hover .db-card-title { color: #8B6340; }
  .db-card-inner { position: relative; z-index: 1; }
  .db-card-top {
    display: flex; align-items: flex-start; justify-content: space-between;
    margin-bottom: 6px;
  }
  .db-card-title {
    font-family: 'Syne', sans-serif;
    font-size: 15px; font-weight: 700;
    letter-spacing: 0.2px;
    color: #141414;
    transition: color 0.2s;
  }
  .db-card-tag {
    font-size: 9px; font-weight: 700;
    letter-spacing: 1.5px; color: rgba(139,99,64,0.7);
    text-transform: uppercase;
    background: rgba(200,184,154,0.15);
    padding: 3px 8px;
    border: 1px solid rgba(200,184,154,0.3);
    white-space: nowrap;
    margin-left: 10px;
    margin-top: 2px;
  }
  .db-card-desc {
    font-size: 13px;
    line-height: 1.65;
    color: #67584a;
    font-weight: 300;
  }
  .db-card-arrow {
    position: absolute; right: 20px; bottom: 18px;
    font-size: 16px; color: rgba(139,99,64,0.4);
    transition: all 0.2s;
  }
  .db-card:hover .db-card-arrow {
    color: #8B6340;
    transform: translateX(3px);
  }

  .db-version {
    position: absolute; bottom: 20px; right: 24px;
    font-size: 10px; color: #C4B5A0; letter-spacing: 1px;
    font-family: 'DM Sans', sans-serif;
  }

  @media (max-width: 900px) {
    .db-wrap { grid-template-columns: 1fr; }
    .db-left { min-height: 40vh; }
  }

  @keyframes dbFadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes dbPulse {
    0%,100% { opacity: 1; transform: scale(1); }
    50%     { opacity: 0.5; transform: scale(0.8); }
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

const moduleList = [
  { num: 'i.',   name: 'Facilities & Booking',  tag: 'Module A+B' },
  { num: 'ii.',  name: 'Incident Ticketing',     tag: 'Module C'   },
  { num: 'iii.', name: 'Notifications & OAuth',  tag: 'Module D+E' },
  { num: 'iv.',  name: 'Reports & Analytics',    tag: 'Module F'   },
];

export default function DashboardPage() {
  const { user } = useContext(AuthContext);
  const cards = roleCards[user?.role] || roleCards.USER;
  const role = user?.role || 'USER';
  const name = user?.name?.split(' ')[0] || 'there';

  return (
    <div className="db-wrap">
      <style>{styles}</style>

      {/* ── LEFT PANEL ── */}
      <div className="db-left">
        <div className="db-ghost">SMART{'\n'}CAMPUS</div>

        <div className="db-topbar">
          <div className="db-brand">
            <div className="db-brand-box">S</div>
            <div className="db-brand-name">SmartCampus Hub</div>
          </div>
          <div className="db-brand-dot" />
        </div>

        <div className="db-hero">
          <div className="db-eyebrow">Smart Campus Operations Hub</div>
          <div className="db-headline">
            Hello,<br />
            <em>{name}.</em>
          </div>
          <div className="db-role-badge">
            <span className="db-role-dot" />
            {role}
          </div>
        </div>

        <div className="db-modules">
          <div className="db-modules-hdr">System Modules</div>
          {moduleList.map(m => (
            <div className="db-mod-row" key={m.num}>
              <div className="db-mod-left">
                <span className="db-mod-num">{m.num}</span>
                <span className="db-mod-name">{m.name}</span>
              </div>
              <span className="db-mod-tag">{m.tag}</span>
            </div>
          ))}
        </div>

        <div className="db-stats">
          {[['5','Modules'],['4+','Roles'],['35+','Endpoints'],['OAuth2','Auth']].map(([n,l]) => (
            <div className="db-stat" key={l}>
              <div className="db-stat-n">{n}</div>
              <div className="db-stat-l">{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="db-right">
        <div className="db-deco db-deco-1" />
        <div className="db-deco db-deco-2" />
        <div className="db-deco db-deco-3" />

        <div className="db-right-inner">
          <div className="db-right-eyebrow">Your Workspace</div>
          <div className="db-right-title">
            Quick<br /><em>access.</em>
          </div>
          <div className="db-right-sub">
            Role-based shortcuts tailored to your permissions.
          </div>

          <div className="db-grid">
            {cards.map((card) => (
              <Link key={card.title} to={card.path} className="db-card">
                <div className="db-card-inner">
                  <div className="db-card-top">
                    <div className="db-card-title">{card.title}</div>
                    <span className="db-card-tag">{card.tag}</span>
                  </div>
                  <div className="db-card-desc">{card.desc}</div>
                </div>
                <span className="db-card-arrow">→</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="db-version">IT3030 · SLIIT · 2026</div>
      </div>
    </div>
  );
}