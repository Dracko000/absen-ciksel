import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useRouter } from 'next/router';

interface User {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: string;
  classId?: string;
  subject?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

interface AuthAction {
  type: string;
  payload?: any;
}

interface AuthContextType {
  state: AuthState;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: RegisterUserData) => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

interface RegisterUserData {
  userId: string;
  name: string;
  email: string;
  password: string;
  role: string;
  classId?: string;
  subject?: string;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, loading: true };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
      };
    case 'REGISTER_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
      };
    case 'LOGOUT':
      return {
        ...initialState,
        loading: false,
      };
    case 'AUTH_ERROR':
      return {
        ...state,
        loading: false,
      };
    case 'SET_LOADING_FALSE':
      return {
        ...state,
        loading: false,
      };
    default:
      return state;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const router = useRouter();

  const login = async (email: string, password: string) => {
    try {
      dispatch({ type: 'AUTH_START' });

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('auth-token', data.token);
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: data.user,
            token: data.token,
          },
        });
        router.push(`/${data.user.role.toLowerCase()}/dashboard`);
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error: any) {
      dispatch({ type: 'AUTH_ERROR' });
      throw error;
    }
  };

  const register = async (userData: RegisterUserData) => {
    try {
      dispatch({ type: 'AUTH_START' });

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('auth-token', data.token);
        dispatch({
          type: 'REGISTER_SUCCESS',
          payload: {
            user: data.user,
            token: data.token,
          },
        });
        router.push('/');
      } else {
        throw new Error(data.message || 'Registration failed');
      }
    } catch (error: any) {
      dispatch({ type: 'AUTH_ERROR' });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('auth-token');
    dispatch({ type: 'LOGOUT' });
    router.push('/login');
  };

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('auth-token');

    if (!token) {
      dispatch({ type: 'SET_LOADING_FALSE' });
      return;
    }

    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok && data.authenticated) {
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: data.user,
            token,
          },
        });
      } else {
        localStorage.removeItem('auth-token');
        dispatch({ type: 'SET_LOADING_FALSE' });
      }
    } catch (error) {
      localStorage.removeItem('auth-token');
      dispatch({ type: 'SET_LOADING_FALSE' });
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        state,
        login,
        logout,
        register,
        checkAuthStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};