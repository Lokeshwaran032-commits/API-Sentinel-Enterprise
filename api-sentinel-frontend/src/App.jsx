import { useCallback, useEffect, useState } from "react";
import api from "./api/axiosConfig";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

import {
  Shield,
  LayoutDashboard,
  Activity,
  FileText,
  Gauge,
  Users,
  Bell,
  Search,
  ShieldCheck,
  Server,
  Clock,
  Menu,
  RefreshCw,
  X,
  LogOut,
  Lock,
  UserCheck,
  ChevronRight,
} from "lucide-react";

import Login from "./pages/Login";
import Register from "./pages/Register";
import TrafficChart from "./components/TrafficChart";
import { getAllLogs, getLogCount } from "./api/monitoringService";

// --------------------------------------------------
// JWT ROLE HELPERS
// --------------------------------------------------

function readTokenClaims(token) {
  try {
    const payload = token.split(".")[1];
    if (!payload) return {};

    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "="
    );

    return JSON.parse(atob(padded));
  } catch (error) {
    console.error("Unable to read JWT claims:", error);
    return {};
  }
}

function getUserRole(token) {
  const claims = readTokenClaims(token);

  const possibleRoles = [
    claims.role,
    claims.roles,
    claims.authorities,
    claims.authority,
  ];

  const roleValues = possibleRoles.flatMap((value) => {
    if (!value) return [];

    if (Array.isArray(value)) {
      return value.map((item) =>
        typeof item === "object"
          ? item.authority || item.name || ""
          : String(item)
      );
    }

    return [String(value)];
  });

  const normalizedRoles = roleValues.map((role) =>
    role.toUpperCase().replace(/^ROLE_/, "")
  );

  return normalizedRoles.includes("ADMIN") ? "ADMIN" : "USER";
}

// --------------------------------------------------
// NAVIGATION
// --------------------------------------------------

const navigation = [
  { name: "Overview", icon: LayoutDashboard },
  { name: "Request Logs", icon: FileText },
  { name: "Rate Limiting", icon: Gauge },
  { name: "User Monitoring", icon: Users },
];

const pageDescriptions = {
  Overview: "Monitor and secure your APIs from one place.",
  "Request Logs": "Inspect and filter recorded API requests.",
  "Rate Limiting": "Review role-based API request protection.",
  "User Monitoring": "Monitor authenticated and anonymous API activity.",
};

// --------------------------------------------------
// SMALL REUSABLE COMPONENTS
// --------------------------------------------------

