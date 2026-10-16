export type LoginPayload = {
  email: string;
  password: string;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken?: string;
  userId?: number;
};

export type LoginResponse = Record<string, unknown>;

export type MeName = {
  uz: string;
  ru: string;
  uz_cryl: string;
};

export type MeModule = {
  id: number;
  key: string;
  order: number;
  name: MeName;
  icon?: { id: number; url?: string } | null;
};

export type MePage = {
  id: number;
  key: string;
  order: number;
  module_id: number;
  name: MeName;
};

export type MeProfile = {
  id?: number;
  first_name?: string | null;
  last_name?: string | null;
  business_id?: number;
  user_id?: number;
};

export type MeResponse = {
  user_id: number;
  business_id?: number;
  role: string;
  modules: MeModule[];
  pages: MePage[];
  permissions: string[];
  [key: string]: unknown;
};
