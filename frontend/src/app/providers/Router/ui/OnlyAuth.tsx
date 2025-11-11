import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { selectCurrentUser } from '@/features/Auth/model/selectors/authSelector';
import { getRouteMain } from '@/shared/const/router';

interface OnlyAuthProps {
    children: JSX.Element;
}

export function OnlyAuth({ children }: OnlyAuthProps) {
    const user = useSelector(selectCurrentUser);
    const location = useLocation();

    if (!user) {
        return (
            <Navigate to={getRouteMain()} state={{ from: location }} replace />
        );
    }

    return children;
}
