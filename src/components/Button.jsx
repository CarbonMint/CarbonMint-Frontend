import './Button.css';

/**
 * A styled button supporting visual variants and a disabled state.
 * @param {object} props
 * @param {'primary'|'secondary'|'danger'|'ghost'} [props.variant]
 */
export default function Button({
  variant = 'primary',
  type = 'button',
  disabled = false,
  onClick,
  children,
  className = '',
  tabIndex,
  ...rest
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`btn btn-${variant} ${className}`.trim()}
      tabIndex={tabIndex}
      {...rest}
    >
      {children}
    </button>
  );
}
