"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  TreePine,
  Camera,
  Mic,
  MapPin,
  CheckCircle2,
  ChevronLeft,
  ThumbsUp,
  ThumbsDown,
  ArrowRight,
  Phone,
  LogOut,
  Clock,
  Trash2,
  Droplets,
  Lightbulb,
  AlertTriangle,
  Globe,
  Sparkles,
  ChevronDown,
  Check,
  Crosshair,
  RefreshCw,
  Navigation,
  Recycle,
  BookOpen,
  Calendar,
  List,
  Search,
  Home,
  ShieldAlert
} from "lucide-react";
import { CitizenScreen } from "../types";
import { useWasteLoop } from "../../context/WasteLoopContext";

type Language = "en" | "hi" | "cg";

const dict = {
  en: {
    deptName: "Raipur Municipal Corporation",
    userName: "Rahul (Pandri)",
    reportIssueTitle: "Report an Issue",
    reportIssueDesc: "Take photo or speak to alert sanitation squad",
    trackStatusTitle: "Track Complaint Status",
    trackStatusDesc: "Check real-time cleanup progress",
    activeStatus: "Cleaning in Progress",
    helplineTitle: "Toll-Free Helpline: 1100",
    helplineDesc: "Tap to call Municipal Corporation directly",
    callBtn: "Call 1100",
    backBtn: "Back",
    step1Photo: "1. Photo of Issue *",
    tapToCapture: "Tap here to take photo or upload",
    changePhoto: "Change Photo",
    step2Voice: "2. Voice Note (Optional)",
    tapToSpeak: "Tap mic to speak",
    recordingVoice: "Recording voice note...",
    recordedVoice: "Voice note recorded (12 sec)",
    step3Category: "3. Select Category",
    categories: [
      { id: "Garbage Pile", label: "Garbage Pile", icon: Trash2 },
      { id: "Blocked Drain", label: "Blocked Drain", icon: Droplets },
      { id: "Street Light", label: "Street Light", icon: Lightbulb },
      { id: "Other Issue", label: "Other Issue", icon: AlertTriangle }
    ],
    gpsTag: "Auto-detected GPS Location",
    submitBtn: "Submit Complaint",
    casePhotoTag: "Reported Site Photo",
    progressTitle: "Cleanup Progress",
    steps: [
      "1. Complaint Registered",
      "2. Squad #12 Dispatched",
      "3. Cleaning in Progress",
      "4. Cleanup Completed"
    ],
    verifyBtn: "Verify Cleanup & Give Feedback →",
    reviewTitle: "Cleanup Review",
    beforeLabel: "Before",
    afterLabel: "After",
    satisfiedQuestion: "Was the area cleaned properly?",
    satisfiedSub: "Your feedback completes the resolution",
    yesSatisfied: "Yes, Cleaned Properly",
    noNotSatisfied: "No, Needs Attention",
    successMsg: "Thank you! Your feedback has been recorded."
  },
  hi: {
    deptName: "रायपुर नगर पालिक निगम",
    userName: "राहुल (पंडरी)",
    reportIssueTitle: "समस्या रिपोर्ट करें",
    reportIssueDesc: "फोटो खींचें या बोलकर सफाई टीम को बताएं",
    trackStatusTitle: "शिकायत की स्थिति देखें",
    trackStatusDesc: "सफाई की लाइव स्थिति चेक करें",
    activeStatus: "सफाई चालू है",
    helplineTitle: "टोल-फ्री हेल्पलाइन: 1100",
    helplineDesc: "नगर निगम से सीधे बात करने के लिए टैप करें",
    callBtn: "कॉल करें",
    backBtn: "वापस",
    step1Photo: "1. समस्या का फोटो *",
    tapToCapture: "यहाँ टैप करके फोटो खींचें",
    changePhoto: "फोटो बदलें",
    step2Voice: "2. बोल कर बताएं (वैकल्पिक)",
    tapToSpeak: "माइक दबाकर बोलें",
    recordingVoice: "आवाज़ रिकॉर्ड हो रही है...",
    recordedVoice: "आवाज़ रिकॉर्ड हो गई (12 sec)",
    step3Category: "3. क्या समस्या है?",
    categories: [
      { id: "Garbage Pile", label: "कचरा ढेर", icon: Trash2 },
      { id: "Blocked Drain", label: "नाली जाम", icon: Droplets },
      { id: "Street Light", label: "स्ट्रीट लाइट", icon: Lightbulb },
      { id: "Other Issue", label: "अन्य समस्या", icon: AlertTriangle }
    ],
    gpsTag: "GPS से स्वतः स्थान पहचान",
    submitBtn: "शिकायत दर्ज करें",
    casePhotoTag: "शिकायत का फोटो",
    progressTitle: "काम की प्रगति",
    steps: [
      "1. शिकायत दर्ज हुई",
      "2. गाड़ी व टीम रवाना",
      "3. सफाई चालू है",
      "4. काम पूरा हुआ"
    ],
    verifyBtn: "सफाई की जाँच करें →",
    reviewTitle: "काम की जाँच",
    beforeLabel: "पहले",
    afterLabel: "बाद में",
    satisfiedQuestion: "क्या जगह पूरी तरह साफ हो गई?",
    satisfiedSub: "आपकी प्रतिक्रिया से काम पूरा होगा",
    yesSatisfied: "हाँ, साफ हो गया",
    noNotSatisfied: "नहीं, कचरा बाकी है",
    successMsg: "धन्यवाद! आपकी प्रतिक्रिया दर्ज हो गई है।"
  },
  cg: {
    deptName: "रायपुर नगर निगम",
    userName: "राहुल (पंडरी)",
    reportIssueTitle: "समस्या के फोटो भेजव",
    reportIssueDesc: "फोटो खींचव या गोठिया के टीम ला बताव",
    trackStatusTitle: "अर्जी के हाल देखव",
    trackStatusDesc: "सफाई के लाइव हाल जानव",
    activeStatus: "सफाई चलत हे",
    helplineTitle: "टोल-फ्री हेल्पलाइन: 1100",
    helplineDesc: "नगर निगम ले गोठियाए बर टैप करव",
    callBtn: "फोन लगाव",
    backBtn: "पाछू आवव",
    step1Photo: "1. कचरा के फोटो *",
    tapToCapture: "इहाँ दबा के फोटो खींचव",
    changePhoto: "फोटो बदलव",
    step2Voice: "2. गोठिया के बताव (माइक)",
    tapToSpeak: "माइक दबा के गोठियाव",
    recordingVoice: "गोठ रिकॉर्ड होवत हे...",
    recordedVoice: "गोठ रिकॉर्ड हो गे (12 sec)",
    step3Category: "3. का समस्या हे?",
    categories: [
      { id: "Garbage Pile", label: "कचरा ढेर", icon: Trash2 },
      { id: "Blocked Drain", label: "नाली जाम", icon: Droplets },
      { id: "Street Light", label: "गली बत्ती", icon: Lightbulb },
      { id: "Other Issue", label: "अन्य समस्या", icon: AlertTriangle }
    ],
    gpsTag: "GPS ले जगह के पता",
    submitBtn: "अर्जी भेजव",
    casePhotoTag: "अर्जी के फोटो",
    progressTitle: "सफाई के काम",
    steps: [
      "1. अर्जी दर्ज होइस",
      "2. सफाई गाड़ी निकल गे",
      "3. सफाई चलत हे",
      "4. काम पूरा हो गे"
    ],
    verifyBtn: "सफाई देखव अउ बताव →",
    reviewTitle: "सफाई के जांच",
    beforeLabel: "पहिली",
    afterLabel: "पाछू",
    satisfiedQuestion: "का जगह पूरा साफ हो गे?",
    satisfiedSub: "तुंहर बताय ले काम बंद होही",
    yesSatisfied: "हव, साफ हो गे",
    noNotSatisfied: "नइ, कचरा बाचे हे",
    successMsg: "धन्यवाद! तुंहर बात दर्ज हो गे।"
  }
};

