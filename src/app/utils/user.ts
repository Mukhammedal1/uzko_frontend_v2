import type { MeProfile, MeResponse } from "@/types/auth.types";

const isProfile = (value: unknown): value is MeProfile =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const getMeProfile = (me?: MeResponse): MeProfile | undefined => {
  if (!me) return undefined;

  const profile = me[me.role];
  return isProfile(profile) ? profile : undefined;
};

export const getUserDisplayName = (me?: MeResponse) => {
  const profile = getMeProfile(me);
  if (!profile) return "";

  return [profile.first_name, profile.last_name]
    .filter((part): part is string => Boolean(part))
    .join(" ")
    .trim();
};

export const getUserInitials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";

  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
};
