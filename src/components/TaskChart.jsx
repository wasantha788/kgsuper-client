import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const TaskChart = ({ completed, pending, cancelled }) => {
  const data = [
    { name: "Completed", value: completed },
    { name: "Pending", value: pending },
    { name: "Cancelled", value: cancelled },
  ];

  return (
    <div style={{ width: "100%", height: 300 }}>
      <h3>Today's Tasks</h3>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="value" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TaskChart;
