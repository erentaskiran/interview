// ui.jsx — shared primitives for AInterview artboards.
// Globalize at the end of the file.

const { useState } = React;

// ── icon set (24px stroke) ─────────────────────────────
const Icon = ({ name, size = 16, stroke = 1.6, style }) => {
  const paths = {
    home:      'M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1z',
    compass:   'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM10 14l1.5-4 4-1.5L14 12.5z',
    sparkle:   'M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6zM18 14l.9 2.6 2.6.9-2.6.9L18 21l-.9-2.6-2.6-.9 2.6-.9z',
    plus:      'M12 5v14M5 12h14',
    heart:     'M12 20s-7-4.35-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.65-7 10-7 10z',
    bookmark:  'M6 4h12v17l-6-4-6 4z',
    user:      'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0',
    settings:  'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 13.8l1.6.9-2 3.4-1.8-.7a8 8 0 0 1-2 1.2l-.3 1.9h-4l-.3-1.9a8 8 0 0 1-2-1.2l-1.8.7-2-3.4 1.6-.9a8 8 0 0 1 0-2.4l-1.6-.9 2-3.4 1.8.7a8 8 0 0 1 2-1.2l.3-1.9h4l.3 1.9a8 8 0 0 1 2 1.2l1.8-.7 2 3.4-1.6.9a8 8 0 0 1 0 2.4z',
    search:    'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3',
    bell:      'M6 16V10a6 6 0 0 1 12 0v6l1.5 2h-15zM10 20a2 2 0 0 0 4 0',
    mic:       'M12 4a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V7a3 3 0 0 0-3-3zM5 12a7 7 0 0 0 14 0M12 19v3',
    play:      'M7 5l12 7-12 7z',
    pause:     'M7 5h3v14H7zM14 5h3v14h-3z',
    stop:      'M6 6h12v12H6z',
    skip:      'M5 5l8 7-8 7zM15 5h2v14h-2z',
    arrow:     'M5 12h14M13 6l6 6-6 6',
    arrowL:    'M19 12H5M11 18l-6-6 6-6',
    check:     'M5 12.5L10 17l9-10',
    close:     'M6 6l12 12M18 6L6 18',
    more:      'M5 12h.01M12 12h.01M19 12h.01',
    chevron:   'M6 9l6 6 6-6',
    chevronR:  'M9 6l6 6-6 6',
    upload:    'M12 16V4M6 10l6-6 6 6M4 20h16',
    waveform:  'M3 12h2M7 8v8M11 4v16M15 8v8M19 12h2',
    star:      'M12 4l2.5 5.2 5.5.8-4 4 1 5.5L12 17l-5 2.5 1-5.5-4-4 5.5-.8z',
    book:      'M4 4h7a3 3 0 0 1 3 3v14a3 3 0 0 0-3-3H4zM20 4h-7a3 3 0 0 0-3 3v14a3 3 0 0 1 3-3h7z',
    edit:      'M4 20h4l11-11-4-4L4 16zM14 6l4 4',
    eye:       'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
    eyeOff:    'M3 3l18 18M10.6 6.2A10 10 0 0 1 12 6c6.5 0 10 6 10 6a17 17 0 0 1-3.2 3.9M6.3 7.8A17 17 0 0 0 2 12s3.5 6 10 6a10 10 0 0 0 3.7-.7M9.9 9.9a3 3 0 0 0 4.2 4.2',
    arrowU:    'M12 19V5M5 11l7-6 7 6',
    spark:     'M5 12h4l2-7 4 14 2-7h4',
    filter:    'M4 5h16l-6 8v6l-4-2v-4z',
    layers:    'M12 3l9 5-9 5-9-5zM3 13l9 5 9-5M3 17l9 5 9-5',
    flag:      'M5 21V4M5 4h12l-2 4 2 4H5',
    bolt:      'M13 3L4 14h7l-1 7 9-11h-7z',
    target:    'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z',
    clock:     'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
    pen:       'M4 20l4-1 11-11-3-3L5 16z',
    grid:      'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
    list:      'M4 6h2M10 6h10M4 12h2M10 12h10M4 18h2M10 18h10',
    download:  'M12 4v12M6 10l6 6 6-6M4 20h16',
    headset:   'M4 14v-3a8 8 0 0 1 16 0v3M4 14a2 2 0 0 0 2 2h1v-5H6a2 2 0 0 0-2 2zM20 14a2 2 0 0 1-2 2c0 2-2 4-5 4',
    chat:      'M21 12c0 4-4 7-9 7-1.2 0-2.3-.2-3.3-.5L4 20l1-3.7A7 7 0 0 1 3 12c0-4 4-7 9-7s9 3 9 7z',
    rubric:    'M4 5h16M4 12h10M4 19h16',
  };
  const d = paths[name] || '';
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
      style={{ flex: '0 0 auto', ...style }}>
      <path d={d} />
    </svg>
  );
};

