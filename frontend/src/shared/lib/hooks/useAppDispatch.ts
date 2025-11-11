import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/app/providers/Store';

export const useAppDispatch = () => useDispatch<AppDispatch>();
