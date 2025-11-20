import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import TaskCard from '../components/TaskCard';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from './AdminDashboard';

type Task = {
  _id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed';
  createdAt: string;
  createdBy?: { _id?: string; username?: string } | string;
  isOwner?: boolean;
};

const statusTabs = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'In Progress', value: 'in-progress' },
  { label: 'Completed', value: 'completed' },
];

const Dashboard = () => {
  const { user } = useAuth();

  if (user?.role === 'admin') {
    return <AdminDashboard />;
  }
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ status: '', search: '' });

  const fetchTasks = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await API.get('/tasks', {
        params: {
          status: filters.status || undefined,
          search: filters.search || undefined,
        },
      });
      const normalized: Task[] = data.tasks.map((task: Task) => {
        const creatorId =
          typeof task.createdBy === 'string'
            ? task.createdBy
            : task.createdBy?._id;

        return {
          ...task,
          isOwner: creatorId === user?.id,
        };
      });
      setTasks(normalized);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApplyFilters = () => {
    fetchTasks();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this task?')) return;
    try {
      await API.delete(`/tasks/${id}`);
      setTasks((prev) => prev.filter((task) => task._id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-slate-500">
            User Dashboard
            {user?.username ? ` • ${user.username}` : ''}
          </p>
          <h1 className="text-3xl font-semibold text-slate-900">Task Manager</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track your work and stay productive with a clean, minimal workspace.
          </p>
        </div>
        <Link
          to="/tasks/new"
          className="inline-flex items-center justify-center rounded-full bg-brand px-5 py-3 text-sm font-medium text-white shadow hover:bg-brand/90"
        >
          <span className="text-lg mr-2">+</span>
          New Task
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="h-5 w-5"
          >
            <path d="M3 5h18M6 12h12M10 19h4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Filter
        </div>
        <div className="flex flex-wrap gap-2">
          {statusTabs.map((tab) => (
            <button
              key={tab.value || 'all'}
              type="button"
              onClick={() => {
                setFilters((prev) => ({ ...prev, status: tab.value }));
                setTimeout(() => handleApplyFilters(), 0);
              }}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                filters.status === tab.value
                  ? 'bg-slate-900 text-white shadow'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="text-sm text-rose-600 bg-rose-50 px-3 py-2 rounded">{error}</p>
      )}

      {loading ? (
        <p className="text-center text-slate-500">Loading tasks…</p>
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center shadow-sm">
          <p className="text-lg font-medium text-slate-600">
            No tasks yet. Create your first task to get started!
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              isAdmin={user?.role === 'admin'}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default Dashboard;
