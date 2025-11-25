import React from 'react';
import UpcomingEventsCalendar from '../components/UpcomingEventsCalendar.jsx';
import './CalendarPage.css';

export default function CalendarPage() {
  return (
    <div className="calendar-page">
      <h2 className="calendar-page__title">Upcoming Events</h2>
      <p className="calendar-page__subtitle">
        Job deadlines/interviews (blue) and blog publish schedule (green).
      </p>
      <UpcomingEventsCalendar />
    </div>
  );
}