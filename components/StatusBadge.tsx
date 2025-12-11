import React from 'react';
import { SeriesStatus } from '../types';

interface StatusBadgeProps {
  status: SeriesStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const colors = {
    [SeriesStatus.WATCHING]: 'bg-rose-100 text-rose-700 border-rose-200',
    [SeriesStatus.WATCHED]: 'bg-teal-100 text-teal-700 border-teal-200',
    [SeriesStatus.WANT_TO_WATCH]: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  };

  const icons = {
    [SeriesStatus.WATCHING]: '▶',
    [SeriesStatus.WATCHED]: '✔',
    [SeriesStatus.WANT_TO_WATCH]: '★',
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border shadow-sm flex items-center gap-1 ${colors[status]}`}>
      <span>{icons[status]}</span>
      {status === SeriesStatus.WATCHING ? 'Assistindo' : 
       status === SeriesStatus.WATCHED ? 'Visto' : 'Quero Ver'}
    </span>
  );
};

export default StatusBadge;