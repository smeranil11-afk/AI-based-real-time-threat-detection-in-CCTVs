import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { Play, Cpu, Bell, FolderSearch, ArrowRight, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import cctvImage1 from "./CCTV camera detects people's faces_ _ Stock Video _ Pond5.jpg";
import cctvImage2 from "./images.jpg";
import cctvImage3 from "./images (1).jpg";
import cctvImage4 from "./images (2).jpg";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-navy">
            <Navigation />

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Left Content */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                                Intelligent Safety.{" "}
                                <span className="text-electric">Real-time</span> Protection.
                            </h1>
                            <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                                Leverage LSTM-CNN based architecture to detect and prevent
                                violence in public spaces. Our AI analyzes video feeds in
                                real-time with 99.2% accuracy, ensuring immediate threat response.
                            </p>
                            <div className="flex gap-4">
                                <Button size="lg" className="gap-2">
                                    <Play className="h-5 w-5" />
                                    Watch Demo
                                </Button>
                                <Button size="lg" variant="outline">
                                    Learn More
                                </Button>
                            </div>
                        </motion.div>

                        {/* Right - Camera Grid Mockup */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="relative"
                        >
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    {
                                        id: 1,
                                        label: "CAM 1 — STREET",
                                        time: "10:15:23",
                                        src: cctvImage1,
                                        alert: false,
                                    },
                                    {
                                        id: 2,
                                        label: "CAM 2 — CORRIDOR",
                                        time: "10:15:24",
                                        src: cctvImage2,
                                        alert: true,
                                    },
                                    {
                                        id: 3,
                                        label: "CAM 3 — PARKING",
                                        time: "10:15:23",
                                        src: cctvImage3,
                                        alert: false,
                                    },
                                    {
                                        id: 4,
                                        label: "CAM 4 — LOBBY",
                                        time: "10:15:25",
                                        src: cctvImage4,
                                        alert: false,
                                    },
                                ].map((cam) => (
                                    <div
                                        key={cam.id}
                                        className="aspect-video bg-gradient-to-br from-charcoal to-navy-light rounded-lg border border-charcoal-light overflow-hidden relative group"
                                    >
                                        {/* CCTV Image */}
                                        <img
                                            src={cam.src}
                                            alt={`Camera ${cam.id} feed`}
                                            className="absolute inset-0 w-full h-full object-cover group-hover:opacity-100 transition-opacity duration-300"
                                            style={{ filter: "grayscale(100%) contrast(1.3) brightness(0.8)" }}
                                        />
                                        {/* Scan-line overlay for CCTV effect */}
                                        <div
                                            className="absolute inset-0 pointer-events-none"
                                            style={{
                                                background:
                                                    "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)",
                                            }}
                                        />
                                        {/* Vignette overlay */}
                                        <div
                                            className="absolute inset-0 pointer-events-none"
                                            style={{
                                                background:
                                                    "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%)",
                                            }}
                                        />
                                        {/* Camera label */}
                                        <div className="absolute top-2 left-2 flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                                            <span className="text-xs text-electric font-mono font-semibold drop-shadow-lg">
                                                {cam.label}
                                            </span>
                                        </div>
                                        {/* Timestamp */}
                                        <div className="absolute bottom-2 left-2 text-[10px] text-gray-300/80 font-mono drop-shadow-lg">
                                            2026-02-18 {cam.time}
                                        </div>
                                        {/* REC indicator */}
                                        <div className="absolute top-2 right-2 flex items-center gap-1">
                                            <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                                            <span className="text-[10px] text-red-400 font-mono font-bold">
                                                REC
                                            </span>
                                        </div>
                                        {/* Alert badge */}
                                        {cam.alert && (
                                            <div className="absolute bottom-2 right-2">
                                                <div className="bg-red-600 text-white text-xs px-2 py-1 rounded font-semibold animate-pulse shadow-lg shadow-red-600/50">
                                                    ⚠ ALERT
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 px-6 bg-charcoal/50">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="text-center"
                        >
                            <div className="text-4xl font-bold text-electric mb-2">99.2%</div>
                            <div className="text-sm text-gray-400 uppercase tracking-wide">
                                Detection Accuracy
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="text-center"
                        >
                            <div className="text-4xl font-bold text-electric mb-2">&lt; 1s</div>
                            <div className="text-sm text-gray-400 uppercase tracking-wide">
                                Response Time
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-center"
                        >
                            <div className="text-4xl font-bold text-electric mb-2">1,500+</div>
                            <div className="text-sm text-gray-400 uppercase tracking-wide">
                                Active Units
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-white mb-4">
                            Advanced AI for Modern Security Infrastructure
                        </h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            Powered by deep learning models trained on extensive datasets,
                            providing unparalleled accuracy in threat detection.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <Card className="h-full hover:border-electric/50 transition-colors">
                                <CardContent className="p-8">
                                    <div className="h-12 w-12 rounded-lg bg-electric/10 flex items-center justify-center mb-6">
                                        <Cpu className="h-6 w-6 text-electric" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-white mb-3">
                                        CNN-LSTM Engine
                                    </h3>
                                    <p className="text-gray-400 mb-4">
                                        Our hybrid deep learning architecture combines spatial feature
                                        extraction with temporal sequence analysis for precise violence
                                        detection in video streams.
                                    </p>
                                    <ul className="space-y-2">
                                        <li className="flex items-start gap-2 text-sm text-gray-300">
                                            <CheckCircle className="h-4 w-4 text-electric mt-0.5 flex-shrink-0" />
                                            Real-time frame analysis
                                        </li>
                                        <li className="flex items-start gap-2 text-sm text-gray-300">
                                            <CheckCircle className="h-4 w-4 text-electric mt-0.5 flex-shrink-0" />
                                            Temporal pattern recognition
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Feature 2 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                        >
                            <Card className="h-full hover:border-electric/50 transition-colors">
                                <CardContent className="p-8">
                                    <div className="h-12 w-12 rounded-lg bg-electric/10 flex items-center justify-center mb-6">
                                        <Bell className="h-6 w-6 text-electric" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-white mb-3">
                                        Automated Alerts
                                    </h3>
                                    <p className="text-gray-400 mb-4">
                                        Instant notifications to security personnel when threats are
                                        detected. Configurable alert thresholds and multi-channel
                                        delivery systems.
                                    </p>
                                    <ul className="space-y-2">
                                        <li className="flex items-start gap-2 text-sm text-gray-300">
                                            <CheckCircle className="h-4 w-4 text-electric mt-0.5 flex-shrink-0" />
                                            SMS, email, and app notifications
                                        </li>
                                        <li className="flex items-start gap-2 text-sm text-gray-300">
                                            <CheckCircle className="h-4 w-4 text-electric mt-0.5 flex-shrink-0" />
                                            Priority escalation workflows
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Feature 3 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <Card className="h-full hover:border-electric/50 transition-colors">
                                <CardContent className="p-8">
                                    <div className="h-12 w-12 rounded-lg bg-electric/10 flex items-center justify-center mb-6">
                                        <FolderSearch className="h-6 w-6 text-electric" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-white mb-3">
                                        Verifiable Evidence
                                    </h3>
                                    <p className="text-gray-400 mb-4">
                                        Automatic recording and archival of incident footage with
                                        tamper-proof timestamps and chain-of-custody documentation.
                                    </p>
                                    <ul className="space-y-2">
                                        <li className="flex items-start gap-2 text-sm text-gray-300">
                                            <CheckCircle className="h-4 w-4 text-electric mt-0.5 flex-shrink-0" />
                                            Encrypted cloud storage
                                        </li>
                                        <li className="flex items-start gap-2 text-sm text-gray-300">
                                            <CheckCircle className="h-4 w-4 text-electric mt-0.5 flex-shrink-0" />
                                            Exportable incident reports
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <Card className="bg-gradient-to-r from-electric-dark via-electric to-electric-light border-0 overflow-hidden">
                        <CardContent className="p-12 text-center">
                            <h2 className="text-3xl md:text-4xl font-bold text-navy-light mb-4">
                                Ready to secure your public spaces with next-generation AI?
                            </h2>
                            <p className="text-navy-light/80 text-lg mb-8 max-w-2xl mx-auto">
                                Join hundreds of organizations protecting communities with
                                ProTechVision
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button
                                    size="lg"
                                    className="bg-navy-light hover:bg-navy text-white gap-2"
                                >
                                    Start Free Trial
                                    <ArrowRight className="h-5 w-5" />
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="border-2 border-navy-light text-navy-light hover:bg-navy-light hover:text-white"
                                >
                                    Talk to Sales
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>

            <Footer />
        </div>
    );
}
