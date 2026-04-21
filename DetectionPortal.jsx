import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { Badge } from "../components/ui/badge";
import { Camera, Shield, Activity, Brain, Cpu, Zap, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function DetectionPortal() {
    const [webcamEnabled, setWebcamEnabled] = useState(false);
    const navigate = useNavigate();
    const [modelInfo, setModelInfo] = useState(null);
    const [isTraining, setIsTraining] = useState(false);
    const [trainingResult, setTrainingResult] = useState(null);
    const BACKEND = "http://localhost:5000";

    const handleRunAssessment = () => {
        navigate("/monitor");
    };

    useEffect(() => {
        const fetchModelInfo = async () => {
            try {
                const res = await fetch(`${BACKEND}/model_info`, { signal: AbortSignal.timeout(3000) });
                if (res.ok) setModelInfo(await res.json());
            } catch { /* offline */ }
        };
        fetchModelInfo();
        const interval = setInterval(fetchModelInfo, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleTrainModel = async () => {
        setIsTraining(true);
        setTrainingResult(null);
        try {
            const res = await fetch(`${BACKEND}/train`, { method: "POST" });
            const data = await res.json();
            setTrainingResult(data);
            const infoRes = await fetch(`${BACKEND}/model_info`);
            if (infoRes.ok) setModelInfo(await infoRes.json());
        } catch (err) {
            setTrainingResult({ error: err.message });
        }
        setIsTraining(false);
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
                                    <span className="text-electric">Safer Lifts</span>
                                </h1>
                                <p className="text-gray-400 text-lg">
                                    AI-powered lift CCTV surveillance that detects violence,
                                    hood touch, and bad touch in elevators. Upload lift footage
                                    for instant AI-powered threat analysis.
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
                                                <p className="text-white text-sm font-mono">Lift CCTV Feed</p>
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
                                                    Active Lifts
                                                </p>
                                                <p className="text-2xl font-bold text-white">4</p>
                                            </div>
                                            <Camera className="h-8 w-8 text-white" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            {/* Model Statistics */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                            >
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Brain className="h-5 w-5 text-electric" />
                                            ML Model Statistics
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {modelInfo ? (
                                            <div className="space-y-4">
                                                {/* Metrics Grid */}
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                    <div className="bg-navy-light rounded-lg p-3 text-center">
                                                        <p className="text-xs text-gray-400 mb-1">Accuracy</p>
                                                        <p className="text-xl font-bold text-green-400">{(modelInfo.accuracy * 100).toFixed(1)}%</p>
                                                    </div>
                                                    <div className="bg-navy-light rounded-lg p-3 text-center">
                                                        <p className="text-xs text-gray-400 mb-1">Precision</p>
                                                        <p className="text-xl font-bold text-electric">{(modelInfo.precision * 100).toFixed(1)}%</p>
                                                    </div>
                                                    <div className="bg-navy-light rounded-lg p-3 text-center">
                                                        <p className="text-xs text-gray-400 mb-1">Recall</p>
                                                        <p className="text-xl font-bold text-yellow-400">{(modelInfo.recall * 100).toFixed(1)}%</p>
                                                    </div>
                                                    <div className="bg-navy-light rounded-lg p-3 text-center">
                                                        <p className="text-xs text-gray-400 mb-1">F1 Score</p>
                                                        <p className="text-xl font-bold text-purple-400">{(modelInfo.f1 * 100).toFixed(1)}%</p>
                                                    </div>
                                                </div>

                                                {/* Architecture & Dataset */}
                                                <div className="flex flex-col sm:flex-row gap-3">
                                                    <div className="flex-1 bg-navy-light rounded-lg p-3">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Cpu className="h-3.5 w-3.5 text-electric" />
                                                            <p className="text-xs text-gray-400">Architecture</p>
                                                        </div>
                                                        <p className="text-sm text-white font-medium">{modelInfo.architecture}</p>
                                                    </div>
                                                    <div className="flex-1 bg-navy-light rounded-lg p-3">
                                                        <p className="text-xs text-gray-400 mb-1">Dataset</p>
                                                        <p className="text-sm text-white font-medium">{modelInfo.trained_on}</p>
                                                        <p className="text-xs text-gray-500 mt-0.5">{modelInfo.num_frames} frames × {modelInfo.img_size}px</p>
                                                    </div>
                                                </div>

                                                {/* Confusion Matrix */}
                                                {modelInfo.confusion_matrix && (
                                                    <div className="bg-navy-light rounded-lg p-3">
                                                        <p className="text-xs text-gray-400 mb-2">Confusion Matrix</p>
                                                        <div className="grid grid-cols-2 gap-1 max-w-[200px]">
                                                            <div className="bg-green-500/20 rounded p-2 text-center">
                                                                <p className="text-xs text-gray-400">TN</p>
                                                                <p className="text-sm font-bold text-green-400">{modelInfo.confusion_matrix[0][0]}</p>
                                                            </div>
                                                            <div className="bg-red-500/20 rounded p-2 text-center">
                                                                <p className="text-xs text-gray-400">FP</p>
                                                                <p className="text-sm font-bold text-red-400">{modelInfo.confusion_matrix[0][1]}</p>
                                                            </div>
                                                            <div className="bg-orange-500/20 rounded p-2 text-center">
                                                                <p className="text-xs text-gray-400">FN</p>
                                                                <p className="text-sm font-bold text-orange-400">{modelInfo.confusion_matrix[1][0]}</p>
                                                            </div>
                                                            <div className="bg-green-500/20 rounded p-2 text-center">
                                                                <p className="text-xs text-gray-400">TP</p>
                                                                <p className="text-sm font-bold text-green-400">{modelInfo.confusion_matrix[1][1]}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Model Status + Train Button */}
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className={`h-2 w-2 rounded-full ${modelInfo.model_loaded ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                        <span className={`text-xs font-medium ${modelInfo.model_loaded ? 'text-green-400' : 'text-red-400'}`}>
                                                            {modelInfo.model_loaded ? 'Model Loaded' : 'Model Not Loaded'}
                                                        </span>
                                                    </div>
                                                    <button
                                                        onClick={handleTrainModel}
                                                        disabled={isTraining}
                                                        className="ml-auto flex items-center gap-2 bg-electric/20 hover:bg-electric/30 border border-electric/40 text-electric text-xs font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                                                    >
                                                        {isTraining ? <Loader2 className="h-3 w-3 animate-spin" /> : <Zap className="h-3 w-3" />}
                                                        {isTraining ? 'Training...' : 'Train Model'}
                                                    </button>
                                                </div>
                                                {trainingResult && (
                                                    <div className={`text-sm p-3 rounded-lg ${trainingResult.error ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-green-500/20 text-green-400 border border-green-500/30'}`}>
                                                        {trainingResult.error || `✓ Training complete! Accuracy: ${(trainingResult.metrics?.accuracy * 100).toFixed(1)}%`}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-400">Connect to backend to view model statistics.</p>
                                        )}
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