// ── Logo ─────────────────────────────────────────────────
// soundwave bars + wordmark
const Wordmark = ({ size = 18, mono = false, color }) => {
  const bars = [4, 9, 14, 8, 11, 5];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.45 }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, color: color || 'var(--acc-deep)' }}>
        {bars.map((h, i) => (
          <span key={i} style={{
            width: Math.max(2, size * 0.13),
            height: (h / 14) * size * 1.1,
            background: 'currentColor',
            borderRadius: 2,
          }} />
        ))}
      </span>
      <span style={{
        fontFamily: mono ? 'var(--f-mono)' : 'var(--f-sans)',
        fontSize: size,
        fontWeight: 600,
        letterSpacing: '-0.025em',
        color: color || 'var(--ink-900)',
      }}>AInterview</span>
    </span>
  );
};

// ── Buttons ─────────────────────────────────────────────
const Button = ({ kind = 'primary', size, icon, iconRight, block, children, style, onClick }) => {
  const cls = ['btn', `btn--${kind}`];
  if (size === 'lg') cls.push('btn--lg');
  if (size === 'sm') cls.push('btn--sm');
  if (block) cls.push('btn--block');
  return (
    <button className={cls.join(' ')} style={style} onClick={onClick}>
      {icon && <Icon name={icon} size={size === 'lg' ? 18 : size === 'sm' ? 13 : 15} />}
      {children}
      {iconRight && <Icon name={iconRight} size={size === 'lg' ? 18 : size === 'sm' ? 13 : 15} />}
    </button>
  );
};

const IconBtn = ({ name, size, onClick, style }) => (
  <button className={`btn btn--ghost btn--icon${size === 'sm' ? ' btn--sm' : ''}`} onClick={onClick} style={style}>
    <Icon name={name} size={size === 'sm' ? 14 : 15} />
  </button>
);

// ── Chip / Badge ────────────────────────────────────────
const Chip = ({ kind, dot, children, style }) => (
  <span className={`chip${kind ? ' chip--' + kind : ''}${dot ? ' chip--dot' : ''}`} style={style}>{children}</span>
);

// ── Avatar ──────────────────────────────────────────────
const Avatar = ({ name = 'AB', tone = 'a', size }) => (
  <span className={`av av--${tone}${size === 'sm' ? ' av--sm' : ''}${size === 'lg' ? ' av--lg' : ''}${size === 'xl' ? ' av--xl' : ''}`}>{name}</span>
);

// ── Input ───────────────────────────────────────────────
const Input = ({ icon, placeholder, value, focus, error, disabled, suffix, style, type = 'text' }) => {
  const cls = ['input'];
  if (focus) cls.push('input--focus');
  if (error) cls.push('input--err');
  if (disabled) cls.push('input--disabled');
  return (
    <div className={cls.join(' ')} style={style}>
      {icon && <Icon name={icon} size={14} style={{ color: 'var(--ink-500)' }} />}
      <input type={type} placeholder={placeholder} defaultValue={value} readOnly disabled={disabled}
        style={{ width: '100%' }} />
      {suffix && <span className="micro">{suffix}</span>}
    </div>
  );
};

