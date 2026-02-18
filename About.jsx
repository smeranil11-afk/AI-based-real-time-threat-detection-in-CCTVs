import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { Shield, Users, Globe, Award, CheckCircle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import cctvImage from "./CCTV camera detects people's faces_ _ Stock Video _ Pond5.jpg";

export default function About() {
    return (
        <div className="min-h-screen bg-navy">
            <Navigation />

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                            Protecting Communities with <span className="text-electric">Advanced AI</span>
                        </h1>
                        <p className="text-lg text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed">
                            ProTechVision is pioneering the future of public safety. We combine cutting-edge computer vision with ethical AI principles to create safer environments for everyone.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-16 px-6 bg-charcoal/50">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="text-3xl font-bold text-white mb-4">Our Mission</h2>
                            <p className="text-gray-300 mb-6 leading-relaxed">
                                Violence in public spaces is a growing concern that requires immediate and intelligent response mechanisms. Our mission is to reduce response times from minutes to seconds, potentially saving lives and preventing escalation.
                            </p>
                            <p className="text-gray-300 mb-6 leading-relaxed">
                                We believe in technology that serves humanity. Our systems are designed to be privacy-conscious, focusing solely on threat detection without compromising individual liberties.
                            </p>
                            <div className="flex gap-4">
                                <div className="flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-electric" />
                                    <span className="text-white font-medium">Safety First</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users className="h-5 w-5 text-electric" />
                                    <span className="text-white font-medium">Community Focused</span>
                                </div>
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            className="relative"
                        >
                            <div className="aspect-video rounded-lg overflow-hidden border border-charcoal-light shadow-2xl shadow-electric/10 relative">
                                {/* Surveillance footage image */}
                                <img
                                    src={cctvImage}
                                    alt="AI-powered surveillance monitoring"
                                    className="w-full h-full object-cover opacity-80"
                                    style={{ filter: "grayscale(100%) contrast(1.2)" }}
                                />
                                {/* Scan-line overlay */}
                                <div
                                    className="absolute inset-0 pointer-events-none"
                                    style={{
                                        background:
                                            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.12) 2px, rgba(0,0,0,0.12) 4px)",
                                    }}
                                />
                                {/* Vignette */}
                                <div
                                    className="absolute inset-0 pointer-events-none"
                                    style={{
                                        background:
                                            "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.5) 100%)",
                                    }}
                                />
                                {/* Camera label */}
                                <div className="absolute top-3 left-3 flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                                    <span className="text-xs text-electric font-mono font-semibold drop-shadow-lg">
                                        CAM 01 — MAIN LOBBY
                                    </span>
                                </div>
                                {/* REC indicator */}
                                <div className="absolute top-3 right-3 flex items-center gap-1">
                                    <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                                    <span className="text-[10px] text-red-400 font-mono font-bold">REC</span>
                                </div>
                                {/* Timestamp */}
                                <div className="absolute bottom-3 left-3 text-[11px] text-gray-300/80 font-mono drop-shadow-lg">
                                    2026-02-18 10:19:04 | AI DETECTION: ACTIVE
                                </div>
                                {/* Color overlay */}
                                <div className="absolute inset-0 bg-electric/10 mix-blend-overlay" />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Stats / Impact Section */}
            <section className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {[
                            { icon: Globe, label: "Global Reach", value: "12+ Countries" },
                            { icon: Shield, label: "Incidents Prevented", value: "5,000+" },
                            { icon: Users, label: "Lives Protected", value: "1M+" },
                            { icon: Award, label: "Accuracy Rate", value: "99.2%" },
                        ].map((stat, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                            >
                                <Card className="bg-navy-light border-charcoal-light text-center hover:border-electric/30 transition-colors">
                                    <CardContent className="p-6">
                                        <div className="mx-auto bg-charcoal w-12 h-12 rounded-full flex items-center justify-center mb-4">
                                            <stat.icon className="h-6 w-6 text-electric" />
                                        </div>
                                        <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                                        <div className="text-sm text-gray-400">{stat.label}</div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact CTA */}
            <section className="py-20 px-6 bg-gradient-to-b from-navy to-charcoal">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold text-white mb-6">Ready to enhance your security infrastructure?</h2>
                    <p className="text-gray-400 mb-8">
                        Contact our team to verify how ProTechVision can be integrated into your existing systems.
                    </p>
                    <Button size="lg" className="gap-2">
                        Contact Sales <ArrowRight className="h-4 w-4" />
                    </Button>
                </div>
            </section>

            <Footer />
        </div>
    );
}
