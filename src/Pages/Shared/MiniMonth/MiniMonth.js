import React, { useEffect, useState } from 'react';
import {
  monthMatrix, monthLabel, isSameDay, isPastDay, isToday, startOfDay,
} from '../../../api/schedule';
import { addDays, dateKey } from '../../../api/demoApi';

const HEADS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

/**
 * Dependency-free month picker (replaces the MUI static date picker).
 * `dark` renders the admin-console variant; `availability` is an optional
 * `(date) => number` used to dot days that still have open slots.
 */
const MiniMonth = ({
  value,
  onChange,
  dark = false,
  disablePast = true,
  availability,
  dimEmpty = true,
  className = '',
}) => {
  const [cursor, setCursor] = useState(startOfDay(value || new Date()));

  // follow the outside selection when it jumps to another month
  useEffect(() => {
    if (!value) return;
    if (value.getMonth() !== cursor.getMonth() || value.getFullYear() !== cursor.getFullYear()) {
      setCursor(startOfDay(value));
    }
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  const days = monthMatrix(cursor);
  const move = (delta) => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + delta, 1));

  return (
    <div className={`sch-month${dark ? ' is-dark' : ''} ${className}`}>
      <div className="sch-month-top">
        <button type="button" className="sch-nav" onClick={() => move(-1)} aria-label="Previous month">‹</button>
        <strong>{monthLabel(cursor)}</strong>
        <button type="button" className="sch-nav" onClick={() => move(1)} aria-label="Next month">›</button>
      </div>

      <div className="sch-month-heads" aria-hidden="true">
        {HEADS.map((h, i) => <span key={`${h}-${i}`}>{h}</span>)}
      </div>

      <div className="sch-month-grid">
        {days.map((day) => {
          const outside = day.getMonth() !== cursor.getMonth();
          const disabled = disablePast && isPastDay(day);
          const selected = value && isSameDay(day, value);
          const free = availability ? availability(day) : null;
          const classes = [
            'sch-mday',
            outside ? 'is-out' : '',
            disabled ? 'is-disabled' : '',
            selected ? 'is-on' : '',
            isToday(day) ? 'is-today' : '',
            free === 0 && dimEmpty ? 'is-full' : '',
          ].filter(Boolean).join(' ');

          return (
            <button
              type="button"
              key={dateKey(day)}
              className={classes}
              disabled={disabled}
              aria-current={selected ? 'date' : undefined}
              onClick={() => onChange && onChange(day)}
            >
              {day.getDate()}
              {free > 0 && <i className="sch-mdot" />}
            </button>
          );
        })}
      </div>

      <div className="sch-month-foot">
        <button
          type="button"
          className="sch-linkbtn"
          onClick={() => { setCursor(startOfDay(new Date())); if (onChange) onChange(new Date()); }}
        >
          Today
        </button>
        <button
          type="button"
          className="sch-linkbtn"
          onClick={() => { const d = addDays(new Date(), 7); setCursor(startOfDay(d)); if (onChange) onChange(d); }}
        >
          Next week
        </button>
      </div>
    </div>
  );
};

export default MiniMonth;
