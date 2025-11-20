import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TaskForm from '../components/TaskForm';
import API from '../services/api';

type TaskFormState = {
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
};

const initialState: TaskFormState = {
  title: '',
  description: '',
  status: 'pending',
};

const CreateEditTask = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [formState, setFormState] = useState<TaskFormState>(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) return;

    const fetchTask = async () => {
      setLoading(true);
      try {
        const { data } = await API.get(`/tasks/${id}`);
        setFormState({
          title: data.title,
          description: data.description || '',
          status: data.status,
        });
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load task');
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [id, isEdit]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isEdit) {
        await API.put(`/tasks/${id}`, formState);
      } else {
        await API.post('/tasks', formState);
      }
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-2xl mx-auto">
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">
              {isEdit ? 'Edit Task' : 'Create Task'}
            </h2>
            <p className="text-sm text-slate-500">
              {isEdit
                ? 'Update details and status for this task.'
                : 'Capture everything you need your team to do.'}
            </p>
          </div>
        </div>
        {error && (
          <p className="text-sm text-rose-600 bg-rose-50 px-3 py-2 rounded mb-4">
            {error}
          </p>
        )}
        <TaskForm
          formState={formState}
          onChange={handleChange}
          onSubmit={handleSubmit}
          loading={loading}
          isEdit={isEdit}
        />
      </div>
    </section>
  );
};

export default CreateEditTask;
