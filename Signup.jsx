import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Signup() {
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
                        <h1 className="text-3xl font-bold text-white">Create Account</h1>
                        <p className="text-gray-400 mt-2">Join ProTechVision for advanced security solutions</p>
                    </div>

                    <Card className="border-charcoal-light bg-navy-light/50 backdrop-blur-sm">
                        <CardHeader className="space-y-1">
                            <CardTitle className="text-2xl text-center text-white">Sign Up</CardTitle>
                            <CardDescription className="text-center text-gray-400">
                                Enter your details to create an account
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-200">First Name</label>
                                    <Input
                                        placeholder="John"
                                        className="bg-navy border-charcoal-light text-white placeholder:text-gray-500 focus-visible:ring-electric"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-200">Last Name</label>
                                    <Input
                                        placeholder="Doe"
                                        className="bg-navy border-charcoal-light text-white placeholder:text-gray-500 focus-visible:ring-electric"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-200">Email</label>
                                <Input
                                    type="email"
                                    placeholder="name@example.com"
                                    className="bg-navy border-charcoal-light text-white placeholder:text-gray-500 focus-visible:ring-electric"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-200">Password</label>
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    className="bg-navy border-charcoal-light text-white placeholder:text-gray-500 focus-visible:ring-electric"
                                />
                            </div>
                            <Button className="w-full bg-electric hover:bg-electric/90 text-white font-bold py-2">
                                Create Account
                            </Button>
                        </CardContent>
                        <div className="px-6 pb-6 text-center text-sm text-gray-400">
                            Already have an account?{" "}
                            <Link to="/login" className="text-electric hover:underline font-medium">
                                Log in
                            </Link>
                        </div>
                    </Card>
                </motion.div>
            </div>

            <Footer />
        </div>
    );
}
