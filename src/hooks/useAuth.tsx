import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import {
  AuthResponse,
  AuthUser,
  ChangePasswordPayload,
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
  UpdateProfilePayload,
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
  setAuth: (data: AuthResponse) => void;
  updateUser: (user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const persisted = authService.loadAuth();
  const [token, setToken] = useState<string | null>(persisted?.token ?? null);
  const [user, setUser] = useState<AuthUser | null>(persisted?.user ?? null);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token && user),
      setAuth: (data) => {
        authService.saveAuth(data);
        setToken(data.token);
        setUser(data.user);
        debugLog("[AUTH] Token stored in localStorage", {
          userId: data.user.id,
          role: data.user.role,
        });
      },
      updateUser: (nextUser) => {
        if (!token) return;
        authService.saveAuth({ token, user: nextUser });
        setUser(nextUser);
        debugLog("[AUTH]", {
          message: "User profile updated in auth store",
          userId: nextUser.id,
          role: nextUser.role,
        });
      },
      logout: () => {
        authService.clearAuth();
        setToken(null);
        setUser(null);
        debugLog("[AUTH] User logged out", {});
      },
    }),
    [token, user],
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
    mutationFn: (payload: LoginPayload) => {
      debugLog("[MUTATION START]", { mutationName: "signIn" });
      debugLog("[AUTH] SignIn started", payload);
      return authService.signIn(payload);
    },
    onSuccess: (data) => {
      debugLog("[MUTATION SUCCESS]", { mutationName: "signIn", data });
      debugLog("[AUTH] SignIn success", data.user);
      setAuth(data);
    },
    onError: (error) => {
      debugError("[MUTATION ERROR]", { mutationName: "signIn", error });
      debugError("[AUTH] SignIn failed", error);
    },
  });
};

export const useRegisterMutation = () => {
  return useMutation({
    mutationFn: (payload: RegisterPayload) => {
      debugLog("[MUTATION START]", { mutationName: "register" });
      return authService.register(payload);
    },
    onSuccess: (data) => {
      debugLog("[MUTATION SUCCESS]", { mutationName: "register", data });
    },
    onError: (error) => {
      debugError("[MUTATION ERROR]", { mutationName: "register", error });
    },
  });
};

export const useUpdateProfileMutation = () => {
  const { updateUser, user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => {
      debugLog("[MUTATION START]", { mutationName: "updateProfile" });
      return authService.updateProfile(payload);
    },
    onSuccess: (updatedUser) => {
      debugLog("[MUTATION SUCCESS]", { mutationName: "updateProfile", data: updatedUser });
      if (user) {
        updateUser({ ...user, ...updatedUser });
      } else {
        updateUser(updatedUser);
      }
      queryClient.invalidateQueries({ queryKey: ["auth", "profile"] });
    },
    onError: (error) => {
      debugError("[MUTATION ERROR]", { mutationName: "updateProfile", error });
    },
  });
};

export const useChangePasswordMutation = () => {
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) => {
      debugLog("[MUTATION START]", { mutationName: "changePassword" });
      return authService.changePassword(payload);
    },
    onSuccess: (data) => {
      debugLog("[MUTATION SUCCESS]", { mutationName: "changePassword", data });
    },
    onError: (error) => {
      debugError("[MUTATION ERROR]", { mutationName: "changePassword", error });
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
