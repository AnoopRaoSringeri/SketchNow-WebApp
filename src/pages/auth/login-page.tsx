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

const formSchema = z.object({
    username: z.string().min(2).max(50),
    email: z.string().email("Invalid email"),
    password: z.string()
});

export const LogInPage = observer(function LogInPage() {
    const { loading, logIn } = useAuth();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            email: "",
            password: ""
        }
    });
    async function onSubmit(values: z.infer<typeof formSchema>) {
        logIn(values);
    }

    return (
        <Card className="mx-auto max-w-sm">
            <CardHeader>
                <CardTitle className="text-xl">Login</CardTitle>
                <CardDescription>Enter your email below to login to your account</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Username</FormLabel>
                                        <FormControl>
                                            <Input className="space-y-0" placeholder="Username" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
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
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center">
                                            <FormLabel>Password</FormLabel>
                                            <NavLink
                                                to="/forgot-password"
                                                className="ml-auto inline-block text-sm underline"
                                            >
                                                Forgot your password?
                                            </NavLink>
                                        </div>
                                        <FormControl>
                                            <Input className="space-y-0" placeholder="Password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full" loading={loading}>
                                Login
                            </Button>
                            <Button variant="outline" className="w-full">
                                Login with Google
                            </Button>
                        </form>
                    </Form>
                </div>
                <div className="mt-4 text-center text-sm">
                    Don&apos;t have an account?{" "}
                    <NavLink to="/register" className="underline">
                        Sign up
                    </NavLink>
                </div>
            </CardContent>
        </Card>
    );
});
