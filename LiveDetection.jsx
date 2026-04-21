import { useState, useEffect, useRef } from "react";
import Navigation from "../components/Navigation";
import {
    AlertTriangle,
    Camera,
    Activity,
    MapPin,
    Clock,
    Phone,
    Bell,
    CheckCircle,
    Upload,
    FileVideo,
    PauseCircle,
    PlayCircle,
    BarChart2,
    X,
    Download,
    Loader2,
    Wifi,
    WifiOff,
    Brain,
    Cpu,
    Zap,
} from "lucide-react";

const BACKEND = "http://localhost:5000";

export default function LiveDetection() {
    const [activeSource, setActiveSource] = useState("live");
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
    const [isPaused, setIsPaused] = useState(false);
    const [lastFrameUrl, setLastFrameUrl] = useState(null);
    const [currentCam, setCurrentCam] = useState(0);
    const [showReports, setShowReports] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadError, setUploadError] = useState(null);
    const [isStreaming, setIsStreaming] = useState(false);

    const [backendOnline, setBackendOnline] = useState(false);
    const [threatLevel, setThreatLevel] = useState(0);
    const [detectionType, setDetectionType] = useState("NONE");
    const [accuracy, setAccuracy] = useState(0);
    const [alerts, setAlerts] = useState([]);
    const [detectionLog, setDetectionLog] = useState([]);

    // Model info state
    const [modelInfo, setModelInfo] = useState(null);
    const [isTraining, setIsTraining] = useState(false);
    const [trainingResult, setTrainingResult] = useState(null);

    const fileInputRef = useRef(null);
    const imgRef = useRef(null);

    const cameras = [
        "CAM #1 - MAIN ENTRANCE",
        "CAM #2 - CORRIDOR",
        "CAM #3 - PARKING",
        "CAM #4 - LOBBY",
    ];

    useEffect(() => {
        const t = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
        return () => clearInterval(t);
    }, []);

    // Fetch model info on mount
    useEffect(() => {
        const fetchModelInfo = async () => {
            try {
                const res = await fetch(`${BACKEND}/model_info`, { signal: AbortSignal.timeout(3000) });
                if (res.ok) {
                    const data = await res.json();
                    setModelInfo(data);
                }
            } catch { /* backend offline */ }
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
            // Refresh model info after training
            const infoRes = await fetch(`${BACKEND}/model_info`);
            if (infoRes.ok) setModelInfo(await infoRes.json());
        } catch (err) {
            setTrainingResult({ error: err.message });
        }
        setIsTraining(false);
    };

    useEffect(() => {
        if (isPaused) return;
        const poll = async () => {
            try {
                const res = await fetch(`${BACKEND}/status`, { signal: AbortSignal.timeout(2000) });
                if (res.ok) {
                    const data = await res.json();
                    setBackendOnline(true);
                    setThreatLevel(data.threatLevel ?? 0);
                    setDetectionType(data.detectionType ?? "NONE");
                    setAccuracy(data.accuracy ?? 0);
                    if (Array.isArray(data.alerts) && data.alerts.length > 0) {
                        setAlerts(data.alerts);
                        setDetectionLog((prev) => {
                            const newEntries = data.alerts
                                .filter((a) => !prev.find((p) => p.id === a.id))
                                .map((a) => ({ ...a, time: new Date().toLocaleTimeString() }));
                            return [...newEntries, ...prev].slice(0, 20);
                        });
                    }
                } else {
                    setBackendOnline(false);
                }
            } catch {
                setBackendOnline(false);
            }
        };
        const interval = setInterval(poll, 1000);
        poll();
        return () => clearInterval(interval);
    }, [isPaused]);

    // Capture frame when pausing
    useEffect(() => {
        if (isPaused && isStreaming) {
            setLastFrameUrl(`${feedUrl}?t=${Date.now()}`);
        }
    }, [isPaused]);

    const handleLiveCam = async () => {
        setActiveSource("live");
        setUploadedFile(null);
        setUploadError(null);
        setIsStreaming(false);
        setIsPaused(false);
        setLastFrameUrl(null);
        setThreatLevel(0);
        setDetectionType("NONE");
        setAlerts([]);
        setDetectionLog([]);
        try {
            await fetch(`${BACKEND}/start_camera`, { method: "POST" });
            setIsStreaming(true);
        } catch {
            // backend offline
        }
    };

    const handleUploadMode = () => {
        setActiveSource("upload");
        setIsStreaming(false);
        setIsPaused(false);
        setLastFrameUrl(null);
        setThreatLevel(0);
        setDetectionType("NONE");
        setAccuracy(0);
        setAlerts([]);
        setDetectionLog([]);
    };

    const handleUploadDetect = () => fileInputRef.current?.click();

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        // Reset all detection data FIRST
        setThreatLevel(0);
        setDetectionType("NONE");
        setAccuracy(0);
        setAlerts([]);
        setDetectionLog([]);
        // Then set upload state
        setUploadedFile(file);
        setActiveSource("upload");
        setUploadError(null);
        setIsStreaming(false);
        setIsPaused(false);
        setLastFrameUrl(null);
        setIsUploading(true);
        setUploadProgress(0);
        const formData = new FormData();
        formData.append("file", file);
        try {
            await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open("POST", `${BACKEND}/upload_video`);
                xhr.upload.onprogress = (ev) => {
                    if (ev.lengthComputable) setUploadProgress(Math.round((ev.loaded / ev.total) * 100));
                };
                xhr.onload = () => {
                    if (xhr.status === 200) resolve(JSON.parse(xhr.responseText));
                    else reject(new Error(JSON.parse(xhr.responseText)?.error || "Upload failed"));
                };
                xhr.onerror = () => reject(new Error("Network error"));
                xhr.send(formData);
            });
            setIsUploading(false);
            setIsStreaming(true);
            if (fileInputRef.current) fileInputRef.current.value = "";
        } catch (err) {
            setIsUploading(false);
            setUploadError(err.message);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleSwitchCam = () => setCurrentCam((p) => (p + 1) % cameras.length);

    const threatPct = Math.min(threatLevel, 100);
    const circumference = 2 * Math.PI * 44;
    const dashArray = `${(threatPct / 100) * circumference} ${circumference}`;
    const threatColor = threatPct >= 70 ? "#ef4444" : threatPct >= 40 ? "#f97316" : "#06b6d4";
    const threatLabel = threatPct >= 70 ? "HIGH" : threatPct >= 40 ? "MED" : "LOW";
    const threatLabelColor = threatPct >= 70 ? "text-red-400" : threatPct >= 40 ? "text-orange-400" : "text-green-400";
    const isViolent = detectionType !== "NONE" && threatPct > 0;
    const detectionTypeLabel = { VIOLENCE: "Violence Detected", HOOD_TOUCH: "Hood Touch Detected", BAD_TOUCH: "Bad Touch Detected", NONE: "No Threat Detected" }[detectionType] ?? "No Threat Detected";
    const feedUrl = `${BACKEND}/video_feed`;

    return (
        <div className="min-h-screen bg-navy flex flex-col">
            <Navigation />
            <div className="flex flex-1 pt-16">
                {/* LEFT PANEL */}
                <div className="w-56 shrink-0 border-r border-charcoal-light bg-charcoal p-4 flex flex-col gap-5">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className={`flex items-center gap-1 text-xs font-medium ${backendOnline ? "text-green-400" : "text-red-400"}`}>
                            {backendOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                            {backendOnline ? "Backend Online" : "Backend Offline"}
                        </span>
                        <span className="flex items-center gap-1 text-xs font-medium text-green-400">
                            <span className="h-2 w-2 rounded-full bg-green-500 inline-block"></span>
                            {activeSource === "upload" ? "VIDEO ANALYSIS" : "LIVE CAMERA"}
                        </span>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Select Source</p>
                        <div className="flex rounded-lg overflow-hidden border border-charcoal-light">
                            <button onClick={handleLiveCam} className={`flex-1 flex items-center justify-center gap-1 py-2 text-xs font-medium transition-colors ${activeSource === "live" ? "bg-electric/20 text-electric" : "bg-charcoal text-muted-foreground hover:text-white"}`}>
                                <Camera className="h-3 w-3" /> Live Cam
                            </button>
                            <button onClick={handleUploadMode} className={`flex-1 flex items-center justify-center gap-1 py-2 text-xs font-medium transition-colors ${activeSource === "upload" ? "bg-electric/20 text-electric" : "bg-charcoal text-muted-foreground hover:text-white"}`}>
                                <Upload className="h-3 w-3" /> Upload Video
                            </button>
                        </div>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Threat Level</p>
                        <div className="relative h-28 w-28 flex items-center justify-center">
                            <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="44" fill="none" stroke="#1f2937" strokeWidth="8" />
                                <circle cx="50" cy="50" r="44" fill="none" stroke={threatColor} strokeWidth="8" strokeDasharray={dashArray} strokeLinecap="round" style={{ transition: "stroke-dasharray 0.5s ease" }} />
                            </svg>
                            <div className="text-center z-10">
                                <p className="text-2xl font-bold text-white">{threatPct}%</p>
                                <p className={`text-xs font-semibold ${threatLabelColor}`}>{threatLabel}</p>
                            </div>
                        </div>
                        <div className={`w-full flex items-center justify-center gap-1 rounded-md py-1.5 border ${isViolent ? "bg-red-500/20 border-red-500/40" : "bg-green-500/20 border-green-500/40"}`}>
                            {isViolent ? <AlertTriangle className="h-3.5 w-3.5 text-red-400" /> : <CheckCircle className="h-3.5 w-3.5 text-green-400" />}
                            <span className={`text-xs font-semibold ${isViolent ? "text-red-400" : "text-green-400"}`}>{detectionTypeLabel.toUpperCase()}</span>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <AlertTriangle className="h-5 w-5 text-orange-400 shrink-0" />
                            <div><p className="text-xs text-muted-foreground">Active Alerts</p><p className="text-lg font-bold text-white">{alerts.length}</p></div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Camera className="h-5 w-5 text-electric shrink-0" />
                            <div><p className="text-xs text-muted-foreground">Active Cameras</p><p className="text-lg font-bold text-white">12</p></div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Activity className="h-5 w-5 text-green-400 shrink-0" />
                            <div><p className="text-xs text-muted-foreground">Detection Rate</p><p className="text-lg font-bold text-white">{accuracy > 0 ? `${accuracy}%` : "99.2%"}</p></div>
                        </div>
                    </div>
                    <div className="mt-auto border-t border-charcoal-light pt-4">
                        <p className="text-xs text-muted-foreground mb-2 font-medium">Current Location</p>
                        <div className="flex items-center gap-2 text-xs text-gray-300 mb-1"><MapPin className="h-3.5 w-3.5 text-electric shrink-0" /><span>Main Entrance, Building A</span></div>
                        <div className="flex items-center gap-2 text-xs text-gray-400"><Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" /><span>{currentTime}</span></div>
                    </div>
                </div>

                {/* CENTER PANEL */}
                <div className="flex-1 flex flex-col p-4 gap-4">
                    <div className={`flex-1 relative border-2 rounded-lg overflow-hidden bg-black min-h-[400px] ${isViolent ? "border-red-500" : "border-electric/40"}`}>
                        <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-red-600 px-2 py-1 rounded text-xs font-bold text-white">
                            <span className="h-2 w-2 rounded-full bg-white animate-pulse inline-block"></span> REC
                        </div>
                        {isUploading && (
                            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-black/80">
                                <Loader2 className="h-10 w-10 text-electric animate-spin" />
                                <p className="text-white font-medium">Uploading {uploadedFile?.name}...</p>
                                <div className="w-64 bg-charcoal-light rounded-full h-2">
                                    <div className="bg-electric h-2 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                                </div>
                                <p className="text-xs text-muted-foreground">{uploadProgress}%</p>
                            </div>
                        )}
                        {uploadError && !isUploading && (
                            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-black/80">
                                <AlertTriangle className="h-10 w-10 text-red-400" />
                                <p className="text-red-400 font-medium">Upload Failed</p>
                                <p className="text-xs text-muted-foreground">{uploadError}</p>
                                <button onClick={() => { setUploadError(null); setUploadedFile(null); }} className="text-xs text-electric hover:underline">Try again</button>
                            </div>
                        )}
                        {isStreaming && !isUploading && !uploadError && (
                            <>
                                <img key={isPaused ? "paused" : "live"} ref={imgRef} src={isPaused ? lastFrameUrl : feedUrl} alt="Detection feed" className="absolute inset-0 w-full h-full object-contain cursor-pointer hover:opacity-90 transition-opacity" onClick={() => {
                                    if (!isPaused) {
                                        setLastFrameUrl(`${feedUrl}?t=${Date.now()}`);
                                    }
                                    setIsPaused((p) => !p);
                                }} />
                                <button onClick={() => {
                                    if (!isPaused) {
                                        setLastFrameUrl(`${feedUrl}?t=${Date.now()}`);
                                    }
                                    setIsPaused((p) => !p);
                                }} className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-14 h-14 rounded-full bg-electric/80 hover:bg-electric text-white transition-all active:scale-95 shadow-lg">
                                    {isPaused ? <PlayCircle className="h-8 w-8" /> : <PauseCircle className="h-8 w-8" />}
                                </button>
                            </>
                        )}
                        {!isStreaming && !isUploading && !uploadError && activeSource === "upload" && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                                <FileVideo className="h-12 w-12 text-gray-600" />
                                <p className="text-white font-medium">Drop a video file here</p>
                                <p className="text-electric text-sm cursor-pointer hover:underline" onClick={handleUploadDetect}>or click to browse</p>
                                <p className="text-xs text-muted-foreground">MP4, AVI, MOV, WMV supported</p>
                                <button onClick={handleLiveCam} className="text-xs text-muted-foreground hover:text-white underline mt-2">Try live camera instead</button>
                            </div>
                        )}
                        {!isStreaming && !isUploading && !uploadError && activeSource === "live" && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                {isPaused ? (
                                    <div className="flex flex-col items-center gap-2"><PauseCircle className="h-12 w-12 text-electric/40" /><p className="text-xs text-muted-foreground">Feed paused</p></div>
                                ) : (
                                    <div className="relative h-20 w-20 flex items-center justify-center">
                                        <div className="absolute h-20 w-20 rounded-full border-2 border-electric/30"></div>
                                        <div className="absolute h-12 w-12 rounded-full border-2 border-electric/20"></div>
                                        <div className="h-3 w-3 rounded-full border-2 border-electric/40"></div>
                                    </div>
                                )}
                            </div>
                        )}
                        <div className="absolute bottom-3 left-3 text-xs text-gray-400 font-mono uppercase tracking-widest z-10">{cameras[currentCam]}</div>
                    </div>
                    <input ref={fileInputRef} type="file" accept="video/mp4,video/avi,video/mov,video/wmv,video/*" className="hidden" onChange={handleFileChange} />
                    <div className="flex items-center gap-3">
                        <button onClick={() => {
                            if (!isPaused) {
                                setLastFrameUrl(`${feedUrl}?t=${Date.now()}`);
                            }
                            setIsPaused((p) => !p);
                        }} className={`flex items-center gap-2 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors ${isPaused ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}>
                            {isPaused ? <PlayCircle className="h-4 w-4" /> : <PauseCircle className="h-4 w-4" />}
                            {isPaused ? "Resume" : "Pause"}
                        </button>
                        <button onClick={handleSwitchCam} className="flex items-center gap-2 border border-charcoal-light hover:border-electric text-gray-300 hover:text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors">
                            <Camera className="h-4 w-4" /> Switch Cam
                        </button>
                        <button onClick={handleUploadDetect} className="flex items-center gap-2 border border-charcoal-light hover:border-electric text-gray-300 hover:text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors">
                            <Upload className="h-4 w-4" /> Upload &amp; Detect
                        </button>
                        <button onClick={() => setShowReports(true)} className="flex items-center gap-2 border border-charcoal-light hover:border-electric text-gray-300 hover:text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors">
                            <BarChart2 className="h-4 w-4" /> Reports
                        </button>
                    </div>
                </div>

                {/* RIGHT PANEL */}
                <div className="w-56 shrink-0 border-l border-charcoal-light bg-charcoal p-4 flex flex-col gap-5">
                    {isViolent ? (
                        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-3 animate-pulse">
                            <AlertTriangle className="h-5 w-5 text-red-400 shrink-0" />
                            <div><p className="text-sm font-bold text-red-400">THREAT DETECTED</p><p className="text-xs text-red-500/70">{detectionTypeLabel}</p></div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-lg px-3 py-3">
                            <CheckCircle className="h-5 w-5 text-green-400 shrink-0" />
                            <div><p className="text-sm font-bold text-green-400">ALL CLEAR</p><p className="text-xs text-green-500/70">No threats detected</p></div>
                        </div>
                    )}
                    <div className="flex-1 flex flex-col">
                        <div className="flex items-center gap-2 mb-3"><Bell className="h-4 w-4 text-muted-foreground" /><p className="text-sm font-semibold text-white">Detection Log</p></div>
                        <div className="bg-navy rounded-lg p-2 flex-1 overflow-y-auto max-h-48 space-y-2">
                            {detectionLog.length === 0 ? (
                                <p className="text-xs text-muted-foreground text-center py-4">No detections yet. Upload or stream a video.</p>
                            ) : (
                                detectionLog.map((entry, i) => (
                                    <div key={i} className="bg-charcoal rounded p-2">
                                        <p className="text-xs font-semibold text-red-400">{entry.type ?? entry.detection_type ?? "Alert"}</p>
                                        <p className="text-xs text-muted-foreground">{entry.message ?? entry.description ?? ""}</p>
                                        <p className="text-xs text-gray-600">{entry.time}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                    {/* MODEL INFO PANEL */}
                    <div className="border-t border-charcoal-light pt-4">
                        <div className="flex items-center gap-2 mb-3"><Brain className="h-4 w-4 text-electric" /><p className="text-sm font-semibold text-white">ML Model</p></div>
                        {modelInfo ? (
                            <div className="space-y-2">
                                <div className="bg-navy rounded-lg p-2.5 space-y-1.5">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-muted-foreground">Accuracy</span>
                                        <span className="text-green-400 font-bold">{(modelInfo.accuracy * 100).toFixed(1)}%</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-muted-foreground">Precision</span>
                                        <span className="text-electric font-bold">{(modelInfo.precision * 100).toFixed(1)}%</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-muted-foreground">Recall</span>
                                        <span className="text-yellow-400 font-bold">{(modelInfo.recall * 100).toFixed(1)}%</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-muted-foreground">F1 Score</span>
                                        <span className="text-purple-400 font-bold">{(modelInfo.f1 * 100).toFixed(1)}%</span>
                                    </div>
                                </div>
                                <div className="bg-navy rounded-lg p-2.5">
                                    <p className="text-xs text-muted-foreground mb-1">Architecture</p>
                                    <p className="text-xs text-white font-medium">{modelInfo.architecture}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{modelInfo.trained_on}</p>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Cpu className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground">Status:</span>
                                    <span className={`text-xs font-semibold ${modelInfo.model_loaded ? 'text-green-400' : 'text-red-400'}`}>
                                        {modelInfo.model_loaded ? 'Loaded' : 'Not Loaded'}
                                    </span>
                                </div>
                                <button
                                    onClick={handleTrainModel}
                                    disabled={isTraining}
                                    className="w-full flex items-center justify-center gap-2 bg-electric/20 hover:bg-electric/30 border border-electric/40 text-electric text-xs font-semibold py-2 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {isTraining ? <Loader2 className="h-3 w-3 animate-spin" /> : <Zap className="h-3 w-3" />}
                                    {isTraining ? 'Training...' : 'Train Model'}
                                </button>
                                {trainingResult && (
                                    <div className={`text-xs p-2 rounded ${trainingResult.error ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                                        {trainingResult.error || `Training complete! Accuracy: ${(trainingResult.metrics?.accuracy * 100).toFixed(1)}%`}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-xs text-muted-foreground">Model info unavailable</p>
                        )}
                    </div>

                    <div>
                        <div className="flex items-center gap-2 mb-3"><Phone className="h-4 w-4 text-muted-foreground" /><p className="text-sm font-semibold text-white">Emergency Contact</p></div>
                        <a href="tel:911" className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors">
                            <Phone className="h-4 w-4" /> Call Emergency
                        </a>
                    </div>
                </div>
            </div>

            {showReports && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                    <div className="bg-charcoal border border-charcoal-light rounded-xl w-full max-w-lg mx-4 shadow-2xl">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-charcoal-light">
                            <div className="flex items-center gap-2"><BarChart2 className="h-5 w-5 text-electric" /><h2 className="text-white font-bold text-lg">Incident Reports</h2></div>
                            <button onClick={() => setShowReports(false)} className="text-muted-foreground hover:text-white transition-colors"><X className="h-5 w-5" /></button>
                        </div>
                        <div className="px-6 py-4 space-y-3 max-h-80 overflow-y-auto">
                            {detectionLog.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-6">No incidents recorded in this session.</p>
                            ) : (
                                detectionLog.map((entry, i) => (
                                    <div key={i} className="flex items-center justify-between bg-navy rounded-lg px-4 py-3">
                                        <div>
                                            <p className="text-sm text-white font-medium">{cameras[currentCam]}</p>
                                            <p className="text-xs text-muted-foreground">{entry.time} - {entry.type ?? entry.detection_type}</p>
                                        </div>
                                        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-red-500/20 text-red-400">Alert</span>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="px-6 py-4 border-t border-charcoal-light flex justify-end gap-3">
                            <button className="flex items-center gap-2 border border-charcoal-light hover:border-electric text-gray-300 hover:text-white text-sm px-4 py-2 rounded-lg transition-colors" onClick={() => setShowReports(false)}>
                                <Download className="h-4 w-4" /> Export PDF
                            </button>
                            <button onClick={() => setShowReports(false)} className="bg-electric hover:bg-electric-light text-navy font-semibold text-sm px-4 py-2 rounded-lg transition-colors">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
