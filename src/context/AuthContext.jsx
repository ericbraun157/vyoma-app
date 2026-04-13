import React, { createContext, useCallback, useContext, useMemo, useReducer } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../utils/constants';
import { api } from '../services/apiClient';

const AuthContext = createContext(null);

const initialState = {
  accessToken: null,
  user: null,
  businessId: null,
  branchId: null,
  branches: [],
};

function reducer(state, action) {
  switch (action.type) {
    case 'RESTORE':
      return { ...state, ...action.payload };
    case 'SET_SESSION':
      return { ...state, ...action.payload };
    case 'SET_BRANCH':
      return { ...state, branchId: action.branchId };
    case 'LOGOUT':
      return { ...initialState };
    default:
      return state;
  }
}

async function persistSession(payload) {
  await AsyncStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(payload));
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const bootstrap = useCallback(async () => {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.SESSION);
    if (!raw) return;
    const saved = JSON.parse(raw);
    dispatch({ type: 'RESTORE', payload: saved });
  }, []);

  const requestOtp = useCallback(async (mobile) => {
    return await api.post('/auth/otp/request', { mobile });
  }, []);

  const verifyOtp = useCallback(async (mobile, otp) => {
    const res = await api.post('/auth/otp/verify', { mobile, otp });
    const payload = {
      accessToken: res.accessToken,
      user: res.user,
      businessId: null,
      branchId: null,
      branches: [],
    };
    dispatch({ type: 'SET_SESSION', payload });
    await persistSession(payload);
    return res;
  }, []);

  const setupBusiness = useCallback(
    async ({ name, type, phone, city }) => {
      const res = await api.post(
        '/me/business/setup',
        { name, type, phone, city },
        { accessToken: state.accessToken },
      );
      const branches = await api.get('/me/branches', { accessToken: res.accessToken });
      const payload = {
        accessToken: res.accessToken,
        user: state.user,
        businessId: res.business?.id ?? null,
        branchId: res.branch?.id ?? null,
        branches,
      };
      dispatch({ type: 'SET_SESSION', payload });
      await persistSession(payload);
      return payload;
    },
    [state.accessToken, state.user],
  );

  const refreshBranches = useCallback(async () => {
    if (!state.accessToken) return [];
    const branches = await api.get('/me/branches', { accessToken: state.accessToken });
    const payload = { ...state, branches };
    dispatch({ type: 'SET_SESSION', payload });
    await persistSession(payload);
    return branches;
  }, [state]);

  const setBranch = useCallback(
    async (branchId) => {
      dispatch({ type: 'SET_BRANCH', branchId });
      await persistSession({ ...state, branchId });
    },
    [state],
  );

  const logout = useCallback(async () => {
    dispatch({ type: 'LOGOUT' });
    await AsyncStorage.removeItem(STORAGE_KEYS.SESSION);
  }, []);

  const value = useMemo(
    () => ({
      state,
      bootstrap,
      requestOtp,
      verifyOtp,
      setupBusiness,
      refreshBranches,
      setBranch,
      logout,
    }),
    [bootstrap, logout, refreshBranches, requestOtp, setBranch, setupBusiness, state, verifyOtp],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

