import { ReactElement } from 'react';

export interface Option<T> {
  label: string;
  value: T;
}

export interface RadioButtonOption<T> {
  key: T;
  title: string | ReactElement;
  description: string;
}
