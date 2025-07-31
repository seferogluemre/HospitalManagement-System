import { Static } from "@sinclair/typebox";
import { redirect } from "@tanstack/react-router";
import { t } from "elysia/type-system";
import { HTMLAttributes } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "#/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "#/components/ui/form";
import { Input } from "#/components/ui/input";
import { cn } from "#/lib/utils";
import { authClient } from "#lib/auth.ts";
import { typeboxResolver } from "#lib/resolver.ts";

type ForgotFormProps = HTMLAttributes<HTMLFormElement>;

const formSchema = t.Object({
    email: t.String({
        format: "email",
    }),
});

type FormSchema = Static<typeof formSchema>;

export function ForgotPasswordForm({ className, ...props }: ForgotFormProps) {
    const form = useForm<FormSchema>({
        resolver: typeboxResolver(formSchema),
        defaultValues: { email: "" },
    });

    async function onSubmit(data: FormSchema) {
        const response = await authClient.forgetPassword({ email: data.email });
        if (response.error) {
            toast.error(response.error.message);
        }
        if (response.data) {
            toast.success("Password reset email sent");
            throw redirect({ to: "/sign-in" });
        }
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className={cn("grid gap-2", className)}
                {...props}
            >
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem className="space-y-1">
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="name@example.com"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button className="mt-2" disabled={form.formState.isSubmitting}>
                    Continue
                </Button>
            </form>
        </Form>
    );
}
