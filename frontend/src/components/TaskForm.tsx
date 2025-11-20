import type { ChangeEvent, FormEvent } from 'react';

type TaskFormProps = {
  formState: {
    title: string;
    description: string;
    status: string;
  };
  onChange: (
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  loading: boolean;
  isEdit: boolean;
};

const statuses = [
  { value: 'pending', label: 'Pending' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

const TaskForm = ({ formState, onChange, onSubmit, loading, isEdit }: TaskFormProps) => {
  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Title
        </label>
        <input
          type="text"
          name="title"
          value={formState.title}
          onChange={onChange}
          required
          className="input"
          placeholder="e.g. Plan sprint demo"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Description
        </label>
        <textarea
          name="description"
          value={formState.description}
          onChange={onChange}
          rows={4}
          className="input"
          placeholder="Add important details or steps…"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Status
        </label>
        <select
          name="status"
          value={formState.status}
          onChange={onChange}
          className="input"
        >
          {statuses.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </div>
      <button type="submit" className="btn-primary w-full" disabled={loading}>
        {loading ? 'Saving…' : isEdit ? 'Update Task' : 'Create Task'}
      </button>
    </form>
  );
};

export default TaskForm;
