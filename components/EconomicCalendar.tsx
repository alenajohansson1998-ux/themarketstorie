import React from 'react';

export default function EconomicCalendar() {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <h2 className="text-lg font-bold mb-4">Economic Calendar</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-gray-500">
            <th className="text-left py-1">Time</th>
            <th className="text-left py-1">Event</th>
            <th className="text-left py-1">Impact</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="py-1">08:30</td>
            <td>US CPI Release</td>
            <td className="text-yellow-600">High</td>
          </tr>
          <tr>
            <td className="py-1">10:00</td>
            <td>Fed Chair Speech</td>
            <td className="text-red-600">Very High</td>
          </tr>
          <tr>
            <td className="py-1">14:00</td>
            <td>Consumer Confidence</td>
            <td className="text-green-600">Medium</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
