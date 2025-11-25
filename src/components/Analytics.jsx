import React from 'react';
import EngagementChart from './EngagementChart.jsx';
import ContentDistributionChart from './ContentDistributionChart.jsx';
import TypeBreakdownChart from './TypeBreakdownChart.jsx';

const Analytics = () => {
  return (
    <div>
      <h1>Analytics</h1>
      <p>View your job site analytics.</p>
      {/* Engagement over time */}
      <EngagementChart />
      {/* Bar Chart – Content Distribution */}
      <ContentDistributionChart />
      {/* Pie Chart – Job & Blog Type Breakdown */}
      <TypeBreakdownChart />
    </div>
  );
};

export default Analytics;
