import { zodResolver } from "@hookform/resolvers/zod";
import { observer } from "mobx-react";
import { useForm } from "react-hook-form";
import { NavLink } from "react-router-dom";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";

const formSchema = z.object({ email: z.string().email("Invalid email") });

export const ForgotPasswordPage = observer(function ForgotPasswordPage() {
    const { loading, forgotPassword } = useAuth();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: ""
        }
    });
    async function onSubmit(values: z.infer<typeof formSchema>) {
        await forgotPassword(values.email);
    }

    return (
        <Card className="mx-auto max-w-sm">
            <CardHeader>
                <CardTitle className="text-xl">Forgot password</CardTitle>
                <CardDescription> Enter your email below to get link to reset password</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input className="space-y-0" placeholder="Email" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full" loading={loading}>
                                Forgot password
                            </Button>
                        </form>
                    </Form>
                </div>
                <div className="mt-4 text-end text-sm">
                    <NavLink to="/" className="underline">
                        Login
                    </NavLink>
                </div>
            </CardContent>
        </Card>
    );
});
