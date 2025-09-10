import { ButtonHTMLAttributes, memo, ReactNode } from 'react';
import { classNames, Mods } from '@/shared/lib/classNames/classNames';
import cls from './Button.module.scss';

export type ButtonVariant = 'clear' | 'outline' | 'btn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  variant?: ButtonVariant;
  disabled?: boolean;
  fullwidth?: boolean;
  children?: ReactNode;
}

export const Button = memo((props: ButtonProps) => {
  const {
    className,
    variant = 'outline',
    disabled,
    fullwidth,
    children,
    ...otherProps
  } = props;

  const mods: Mods = {
    [cls.disabled]: disabled,
    [cls.fullwidth]: fullwidth,
  };

  const additionalClasses = [className, cls[variant]];

  console.log(className)
  
  return (
    <button
      type="button"
      className={classNames(cls.Button, mods, additionalClasses)}
      disabled={disabled}
      {...otherProps}
    >
      {children}
    </button>
  );
});
