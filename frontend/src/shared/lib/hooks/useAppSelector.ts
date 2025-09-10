import { TypedUseSelectorHook, useSelector } from 'react-redux';
import type { StateSchema } from '@/app/providers/Store';

export const useAppSelector: TypedUseSelectorHook<StateSchema> = useSelector;
