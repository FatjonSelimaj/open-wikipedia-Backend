import { z } from "zod";

export const loginSchema = z.object({
    email: z.string().min(1, { message: "Email is required" }).email(),
    password: z.string().min(1, { message: "Password is required" }),
});

export type TLoginSchema = z.infer<typeof loginSchema>;