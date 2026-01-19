import { clsx } from 'clsx';

export default function Card({ children, className, ...props }) {
  return (
    <div
      className={clsx(
        'bg-surface-100/80 backdrop-blur-sm rounded-2xl border border-surface-200/50 p-6 transition-all duration-300',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
