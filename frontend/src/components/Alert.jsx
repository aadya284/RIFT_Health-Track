/**
 * Alert component - inline alert boxes with no modals/popups
 * variant: 'error' | 'warning' | 'info' | 'success'
 */
export default function Alert({ variant = 'error', title, children }) {
  const classes = {
    error: 'alert-error',
    warning: 'alert-warning',
    info: 'alert-info',
    success: 'alert-success',
  }

  const roles = {
    error: 'alert',
    warning: 'alert',
    info: 'status',
    success: 'status',
  }

  return (
    <div
      role={roles[variant] || 'alert'}
      aria-live={variant === 'error' || variant === 'warning' ? 'assertive' : 'polite'}
      className={classes[variant] || classes.error}
    >
      {title && <p className="font-semibold mb-0.5 m-0">{title}</p>}
      <p className="m-0">{children}</p>
    </div>
  )
}
