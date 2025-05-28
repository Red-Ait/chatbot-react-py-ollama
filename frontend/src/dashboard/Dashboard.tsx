import { useRef, useEffect, useState } from "react";
import { averageArray, formatDuration } from "../utils";
import  { Metric} from "../types"
import { API } from "../api";

const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [search, setSearch] = useState("");
  const hasFetched = useRef(false);


  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    fetchMetrics(); // Initial fetch

    setInterval(() => {
      fetchMetrics(); // Fetch every 5s
    }, 5000);

  }, []);


  const fetchMetrics = () => {
    API.fetchMetrics().then((res) => {
      setMetrics(res.data);
    });
  }

  const filtered = metrics.filter((m) =>
    m.user_input.toLowerCase().includes(search.toLowerCase())
  );

  const successCount = metrics.filter(
    (m) => m.generated_sql_status === "success"
  ).length;

  const failCount = metrics.filter(
    (m) => m.generated_sql_status === "failure"
  ).length;

  const ollamaQueriesCount = metrics.filter(
    (m) => m.provider === "ollama"
  ).length;

  const openaiQueriesCount = metrics.filter(
    (m) => m.provider === "openai"
  ).length;

  const averageDurationOpenaiQueries = averageArray([...metrics.filter(
    (m) => m.provider === "openai"
  ).map(m => m.generated_interpretation_duration_ms), ...metrics.filter(
    (m) => m.provider === "openai"
  ).map(m => m.generated_sql_duration_ms)].filter(d => d !== null));

  const averageDurationOllamaQueries = averageArray([...metrics.filter(
    (m) => m.provider === "ollama"
  ).map(m => m.generated_interpretation_duration_ms), ...metrics.filter(
    (m) => m.provider === "ollama"
  ).map(m => m.generated_sql_duration_ms)].filter(d => d !== null));

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Assistant AI Metrics</h1>

      <div className="flex gap-4">
        <div className="bg-green-100 text-green-800 p-4 rounded-xl shadow">
          SQL Success: <br />{successCount}
        </div>
        <div className="bg-red-100 text-red-800 p-4 rounded-xl shadow">
          SQL Failures: <br />{failCount}
        </div>
        <div className="bg-gray-100 text-gray-800 p-4 rounded-xl shadow">
          Ollama Queries: <br />{ollamaQueriesCount}
        </div>
        <div className="bg-gray-100 text-gray-800 p-4 rounded-xl shadow">
          OpenAI Queries: <br />{openaiQueriesCount}
        </div>
        <div className="bg-gray-100 text-gray-800 p-4 rounded-xl shadow">
          OpenAI Queries Avg Duration: <br />{formatDuration(averageDurationOpenaiQueries)}
        </div>
        <div className="bg-gray-100 text-gray-800 p-4 rounded-xl shadow">
          Ollama Queries Avg Duration: <br />{formatDuration(averageDurationOllamaQueries)}
        </div>
      </div>

      <input
        className="w-full p-2 border rounded-md"
        placeholder="Search user input..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="overflow-auto">
        <table className="min-w-full border text-sm text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Provider</th>
              <th className="p-2 border">Input</th>
              <th className="p-2 border">SQL Status</th>
              <th className="p-2 border">Interp. Status</th>
              <th className="p-2 border">SQL Duration </th>
              <th className="p-2 border">Interp. Duration</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => (
              <tr key={m.id} className="hover:bg-gray-50">
                <td className="p-2 border">{new Date(m.executed_at).toLocaleString()}</td>
                <td className="p-2 border">{m.provider}</td>
                <td className="p-2 border">{m.user_input}</td>
                <td className="p-2 border">{m.generated_sql_status}</td>
                <td className="p-2 border">{m.generated_interpretation_status}</td>
                <td className="p-2 border">{formatDuration(m.generated_sql_duration_ms)}</td>
                <td className="p-2 border">{formatDuration(m.generated_interpretation_duration_ms)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard

