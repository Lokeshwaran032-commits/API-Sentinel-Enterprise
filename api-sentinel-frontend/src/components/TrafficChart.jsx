
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const TrafficChart = ({ logs = [] }) => {
  // Create 24 hourly buckets
  const now = new Date();
  const currentHour = new Date(now);
  currentHour.setMinutes(0, 0, 0);

  const hourlyData = Array.from({ length: 24 }, (_, index) => {
    const hour = new Date(currentHour);
    hour.setHours(hour.getHours() - (23 - index));

    return {
      time: hour.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      timestamp: hour.getTime(),
      total: 0,
      successful: 0,
      blocked: 0,
    };
  });

  // Add API logs to their matching hourly buckets
  logs.forEach((log) => {
    const logTime = new Date(log.timestamp).getTime();

    if (Number.isNaN(logTime)) return;

    const hourIndex = hourlyData.findIndex(
      (item) =>
        item.timestamp ===
        new Date(logTime).setMinutes(0, 0, 0)
    );

    if (hourIndex === -1) return;

    const status = Number(log.statusCode ?? log.status_code);

    hourlyData[hourIndex].total += 1;

    if (status >= 200 && status < 400) {
      hourlyData[hourIndex].successful += 1;
    }

    if (status === 403 || status === 429) {
      hourlyData[hourIndex].blocked += 1;
    }
  });

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-[#111318] p-5">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white">
          API Traffic Overview
        </h2>
        <p className="mt-1 text-sm text-gray-400">
          Request activity over the last 24 hours
        </p>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={hourlyData}>
            <defs>
              <linearGradient
                id="totalGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>

              <linearGradient
                id="successGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#27272a"
              vertical={false}
            />

            <XAxis
              dataKey="time"
              stroke="#71717a"
              tick={{ fill: "#a1a1aa", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              minTickGap={25}
            />

            <YAxis
              stroke="#71717a"
              allowDecimals={false}
              tick={{ fill: "#a1a1aa", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "#18181b",
                border: "1px solid #3f3f46",
                borderRadius: "10px",
                color: "#fff",
              }}
            />

            <Legend />

            <Area
              type="monotone"
              dataKey="total"
              name="Total Requests"
              stroke="#3B82F6"
              fill="url(#totalGradient)"
              strokeWidth={2}
            />

            <Area
              type="monotone"
              dataKey="successful"
              name="Successful"
              stroke="#10B981"
              fill="url(#successGradient)"
              strokeWidth={2}
            />

            <Area
              type="monotone"
              dataKey="blocked"
              name="Blocked"
              stroke="#F59E0B"
              fill="none"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TrafficChart;