function SectionHeading({ title, description, icon: Icon }) {
  return (
    <div className="mb-6 flex items-start gap-3">
      {Icon && (
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-2.5">
          <Icon size={20} className="text-blue-400" />
        </div>
      )}

      <div className="min-w-0">
        <h3 className="text-lg font-semibold text-white">
          {title}
        </h3>

        {description && (
          <p className="mt-1 text-sm leading-5 text-gray-500">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

function StatCard({ stat }) {
  const Icon = stat.icon;

  return (
    <div className="group min-w-0 rounded-2xl border border-white/10 bg-[#121212] p-5 transition duration-200 hover:-translate-y-0.5 hover:border-blue-500/30 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium leading-5 text-gray-400">
          {stat.title}
        </p>

        <div className="shrink-0 rounded-xl border border-blue-500/10 bg-blue-500/10 p-2.5">
          <Icon size={19} className="text-blue-400" />
        </div>
      </div>

      <h3 className="mt-5 break-words text-3xl font-bold tracking-tight text-white">
        {stat.value}
      </h3>

      <p className="mt-2 text-xs leading-5 text-gray-500">
        {stat.description}
      </p>
    </div>
  );
}

function MetricCard({ title, value, description, icon: Icon, color = "blue" }) {
  const colorClasses = {
    blue: "bg-blue-500/10 text-blue-400",
    yellow: "bg-yellow-500/10 text-yellow-400",
    green: "bg-green-500/10 text-green-400",
    purple: "bg-purple-500/10 text-purple-400",
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#121212] p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-gray-400">{title}</p>

        <div className={`rounded-xl p-2.5 ${colorClasses[color]}`}>
          <Icon size={19} />
        </div>
      </div>

      <h3 className="mt-5 text-3xl font-bold text-white">
        {value}
      </h3>

      <p className="mt-2 text-xs leading-5 text-gray-500">
        {description}
      </p>
    </div>
  );
}

// --------------------------------------------------
// MAIN ADMIN DASHBOARD
// --------------------------------------------------

function App() {
  const navigate = useNavigate();

  const [logs, setLogs] = useState([]);
  const [totalRequests, setTotalRequests] = useState(0);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const [activeSection, setActiveSection] = useState("Overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // --------------------------------------------------
  // FETCH MONITORING DATA
  // --------------------------------------------------

  const fetchMonitoringData = useCallback(async () => {
    setRefreshing(true);

    try {
      const [logsData, countData] = await Promise.all([
        getAllLogs(),
        getLogCount(),
      ]);

      setLogs(Array.isArray(logsData) ? logsData : []);
      setTotalRequests(Number(countData) || 0);

      setLastUpdated(new Date());
      setError("");
    } catch (err) {
      console.error("Monitoring API error:", err);
      setError("Unable to load monitoring data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMonitoringData();

    const interval = setInterval(() => {
      fetchMonitoringData();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchMonitoringData]);

  // --------------------------------------------------
  // NAVIGATION AND LOGOUT
  // --------------------------------------------------

  const handleNavigation = (section) => {
    setActiveSection(section);
    setMobileMenuOpen(false);
    setSearchTerm("");
    setStatusFilter("ALL");
  };

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  // --------------------------------------------------
  // REQUEST METRICS
  // --------------------------------------------------

  const successfulRequests = logs.filter((log) => {
    const status = Number(log.statusCode ?? log.status_code);
    return status >= 200 && status < 300;
  }).length;

  const blockedRequests = logs.filter((log) => {
    const status = Number(log.statusCode ?? log.status_code);
    return status === 403 || status === 429;
  }).length;

  const errorRequests = logs.filter((log) => {
    const status = Number(log.statusCode ?? log.status_code);
    return status >= 400 && status <= 599;
  }).length;

  const successRate =
    logs.length > 0
      ? ((successfulRequests / logs.length) * 100).toFixed(2)
      : "0.00";

  const errorRate =
    logs.length > 0
      ? ((errorRequests / logs.length) * 100).toFixed(2)
      : "0.00";

  const averageResponseTime =
    logs.length > 0
      ? (
          logs.reduce((total, log) => {
            return (
              total +
              (Number(
                log.responseTimeMs ?? log.response_time_ms
              ) || 0)
            );
          }, 0) / logs.length
        ).toFixed(2)
      : "0.00";

  // --------------------------------------------------
  // TOP ENDPOINTS
  // --------------------------------------------------

  const endpointCounts = logs.reduce((acc, log) => {
    const endpoint = log.endpoint || "Unknown Endpoint";

    acc[endpoint] = (acc[endpoint] || 0) + 1;

    return acc;
  }, Object.create(null));

  const topEndpoints = Object.entries(endpointCounts)
    .map(([endpoint, count]) => ({ endpoint, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // --------------------------------------------------
  // USER ANALYTICS
  // --------------------------------------------------

 // Identify anonymous requests consistently
 const isAnonymousUsername = (username) => {
   const normalized = String(username || "").trim().toUpperCase();

   return (
     normalized === "" ||
     normalized === "ANONYMOUS" ||
     normalized === "ANONYMOUSUSER"
   );
 };

 // Count requests made by authenticated users only
 const userRequestCounts = logs.reduce((acc, log) => {
   const username = String(log.username || "").trim();

   if (isAnonymousUsername(username)) {
     return acc;
   }

   acc[username] = (acc[username] || 0) + 1;

   return acc;
 }, Object.create(null));

 // Find the five most active authenticated users
 const topUsers = Object.entries(userRequestCounts)
   .map(([username, count]) => ({
     username,
     count,
   }))
   .sort((a, b) => b.count - a.count)
   .slice(0, 5);

 // Count anonymous requests separately
 const anonymousRequests = logs.filter((log) =>
   isAnonymousUsername(log.username)
 ).length;

  // --------------------------------------------------
  // STATISTICS CARDS
  // --------------------------------------------------

  const stats = [
    {
      title: "Total API Requests",
      value: loading ? "..." : totalRequests.toLocaleString(),
      icon: Activity,
      description: "Total recorded API requests",
    },
    {
      title: "Successful Requests",
      value: loading ? "..." : successfulRequests.toLocaleString(),
      icon: ShieldCheck,
      description: "HTTP 2xx responses",
    },
    {
      title: "Blocked Requests",
      value: loading ? "..." : blockedRequests.toLocaleString(),
      icon: Shield,
      description: "HTTP 403 and 429 responses",
    },
    {
      title: "Avg Response Time",
      value: loading ? "..." : `${averageResponseTime} ms`,
      icon: Clock,
      description: "Average recorded response time",
    },
    {
      title: "Success Rate",
      value: loading ? "..." : `${successRate}%`,
      icon: ShieldCheck,
      description: "Percentage of HTTP 2xx responses",
    },
    {
      title: "Error Rate",
      value: loading ? "..." : `${errorRate}%`,
      icon: Activity,
      description: "Percentage of HTTP 4xx and 5xx responses",
    },
  ];

  // --------------------------------------------------
  // SEARCH AND FILTER REQUEST LOGS
  // --------------------------------------------------

  const filteredLogs = logs
    .filter((log) => {
      const search = searchTerm.trim().toLowerCase();

      const endpoint = String(log.endpoint || "").toLowerCase();
      const username = String(log.username || "").toLowerCase();
      const method = String(log.method || "").toLowerCase();

      const status = Number(log.statusCode ?? log.status_code);

      const matchesSearch =
        search === "" ||
        endpoint.includes(search) ||
        username.includes(search) ||
        method.includes(search) ||
        String(status).includes(search);

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "SUCCESS" &&
          status >= 200 &&
          status < 300) ||
        (statusFilter === "BLOCKED" &&
          (status === 403 || status === 429)) ||
        (statusFilter === "ERROR" &&
          status >= 400 &&
          status !== 403 &&
          status !== 429);

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      return (
        new Date(b.timestamp).getTime() -
        new Date(a.timestamp).getTime()
      );
    });

  const recentLogs = filteredLogs.slice(0, 8);

  // --------------------------------------------------
  // TOP ENDPOINTS PANEL
  // --------------------------------------------------

  const renderTopEndpoints = () => (
    <div className="rounded-2xl border border-white/10 bg-[#121212] p-5 sm:p-6">
      <SectionHeading
        title="Top Requested API Endpoints"
        description="Your five most frequently requested endpoints"
        icon={Activity}
      />

      {loading ? (
        <p className="py-5 text-sm text-gray-400">
          Loading endpoint analytics...
        </p>
      ) : topEndpoints.length === 0 ? (
        <p className="py-5 text-sm text-gray-400">
          No endpoint data available.
        </p>
      ) : (
        <div className="space-y-6">
          {topEndpoints.map((item, index) => {
            const percentage =
              (item.count / topEndpoints[0].count) * 100;

            return (
              <div key={item.endpoint}>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="shrink-0 text-xs font-semibold text-gray-500">
                      #{index + 1}
                    </span>

                    <span className="truncate text-sm text-gray-300">
                      {item.endpoint}
                    </span>
                  </div>

                  <span className="shrink-0 text-xs font-semibold text-blue-400 sm:text-sm">
                    {item.count.toLocaleString()}
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // --------------------------------------------------
  // TOP USERS PANEL
  // --------------------------------------------------

  const renderTopUsers = () => (
    <div className="rounded-2xl border border-white/10 bg-[#121212] p-5 sm:p-6">
      <SectionHeading
        title="Most Active API Users"
        description="Users generating the highest number of API requests"
        icon={Users}
      />

      {loading ? (
        <p className="py-5 text-sm text-gray-400">
          Loading user analytics...
        </p>
      ) : topUsers.length === 0 ? (
        <p className="py-5 text-sm text-gray-400">
          No authenticated user activity available.
        </p>
      ) : (
        <div className="space-y-6">
          {topUsers.map((user, index) => {
            const percentage =
              (user.count / topUsers[0].count) * 100;

            return (
              <div key={user.username}>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="shrink-0 text-xs font-semibold text-gray-500">
                      #{index + 1}
                    </span>

                    <div className="flex min-w-0 items-center gap-2">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500/10">
                        <Users size={15} className="text-blue-400" />
                      </div>

                      <span className="truncate text-sm text-gray-300">
                        {user.username}
                      </span>
                    </div>
                  </div>

                  <span className="shrink-0 text-xs font-semibold text-blue-400 sm:text-sm">
                    {user.count.toLocaleString()}
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-7 flex items-center justify-between gap-4 border-t border-white/10 pt-5">
        <div>
          <p className="text-sm font-medium text-gray-300">
            Anonymous Requests
          </p>

          <p className="mt-1 text-xs text-gray-500">
            Requests without an authenticated username
          </p>
        </div>

        <span className="text-xl font-bold text-yellow-400">
          {loading ? "..." : anonymousRequests.toLocaleString()}
        </span>
      </div>
    </div>
  );

  // --------------------------------------------------
  // REQUEST LOGS TABLE
  // --------------------------------------------------

  const renderRequestLogs = () => (
    <div className="rounded-2xl border border-white/10 bg-[#121212] p-5 sm:p-6">
      <SectionHeading
        title="API Request Logs"
        description="Search, filter and monitor recorded API requests"
        icon={FileText}
      />

      <div className="mb-5 grid grid-cols-1 gap-3 lg:grid-cols-[1fr_220px]">
        <div className="relative min-w-0">
          <Search
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />

          <input
            type="text"
            placeholder="Search endpoint, username, method or status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-[#1A1A1A] py-3 pl-10 pr-10 text-sm text-white outline-none transition focus:border-blue-500"
          />

          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-[#1A1A1A] px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
        >
          <option value="ALL">All Requests</option>
          <option value="SUCCESS">Successful</option>
          <option value="BLOCKED">Blocked (403 / 429)</option>
          <option value="ERROR">Other Errors (4xx / 5xx)</option>
        </select>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-gray-500">
          Showing {Math.min(filteredLogs.length, 50)} of{" "}
          {filteredLogs.length} matching requests
        </p>

        {(searchTerm || statusFilter !== "ALL") && (
          <button
            type="button"
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("ALL");
            }}
            className="text-xs font-medium text-blue-400 transition hover:text-blue-300"
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/5">
        {error ? (
          <p className="p-6 text-sm text-red-400">{error}</p>
        ) : loading ? (
          <p className="p-6 text-sm text-gray-400">
            Loading API request logs...
          </p>
        ) : filteredLogs.length === 0 ? (
          <p className="p-6 text-sm text-gray-400">
            No matching API requests found.
          </p>
        ) : (
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-[#191919]">
              <tr className="text-xs uppercase tracking-wide text-gray-500">
                <th className="px-4 py-4 font-medium">Endpoint</th>
                <th className="px-4 py-4 font-medium">Method</th>
                <th className="px-4 py-4 font-medium">Status</th>
                <th className="px-4 py-4 font-medium">Response</th>
                <th className="px-4 py-4 font-medium">User</th>
                <th className="px-4 py-4 font-medium">Timestamp</th>
              </tr>
            </thead>

            <tbody>
              {filteredLogs.slice(0, 50).map((log, index) => {
                const status = Number(
                  log.statusCode ?? log.status_code
                );

                const responseTime =
                  log.responseTimeMs ?? log.response_time_ms ?? 0;

                const isSuccess = status >= 200 && status < 300;
                const isBlocked = status === 403 || status === 429;

                return (
                  <tr
                    key={log.id ?? `${log.timestamp}-${index}`}
                    className="border-t border-white/5 transition hover:bg-white/[0.025]"
                  >
                    <td className="max-w-[300px] truncate px-4 py-4 text-gray-300">
                      {log.endpoint || "Unknown"}
                    </td>

                    <td className="px-4 py-4 text-gray-400">
                      {log.method || "-"}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${
                          isSuccess
                            ? "bg-green-500/10 text-green-400"
                            : isBlocked
                            ? "bg-yellow-500/10 text-yellow-400"
                            : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        {status || "-"}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-gray-400">
                      {responseTime} ms
                    </td>

                    <td className="px-4 py-4 text-gray-400">
                      {log.username || "Anonymous"}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-gray-500">
                      {log.timestamp
                        ? new Date(log.timestamp).toLocaleString()
                        : "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );

  // --------------------------------------------------
  // PAGE CONTENT
  // --------------------------------------------------

  const renderOverview = () => (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 xl:gap-5">
        {stats.map((stat) => (
          <StatCard key={stat.title} stat={stat} />
        ))}
      </div>

      <div className="mt-6 min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-[#121212] p-4 sm:p-6">
        <SectionHeading
          title="API Traffic Overview"
          description="Request activity over the last 24 hours"
          icon={Activity}
        />

        <div className="min-w-0 w-full">
          <TrafficChart logs={logs} />
        </div>
      </div>

      <div className="mt-6">
        {renderTopEndpoints()}
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-[#121212] p-5 sm:p-6">
        <SectionHeading
          title="Security Status"
          description="API protection monitoring"
          icon={ShieldCheck}
        />

        <div className="flex flex-col items-center justify-center py-8">
          <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full border-4 border-blue-500/30 bg-blue-500/5">
            <Shield size={32} className="mb-2 text-blue-400" />

            <span className="text-xs font-medium text-gray-400">
              Monitoring
            </span>
          </div>

          <p className="mt-5 text-sm text-gray-400">
            API security monitoring is active.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
          <p className="text-sm text-gray-400">
            Blocked requests recorded
          </p>

          <span className="text-lg font-bold text-yellow-400">
            {loading ? "..." : blockedRequests.toLocaleString()}
          </span>
        </div>
      </div>
    </>
  );

  const renderRateLimiting = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-[#121212] p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-500/10 p-3">
              <UserCheck size={22} className="text-blue-400" />
            </div>

            <div>
              <h3 className="font-semibold text-white">USER Role</h3>
              <p className="mt-1 text-xs text-gray-500">
                Standard account limit
              </p>
            </div>
          </div>

          <div className="mt-7">
            <p className="text-5xl font-bold text-white">10</p>
            <p className="mt-2 text-sm text-gray-400">
              Requests per minute
            </p>
          </div>

          <div className="mt-6 border-t border-white/10 pt-4">
            <p className="text-xs leading-5 text-gray-500">
              Requests exceeding this configured limit receive HTTP 429.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#121212] p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-purple-500/10 p-3">
              <ShieldCheck size={22} className="text-purple-400" />
            </div>

            <div>
              <h3 className="font-semibold text-white">ADMIN Role</h3>
              <p className="mt-1 text-xs text-gray-500">
                Administrator account limit
              </p>
            </div>
          </div>

          <div className="mt-7">
            <p className="text-5xl font-bold text-white">20</p>
            <p className="mt-2 text-sm text-gray-400">
              Requests per minute
            </p>
          </div>

          <div className="mt-6 border-t border-white/10 pt-4">
            <p className="text-xs leading-5 text-gray-500">
              Requests exceeding this configured limit receive HTTP 429.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#121212] p-6">
        <SectionHeading
          title="Rate Limiting Protection"
          description="Role-based API request protection"
          icon={Lock}
        />

        <p className="text-sm leading-7 text-gray-400">
          API Sentinel applies role-based rate limiting to authenticated
          API users. Standard USER accounts can make up to 10 requests
          per minute, while ADMIN accounts can make up to 20 requests
          per minute. Requests exceeding the configured limit are
          rejected with HTTP 429 (Too Many Requests).
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-white/10 pt-5 text-sm text-green-400">
          <ShieldCheck size={18} />
          Rate limiting configured in backend
        </div>
      </div>

      <MetricCard
        title="Blocked Requests"
        value={loading ? "..." : blockedRequests.toLocaleString()}
        description="Recorded HTTP 403 and 429 responses"
        icon={Shield}
        color="yellow"
      />
    </div>
  );

  const renderUserMonitoring = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <MetricCard
          title="Active Users in Logs"
          value={
            loading ? "..." : Object.keys(userRequestCounts).length
          }
          description="Unique authenticated usernames"
          icon={Users}
          color="blue"
        />

        <MetricCard
          title="Anonymous Requests"
          value={loading ? "..." : anonymousRequests.toLocaleString()}
          description="Requests without a recorded username"
          icon={Activity}
          color="yellow"
        />
      </div>

      {renderTopUsers()}
    </div>
  );

  // --------------------------------------------------
  // SIDEBAR
  // --------------------------------------------------

  const renderSidebar = () => (
    <>
      {mobileMenuOpen && (
        <button
          type="button"
          aria-label="Close navigation overlay"
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-[260px] shrink-0 flex-col border-r border-white/10 bg-[#101010] px-4 py-5 transition-transform duration-300 md:sticky md:top-0 md:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-10 flex items-center justify-between px-1">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-900/20">
              <Shield size={24} className="text-white" />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold tracking-tight text-white">
                API Sentinel
              </h1>

              <p className="mt-0.5 text-xs text-gray-500">
                Enterprise Security
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
            className="rounded-lg p-2 text-gray-400 transition hover:bg-white/5 hover:text-white md:hidden"
          >
            <X size={19} />
          </button>
        </div>

        <div>
          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">
            Main Menu
          </p>

          <nav className="space-y-1.5">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.name;

              return (
                <button
                  type="button"
                  key={item.name}
                  onClick={() => handleNavigation(item.name)}
                  className={`flex min-h-11 w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left text-sm font-medium transition duration-200 ${
                    isActive
                      ? "border-blue-500/20 bg-blue-500/10 text-blue-400"
                      : "border-transparent text-gray-400 hover:bg-white/[0.05] hover:text-white"
                  }`}
                >
                  <Icon size={19} className="shrink-0" />
                  <span className="flex-1">{item.name}</span>

                  {isActive && (
                    <ChevronRight size={15} className="shrink-0 opacity-70" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto space-y-4">
          <div className="rounded-xl border border-white/10 bg-[#151515] p-4">
            <div className="mb-3 flex items-center gap-2">
              <Server
                size={17}
                className={error ? "text-red-400" : "text-green-400"}
              />

              <span className="text-sm font-semibold text-gray-200">
                Backend Status
              </span>
            </div>

            <div className="flex items-start gap-2">
              <span
                className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                  loading
                    ? "bg-yellow-400"
                    : error
                    ? "bg-red-400"
                    : "bg-green-400"
                }`}
              />

              <p className="text-xs leading-5 text-gray-500">
                {loading
                  ? "Checking backend connection..."
                  : error
                  ? "Backend connection failed."
                  : "Backend connected successfully."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium text-red-400 transition hover:bg-red-500/10"
          >
            <LogOut size={19} />
            Logout
          </button>

          <div className="border-t border-white/10 pt-4 text-center">
            <p className="text-[11px] text-gray-600">
              API Sentinel Enterprise
            </p>

            <p className="mt-1 text-[10px] text-gray-700">
              Version 1.0.0
            </p>
          </div>
        </div>
      </aside>
    </>
  );

  // --------------------------------------------------
  // MAIN RETURN
  // --------------------------------------------------

  return (
    <div className="flex min-h-screen w-full bg-[#0B0B0B] text-white">
      {renderSidebar()}

      <main className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex min-h-[76px] flex-wrap items-center justify-between gap-4 border-b border-white/10 bg-[#0B0B0B]/95 px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="rounded-lg border border-white/10 p-2 text-gray-400 transition hover:bg-white/5 hover:text-white md:hidden"
            >
              <Menu size={20} />
            </button>

            <div className="min-w-0">
              <h2 className="truncate text-base font-semibold text-white sm:text-lg">
                {activeSection === "Overview"
                  ? "Dashboard Overview"
                  : activeSection}
              </h2>

              <p className="mt-1 hidden text-xs text-gray-500 sm:block">
                {pageDescriptions[activeSection]}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            <div className="relative hidden w-44 items-center sm:flex lg:w-60">
              <Search
                size={16}
                className="absolute left-3 text-gray-500"
              />

              <input
                type="text"
                placeholder="Search API requests..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setActiveSection("Request Logs");
                }}
                className="h-10 w-full rounded-xl border border-white/10 bg-[#151515] pl-9 pr-9 text-xs text-white outline-none transition placeholder:text-gray-600 focus:border-blue-500"
              />

              {searchTerm && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 text-gray-500 hover:text-white"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div
              title="Notifications"
              className="relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-400"
            >
              <Bell size={19} />
              {error && (
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-400" />
              )}
            </div>

            <div className="flex items-center gap-2.5 border-l border-white/10 pl-3 sm:pl-5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-blue-500/30 bg-blue-500/10 text-sm font-bold text-blue-400 sm:h-10 sm:w-10">
                A
              </div>

              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-white">
                  Administrator
                </p>

                <p className="mt-0.5 text-xs text-gray-500">
                  Admin Account
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto w-full max-w-[1800px] p-4 sm:p-6 lg:p-8">
          <div className="mb-7 flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {activeSection === "Overview"
                  ? "Welcome to API Sentinel"
                  : activeSection}
              </h1>

              <p className="mt-2 text-sm text-gray-400">
                {pageDescriptions[activeSection]}
              </p>

              {lastUpdated && (
                <p className="mt-2 text-xs text-gray-600">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex min-h-10 items-center gap-2 rounded-xl border border-white/10 bg-[#151515] px-3.5 py-2">
                <span
                  className={`h-2 w-2 shrink-0 rounded-full ${
                    loading
                      ? "bg-yellow-400"
                      : error
                      ? "bg-red-400"
                      : "bg-green-400"
                  }`}
                />

                <span className="text-xs font-medium text-gray-300">
                  {loading
                    ? "Connecting..."
                    : error
                    ? "Backend disconnected"
                    : "Backend connected"}
                </span>
              </div>

              <button
                type="button"
                onClick={fetchMonitoringData}
                disabled={refreshing}
                className="flex min-h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw
                  size={15}
                  className={refreshing ? "animate-spin" : ""}
                />

                {refreshing ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-red-400">
                <Activity size={17} />
                {error}
              </div>

              <button
                type="button"
                onClick={fetchMonitoringData}
                className="text-xs font-semibold text-red-300 hover:text-white"
              >
                Try again
              </button>
            </div>
          )}

          {activeSection === "Overview" && renderOverview()}
          {activeSection === "Request Logs" && renderRequestLogs()}
          {activeSection === "Rate Limiting" && renderRateLimiting()}
          {activeSection === "User Monitoring" && renderUserMonitoring()}

          <footer className="mt-10 border-t border-white/5 py-5 text-center">
            <p className="text-xs text-gray-600">
              API Sentinel Enterprise © 2026
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}

// --------------------------------------------------
// STANDARD USER DASHBOARD
// --------------------------------------------------

function UserDashboard() {
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token") || "";
  const claims = readTokenClaims(token);

  // Dynamic rate-limit state
  const [rateLimit, setRateLimit] = useState({
    limit: 10,
    remaining: 10,
  });

  const [rateLimitError, setRateLimitError] = useState("");

  // Fetch current rate-limit status from backend
  useEffect(() => {
    let isMounted = true;

    const fetchRateLimitStatus = async () => {
      try {
        const response = await api.get("/api/rate-limit/status");

        if (!isMounted) return;

        setRateLimit({
          limit: Number(response.data.limit) || 10,
          remaining: Number(response.data.remaining) || 0,
        });

        setRateLimitError("");
      } catch (error) {
        console.error("Rate limit status error:", error);

        if (isMounted) {
          setRateLimitError("Unable to retrieve rate limit status.");
        }
      }
    };

    fetchRateLimitStatus();

    const interval = setInterval(fetchRateLimitStatus, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const displayName =
    claims.name ||
    claims.fullName ||
    claims.email ||
    claims.sub ||
    "API User";

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white">
      <header className="flex min-h-[76px] items-center justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600">
            <Shield size={23} className="text-white" />
          </div>

          <div>
            <h1 className="text-lg font-bold">API Sentinel</h1>
            <p className="text-xs text-gray-500">
              Enterprise Security
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-white">
              {displayName}
            </p>

            <p className="text-xs text-gray-500">
              Standard User
            </p>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-blue-500/30 bg-blue-500/10 font-semibold text-blue-400">
            {String(displayName).charAt(0).toUpperCase()}
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="ml-1 flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-red-400 transition hover:bg-red-500/10"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium text-blue-400">
            USER DASHBOARD
          </p>

          <h2 className="text-2xl font-bold sm:text-3xl">
            Welcome, {displayName}
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-400">
            Your API Sentinel account is active. You can use the protected
            API services available to standard users.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <section className="rounded-2xl border border-white/10 bg-[#121212] p-6">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-green-500/10">
              <ShieldCheck size={22} className="text-green-400" />
            </div>

            <h3 className="text-lg font-semibold">
              Account Security
            </h3>

            <p className="mt-2 text-sm leading-6 text-gray-400">
              You are signed in with a standard USER account. Your protected
              requests are authenticated using your access token.
            </p>

            <div className="mt-5 inline-flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/5 px-3 py-2 text-xs font-medium text-green-400">
              <span className="h-2 w-2 rounded-full bg-green-400" />
              Authenticated
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-[#121212] p-6">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10">
              <Gauge size={22} className="text-blue-400" />
            </div>

            <h3 className="text-lg font-semibold">
              API Rate Limit
            </h3>

            <p className="mt-2 text-sm leading-6 text-gray-400">
              Standard USER accounts are configured for up to 10 API requests
              per minute. Requests above the configured limit are rejected.
            </p>

            {/* Dynamic remaining request count */}
            <div className="mt-5">
              <p className="text-3xl font-bold text-white">
                {rateLimit.remaining}
                <span className="ml-2 text-sm font-medium text-gray-500">
                  / {rateLimit.limit} remaining
                </span>
              </p>

              {/* Progress bar */}
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    rateLimit.remaining === 0
                      ? "bg-red-500"
                      : "bg-blue-500"
                  }`}
                  style={{
                    width: `${
                      rateLimit.limit > 0
                        ? (rateLimit.remaining / rateLimit.limit) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>

              <p className="mt-3 text-xs text-gray-500">
                {rateLimitError ||
                  `${rateLimit.remaining} requests remaining in your current window.`}
              </p>
            </div>
          </section>
        </div>

        <section className="mt-5 rounded-2xl border border-white/10 bg-[#121212] p-6">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-purple-500/10 p-3">
              <Lock size={20} className="text-purple-400" />
            </div>

            <div>
              <h3 className="font-semibold">
                Role-based access
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-400">
                Monitoring logs and administrator controls are restricted to
                ADMIN accounts. Your account has standard USER permissions.
              </p>
            </div>
          </div>
        </section>

        <footer className="mt-10 border-t border-white/5 py-5 text-center text-xs text-gray-600">
          API Sentinel Enterprise © 2026
        </footer>
      </main>
    </div>
  );
}

// --------------------------------------------------
// ROLE-BASED DASHBOARD
// --------------------------------------------------

function RoleBasedDashboard() {
  const token = sessionStorage.getItem("token") || "";
  const role = getUserRole(token);

  return role === "ADMIN" ? <App /> : <UserDashboard />;
}

// --------------------------------------------------
// PROTECTED ROUTE
// --------------------------------------------------

function ProtectedRoute({ children }) {
  const token = sessionStorage.getItem("token");

  return token ? children : <Navigate to="/login" replace />;
}

// --------------------------------------------------
// APPLICATION ROUTER
// --------------------------------------------------

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <RoleBasedDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
