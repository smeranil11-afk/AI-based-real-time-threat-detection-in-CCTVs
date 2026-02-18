import { useEffect, useState } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
    AlertTriangle,
    Camera,
    Target,
    Activity,
    Wifi,
    Clock,
    MapPin,
    Phone,
    Bell,
    Shield,
    Play,
    Pause,
} from "lucide-react";
import { motion } from "framer-motion";
// import { Link } from "react-router-dom"; // Link removed as we use Navigation component

import Navigation from "../components/Navigation";

export default function LiveDetection() {
    const [threatLevel, setThreatLevel] = useState(84);
    const [isMonitoring, setIsMonitoring] = useState(true);
    const [alerts, setAlerts] = useState(3);

    return (
        <div className="min-h-screen bg-navy p-6 pt-24">
            <Navigation />
            <div className="max-w-[1920px] mx-auto">
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 h-[calc(100vh-8rem)]">
                    {/* Left Sidebar - Metrics */}
                    <div className="space-y-4 overflow-y-auto">
                        {/* Header Link Removed - Using Navigation Component */}
                        <div className="flex items-center justify-between mb-4">
                            <Badge variant={isMonitoring ? "success" : "secondary"} className="gap-1 ml-auto">
                                <Wifi className="h-3 w-3" />
                                {isMonitoring ? "LIVE" : "OFFLINE"}
                            </Badge>
                        </div>

                        {/* Threat Level Gauge */}
                        <Card className="bg-charcoal/50">
                            <CardContent className="p-6">
                                <div className="text-center">
                                    <p className="text-xs text-gray-400 uppercase mb-4">
                                        Threat Level
                                    </p>
                                    <div className="relative inline-flex items-center justify-center">
                                        <svg className="w-32 h-32 transform -rotate-90">
                                            <circle
                                                cx="64"
                                                cy="64"
                                                r="56"
                                                stroke="currentColor"
                                                strokeWidth="8"
                                                fill="none"
                                                className="text-charcoal-light"
                                            />
                                            <circle
                                                cx="64"
                                                cy="64"
                                                r="56"
                                                stroke="currentColor"
                                                strokeWidth="8"
                                                fill="none"
                                                strokeDasharray={`${2 * Math.PI * 56}`}
                                                strokeDashoffset={`${2 * Math.PI * 56 * (1 - threatLevel / 100)}`}
                                                className={
                                                    threatLevel > 70
                                                        ? "text-red-500"
                                                        : threatLevel > 40
                                                            ? "text-yellow-500"
                                                            : "text-green-500"
                                                }
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                                            <span className="text-3xl font-bold text-white">
                                                {threatLevel}%
                                            </span>
                                            <span className="text-xs text-gray-400">HIGH</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Metrics Cards */}
                        <div className="space-y-3">
                            <Card className="bg-charcoal/50">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                                            <AlertTriangle className="h-5 w-5 text-red-500" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs text-gray-400">Active Alerts</p>
                                            <p className="text-xl font-bold text-white">{alerts}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-charcoal/50">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-electric/10 flex items-center justify-center">
                                            <Camera className="h-5 w-5 text-electric" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs text-gray-400">Active Cameras</p>
                                            <p className="text-xl font-bold text-white">12</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-charcoal/50">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                                            <Activity className="h-5 w-5 text-green-500" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs text-gray-400">Detection Rate</p>
                                            <p className="text-xl font-bold text-white">99.2%</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Location Info */}
                        <Card className="bg-charcoal/50">
                            <CardContent className="p-4 space-y-3">
                                <h3 className="font-semibold text-white text-sm">
                                    Current Location
                                </h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2 text-gray-300">
                                        <MapPin className="h-4 w-4 text-electric" />
                                        <span>Main Entrance, Building A</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-300">
                                        <Clock className="h-4 w-4 text-electric" />
                                        <span>{new Date().toLocaleTimeString()}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Center - Circular Viewfinder */}
                    <div className="xl:col-span-2 flex flex-col">
                        <Card className="flex-1 bg-charcoal/50 flex items-center justify-center relative overflow-hidden">
                            <CardContent className="p-8 w-full h-full flex items-center justify-center">
                                {/* Circular Viewfinder */}
                                <div className="relative">
                                    {/* Main Circle */}
                                    <motion.div
                                        className="relative w-[500px] h-[500px] rounded-full border-4 border-electric/30 overflow-hidden"
                                        animate={{ borderColor: ["rgba(6, 182, 212, 0.3)", "rgba(6, 182, 212, 0.6)", "rgba(6, 182, 212, 0.3)"] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    >
                                        {/* Video Feed Background */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy-light to-charcoal">
                                            {/* Crosshair Overlay */}
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="relative w-full h-full">
                                                    <div className="absolute top-1/2 left-0 right-0 h-px bg-electric/20" />
                                                    <div className="absolute top-0 bottom-0 left-1/2 w-px bg-electric/20" />

                                                    {/* Corner Markers */}
                                                    <div className="absolute top-[25%] left-[25%] w-16 h-16">
                                                        <div className="absolute top-0 left-0 w-4 h-px bg-electric" />
                                                        <div className="absolute top-0 left-0 w-px h-4 bg-electric" />
                                                    </div>
                                                    <div className="absolute top-[25%] right-[25%] w-16 h-16">
                                                        <div className="absolute top-0 right-0 w-4 h-px bg-electric" />
                                                        <div className="absolute top-0 right-0 w-px h-4 bg-electric" />
                                                    </div>
                                                    <div className="absolute bottom-[25%] left-[25%] w-16 h-16">
                                                        <div className="absolute bottom-0 left-0 w-4 h-px bg-electric" />
                                                        <div className="absolute bottom-0 left-0 w-px h-4 bg-electric" />
                                                    </div>
                                                    <div className="absolute bottom-[25%] right-[25%] w-16 h-16">
                                                        <div className="absolute bottom-0 right-0 w-4 h-px bg-electric" />
                                                        <div className="absolute bottom-0 right-0 w-px h-4 bg-electric" />
                                                    </div>

                                                    {/* Central Target */}
                                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                                        <Target className="h-12 w-12 text-electric/30" />
                                                    </div>

                                                    {/* Red Detection Box */}
                                                    <motion.div
                                                        className="absolute top-[30%] left-[35%] w-[30%] h-[40%] border-4 border-red-500 rounded-lg"
                                                        animate={{
                                                            opacity: [0.6, 1, 0.6],
                                                        }}
                                                        transition={{ duration: 1.5, repeat: Infinity }}
                                                    >
                                                        <div className="absolute -top-8 left-0 bg-red-500 px-3 py-1 rounded text-xs font-bold text-white">
                                                            THREAT DETECTED
                                                        </div>
                                                    </motion.div>
                                                </div>
                                            </div>

                                            {/* Scanning Lines Effect */}
                                            <motion.div
                                                className="absolute inset-0 bg-gradient-to-b from-transparent via-electric/5 to-transparent h-24"
                                                animate={{
                                                    top: ["-100px", "500px"],
                                                }}
                                                transition={{
                                                    duration: 3,
                                                    repeat: Infinity,
                                                    ease: "linear",
                                                }}
                                            />
                                        </div>

                                        {/* Recording Badge */}
                                        <div className="absolute top-4 right-4">
                                            <Badge variant="destructive" className="gap-2 animate-pulse">
                                                <span className="h-2 w-2 rounded-full bg-white" />
                                                REC
                                            </Badge>
                                        </div>

                                        {/* Info Badge */}
                                        <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-2 rounded-lg">
                                            <p className="text-white text-xs font-mono">CAM #3 - MAIN ENTRANCE</p>
                                        </div>
                                    </motion.div>

                                    {/* Outer Ring Glow */}
                                    <div className="absolute -inset-4 rounded-full border border-electric/10 animate-pulse" />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Bottom Control Panel */}
                        <div className="mt-4 grid grid-cols-4 gap-4">
                            <Button
                                variant={isMonitoring ? "destructive" : "default"}
                                className="gap-2"
                                onClick={() => setIsMonitoring(!isMonitoring)}
                            >
                                {isMonitoring ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                                {isMonitoring ? "Pause" : "Resume"}
                            </Button>
                            <Button variant="outline" className="gap-2">
                                <Camera className="h-4 w-4" />
                                Switch Cam
                            </Button>
                            <Button variant="outline" className="gap-2">
                                <Activity className="h-4 w-4" />
                                Analysis
                            </Button>
                            <Button variant="outline" className="gap-2">
                                <Shield className="h-4 w-4" />
                                Reports
                            </Button>
                        </div>
                    </div>

                    {/* Right Sidebar - Alerts */}
                    <div className="space-y-4 overflow-y-auto">
                        {/* Alert Panel */}
                        <Card className="bg-red-600">
                            <CardContent className="p-6">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="h-6 w-6 text-white animate-pulse flex-shrink-0" />
                                    <div className="flex-1">
                                        <h3 className="font-bold text-white text-lg mb-1">
                                            AUTOMATED ALARM: ACTIVE
                                        </h3>
                                        <p className="text-red-100 text-sm mb-4">
                                            High-confidence threat detected at Main Entrance
                                        </p>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                className="bg-white text-red-600 hover:bg-red-50 flex-1"
                                            >
                                                Escalate
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="border-white text-white hover:bg-white hover:text-red-600 flex-1"
                                            >
                                                Dismiss
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Alerts */}
                        <Card className="bg-charcoal/50">
                            <CardContent className="p-4">
                                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                                    <Bell className="h-4 w-4 text-electric" />
                                    Recent Alerts
                                </h3>
                                <div className="space-y-3">
                                    {[
                                        { time: "21:03:45", severity: "Critical", cam: "CAM #3" },
                                        { time: "20:47:22", severity: "High", cam: "CAM #7" },
                                        { time: "20:15:33", severity: "Medium", cam: "CAM #1" },
                                    ].map((alert, i) => (
                                        <div
                                            key={i}
                                            className="bg-navy-light p-3 rounded-lg border border-charcoal-light"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-mono text-gray-400">
                                                    {alert.time}
                                                </span>
                                                <Badge
                                                    variant={
                                                        alert.severity === "Critical"
                                                            ? "destructive"
                                                            : alert.severity === "High"
                                                                ? "warning"
                                                                : "default"
                                                    }
                                                    className="text-xs"
                                                >
                                                    {alert.severity}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-white">{alert.cam}</p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Emergency Contact */}
                        <Card className="bg-charcoal/50">
                            <CardContent className="p-4">
                                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-electric" />
                                    Emergency Contact
                                </h3>
                                <Button variant="destructive" className="w-full gap-2">
                                    <Phone className="h-4 w-4" />
                                    Call Emergency
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
