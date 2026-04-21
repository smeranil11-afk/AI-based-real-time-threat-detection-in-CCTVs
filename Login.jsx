import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Login() {
    return (
        <div className="min-h-screen bg-navy flex flex-col">
            <Navigation />

            <div className="flex-1 flex items-center justify-center px-6 pt-20 pb-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md"
                >
                    <div className="text-center mb-8">
                        <ShieldCheck className="h-12 w-12 text-electric mx-auto mb-4" />
                        <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
                        <p className="text-gray-400 mt-2">Sign in to access the ProTechVision portal</p>
                    </div>

                    <Card className="border-charcoal-light bg-navy-light/50 backdrop-blur-sm">
                        <CardHeader className="space-y-1">
                            <CardTitle className="text-2xl text-center text-white">Login</CardTitle>
                            <CardDescription className="text-center text-gray-400">
                                Enter your email and password to login
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-200">Email</label>
                                <Input
                                    type="email"
                                    placeholder="admin@security.com"
                                    className="bg-navy border-charcoal-light text-white placeholder:text-gray-500 focus-visible:ring-electric"
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-gray-200">Password</label>
                                    <Link to="#" className="text-sm text-electric hover:underline">
                                        Forgot password?
                                    </Link>
                                </div>
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    className="bg-navy border-charcoal-light text-white placeholder:text-gray-500 focus-visible:ring-electric"
                                />
                            </div>
                            <Button className="w-full bg-electric hover:bg-electric/90 text-white font-bold py-2">
                                Sign In
                            </Button>
                        </CardContent>
                        <div className="px-6 pb-6 text-center text-sm text-gray-400">
                            Don't have an account?{" "}
                            <Link to="/signup" className="text-electric hover:underline font-medium">
                                Sign up
                            </Link>
                        </div>
                    </Card>
                </motion.div>
            </div>

            <Footer />
        </div>
    );
}
