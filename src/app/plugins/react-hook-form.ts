import { zodResolver } from "@hookform/resolvers/zod";
import {
  useForm,
  type FieldValues,
  type Resolver,
  type UseFormProps,
  type UseFormReturn,
} from "react-hook-form";
import type { z } from "zod";

export const formDefaultOptions = {
  mode: "onSubmit",
  reValidateMode: "onChange",
  shouldFocusError: true,
} as const;

type ZodFormOptions<TSchema extends z.ZodType<FieldValues, FieldValues>> = Omit<
  UseFormProps<z.input<TSchema>, unknown, z.output<TSchema>>,
  "resolver"
>;

export function useZodForm<TSchema extends z.ZodType<FieldValues, FieldValues>>(
  schema: TSchema,
  options?: ZodFormOptions<TSchema>,
): UseFormReturn<z.input<TSchema>, unknown, z.output<TSchema>> {
  return useForm<z.input<TSchema>, unknown, z.output<TSchema>>({
    ...formDefaultOptions,
    ...options,
    resolver: zodResolver(schema) as unknown as Resolver<
      z.input<TSchema>,
      unknown,
      z.output<TSchema>
    >,
  });
}
