import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../services/api.js';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

export const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);

  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ['admin-sessions'],
    queryFn: () => apiClient.get('/admin/sessions').then((res) => res.data.sessions || res.data),
    refetchInterval: 5000,
  });

  const { data: logs = [] } = useQuery({
    queryKey: ['admin-logs'],
    queryFn: () => apiClient.get('/admin/logs?limit=50').then((res) => res.data),
    refetchInterval: 30000,
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await apiClient.get('/admin/metrics');
        setMetrics(response.data);
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 10000);
    return () => clearInterval(interval);
  }, []);

  const chartData = [
    { name: 'Active Sessions', value: metrics?.activeSessions || 0 },
    { name: 'Total Sessions', value: metrics?.totalSessions || 0 },
    { name: 'Recordings', value: metrics?.recordingCount || 0 },
  ];

  const handleEndSession = async (sessionId: string) => {
    try {
      await apiClient.post(`/admin/sessions/${sessionId}/end`);
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0F19] to-[#111827] text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">System monitoring and management</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#1a1f2e] rounded-lg p-6 border border-gray-700">
            <p className="text-gray-400 text-sm mb-2">Active Sessions</p>
            <p className="text-3xl font-bold text-[#FFC107]">
              {metrics?.activeSessions || 0}
            </p>
          </div>
          <div className="bg-[#1a1f2e] rounded-lg p-6 border border-gray-700">
            <p className="text-gray-400 text-sm mb-2">Total Sessions</p>
            <p className="text-3xl font-bold text-blue-400">
              {metrics?.totalSessions || 0}
            </p>
          </div>
          <div className="bg-[#1a1f2e] rounded-lg p-6 border border-gray-700">
            <p className="text-gray-400 text-sm mb-2">Recordings</p>
            <p className="text-3xl font-bold text-green-400">
              {metrics?.recordingCount || 0}
            </p>
          </div>
          <div className="bg-[#1a1f2e] rounded-lg p-6 border border-gray-700">
            <p className="text-gray-400 text-sm mb-2">Avg Duration</p>
            <p className="text-3xl font-bold text-purple-400">
              {metrics?.averageSessionDuration || 0}m
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-[#1a1f2e] rounded-lg p-6 border border-gray-700">
            <h2 className="text-lg font-semibold mb-4">Metrics Overview</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#999" />
                <YAxis stroke="#999" />
                <Tooltip />
                <Bar dataKey="value" fill="#FFC107" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-[#1a1f2e] rounded-lg p-6 border border-gray-700">
            <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {logs.slice(0, 10).map((log: any) => (
                <div key={log.id} className="text-sm p-2 bg-gray-900/30 rounded">
                  <p className="text-gray-300">{log.action}</p>
                  <p className="text-gray-500 text-xs">
                    {new Date(log.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sessions List */}
        <div className="bg-[#1a1f2e] rounded-lg p-6 border border-gray-700">
          <h2 className="text-lg font-semibold mb-4">Live Sessions</h2>
          {sessionsLoading ? (
            <p className="text-gray-400">Loading...</p>
          ) : sessions.length === 0 ? (
            <p className="text-gray-400">No active sessions</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-gray-400 border-b border-gray-700">
                  <tr>
                    <th className="text-left py-2 px-4">Session ID</th>
                    <th className="text-left py-2 px-4">Agent</th>
                    <th className="text-left py-2 px-4">Status</th>
                    <th className="text-left py-2 px-4">Duration</th>
                    <th className="text-left py-2 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((session: any) => (
                    <tr key={session.id} className="border-b border-gray-700/50">
                      <td className="py-3 px-4">{session.id.substring(0, 8)}</td>
                      <td className="py-3 px-4">{session.agent_id.substring(0, 8)}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                            session.status === 'active'
                              ? 'bg-green-900/30 text-green-400'
                              : 'bg-gray-700/30 text-gray-400'
                          }`}
                        >
                          {session.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {session.start_time &&
                          Math.floor(
                            (new Date().getTime() - new Date(session.start_time).getTime()) / 1000 / 60
                          )}
                        m
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleEndSession(session.id)}
                          className="px-3 py-1 bg-red-900/20 text-red-400 rounded text-xs hover:bg-red-900/40"
                        >
                          End
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
