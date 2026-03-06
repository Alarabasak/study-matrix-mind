import React from 'react';
import { cn } from '@/lib/utils';

interface NotebookPageProps {
  children: React.ReactNode;
  className?: string;
}

const NotebookPage: React.FC<NotebookPageProps> = ({ children, className }) => (
  <div className={cn('notebook-page p-5 pl-6', className)}>
    {children}
  </div>
);

export default NotebookPage;
