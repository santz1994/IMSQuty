import { User } from '../../api/authService';
interface AuthState {
    user: User | null;
    token: string | null;
    loading: boolean;
    error: string | null;
    isAuthenticated: boolean;
}
export declare const login: import("@reduxjs/toolkit").AsyncThunk<{
    token: string;
    user: {
        id: number;
        username: string;
        email: string;
        first_name: string;
        last_name: string;
        role: string;
    };
}, {
    email: string;
    password: string;
}, {
    state?: unknown;
    dispatch?: import("redux").Dispatch;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export declare const logout: import("@reduxjs/toolkit").AsyncThunk<void, void, {
    state?: unknown;
    dispatch?: import("redux").Dispatch;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
declare const _default: import("redux").Reducer<AuthState>;
export default _default;
