import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import { meService } from "@/services/me.service";
import {
  AuthResponse,
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
  UserRole,
} from "@/types/auth.types";
import { ApiError } from "@/types/api.types";
import { MeResponse } from "@/types/me.types";
import { myAccountQueryKeys } from "@/hooks/useMyAccount";

const IS_DEV = import.meta.env.DEV;

const debugLog = (tag: string, payload: unknown) => {
  if (!IS_DEV) return;
  console.log(tag, payload);
};

const debugError = (tag: string, payload: unknown) => {
  if (!IS_DEV) return;
  console.error(tag, payload);
};

interface AuthContextValue {
  token: string | null;
  user: MeResponse | null;
  hasToken: boolean;
  isAuthenticated: boolean;
  isBootstrappingAuth: boolean;
  authBootstrapError: ApiError | Error | null;
  setSession: (data: AuthResponse) => Promise<MeResponse>;
  bootstrapAuth: () => Promise<MeResponse | null>;
  setBootstrappedUser: (user: MeResponse | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const authQueryKeys = {
  all: ["auth"] as const,
  bootstrap: () => ["auth", "bootstrap"] as const,
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const persisted = authService.loadAuth();
  const [token, setToken] = useState<string | null>(persisted?.token ?? null);
  const [user, setUser] = useState<MeResponse | null>(persisted?.user ?? null);
  const [isBootstrappingAuth, setIsBootstrappingAuth] = useState(Boolean(persisted?.token));
  const [authBootstrapError, setAuthBootstrapError] = useState<ApiError | Error | null>(null);
  const bootstrapPromiseRef = useRef<Promise<MeResponse | null> | null>(null);

  const clearRelatedQueries = useCallback(() => {
    queryClient.removeQueries({ queryKey: authQueryKeys.all });
    queryClient.removeQueries({ queryKey: myAccountQueryKeys.all });
  }, [queryClient]);

  const setBootstrappedUser = useCallback(
    (nextUser: MeResponse | null) => {
      setUser(nextUser);
      if (token) {
        authService.saveAuth({ token, user: nextUser });
      }
    },
    [token],
  );

  const logout = useCallback(() => {
    authService.clearAuth();
    setToken(null);
    setUser(null);
    setAuthBootstrapError(null);
    setIsBootstrappingAuth(false);
    bootstrapPromiseRef.current = null;
    clearRelatedQueries();
    debugLog("[AUTH] User logged out", {});
  }, [clearRelatedQueries]);

  const bootstrapAuth = useCallback(async (): Promise<MeResponse | null> => {
    if (!token) {
      setIsBootstrappingAuth(false);
      setAuthBootstrapError(null);
      setUser(null);
      return null;
    }

    if (bootstrapPromiseRef.current) {
      return bootstrapPromiseRef.current;
    }

    setIsBootstrappingAuth(true);
    setAuthBootstrapError(null);

    const bootstrapPromise = queryClient
      .fetchQuery({
        queryKey: myAccountQueryKeys.me(),
        queryFn: meService.getMe,
      })
      .then((me) => {
        setUser(me);
        authService.saveAuth({ token, user: me });
        debugLog("[AUTH] Bootstrap success", { userId: me.id, role: me.role });
        return me;
      })
      .catch((error: ApiError | Error) => {
        setAuthBootstrapError(error);
        authService.clearAuth();
        setToken(null);
        setUser(null);
        clearRelatedQueries();
        debugError("[AUTH] Bootstrap failed", error);
        throw error;
      })
      .finally(() => {
        setIsBootstrappingAuth(false);
        bootstrapPromiseRef.current = null;
      });

    bootstrapPromiseRef.current = bootstrapPromise;
    return bootstrapPromise;
  }, [clearRelatedQueries, queryClient, token]);

  useEffect(() => {
    if (!token) {
      setIsBootstrappingAuth(false);
      setAuthBootstrapError(null);
      return;
    }

    void bootstrapAuth();
  }, [bootstrapAuth, token]);

  const setSession = useCallback(
    async (data: AuthResponse) => {
      authService.saveAuth({ token: data.token, user: null });
      setToken(data.token);
      setUser(null);
      setAuthBootstrapError(null);
      setIsBootstrappingAuth(true);
      clearRelatedQueries();
      debugLog("[AUTH] Token stored in localStorage", { tokenPreview: `${data.token.slice(0, 8)}...` });

      try {
        const me = await queryClient.fetchQuery({
          queryKey: myAccountQueryKeys.me(),
          queryFn: meService.getMe,
        });

        setToken(data.token);
        setUser(me);
        setIsBootstrappingAuth(false);
        authService.saveAuth({ token: data.token, user: me });
        return me;
      } catch (error) {
        setAuthBootstrapError(error as ApiError | Error);
        authService.clearAuth();
        setToken(null);
        setUser(null);
        setIsBootstrappingAuth(false);
        throw error;
      }
    },
    [clearRelatedQueries, queryClient],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      hasToken: Boolean(token),
      isAuthenticated: Boolean(token && user),
      isBootstrappingAuth,
      authBootstrapError,
      setSession,
      bootstrapAuth,
      setBootstrappedUser,
      logout,
    }),
    [
      authBootstrapError,
      bootstrapAuth,
      isBootstrappingAuth,
      logout,
      setBootstrappedUser,
      setSession,
      token,
      user,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};

export const useSignInMutation = () => {
  const { setSession } = useAuth();

  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      debugLog("[MUTATION START]", { mutationName: "signIn" });
      const response = await authService.signIn(payload);
      return setSession(response);
    },
    onSuccess: (data) => {
      debugLog("[MUTATION SUCCESS]", { mutationName: "signIn", data });
    },
    onError: (error) => {
      debugError("[MUTATION ERROR]", { mutationName: "signIn", error });
    },
  });
};

export const useRegisterMutation = () =>
  useMutation({
    mutationFn: (payload: RegisterPayload) => authService.register(payload),
    onSuccess: (data) => {
      debugLog("[MUTATION SUCCESS]", { mutationName: "register", data });
    },
    onError: (error) => {
      debugError("[MUTATION ERROR]", { mutationName: "register", error });
    },
  });

export const useForgotPasswordMutation = () =>
  useMutation({
    mutationFn: (payload: ForgotPasswordPayload) => authService.forgotPassword(payload),
    onSuccess: (data) => {
      debugLog("[MUTATION SUCCESS]", { mutationName: "forgotPassword", data });
    },
    onError: (error) => {
      debugError("[MUTATION ERROR]", { mutationName: "forgotPassword", error });
    },
  });

export const useResetPasswordMutation = () =>
  useMutation({
    mutationFn: (payload: ResetPasswordPayload) => authService.resetPassword(payload),
    onSuccess: (data) => {
      debugLog("[MUTATION SUCCESS]", { mutationName: "resetPassword", data });
    },
    onError: (error) => {
      debugError("[MUTATION ERROR]", { mutationName: "resetPassword", error });
    },
  });

export const hasRoleAccess = (userRole: UserRole | undefined, allowedRoles: UserRole[]) => {
  if (!userRole) return false;
  return allowedRoles.includes(userRole);
};
