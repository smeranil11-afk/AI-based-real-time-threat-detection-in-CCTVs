import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { Badge } from "../components/ui/badge";
import { Camera, Shield, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function DetectionPortal() {
    const [webcamEnabled, setWebcamEnabled] = useState(false);
    const navigate = useNavigate();

    const handleRunAssessment = () => {
        navigate("/monitor");
    };

    return (
        <div className="min-h-screen bg-navy">
            <Navigation />

            <div className="pt-24 px-6 pb-20">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left - Main Content */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Header */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                                    Real-time Violence Detection for{" "}
                                    <span className="text-electric">Safer Public Spaces</span>
                                </h1>
                                <p className="text-gray-400 text-lg">
                                    Leveraging LSTM-CNN architecture to detect and prevent
                                    violence before it escalates. Submit live footage for instant
                                    AI-powered threat analysis.
                                </p>
                            </motion.div>

                            {/* Detection Image */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className="relative"
                            >
                                <Card className="overflow-hidden border-2 border-charcoal-light">
                                    <CardContent className="p-0">
                                        <div className="relative aspect-video bg-gradient-to-br from-navy to-navy-light flex items-center justify-center">
                                            {/* Silhouette Image Placeholder */}
                                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-navy/50 to-navy">
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="text-center">
                                                        <Camera className="h-24 w-24 text-electric/20 mx-auto mb-4" />
                                                        <p className="text-gray-500 text-sm">Live Feed Preview</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Violence Detected Badge */}
                                            <div className="absolute top-4 right-4 z-10">
                                                <Badge variant="destructive" className="text-sm px-4 py-2 animate-pulse">
                                                    VIOLENCE DETECTED
                                                </Badge>
                                            </div>

                                            {/* Camera Info */}
                                            <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-lg z-10">
                                                <p className="text-white text-sm font-mono">Camera Feed #1</p>
                                                <p className="text-gray-400 text-xs font-mono">
                                                    {new Date().toLocaleTimeString()}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            {/* Realtime Stats */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                                className="grid grid-cols-3 gap-4"
                            >
                                <Card>
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs text-gray-400 uppercase mb-1">
                                                    Threat Level
                                                </p>
                                                <p className="text-2xl font-bold text-red-500">High</p>
                                            </div>
                                            <Shield className="h-8 w-8 text-red-500" />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs text-gray-400 uppercase mb-1">
                                                    Confidence
                                                </p>
                                                <p className="text-2xl font-bold text-electric">94.2%</p>
                                            </div>
                                            <Activity className="h-8 w-8 text-electric" />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs text-gray-400 uppercase mb-1">
                                                    Active Cams
                                                </p>
                                                <p className="text-2xl font-bold text-white">12</p>
                                            </div>
                                            <Camera className="h-8 w-8 text-white" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </div>

                        {/* Right - Access Portal Sidebar */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                        >
                            <Card className="sticky top-24">
                                <CardHeader>
                                    <CardTitle className="text-center">Access Portal</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Login Form */}
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-sm text-gray-400 mb-1 block">
                                                Email Address
                                            </label>
                                            <Input
                                                type="email"
                                                placeholder="admin@security.com"
                                                className="bg-navy-light"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-400 mb-1 block">
                                                Password
                                            </label>
                                            <Input
                                                type="password"
                                                placeholder="••••••••"
                                                className="bg-navy-light"
                                            />
                                        </div>
                                        <Button className="w-full">Login</Button>
                                    </div>

                                    <div className="border-t border-charcoal-light pt-4">
                                        <p className="text-sm text-gray-400 mb-3">Quick Access</p>

                                        {/* Webcam Switch */}
                                        <div className="bg-navy-light rounded-lg p-4 mb-3">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-white">
                                                    Webcam Feed
                                                </span>
                                                <button
                                                    onClick={() => setWebcamEnabled(!webcamEnabled)}
                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${webcamEnabled ? "bg-electric" : "bg-charcoal-light"
                                                        }`}
                                                >
                                                    <span
                                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${webcamEnabled ? "translate-x-6" : "translate-x-1"
                                                            }`}
                                                    />
                                                </button>
                                            </div>
                                            <p className="text-xs text-gray-400">
                                                {webcamEnabled
                                                    ? "Camera is active"
                                                    : "Enable to start monitoring"}
                                            </p>
                                        </div>

                                        {/* Run Assessment Button */}
                                        <Button
                                            className="w-full gap-2"
                                            size="lg"
                                            onClick={handleRunAssessment}
                                            disabled={!webcamEnabled}
                                        >
                                            <Activity className="h-5 w-5" />
                                            Run Assessment
                                        </Button>

                                        <p className="text-xs text-gray-400 text-center mt-3">
                                            AI-powered real-time analysis
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
