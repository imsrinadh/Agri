import React from 'react';

export default function Button({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'disease' | 'outline'
  size = 'md', // 'sm' | 'md' | 'lg'
  icon: Icon,
  iconPosition = 'right',
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  style = {},
  ...props
}) {
  const variantClass = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    disease: 'btn-disease',
    outline: 'btn-outline',
  }[variant] || 'btn-primary';

  const sizeStyle = {
    sm: { padding: '8px 16px', fontSize: '0.84rem' },
    md: { padding: '12px 24px', fontSize: '0.95rem' },
    lg: { padding: '14px 30px', fontSize: '1.02rem' },
  }[size] || {};

  return (
    <button
      type={type}
      className={`${variantClass} ${className}`}
      disabled={disabled}
      onClick={onClick}
      style={{
        ...sizeStyle,
        ...style,
        opacity: disabled ? 0.6 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
      {...props}
    >
      {Icon && iconPosition === 'left' && <Icon size={size === 'sm' ? 14 : 17} />}
      <span>{children}</span>
      {Icon && iconPosition === 'right' && <Icon size={size === 'sm' ? 14 : 17} />}
    </button>
  );
}
