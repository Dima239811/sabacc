import { classNames } from '@/shared/lib/classNames/classNames';
import { memo, ReactNode } from 'react';
import cls from './{{pascalCase}}.module.scss';

interface {{pascalCase}}Props {
  className?: string;
  children: ReactNode;
}

export const {{pascalCase}} = memo((props: {{pascalCase}}Props) => {
  const { className, children, ...otherProps } = props;

  return (
    <div className={classNames(cls.{{pascalCase}}, {}, [className])} {...otherProps}>
      {children}
    </div>
  );
});
