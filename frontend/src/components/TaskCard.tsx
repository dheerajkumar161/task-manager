import { Link } from 'react-router-dom';

type TaskCardProps = {
  task: {
    _id: string;
    title: string;
    description?: string;
    status: string;
    createdAt: string;
    createdBy?: { _id?: string; username?: string; role?: string } | string;
    isOwner?: boolean;
  };
  isAdmin: boolean;
  onDelete: (id: string) => void;
};

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  'in-progress': 'bg-sky-100 text-sky-800',
  completed: 'bg-emerald-100 text-emerald-800',
};

const TaskCard = ({ task, isAdmin, onDelete }: TaskCardProps) => {
  const formattedDate = new Date(task.createdAt).toLocaleDateString();
  const canEdit = isAdmin || task.isOwner;

  const ownerLabel =
    isAdmin && task.createdBy && typeof task.createdBy !== 'string'
      ? ` • ${task.createdBy.username ?? ''}`
      : '';

  return (
    <article className="card space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{task.title}</h3>
          <p className="text-sm text-slate-500">
            Created {formattedDate}
            {ownerLabel}
          </p>
        </div>
        <span
          className={`text-xs font-semibold px-3 py-1 rounded-full ${
            statusColors[task.status] || 'bg-slate-100 text-slate-600'
          }`}
        >
          {task.status.replace('-', ' ')}
        </span>
      </div>
      {task.description && (
        <p className="text-sm text-slate-600 whitespace-pre-line">
          {task.description}
        </p>
      )}
      <div className="flex flex-wrap gap-2 justify-end">
        {canEdit && (
          <Link to={`/tasks/${task._id}`} className="btn-secondary text-sm">
            Edit
          </Link>
        )}
        {(isAdmin || task.isOwner) && (
          <button
            onClick={() => onDelete(task._id)}
            className="btn-primary bg-rose-600 hover:bg-rose-500"
          >
            Delete
          </button>
        )}
      </div>
    </article>
  );
};

export default TaskCard;