const Field = ({ label, hint, error, children, optional }) => (
  <div className="field">
    {label && (
      <div className="label">
        <span>{label}</span>
        {optional && <span className="label__hint">Optional</span>}
      </div>
    )}
    {children}
    {hint && <div className={`hint${error ? ' hint--err' : ''}`}>{hint}</div>}
  </div>
);

// ── Wave (decorative) ───────────────────────────────────
const Wave = ({ bars = 28, color = 'currentColor', max = 16, seed = 1, style }) => {
  const heights = [];
  let s = seed * 9301;
  for (let i = 0; i < bars; i++) {
    s = (s * 9301 + 49297) % 233280;
    heights.push(3 + (s / 233280) * max);
  }
  return (
    <span className="wave" style={{ color, ...style }}>
      {heights.map((h, i) => <i key={i} style={{ height: h }} />)}
    </span>
  );
};

// ── Sidebar (used by most pages) ────────────────────────
const Sidebar = ({ active = 'discover', user = { name: 'Maya Hoxha', sub: 'Product PM' } }) => (
  <aside className="side">
    <div className="side__brand"><Wordmark size={17} /></div>
    <div className="side__nav">
      <NavItem id="discover" active={active} icon="compass" label="Discover" />
      <NavItem id="my"       active={active} icon="bookmark" label="My templates" badge="6" />
      <NavItem id="liked"    active={active} icon="heart"    label="Liked" />
      <NavItem id="sessions" active={active} icon="headset"  label="Sessions" badge="3" />
    </div>
    <div className="side__group">Practice</div>
    <div className="side__nav">
      <NavItem id="create" active={active} icon="plus" label="Create template" />
      <NavItem id="quick"  active={active} icon="bolt" label="Quick interview" />
    </div>
    <div className="side__group">Account</div>
    <div className="side__nav">
      <NavItem id="profile"  active={active} icon="user" label="Profile" />
      <NavItem id="settings" active={active} icon="settings" label="Settings" />
    </div>
    <div className="side__user">
      <Avatar name="MH" tone="a" />
      <div style={{ minWidth: 0 }}>
        <div className="side__user__name">{user.name}</div>
        <div className="side__user__hint">{user.sub}</div>
      </div>
      <Icon name="chevron" size={14} style={{ marginLeft: 'auto', color: 'var(--ink-500)' }} />
    </div>
  </aside>
);

const NavItem = ({ id, active, icon, label, badge }) => (
  <a className={`side__item${active === id ? ' is-active' : ''}`}>
    <Icon name={icon} size={15} />
    <span>{label}</span>
    {badge && <span className="badge">{badge}</span>}
  </a>
);

// ── Topbar (used by app pages) ──────────────────────────
const Topbar = ({ title, crumb, actions, hideSearch }) => (
  <header className="top">
    {crumb && (
      <span className="small" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        {crumb.map((c, i) => (
          <React.Fragment key={i}>
            {i > 0 && <Icon name="chevronR" size={12} style={{ color: 'var(--ink-400)' }} />}
            <span style={{ color: i === crumb.length - 1 ? 'var(--ink-900)' : 'var(--ink-500)', fontWeight: i === crumb.length - 1 ? 500 : 400 }}>{c}</span>
          </React.Fragment>
        ))}
      </span>
    )}
    {!crumb && title && <span className="h3" style={{ fontWeight: 500 }}>{title}</span>}
    {!hideSearch && (
      <div className="top__search" style={{ marginLeft: crumb || title ? 24 : 0 }}>
        <Icon name="search" size={14} />
        <span>Search templates, prompts, people…</span>
        <span className="top__kbd">⌘K</span>
      </div>
    )}
    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
      {actions}
      <IconBtn name="bell" />
      <Avatar name="MH" tone="a" />
    </div>
  </header>
);

// ── Globals ─────────────────────────────────────────────
Object.assign(window, {
  Icon, Wordmark, Button, IconBtn, Chip, Avatar, Input, Field, Wave,
  Sidebar, NavItem, Topbar,
});