export default function CitizenMinimalApp() {
  const {
    activeCase,
    cases,
    createComplaint,
    submitCitizenFeedback,
    toast
  } = useWasteLoop();

  const [lang, setLang] = useState<Language>("en");
  const [showLangMenu, setShowLangMenu] = useState(false);
  const t = dict[lang];

  const [currentScreen, setCurrentScreen] = useState<CitizenScreen>("home");
  const [showModalInfo, setShowModalInfo] = useState<string | null>(null);
  const [duplicateAlert, setDuplicateAlert] = useState<{ matchedCaseId: string; reason: string } | null>(null);

  // Simple form states
  const [selectedCategory, setSelectedCategory] = useState("Garbage Pile");
  const [selectedLocation, setSelectedLocation] = useState("Detecting live location...");
  const [photoPreview, setPhotoPreview] = useState("/garbage_pile.jpg");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [description, setDescription] = useState("");
  const [gpsStatus, setGpsStatus] = useState<"detecting" | "locked">("detecting");
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number; accuracy?: number } | null>(null);

  const detectLiveLocation = () => {
    setGpsStatus("detecting");
    setSelectedLocation("Acquiring high-accuracy GPS lock...");
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = Number(pos.coords.latitude.toFixed(5));
          const lng = Number(pos.coords.longitude.toFixed(5));
          const acc = Math.round(pos.coords.accuracy || 4);
          setCoordinates({ lat, lng, accuracy: acc });
          setGpsStatus("locked");

          try {
            // Real reverse geocode to get exact street and locality
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
              headers: { "Accept-Language": "en" }
            });
            const data = await res.json();
            if (data && data.address) {
              const street = data.address.road || data.address.pedestrian || data.address.suburb || data.address.neighbourhood || "Main Road";
              const area = data.address.city_district || data.address.suburb || data.address.city || "Raipur";
              setSelectedLocation(`${street}, ${area} (GPS: ${lat}°N, ${lng}°E · ±${acc}m)`);
              return;
            }
          } catch {
            // fallback
          }
          setSelectedLocation(`GPS Pin: ${lat}°N, ${lng}°E (±${acc}m accuracy)`);
        },
        () => {
          const fallbackLat = 21.2514;
          const fallbackLng = 81.6296;
          setCoordinates({ lat: fallbackLat, lng: fallbackLng, accuracy: 6 });
          setGpsStatus("locked");
          setSelectedLocation(`Telibandha Lake Road, Ward 12, Raipur (GPS: ${fallbackLat}°N, ${fallbackLng}°E)`);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      const fallbackLat = 21.2514;
      const fallbackLng = 81.6296;
      setCoordinates({ lat: fallbackLat, lng: fallbackLng, accuracy: 6 });
      setGpsStatus("locked");
      setSelectedLocation(`Telibandha Lake Road, Ward 12, Raipur (GPS: ${fallbackLat}°N, ${fallbackLng}°E)`);
    }
  };

  useEffect(() => {
    detectLiveLocation();
  }, []);

  // Feedback states
  const [feedbackRating, setFeedbackRating] = useState<boolean | null>(true);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  const handleVoiceRecord = () => {
    if (isRecording) {
      setIsRecording(false);
      setRecordingSeconds(0);
      setDescription(
        lang === "en"
          ? "Garbage bin is overflowing and scattered on the street."
          : lang === "hi"
          ? "कचरा पेटी भर गई है और सड़क पर कचरा फैला हुआ है।"
          : "कचरा पेटी भर गे हे अउ रद्दा म कचरा बगरे हे।"
      );
    } else {
      setIsRecording(true);
      const interval = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 12) {
            clearInterval(interval);
            setIsRecording(false);
            setDescription(
              lang === "en"
                ? "Garbage bin is overflowing and scattered on the street."
                : lang === "hi"
                ? "कचरा पेटी भर गई है और सड़क पर कचरा फैला हुआ है।"
                : "कचरा पेटी भर गे हे अउ रद्दा म कचरा बगरे हे।"
            );
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setPhotoPreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);

  const handleSubmit = async () => {
    setIsAiAnalyzing(true);
    try {
      const res = await fetch("/api/ai-triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photoBase64: photoPreview.startsWith("data:") ? photoPreview : undefined,
          description: description || "Garbage overflow issue reported by citizen",
          location: selectedLocation,
          category: selectedCategory,
          coordinates: coordinates || { lat: 21.2514, lng: 81.6296 },
          existingCases: cases || [],
        }),
      });
      const json = await res.json();
      const aiData = json.data;

      // Duplicate Check
      if (aiData?.isDuplicate && aiData?.matchedCaseId) {
        createComplaint({
          id: aiData.matchedCaseId,
          isDuplicateMerged: true,
          photoUrl: photoPreview,
          description: description || "Additional citizen photo & report",
          coordinates: coordinates || { lat: 21.2514, lng: 81.6296 },
        });

        setDuplicateAlert({
          matchedCaseId: aiData.matchedCaseId,
          reason: aiData.duplicateReason || "A complaint for this identical location is already active."
        });
        return;
      }

      // Fresh Complaint
      createComplaint({
        title: aiData?.summary || `${selectedCategory} issue reported`,
        category: aiData?.category || selectedCategory,
        location: selectedLocation,
        photoUrl: photoPreview,
        coordinates: coordinates || { lat: 21.2514, lng: 81.6296 },
        visualFingerprint: aiData?.visualFingerprint || `${selectedCategory} accumulation near ${selectedLocation}`,
        description: description || aiData?.summary || "Garbage overflow issue reported by citizen.",
        possibleCause: "Overflowing bin analyzed by Gemini AI",
        recommendedDepartment: aiData?.assignedSquad || "Raipur Sanitation Team",
        suggestedAction: aiData?.actionSteps?.[0] || "Dispatch squad to clear garbage",
        priority: aiData?.priority || "High",
        steps: aiData?.actionSteps || undefined,
        wasteCollectedKg: aiData?.estimatedWasteKg || 45,
      });
      setCurrentScreen("track");
    } catch {
      createComplaint({
        title: `${selectedCategory} issue reported`,
        category: selectedCategory,
        location: selectedLocation,
        photoUrl: photoPreview,
        coordinates: coordinates || { lat: 21.2514, lng: 81.6296 },
        visualFingerprint: `${selectedCategory} accumulation near ${selectedLocation}`,
        description: description || "Garbage overflow issue reported by citizen.",
        possibleCause: "Overflowing bin",
        recommendedDepartment: "Raipur Sanitation Team",
        suggestedAction: "Dispatch squad to clear garbage"
      });
      setCurrentScreen("track");
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  const handleFeedback = (satisfied: boolean) => {
    setFeedbackRating(satisfied);
    submitCitizenFeedback(activeCase.id, satisfied, satisfied ? "Satisfied" : "Needs Re-inspection");
    setFeedbackSuccess(true);
    setTimeout(() => {
      setFeedbackSuccess(false);
      setCurrentScreen("home");
    }, 1200);
  };

  return (
    <div
      className="min-h-screen text-[#1c241c] font-sans flex flex-col justify-between"
      style={{
        backgroundColor: "#f5f4ed",
        backgroundImage: `
          linear-gradient(to right, rgba(28, 69, 46, 0.05) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(28, 69, 46, 0.05) 1px, transparent 1px)
        `,
        backgroundSize: "22px 22px",
      }}
    >
      {/* Clean Topbar with Language Selector */}
      <header className="h-16 bg-white/90 backdrop-blur-md border-b border-[#dce5d8] px-4 md:px-8 flex items-center justify-between sticky top-0 z-40">
        <button
          onClick={() => setCurrentScreen("home")}
          className="flex items-center gap-2.5 cursor-pointer text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-[#204e37] flex items-center justify-center text-white shadow-xs">
            <TreePine size={22} />
          </div>
          <div>
            <span className="text-base font-black text-[#143826] leading-none block">
              WasteLoop CG
            </span>
            <span className="text-[11px] font-bold text-[#556955] leading-none mt-0.5 block">
              {t.deptName}
            </span>
          </div>
        </button>

        {/* Center/Right Language Selector & Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-1.5 bg-[#f0f5ee] hover:bg-[#e4edd0] border border-[#d6dfce] px-3 py-1.5 rounded-xl text-xs font-bold text-[#204e37] transition cursor-pointer shadow-2xs"
            >
              <Globe size={14} className="text-[#204e37]" />
              <span>
                {lang === "en" ? "English" : lang === "hi" ? "हिंदी" : "छत्तीसगढ़ी"}
              </span>
              <ChevronDown size={13} className="text-[#556955]" />
            </button>

            {showLangMenu && (
              <div className="absolute right-0 mt-1.5 w-36 bg-white border border-[#d6dfce] rounded-xl shadow-xl py-1 z-50 text-xs animate-in fade-in duration-150">
                <button
                  onClick={() => {
                    setLang("en");
                    setShowLangMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 font-bold flex items-center justify-between hover:bg-[#f2f7ef] transition cursor-pointer ${
                    lang === "en" ? "text-[#204e37] bg-[#f2f7ef]" : "text-gray-700"
                  }`}
                >
                  <span>English</span>
                  {lang === "en" && <Check size={14} />}
                </button>
                <button
                  onClick={() => {
                    setLang("hi");
                    setShowLangMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 font-bold flex items-center justify-between hover:bg-[#f2f7ef] transition cursor-pointer ${
                    lang === "hi" ? "text-[#204e37] bg-[#f2f7ef]" : "text-gray-700"
                  }`}
                >
                  <span>हिंदी</span>
                  {lang === "hi" && <Check size={14} />}
                </button>
                <button
                  onClick={() => {
                    setLang("cg");
                    setShowLangMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 font-bold flex items-center justify-between hover:bg-[#f2f7ef] transition cursor-pointer ${
                    lang === "cg" ? "text-[#204e37] bg-[#f2f7ef]" : "text-gray-700"
                  }`}
                >
                  <span>छत्तीसगढ़ी</span>
                  {lang === "cg" && <Check size={14} />}
                </button>
              </div>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-1.5 bg-[#e8f5e9] text-[#204e37] px-3 py-1.5 rounded-full text-xs font-bold">
            <span>{t.userName}</span>
          </div>

          <Link
            href="/"
            className="w-9 h-9 rounded-xl bg-white border border-[#d8e3d2] flex items-center justify-center text-[#556955] hover:text-rose-600 hover:bg-rose-50 transition shadow-2xs"
            title="Log Out"
          >
            <LogOut size={16} />
          </Link>
        </div>
      </header>

      {/* Main Minimal Body */}
      <main className="flex-1 max-w-2xl w-full mx-auto p-4 md:p-6 flex flex-col justify-center items-center">
        {/* ================= SCREEN 1: HOME ================= */}
        {currentScreen === "home" && (
          <div className="flex flex-col items-center gap-3 w-full animate-in fade-in duration-200">
            {/* Phone Shell */}
            <div
              className="w-full max-w-[360px] h-[640px] rounded-[40px] border-[7px] border-[#1d2620] shadow-2xl overflow-hidden flex flex-col relative"
              style={{
                backgroundColor: "#f5f4ed",
                backgroundImage: `
                  linear-gradient(to right, rgba(28, 69, 46, 0.05) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(28, 69, 46, 0.05) 1px, transparent 1px)
                `,
                backgroundSize: "22px 22px",
              }}
            >
              {/* Phone Speaker Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-4 bg-[#1d2620] rounded-b-xl z-30" />

              {/* Status bar */}
              <div className="h-9 px-6 pt-2 flex items-center justify-between text-xs font-semibold text-[#2d372d] shrink-0 z-20">
                <span>9:41</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] tracking-tight">5G</span>
                  <div className="w-5 h-2.5 border border-[#2d372d] rounded-sm p-0.5 flex items-center">
                    <div className="w-3 h-full bg-[#2d372d] rounded-2xs" />
                  </div>
                </div>
              </div>

              {/* Content Body */}
              <div className="flex-1 px-5 pt-1 pb-16 flex flex-col overflow-y-auto no-scrollbar">
                {/* Header: Cleaner Communities for a Better Chhattisgarh */}
                <div className="text-center pt-2 pb-3.5">
                  <h1 className="text-sm font-semibold text-[#2c3d2e] tracking-tight leading-snug">
                    Cleaner Communities
                  </h1>
                  <p className="text-sm font-semibold text-[#2c3d2e] tracking-tight leading-snug">
                    for a Better Chhattisgarh
                  </p>
                </div>

                {/* Primary Action Hero: Report an Issue */}
                <button
                  onClick={() => setCurrentScreen("report")}
                  className="w-full bg-[#1b4329] hover:bg-[#153721] active:scale-[0.98] text-white rounded-2xl py-3.5 px-4 flex items-center justify-between shadow-md transition group mb-3.5 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
                      <ShieldAlert size={18} strokeWidth={2.2} />
                    </div>
                    <span className="text-[15px] font-semibold text-white tracking-tight">
                      Report an Issue
                    </span>
                  </div>
                  <ArrowRight size={18} className="text-white group-hover:translate-x-0.5 transition" />
                </button>

                {/* 4 Quick Action Cards (2x2 Grid) */}
                <div className="grid grid-cols-2 gap-3 mb-2">
                  {/* Card 1: Track Complaint */}
                  <button
                    onClick={() => setCurrentScreen("track")}
                    className="bg-white hover:bg-[#fafbfa] active:scale-[0.98] rounded-3xl p-4 flex flex-col justify-between h-[108px] text-left transition shadow-xs border border-[#e8ece5] group cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-xl bg-[#eef4fe] text-[#2563eb] flex items-center justify-center">
                      <Clock size={19} strokeWidth={2.2} />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-[#1a251e] leading-snug">Track Complaint</h3>
                      <p className="text-[11px] text-[#718274] font-medium">Check status</p>
                    </div>
                  </button>

                  {/* Card 2: Find Scrap Buyer */}
                  <button
                    onClick={() => setShowModalInfo("Find Scrap Buyer (Kabadiwala): 14 verified dry-waste collectors operating in Raipur with doorstep pickup.")}
                    className="bg-white hover:bg-[#fafbfa] active:scale-[0.98] rounded-3xl p-4 flex flex-col justify-between h-[108px] text-left transition shadow-xs border border-[#e8ece5] group cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-xl bg-[#eef9f1] text-[#16a34a] flex items-center justify-center">
                      <Recycle size={19} strokeWidth={2.2} />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-[#1a251e] leading-snug">Find Scrap Buyer</h3>
                      <p className="text-[11px] text-[#718274] font-medium">Sell your scrap</p>
                    </div>
                  </button>

                  {/* Card 3: Collection Schedule */}
                  <button
                    onClick={() => setShowModalInfo("Collection Schedule for Raipur: Door-to-door wet waste at 8:30 AM daily; Dry recycling every Wed & Sat.")}
                    className="bg-white hover:bg-[#fafbfa] active:scale-[0.98] rounded-3xl p-4 flex flex-col justify-between h-[108px] text-left transition shadow-xs border border-[#e8ece5] group cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-xl bg-[#ebf8f2] text-[#059669] flex items-center justify-center">
                      <Calendar size={19} strokeWidth={2.2} />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-[#1a251e] leading-snug">Collection Schedule</h3>
                      <p className="text-[11px] text-[#718274] font-medium">Your locality</p>
                    </div>
                  </button>

                  {/* Card 4: Awareness */}
                  <button
                    onClick={() => setShowModalInfo("Swachh CG Awareness: Segregate 3 bins (Green: Organic, Blue: Recyclable, Red: Hazardous) to keep Raipur pristine.")}
                    className="bg-white hover:bg-[#fafbfa] active:scale-[0.98] rounded-3xl p-4 flex flex-col justify-between h-[108px] text-left transition shadow-xs border border-[#e8ece5] group cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-xl bg-[#fef9eb] text-[#d97706] flex items-center justify-center">
                      <BookOpen size={19} strokeWidth={2.2} />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-[#1a251e] leading-snug">Awareness</h3>
                      <p className="text-[11px] text-[#718274] font-medium">Learn & Contribute</p>
                    </div>
                  </button>
                </div>

                {/* Bottom Scenic Illustration */}
                <div className="mt-auto -mx-5 -mb-16 relative overflow-hidden pointer-events-none">
                  <img
                    src="/cg_home_scenery.jpg"
                    alt="Chhattisgarh Scenery"
                    className="w-full h-44 object-cover object-bottom"
                  />
                </div>
              </div>

              {/* Bottom Navigation Bar */}
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-[#e2e8de] rounded-t-3xl flex items-center justify-around px-4 z-20 shadow-lg">
                <button
                  onClick={() => setCurrentScreen("home")}
                  className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-[#1b4329] transition cursor-pointer"
                >
                  <Home size={19} className="fill-[#1b4329]" />
                  <span>Home</span>
                </button>

                <button
                  onClick={() => setCurrentScreen("report")}
                  className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-[#718274] hover:text-[#1b4329] transition cursor-pointer"
                >
                  <Clock size={19} />
                  <span>Report</span>
                </button>

                <button
                  onClick={() => setCurrentScreen("track")}
                  className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-[#718274] hover:text-[#1b4329] transition cursor-pointer"
                >
                  <Search size={19} />
                  <span>Track</span>
                </button>

                <button
                  onClick={() => setShowModalInfo("WasteLoop Citizen Menu: Settings, Profile, Language (Hindi / Chhattisgarhi / English), Raipur Municipal Helplines (1100).")}
                  className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-[#718274] hover:text-[#1b4329] transition cursor-pointer"
                >
                  <List size={19} />
                  <span>More</span>
                </button>
              </div>
            </div>

            {/* Label under phone */}
            <span className="text-sm font-semibold text-[#3b4d3e] tracking-tight">1. Home</span>
          </div>
        )}

        {/* ================= SCREEN 2: REPORT ISSUE ================= */}
        {currentScreen === "report" && (
          <div className="bg-white rounded-3xl border border-[#d8e3d2] shadow-xl p-5 md:p-7 flex flex-col gap-5 animate-in fade-in duration-150">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#eef3eb] pb-3">
              <button
                onClick={() => setCurrentScreen("home")}
                className="flex items-center gap-1.5 text-xs font-bold text-[#204e37] bg-[#f0f5ee] hover:bg-[#e4edd0] px-3 py-1.5 rounded-xl transition cursor-pointer"
              >
                <ChevronLeft size={16} />
                <span>{t.backBtn}</span>
              </button>
              <span className="text-sm font-black text-[#143826]">
                {t.reportIssueTitle}
              </span>
            </div>

            {/* 1. Camera Upload Box */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-bold text-[#143826]">
                {t.step1Photo}
              </span>
              <label className="relative rounded-2xl border-2 border-dashed border-[#204e37] bg-[#f8faf7] hover:bg-[#edf3e8] transition h-48 flex flex-col items-center justify-center cursor-pointer overflow-hidden p-2 text-center">
                {photoPreview ? (
                  <>
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                    <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[11px] font-bold px-3 py-1 rounded-lg">
                      {t.changePhoto}
                    </span>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-[#204e37]">
                    <div className="w-14 h-14 rounded-2xl bg-[#e8f5e9] flex items-center justify-center shadow-xs">
                      <Camera size={30} />
                    </div>
                    <span className="text-sm font-bold">{t.tapToCapture}</span>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
            </div>

            {/* 2. Voice Mic Button */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-bold text-[#143826]">
                {t.step2Voice}
              </span>
              <button
                type="button"
                onClick={handleVoiceRecord}
                className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition cursor-pointer ${
                  isRecording
                    ? "bg-rose-50 border-rose-400 text-rose-700 animate-pulse"
                    : "bg-[#f8faf7] border-[#d8e3d2] text-[#143826] hover:bg-[#edf3e8]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${isRecording ? "bg-rose-600" : "bg-[#204e37]"}`}>
                    <Mic size={20} />
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-bold block">
                      {isRecording ? t.recordingVoice : t.tapToSpeak}
                    </span>
                    <span className="text-[11px] text-[#556955] block">
                      {description || "Record voice in English, Hindi, or Chhattisgarhi"}
                    </span>
                  </div>
                </div>
                {isRecording && (
                  <span className="text-xs font-mono font-bold text-rose-600">
                    00:{recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds}
                  </span>
                )}
              </button>
            </div>

            {/* 3. Four Simple Problem Categories */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-bold text-[#143826]">
                {t.step3Category}
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                {t.categories.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSelectedCategory(id)}
                    className={`p-3 rounded-2xl border text-xs font-bold flex items-center gap-2.5 transition cursor-pointer ${
                      selectedCategory === id
                        ? "bg-[#204e37] text-white border-[#204e37] shadow-sm"
                        : "bg-white text-[#405440] border-[#d8e3d2] hover:bg-[#edf3e8]"
                    }`}
                  >
                    <Icon size={18} />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Live GPS Location (Instant Auto-Detect) */}
            <div className="bg-[#f8faf7] p-3.5 rounded-2xl border border-[#d8e3d2] flex items-center justify-between gap-3 text-xs text-[#143826]">
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <div className="relative w-8 h-8 rounded-xl bg-[#e8f5e9] text-[#204e37] flex items-center justify-center shrink-0 shadow-2xs">
                  <MapPin size={18} />
                  <span className="w-2 h-2 rounded-full bg-emerald-500 absolute -top-0.5 -right-0.5 ring-2 ring-white animate-ping" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-bold block truncate">{selectedLocation}</span>
                  <div className="flex items-center gap-2 text-[10px] text-[#556955] mt-0.5">
                    <span>{t.gpsTag}</span>
                    {coordinates?.accuracy && (
                      <span className="bg-[#e8f5e9] text-[#204e37] font-bold px-1.5 py-0.2 rounded">
                        ±{coordinates.accuracy}m Accuracy
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={detectLiveLocation}
                className="flex items-center gap-1.5 text-[11px] font-bold text-[#204e37] bg-white hover:bg-[#edf3e8] border border-[#d8e3d2] px-2.5 py-1.5 rounded-xl transition shrink-0 cursor-pointer shadow-2xs"
                title="Refresh Live GPS"
              >
                <RefreshCw size={12} className={gpsStatus === "detecting" ? "animate-spin text-[#204e37]" : ""} />
                <span>GPS Refresh</span>
              </button>
            </div>

            {/* SUBMIT BUTTON WITH REAL AI ANALYSIS */}
            <button
              type="button"
              disabled={isAiAnalyzing}
              onClick={handleSubmit}
              className="bg-[#204e37] hover:bg-[#183d2b] active:scale-[0.99] text-white py-4 rounded-2xl font-black text-base shadow-lg transition flex items-center justify-center gap-2 cursor-pointer mt-1 disabled:opacity-75"
            >
              {isAiAnalyzing ? (
                <>
                  <Sparkles size={20} className="animate-spin text-[#a7f3d0]" />
                  <span>Gemini AI Triage Analyzing...</span>
                </>
              ) : (
                <>
                  <span>{t.submitBtn}</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </div>
        )}

        {/* ================= SCREEN 3: TRACK STATUS ================= */}
        {currentScreen === "track" && (
          <div className="bg-white rounded-3xl border border-[#d8e3d2] shadow-xl p-5 md:p-7 flex flex-col gap-5 animate-in fade-in duration-150">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#eef3eb] pb-3">
              <button
                onClick={() => setCurrentScreen("home")}
                className="flex items-center gap-1.5 text-xs font-bold text-[#204e37] bg-[#f0f5ee] hover:bg-[#e4edd0] px-3 py-1.5 rounded-xl transition cursor-pointer"
              >
                <ChevronLeft size={16} />
                <span>{t.backBtn}</span>
              </button>
              <div className="text-right">
                <span className="text-xs font-mono font-bold text-[#204e37] block">
                  #{activeCase.id}
                </span>
                <span className="text-[11px] text-[#556955] block">
                  {activeCase.location}
                </span>
              </div>
            </div>

            {/* Photo */}
            <div className="rounded-2xl overflow-hidden border border-[#d8e3d2] h-48 relative">
              <img src={activeCase.photoUrl} alt="Case" className="w-full h-full object-cover" />
              <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs font-bold px-3 py-1 rounded-lg">
                {t.casePhotoTag}
              </div>
            </div>

            {/* Simple Step-by-Step Status */}
            <div className="bg-[#f8faf7] border border-[#d8e3d2] rounded-2xl p-4 flex flex-col gap-3">
              <span className="text-xs font-bold text-[#143826] uppercase tracking-wider block">
                {t.progressTitle}
              </span>

              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#204e37] text-white flex items-center justify-center text-xs">
                    ✓
                  </div>
                  <span className="text-xs font-bold text-[#143826]">
                    {t.steps[0]}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#204e37] text-white flex items-center justify-center text-xs">
                    ✓
                  </div>
                  <span className="text-xs font-bold text-[#143826]">
                    {t.steps[1]}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs animate-pulse">
                    ●
                  </div>
                  <span className="text-xs font-bold text-amber-800">
                    {t.steps[2]}
                  </span>
                </div>

                <div className="flex items-center gap-3 opacity-40">
                  <div className="w-6 h-6 rounded-full border-2 border-gray-400 flex items-center justify-center text-xs">
                    4
                  </div>
                  <span className="text-xs font-medium text-gray-600">
                    {t.steps[3]}
                  </span>
                </div>
              </div>
            </div>

            {/* Action to Feedback */}
            <button
              onClick={() => setCurrentScreen("feedback")}
              className="bg-[#204e37] hover:bg-[#183d2b] text-white py-3.5 rounded-2xl font-bold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{t.verifyBtn}</span>
            </button>
          </div>
        )}

        {/* ================= SCREEN 4: RESOLUTION & FEEDBACK ================= */}
        {currentScreen === "feedback" && (
          <div className="bg-white rounded-3xl border border-[#d8e3d2] shadow-xl p-5 md:p-7 flex flex-col gap-5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-[#eef3eb] pb-3">
              <button
                onClick={() => setCurrentScreen("track")}
                className="flex items-center gap-1.5 text-xs font-bold text-[#204e37] bg-[#f0f5ee] hover:bg-[#e4edd0] px-3 py-1.5 rounded-xl transition cursor-pointer"
              >
                <ChevronLeft size={16} />
                <span>{t.backBtn}</span>
              </button>
              <span className="text-sm font-black text-[#143826]">
                {t.reviewTitle}
              </span>
            </div>

            {/* Before vs After Photos */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl overflow-hidden border border-[#d8e3d2] h-40 relative">
                <img src={activeCase.photoUrl} alt="Before" className="w-full h-full object-cover" />
                <span className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                  {t.beforeLabel}
                </span>
              </div>

              <div className="rounded-2xl overflow-hidden border-2 border-[#204e37] h-40 relative">
                <img src="/cleaned_street.jpg" alt="After" className="w-full h-full object-cover" />
                <span className="absolute bottom-2 left-2 bg-[#204e37] text-white text-[10px] font-bold px-2 py-0.5 rounded">
                  {t.afterLabel}
                </span>
              </div>
            </div>

            {/* Big Question: Are you satisfied? */}
            <div className="text-center flex flex-col gap-2 pt-2">
              <h2 className="text-base font-black text-[#143826]">
                {t.satisfiedQuestion}
              </h2>
              <p className="text-xs text-[#556955]">
                {t.satisfiedSub}
              </p>
            </div>

            {/* 2 Big Thumb Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleFeedback(true)}
                className="bg-[#e8f5e9] hover:bg-[#d5eed7] active:scale-[0.98] border-2 border-[#204e37] p-5 rounded-2xl flex flex-col items-center gap-2 transition cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-[#204e37] text-white flex items-center justify-center">
                  <ThumbsUp size={24} />
                </div>
                <span className="text-sm font-black text-[#204e37]">{t.yesSatisfied}</span>
              </button>

              <button
                type="button"
                onClick={() => handleFeedback(false)}
                className="bg-rose-50 hover:bg-rose-100 active:scale-[0.98] border-2 border-rose-300 p-5 rounded-2xl flex flex-col items-center gap-2 transition cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-rose-600 text-white flex items-center justify-center">
                  <ThumbsDown size={24} />
                </div>
                <span className="text-sm font-black text-rose-700">{t.noNotSatisfied}</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Floating Success Toast */}
      {feedbackSuccess && (
        <div className="fixed bottom-6 inset-x-4 max-w-sm mx-auto z-50 bg-[#204e37] text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center justify-center gap-2.5 text-xs font-bold animate-in fade-in">
          <CheckCircle2 size={18} className="text-[#a7f3d0]" />
          <span>{t.successMsg}</span>
        </div>
      )}

      {/* Info Modal */}
      {showModalInfo && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-6 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-xs w-full shadow-2xl flex flex-col gap-3 border border-[#d6dfce]">
            <h4 className="text-sm font-bold text-[#19321c]">WasteLoop Info</h4>
            <p className="text-xs text-[#4c5e4c] leading-relaxed">{showModalInfo}</p>
            <button
              onClick={() => setShowModalInfo(null)}
              className="mt-2 bg-[#204e37] hover:bg-[#183d2b] text-white py-2.5 rounded-xl text-xs font-bold shadow-xs cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* AI Duplicate Detected Modal */}
      {duplicateAlert && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-150 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl flex flex-col gap-3.5 border-2 border-emerald-600">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h4 className="text-sm font-black text-[#143826]">Similar Complaint Already Active!</h4>
                <span className="text-[11px] font-bold text-emerald-700">Case {duplicateAlert.matchedCaseId} · Merged by AI</span>
              </div>
            </div>
            
            <p className="text-xs text-[#3b4d3e] leading-relaxed bg-[#f3f8f1] p-3 rounded-xl border border-[#d6e5d2]">
              {duplicateAlert.reason}
            </p>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-[11px] text-amber-900 font-medium">
              ⚡ <strong>Priority Boosted:</strong> Multiple citizens reporting this exact spot has automatically escalated this issue to High/Urgent for immediate squad dispatch.
            </div>

            <button
              onClick={() => {
                setDuplicateAlert(null);
                setCurrentScreen("track");
              }}
              className="mt-1 bg-[#1b4329] hover:bg-[#153721] text-white py-3 rounded-xl text-xs font-bold shadow-md transition cursor-pointer"
            >
              Track Active Cleanup Progress →
            </button>
          </div>
        </div>
      )}

      {/* Clean Footer */}
      <footer className="bg-white border-t border-[#dce5d8] py-3 px-4 text-center text-xs text-[#556955]">
        <span>WasteLoop CG · {t.deptName} · {t.helplineTitle}</span>
      </footer>
    </div>
  );
}
