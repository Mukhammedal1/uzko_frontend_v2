"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { Controller } from "react-hook-form";

import { BaseInputPassword } from "@/component/base/input/BaseInputPassword";
import { BaseInputText } from "@/component/base/input/BaseInputText";
import { Button } from "@/component/ui/button";
import {
  LOGIN_DEFAULT_VALUES,
  LOGIN_REDIRECT_PATH,
} from "@/constants/login/login.constants";
import { useZodForm } from "@/plugins/react-hook-form";
import { useLoginMutation } from "@/rest/query/auth/auth.query";
import type { LoginFormValues } from "@/types/login.types";
import { loginSchema } from "@/validate/login/login.zod";

export function LoginForm() {
  const t = useTranslations();
  const router = useRouter();
  const login = useLoginMutation();

  const form = useZodForm(loginSchema, {
    defaultValues: LOGIN_DEFAULT_VALUES,
  });

  const translateError = (message?: string) =>
    message ? t(message as Parameters<typeof t>[0]) : undefined;

  const onSubmit = (values: LoginFormValues) => {
    login.mutate(values, {
      onSuccess: () => router.replace(LOGIN_REDIRECT_PATH),
    });
  };

  return (
    <form
      noValidate
      className="flex w-full flex-col gap-6"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("login.title")}
        </h1>
        <p className="text-sm text-muted-foreground">{t("login.subtitle")}</p>
      </div>

      <Controller
        control={form.control}
        name="email"
        render={({ field, fieldState }) => (
          <BaseInputText
            id="login-email"
            type="email"
            label={t("login.email")}
            placeholder={t("login.emailPlaceholder")}
            autoComplete="email"
            value={field.value}
            error={translateError(fieldState.error?.message)}
            disabled={login.isPending}
            onChange={field.onChange}
            onBlur={field.onBlur}
          />
        )}
      />

      <Controller
        control={form.control}
        name="password"
        render={({ field, fieldState }) => (
          <BaseInputPassword
            id="login-password"
            label={t("login.password")}
            placeholder={t("login.passwordPlaceholder")}
            showLabel={t("login.showPassword")}
            hideLabel={t("login.hidePassword")}
            autoComplete="current-password"
            value={field.value}
            error={translateError(fieldState.error?.message)}
            disabled={login.isPending}
            onChange={field.onChange}
            onBlur={field.onBlur}
          />
        )}
      />

      <Button
        type="submit"
        size="lg"
        className="h-10 w-full"
        disabled={login.isPending}
      >
        {login.isPending ? t("login.submitting") : t("login.submit")}
      </Button>
    </form>
  );
}
