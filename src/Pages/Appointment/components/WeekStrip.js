import React, { useState } from 'react';
import MiniMonth from '../../Shared/MiniMonth/MiniMonth';
import { IconCalendar } from '../../Shared/Icons/Icons';
import {
  weekRangeLabel, isSameDay, isPastDay, isToday, weekdayShort,
} from '../../../api/schedule';
import { dateKey } from '../../../api/demoApi';

/* Seven day-columns with the real number of free slots under each date —
   the piece that makes the screen read as a scheduler rather than a form.
   ‹ › move a week at a time, "Today" snaps back, past days are disabled and
   the month button opens a jump-to-date grid. */
const WeekStrip = ({
  weekStart, days, selected, onSelect, onShiftWeek, onToday, canGoBack, availabilityFor,
}) => {
  const [monthOpen, setMonthOpen] = useState(false);

  return (
    <div className="sch-cal">
      <div className="sch-cal-top">
        <div className="sch-cal-title">
          <strong>{weekStart.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</strong>
          <span>{weekRangeLabel(weekStart)}</span>
        </div>

        <div className="sch-cal-ctrls">
          <button
            type="button"
            className="sch-nav"
            onClick={() => onShiftWeek(-1)}
            disabled={!canGoBack}
            aria-label="Previous week"
          >
            ‹
          </button>
          <button type="button" className="sch-today" onClick={onToday}>Today</button>
          <button type="button" className="sch-nav" onClick={() => onShiftWeek(1)} aria-label="Next week">›</button>
          <button
            type="button"
            className={`sch-monthbtn${monthOpen ? ' is-on' : ''}`}
            onClick={() => setMonthOpen((v) => !v)}
            aria-expanded={monthOpen}
          >
            <IconCalendar size={16} /> <span>Month</span>
          </button>
        </div>
      </div>

      {monthOpen && (
        <div className="sch-month-pop">
          <MiniMonth
            value={selected}
            availability={availabilityFor}
            onChange={(d) => { onSelect(d); setMonthOpen(false); }}
          />
        </div>
      )}

      <div className="sch-week" role="tablist" aria-label="Pick a day">
        {days.map((day) => {
          const free = availabilityFor(day);
          const past = isPastDay(day);
          const on = isSameDay(day, selected);
          const classes = [
            'sch-day',
            on ? 'is-on' : '',
            past ? 'is-past' : '',
            !past && free === 0 ? 'is-full' : '',
            isToday(day) ? 'is-today' : '',
          ].filter(Boolean).join(' ');

          return (
            <button
              type="button"
              role="tab"
              aria-selected={on}
              key={dateKey(day)}
              className={classes}
              disabled={past}
              onClick={() => onSelect(day)}
            >
              <span className="wd">{weekdayShort(day)}</span>
              <span className="dd">{day.getDate()}</span>
              <span className="av">
                {past ? '—' : free > 0 ? `${free} slot${free === 1 ? '' : 's'}` : 'Full'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default WeekStrip;
