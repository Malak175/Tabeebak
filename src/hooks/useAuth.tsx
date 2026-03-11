import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import { meQueryKeys, useFetchMeQuery } from "@/hooks/useMe";
import { meService, toAuthUser } from "@/services/me.service";
import {
  AuthResponse,
  AuthTokenResponse,
  AuthUser,
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
  UserRole,
} from "@/types/auth.types";

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
  user: AuthUser | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  bootstrapError: Error | null;
  setAuth: (data: AuthTokenResponse) => Promise<AuthUser>;
  retryBootstrap: () => Promise<AuthUser | null>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const [persisted] = useState(() => authService.loadAuth());
  const [token, setToken] = useState<string | null>(persisted?.token ?? null);
  const [user, setUser] = useState<AuthUser | null>(persisted?.user ?? null);
  const [isBootstrapping, setIsBootstrapping] = useState(false);
  const [bootstrapError, setBootstrapError] = useState<Error | null>(null);
  const meQuery = useFetchMeQuery(Boolean(token));

  const persistAuth = useCallback((nextToken: string, nextUser: AuthUser | null) => {
    authService.saveAuth({ token: nextToken, user: nextUser });
  }, []);

  const bootstrapUser = useCallback(async (nextToken: string): Promise<AuthUser> => {
    setIsBootstrapping(true);
    setBootstrapError(null);
    setToken(nextToken);
    persistAuth(nextToken, null);

    try {
      const me = await queryClient.fetchQuery({
        queryKey: meQueryKeys.auth,
        queryFn: meService.getMe,
      });

      const nextUser = toAuthUser(me);
      setUser(nextUser);
      persistAuth(nextToken, nextUser);
      debugLog("[AUTH] Bootstrapped authenticated user", {
        userId: nextUser.id,
        role: nextUser.role,
      });
      return nextUser;
    } catch (error) {
      const nextError = error instanceof Error ? error : new Error("Failed to bootstrap auth session");
      setBootstrapError(nextError);
      setUser(null);
      persistAuth(nextToken, null);
      debugError("[AUTH] Bootstrap failed", nextError);
      throw nextError;
    } finally {
      setIsBootstrapping(false);
    }
  }, [persistAuth, queryClient]);

  useEffect(() => {
    if (!persisted?.token) return;

    void bootstrapUser(persisted.token);
  }, [bootstrapUser, persisted?.token]);

  useEffect(() => {
    if (!token || !meQuery.data) return;

    const nextUser = toAuthUser(meQuery.data);
    setUser(nextUser);
    persistAuth(token, nextUser);
  }, [meQuery.data, persistAuth, token]);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token && user && !isBootstrapping),
      isBootstrapping,
      bootstrapError,
      setAuth: async (data) => {
        debugLog("[AUTH] Token stored in localStorage", {
          tokenPreview: `${data.token.slice(0, 8)}...`,
        });
        return bootstrapUser(data.token);
      },
      retryBootstrap: async () => {
        if (!token) return null;
        return bootstrapUser(token);
      },
      logout: () => {
        authService.clearAuth();
        queryClient.removeQueries({ queryKey: meQueryKeys.all });
        setToken(null);
        setUser(null);
        setBootstrapError(null);
        setIsBootstrapping(false);
        debugLog("[AUTH] User logged out", {});
      },
    }),
    [bootstrapError, bootstrapUser, isBootstrapping, queryClient, token, user],
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
  const { setAuth } = useAuth();

  return useMutation({
    mutationFn: async (payload: LoginPayload): Promise<AuthResponse> => {
      debugLog("[MUTATION START]", { mutationName: "signIn" });
      debugLog("[AUTH] SignIn started", payload);
      const response = await authService.signIn(payload);
      const user = await setAuth(response);
      return { token: response.token, user };
    },
    onSuccess: (data) => {
      debugLog("[MUTATION SUCCESS]", { mutationName: "signIn", data });
      debugLog("[AUTH] SignIn success", data.user);
    },
    onError: (error) => {
      debugError("[MUTATION ERROR]", { mutationName: "signIn", error });
      debugError("[AUTH] SignIn failed", error);
    },
  });
};

export const useRegisterMutation = () => {
  const { setAuth } = useAuth();

  return useMutation({
    mutationFn: async (payload: RegisterPayload): Promise<AuthResponse> => {
      debugLog("[MUTATION START]", { mutationName: "register" });
      const response = await authService.register(payload);
      const user = await setAuth(response);
      return { token: response.token, user };
    },
    onSuccess: (data) => {
      debugLog("[MUTATION SUCCESS]", { mutationName: "register", data });
    },
    onError: (error) => {
      debugError("[MUTATION ERROR]", { mutationName: "register", error });
    },
  });
};

export const useForgotPasswordMutation = () => {
  return useMutation({
    mutationFn: (payload: ForgotPasswordPayload) => {
      debugLog("[MUTATION START]", { mutationName: "forgotPassword" });
      return authService.forgotPassword(payload);
    },
    onSuccess: (data) => {
      debugLog("[MUTATION SUCCESS]", { mutationName: "forgotPassword", data });
    },
    onError: (error) => {
      debugError("[MUTATION ERROR]", { mutationName: "forgotPassword", error });
    },
  });
};

export const useResetPasswordMutation = () => {
  return useMutation({
    mutationFn: (payload: ResetPasswordPayload) => {
      debugLog("[MUTATION START]", { mutationName: "resetPassword" });
      return authService.resetPassword(payload);
    },
    onSuccess: (data) => {
      debugLog("[MUTATION SUCCESS]", { mutationName: "resetPassword", data });
    },
    onError: (error) => {
      debugError("[MUTATION ERROR]", { mutationName: "resetPassword", error });
    },
  });
};

export const hasRoleAccess = (userRole: UserRole | undefined, allowedRoles: UserRole[]) => {
  if (!userRole) return false;
  return allowedRoles.includes(userRole);
};
