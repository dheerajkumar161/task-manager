import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import TaskForm from '../components/TaskForm';
import TaskCard from '../components/TaskCard';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

type UserSummary = {
  _id: string;
  username: string;
  role: 'user' | 'admin';
  taskCount: number;
};

type UserDetail = {
  _id: string;
  username: string;
  role: 'user' | 'admin';
  createdAt?: string;
};

type TaskType = {
  _id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed';
  createdAt: string;
  createdBy?: { _id?: string; username?: string; role?: string } | string;
};

const taskInitialState = {
  title: '',
  description: '',
  status: 'pending' as 'pending' | 'in-progress' | 'completed',
};

const AdminDashboard = () => {
  const { user: admin } = useAuth();
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [userTasks, setUserTasks] = useState<TaskType[]>([]);
  const [profileForm, setProfileForm] = useState({ username: '', role: 'user' });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [taskFormState, setTaskFormState] = useState(taskInitialState);
  const [taskSaving, setTaskSaving] = useState(false);
  const [taskError, setTaskError] = useState('');

  const fetchUsers = async () => {
    setUsersLoading(true);
    setUsersError('');
    try {
      const { data } = await API.get('/users');
      setUsers(data);
      if (!selectedUserId && data.length > 0) {
        loadUser(data[0]._id);
      } else if (selectedUserId) {
        const exists = data.find((item: UserSummary) => item._id === selectedUserId);
        if (!exists && data.length) {
          loadUser(data[0]._id);
        }
      }
    } catch (err: any) {
      setUsersError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadUser = async (id: string) => {
    setSelectedUserId(id);
    setProfileError('');
    setTaskError('');
    try {
      const { data } = await API.get(`/users/${id}`);
      setSelectedUser(data.user);
      setProfileForm({
        username: data.user.username,
        role: data.user.role,
      });
      setUserTasks(data.tasks);
    } catch (err: any) {
      setProfileError(err.response?.data?.message || 'Failed to load profile');
    }
  };

  const handleProfileChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const handleProfileSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedUserId) return;
    setProfileSaving(true);
    setProfileError('');
    try {
      await API.put(`/users/${selectedUserId}`, profileForm);
      await fetchUsers();
      await loadUser(selectedUserId);
    } catch (err: any) {
      setProfileError(err.response?.data?.message || 'Failed to update user');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleTaskFormChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setTaskFormState({ ...taskFormState, [e.target.name]: e.target.value });
  };

  const handleTaskCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedUserId) return;
    setTaskSaving(true);
    setTaskError('');
    try {
      await API.post('/tasks', {
        ...taskFormState,
        ownerId: selectedUserId,
      });
      setTaskFormState(taskInitialState);
      await loadUser(selectedUserId);
    } catch (err: any) {
      setTaskError(err.response?.data?.message || 'Failed to create task');
    } finally {
      setTaskSaving(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Delete this task?')) return;
    try {
      await API.delete(`/tasks/${taskId}`);
      if (selectedUserId) {
        await loadUser(selectedUserId);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete task');
    }
  };

  const selectedUserSummary = useMemo(
    () => users.find((u) => u._id === selectedUserId),
    [users, selectedUserId]
  );

  return (
    <section className="space-y-6">
      <div className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">Signed in as</p>
          <h2 className="text-2xl font-semibold text-slate-900">{admin?.username}</h2>
          <p className="text-sm text-slate-500 capitalize">{admin?.role}</p>
        </div>
        <button className="btn-secondary" onClick={fetchUsers} disabled={usersLoading}>
          Refresh data
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px,1fr]">
        <aside className="card h-fit">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Team members</h3>
            <span className="text-xs text-slate-500">{users.length} total</span>
          </div>

          {usersError && (
            <p className="text-sm text-rose-600 bg-rose-50 px-3 py-2 rounded">{usersError}</p>
          )}

          {usersLoading ? (
            <p className="text-sm text-slate-500">Loading users…</p>
          ) : users.length === 0 ? (
            <p className="text-sm text-slate-500">No users registered yet.</p>
          ) : (
            <ul className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
              {users.map((member) => (
                <li key={member._id}>
                  <button
                    type="button"
                    onClick={() => loadUser(member._id)}
                    className={`w-full text-left rounded-md border px-3 py-2 transition ${
                      member._id === selectedUserId
                        ? 'border-brand bg-brand/10 text-brand'
                        : 'border-slate-200 hover:border-brand/60'
                    }`}
                  >
                    <span className="flex items-center justify-between text-sm font-medium">
                      {member.username}
                      <span className="text-xs capitalize text-slate-500">
                        {member.role}
                      </span>
                    </span>
                    <span className="text-xs text-slate-500">
                      {member.taskCount} task{member.taskCount === 1 ? '' : 's'}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <div className="space-y-6">
          {!selectedUser ? (
            <div className="card">
              <p className="text-sm text-slate-500">Select a user to view details.</p>
            </div>
          ) : (
            <>
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">
                      {selectedUser.username}
                    </h3>
                    <p className="text-sm text-slate-500">
                      Member since{' '}
                      {selectedUser.createdAt
                        ? new Date(selectedUser.createdAt).toLocaleDateString()
                        : '—'}
                    </p>
                  </div>
                  {selectedUserSummary && (
                    <div className="text-right">
                      <p className="text-3xl font-semibold text-slate-900">
                        {selectedUserSummary.taskCount}
                      </p>
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Tasks
                      </p>
                    </div>
                  )}
                </div>
                <form onSubmit={handleProfileSave} className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    {profileError && (
                      <p className="text-sm text-rose-600 bg-rose-50 px-3 py-2 rounded mb-3">
                        {profileError}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={profileForm.username}
                      onChange={handleProfileChange}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Role
                    </label>
                    <select
                      name="role"
                      value={profileForm.role}
                      onChange={handleProfileChange}
                      className="input capitalize"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="md:col-span-2 flex justify-end">
                    <button type="submit" className="btn-primary" disabled={profileSaving}>
                      {profileSaving ? 'Saving…' : 'Update profile'}
                    </button>
                  </div>
                </form>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  Create task for {selectedUser.username}
                </h3>
                {taskError && (
                  <p className="text-sm text-rose-600 bg-rose-50 px-3 py-2 rounded mb-3">
                    {taskError}
                  </p>
                )}
                <TaskForm
                  formState={taskFormState}
                  onChange={handleTaskFormChange}
                  onSubmit={handleTaskCreate}
                  loading={taskSaving}
                  isEdit={false}
                />
              </div>

              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900">
                    {selectedUser.username}&apos;s tasks
                  </h3>
                  <span className="text-sm text-slate-500">
                    {userTasks.length} task{userTasks.length === 1 ? '' : 's'}
                  </span>
                </div>
                {userTasks.length === 0 ? (
                  <p className="text-sm text-slate-500">No tasks found for this user.</p>
                ) : (
                  <div className="space-y-4">
                    {userTasks.map((task) => (
                      <TaskCard
                        key={task._id}
                        task={task}
                        isAdmin
                        onDelete={handleDeleteTask}
                      />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default AdminDashboard;

