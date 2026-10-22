"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useState } from "react";
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Search,
  Plus,
  Mic,
  MapPin,
  CheckCircle2,
  Trash2,
  Droplets,
  Wind,
  TreePine,
  Boxes,
  MoreHorizontal,
  Home,
  FileText,
  Navigation,
  Sparkles,
  Building2,
  Lightbulb,
  ClipboardList,
  ThumbsUp,
  ThumbsDown,
  Layers,
  ArrowRight,
  Calendar,
  DollarSign,
  BookOpen,
  Clock,
  Recycle,
  List,
  ShieldAlert
} from "lucide-react";
import { CaseItem, CitizenScreen } from "../app/types";

interface CitizenAppProps {
  currentScreen: CitizenScreen;
  setScreen: (screen: CitizenScreen) => void;
  cases: CaseItem[];
  activeCase: CaseItem;
  setActiveCaseId: (id: string) => void;
  onSubmitNewCase: (newCase: Partial<CaseItem>) => void;
  onFeedbackSubmit: (caseId: string, resolved: boolean, comment: string) => void;
  standalone?: boolean;
}

export default function CitizenApp({
  currentScreen,
  setScreen,
  cases,
  activeCase,
  setActiveCaseId,
  onSubmitNewCase,
  onFeedbackSubmit,
  standalone = true,
}: CitizenAppProps) {
  // Report form local state
  const [selectedCategory, setSelectedCategory] = useState("Garbage & Dumping");
  const [selectedLocation, setSelectedLocation] = useState("Sundar Nagar, Raipur (GPS: 21.2384°N, 81.6190°E)");
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number; accuracy?: number }>({
    lat: 21.2384,
    lng: 81.6190,
    accuracy: 4
  });
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [duplicateAlert, setDuplicateAlert] = useState<{ matchedCaseId: string; reason: string } | null>(null);
  const [photoPreview, setPhotoPreview] = useState("/garbage_pile.jpg");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showModalInfo, setShowModalInfo] = useState<string | null>(null);

  const detectLiveGps = () => {
    setIsDetectingGps(true);
    setSelectedLocation("Acquiring high-accuracy GPS lock...");
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = Number(pos.coords.latitude.toFixed(5));
          const lng = Number(pos.coords.longitude.toFixed(5));
          const acc = Math.round(pos.coords.accuracy || 4);
          setCoordinates({ lat, lng, accuracy: acc });
          setIsDetectingGps(false);
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
              headers: { "Accept-Language": "en" }
            });
            const data = await res.json();
            if (data && data.address) {
              const street = data.address.road || data.address.pedestrian || data.address.suburb || "Main Road";
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
          setIsDetectingGps(false);
          setCoordinates({ lat: 21.2514, lng: 81.6296, accuracy: 5 });
          setSelectedLocation("Telibandha Lake Road, Ward 12, Raipur (GPS: 21.2514°N, 81.6296°E)");
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setIsDetectingGps(false);
    }
  };

  // Track status photo slider index
  const [photoIndex, setPhotoIndex] = useState(0);

  // Feedback local state
  const [feedbackRating, setFeedbackRating] = useState<boolean | null>(true);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [beforeAfterMode, setBeforeAfterMode] = useState<"before" | "after" | "split">("split");

  // Comment modal
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentText, setCommentText] = useState("");

  const handleVoiceRecord = () => {
    if (isRecording) {
      setIsRecording(false);
      setRecordingSeconds(0);
    } else {
      setIsRecording(true);
      const interval = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 29) {
            clearInterval(interval);
            setIsRecording(false);
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

  const handleSubmitComplaint = async () => {
    try {
      const res = await fetch("/api/ai-triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photoBase64: photoPreview.startsWith("data:") ? photoPreview : undefined,
          description: "Garbage overflow near roadside reported by citizen",
          location: selectedLocation,
          category: selectedCategory,
          coordinates,
          existingCases: cases,
        }),
      });
      const json = await res.json();
      const aiData = json.data;

      if (aiData?.isDuplicate && aiData?.matchedCaseId) {
        onSubmitNewCase({
          id: aiData.matchedCaseId,
          isDuplicateMerged: true,
          photoUrl: photoPreview,
          coordinates,
          description: "Citizen photo merged via AI duplicate detection",
        });
        setDuplicateAlert({
          matchedCaseId: aiData.matchedCaseId,
          reason: aiData.duplicateReason || "Identical garbage pile reported at this GPS location."
        });
        return;
      }

      onSubmitNewCase({
        title: aiData?.summary || `${selectedCategory} near roadside`,
        category: selectedCategory,
        location: selectedLocation,
        photoUrl: photoPreview,
        coordinates,
        visualFingerprint: aiData?.visualFingerprint || `${selectedCategory} accumulation near ${selectedLocation}`,
        description: aiData?.summary || "Garbage pile reported by citizen.",
        possibleCause: "Overflow due to insufficient bin clearance frequency.",
        recommendedDepartment: aiData?.assignedSquad || "Municipal Sanitation Team",
        suggestedAction: aiData?.actionSteps?.[0] || "Send collection vehicle and clean the area.",
        priority: aiData?.priority || "High"
      });
      setScreen("track");
    } catch {
      onSubmitNewCase({
        title: `${selectedCategory} near roadside`,
        category: selectedCategory,
        location: selectedLocation,
        photoUrl: photoPreview,
        coordinates,
        visualFingerprint: `${selectedCategory} accumulation near ${selectedLocation}`,
        description: "Garbage pile near roadside.",
        possibleCause: "Missed collection or overflow.",
        recommendedDepartment: "Municipal Sanitation Team",
        suggestedAction: "Send collection vehicle and clean area."
      });
      setScreen("track");
    }
  };

  const handleFeedback = () => {
    if (feedbackRating !== null) {
      onFeedbackSubmit(activeCase.id, feedbackRating, feedbackComment);
      setFeedbackSubmitted(true);
      setTimeout(() => {
        setFeedbackSubmitted(false);
        setScreen("home");
      }, 1500);
    }
  };

  const phoneContent = (
    <div
      className="flex flex-col h-full text-[#1c241c] select-none font-sans relative overflow-hidden"
      style={{
        backgroundColor: "#f5f4ed",
        backgroundImage: `
          linear-gradient(to right, rgba(28, 69, 46, 0.05) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(28, 69, 46, 0.05) 1px, transparent 1px)
        `,
        backgroundSize: "22px 22px",
      }}
    >
      {/* Top Phone Status Bar */}
      <div className="h-9 px-6 pt-2 flex items-center justify-between text-xs font-semibold text-[#2d372d] z-30 shrink-0">
        <span>9:41</span>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] tracking-tight">5G</span>
          <div className="w-5 h-2.5 border border-[#2d372d] rounded-sm p-0.5 flex items-center">
            <div className="w-3 h-full bg-[#2d372d] rounded-2xs" />
          </div>
        </div>
      </div>

      {/* Main Screen Body */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-16 flex flex-col">
        {/* ================= SCREEN 1: HOME ================= */}
        {currentScreen === "home" && (
          <div className="px-5 pt-1 pb-0 flex flex-col flex-1 animate-in fade-in duration-200">
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
              onClick={() => setScreen("report")}
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
                onClick={() => setScreen("track")}
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
        )}

        {/* ================= SCREEN 2: REPORT ISSUE ================= */}
        {currentScreen === "report" && (
          <div className="px-5 pt-1 pb-6 flex flex-col gap-4 animate-in fade-in duration-200">
            {/* Header */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setScreen("home")}
                className="w-8 h-8 rounded-full bg-white border border-[#e1e8dc] flex items-center justify-center text-[#2d372d]"
              >
                <ChevronLeft size={20} />
              </button>
              <h2 className="text-base font-bold text-[#1b3d2b]">Report an Issue</h2>
              <button className="w-8 h-8 rounded-full bg-white border border-[#e1e8dc] flex items-center justify-center text-[#2d372d]">
                <Search size={16} />
              </button>
            </div>

            <p className="text-xs text-[#526352] -mt-1 leading-relaxed">
              Tell us what's happening in your area. Add a photo, voice or text.
            </p>

            {/* Category 2x3 Grid */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Garbage & Dumping", icon: Trash2, key: "Garbage & Dumping" },
                { label: "Water Leakage & Drainage", icon: Droplets, key: "Drainage Issue" },
                { label: "Open Burning & Air Pollution", icon: Wind, key: "Open Burning" },
                { label: "Trees & Green Spaces", icon: TreePine, key: "Trees & Green Spaces" },
                { label: "Construction Waste", icon: Boxes, key: "Construction Waste" },
                { label: "Other Environmental Issue", icon: MoreHorizontal, key: "Other" },
              ].map(({ label, icon: Icon, key }) => {
                const isSelected = selectedCategory === key || (key === "Garbage & Dumping" && selectedCategory === "Garbage & Dumping");
                return (
                  <button
                    key={label}
                    onClick={() => setSelectedCategory(key)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition min-h-[82px] ${
                      isSelected
                        ? "bg-[#eaf4e7] border-[#205136] text-[#1c472f] shadow-xs"
                        : "bg-white border-[#e0e7da] text-[#4d5e4d] hover:bg-[#f6f9f3]"
                    }`}
                  >
                    <Icon size={20} className={isSelected ? "text-[#1d4b2b]" : "text-[#5e715e]"} />
                    <span className="text-[10px] font-semibold mt-1.5 leading-tight">{label}</span>
                  </button>
                );
              })}
            </div>

            {/* Photos Section */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#233523]">Photos</label>
              <div className="flex items-center gap-2.5">
                <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-[#ccd8c4] shadow-xs group">
                  <img src={photoPreview} alt="Selected waste issue" className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] px-1 rounded">1/1</span>
                </div>
                <label className="w-20 h-20 rounded-xl border-2 border-dashed border-[#ccd8c4] bg-white hover:bg-[#f4f7f0] flex flex-col items-center justify-center cursor-pointer text-[#486348] transition">
                  <Plus size={22} />
                  <span className="text-[10px] font-medium mt-0.5">Add</span>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>
              </div>
            </div>

            {/* Voice Note Bar */}
            <button
              onClick={handleVoiceRecord}
              className={`w-full py-2.5 px-4 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition ${
                isRecording
                  ? "bg-rose-50 border-rose-300 text-rose-700 animate-pulse"
                  : "bg-white border-[#d8e2d2] text-[#344834] hover:bg-[#f2f7ed]"
              }`}
            >
              <Mic size={17} className={isRecording ? "text-rose-600 animate-bounce" : "text-[#2e6244]"} />
              <span>{isRecording ? `Recording voice note... (${recordingSeconds}s / 30s)` : "Tap to record (max 30 sec)"}</span>
            </button>

            {/* Location */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#233523]">Location</label>
              <div className="bg-white border border-[#d8e2d2] rounded-xl p-3 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#eaf4e5] text-[#22543d] flex items-center justify-center">
                    <MapPin size={17} />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#6d7f6d] block font-medium">Current location</span>
                    <strong className="text-xs text-[#1e2f1e] font-bold">{selectedLocation}</strong>
                  </div>
                </div>
                <button
                  onClick={() => setShowLocationModal(true)}
                  className="text-xs font-bold text-[#205136] hover:underline"
                >
                  Change
                </button>
              </div>
            </div>

            {/* Continue CTA */}
            <button
              onClick={() => setScreen("confirm")}
              className="w-full mt-2 bg-[#204e37] hover:bg-[#183d2b] text-white py-3 rounded-xl font-bold text-sm shadow-md transition"
            >
              Continue
            </button>
          </div>
        )}

        {/* ================= SCREEN 3: CONFIRM & SUBMIT ================= */}
        {currentScreen === "confirm" && (
          <div className="px-5 pt-1 pb-6 flex flex-col gap-3.5 animate-in fade-in duration-200">
            {/* Header */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setScreen("report")}
                className="w-8 h-8 rounded-full bg-white border border-[#e1e8dc] flex items-center justify-center text-[#2d372d]"
              >
                <ChevronLeft size={20} />
              </button>
              <h2 className="text-base font-bold text-[#1b3d2b]">Confirm & Submit</h2>
            </div>

            {/* AI Summary Card */}
            <div className="bg-white border border-[#d8e3d2] rounded-2xl p-3.5 shadow-2xs flex flex-col gap-2.5">
              <span className="text-xs font-bold text-[#1e3422] flex items-center gap-1.5">
                <Sparkles size={14} className="text-emerald-600" />
                AI Summary
              </span>
              <div className="flex gap-3">
                <img
                  src={photoPreview}
                  alt="AI summary preview"
                  className="w-20 h-20 rounded-xl object-cover shrink-0 border border-[#d2ded0]"
                />
                <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-[10px] font-bold bg-[#e8f5e9] text-[#206037] px-2 py-0.5 rounded-full">
                      {selectedCategory}
                    </span>
                    <span className="text-[10px] font-bold bg-[#fee2e2] text-[#991b1b] px-2 py-0.5 rounded-full">
                      High Priority
                    </span>
                  </div>
                  <p className="text-[11px] text-[#425242] leading-tight line-clamp-3">
                    Garbage pile near community bin on main road. Looks like it has been there for multiple days and may cause health issues.
                  </p>
                </div>
              </div>
            </div>

            {/* Detected Location Card */}
            <div className="bg-white border border-[#d8e3d2] rounded-xl p-3 flex items-start gap-3 shadow-2xs">
              <div className="w-7 h-7 rounded-lg bg-[#e8f5e9] text-[#22543d] flex items-center justify-center shrink-0 mt-0.5">
                <MapPin size={16} />
              </div>
              <div>
                <span className="text-[10px] text-[#697c69] font-medium block">Detected Location</span>
                <span className="text-xs font-bold text-[#1a2d1a]">{selectedLocation}</span>
              </div>
            </div>

            {/* Possible Cause (AI) */}
            <div className="bg-white border border-[#d8e3d2] rounded-xl p-3 flex items-start gap-3 shadow-2xs">
              <div className="w-7 h-7 rounded-lg bg-[#fef3c7] text-[#92400e] flex items-center justify-center shrink-0 mt-0.5">
                <Lightbulb size={16} />
              </div>
              <div>
                <span className="text-[10px] text-[#697c69] font-medium block">Possible Cause (AI)</span>
                <span className="text-xs text-[#2a382a] leading-tight block">
                  Missed collection or overflow due to insufficient bins.
                </span>
              </div>
            </div>

            {/* Recommended Department */}
            <div className="bg-white border border-[#d8e3d2] rounded-xl p-3 flex items-start gap-3 shadow-2xs">
              <div className="w-7 h-7 rounded-lg bg-[#e0f2fe] text-[#0369a1] flex items-center justify-center shrink-0 mt-0.5">
                <Building2 size={16} />
              </div>
              <div>
                <span className="text-[10px] text-[#697c69] font-medium block">Recommended Department</span>
                <span className="text-xs font-bold text-[#1a2d1a]">Municipal Sanitation Team (Ward 12)</span>
              </div>
            </div>

            {/* Suggested Action */}
            <div className="bg-white border border-[#d8e3d2] rounded-xl p-3 flex items-start gap-3 shadow-2xs">
              <div className="w-7 h-7 rounded-lg bg-[#dcfce7] text-[#15803d] flex items-center justify-center shrink-0 mt-0.5">
                <ClipboardList size={16} />
              </div>
              <div>
                <span className="text-[10px] text-[#697c69] font-medium block">Suggested Action</span>
                <span className="text-xs text-[#2a382a] leading-tight block">
                  Send collection vehicle and clean the area. Check if additional bins are needed.
                </span>
              </div>
            </div>

            {/* Submit Complaint Button */}
            <button
              onClick={handleSubmitComplaint}
              className="w-full mt-1 bg-[#204e37] hover:bg-[#183d2b] text-white py-3 rounded-xl font-bold text-sm shadow-md transition"
            >
              Submit Complaint
            </button>
          </div>
        )}

        {/* ================= SCREEN 4: TRACK STATUS (COMPLAINT DETAILS) ================= */}
        {currentScreen === "track" && (
          <div className="px-5 pt-1 pb-6 flex flex-col gap-3.5 animate-in fade-in duration-200">
            {/* Header */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setScreen("home")}
                className="w-8 h-8 rounded-full bg-white border border-[#e1e8dc] flex items-center justify-center text-[#2d372d]"
              >
                <ChevronLeft size={20} />
              </button>
              <h2 className="text-base font-bold text-[#1b3d2b]">Complaint Details</h2>
              <button
                onClick={() => setShowModalInfo(`Complaint options for ${activeCase.id}: Share tracking link, Download receipt, Escalate to Ward Councilor.`)}
                className="w-8 h-8 rounded-full bg-white border border-[#e1e8dc] flex items-center justify-center text-[#2d372d]"
              >
                <MoreVertical size={16} />
              </button>
            </div>

            {/* Badges and ID */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#455c48] bg-[#eef4ea] px-2.5 py-1 rounded-md">
                {activeCase.id}
              </span>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                activeCase.status === "Resolved"
                  ? "bg-[#dcfce7] text-[#15803d]"
                  : "bg-[#e0f2fe] text-[#0369a1]"
              }`}>
                {activeCase.status}
              </span>
            </div>

            {/* Photo carousel with 1/3 badge */}
            <div className="relative rounded-2xl overflow-hidden border border-[#d2ded0] h-44 bg-slate-900 group">
              <img
                src={photoIndex === 0 ? activeCase.photoUrl : photoIndex === 1 ? "/drainage_issue.jpg" : "/cleaned_street.jpg"}
                alt="Complaint site evidence"
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-2.5 right-2.5 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full font-mono">
                {photoIndex + 1}/3
              </span>
              <button
                onClick={() => setPhotoIndex((p) => (p > 0 ? p - 1 : 2))}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPhotoIndex((p) => (p < 2 ? p + 1 : 0))}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Title & Metadata */}
            <div>
              <h3 className="text-sm font-bold text-[#1a2d1a]">{activeCase.title}</h3>
              <p className="text-[11px] text-[#617361] mt-0.5">
                {activeCase.location} · Reported on {activeCase.createdAt}
              </p>
            </div>

            {/* Vertical Timeline / Stepper */}
            <div className="bg-white border border-[#dbe4d5] rounded-2xl p-4 shadow-2xs">
              <div className="flex flex-col gap-3">
                {activeCase.timeline.map((step, idx) => {
                  const isLast = idx === activeCase.timeline.length - 1;
                  return (
                    <div key={step.status} className="flex items-start gap-3 relative">
                      {/* Connecting Line */}
                      {!isLast && (
                        <div
                          className={`absolute left-2.5 top-5 bottom-0 w-0.5 -ml-[1px] ${
                            step.completed ? "bg-[#22543d]" : "bg-[#e2e8de]"
                          }`}
                        />
                      )}

                      {/* Icon / Marker */}
                      <div className="z-10 mt-0.5">
                        {step.completed ? (
                          <div className="w-5 h-5 rounded-full bg-[#22543d] text-white flex items-center justify-center shadow-2xs">
                            <CheckCircle2 size={13} strokeWidth={3} />
                          </div>
                        ) : step.active ? (
                          <div className="w-5 h-5 rounded-full bg-[#22543d] flex items-center justify-center ring-4 ring-[#d8eedf]">
                            <div className="w-2 h-2 rounded-full bg-white animate-ping" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-[#ccd8c6] bg-white" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 text-left -mt-0.5">
                        <div className="flex items-center justify-between">
                          <strong className={`text-xs ${step.completed || step.active ? "text-[#1b2f1c]" : "text-[#839483]"}`}>
                            {step.status}
                          </strong>
                          <span className="text-[10px] text-[#718271]">{step.timestamp}</span>
                        </div>
                        {step.subtext && (
                          <p className="text-[10px] text-[#426046] font-medium mt-0.5">
                            {step.subtext}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 mt-1">
              <button
                onClick={() => setShowCommentModal(true)}
                className="bg-white hover:bg-[#f3f7f0] border border-[#d0dbcb] text-[#204a32] py-2.5 rounded-xl font-bold text-xs transition"
              >
                Add Comment
              </button>
              <button
                onClick={() => setScreen("feedback")}
                className="bg-[#204e37] hover:bg-[#183d2b] text-white py-2.5 rounded-xl font-bold text-xs shadow-sm transition flex items-center justify-center gap-1.5"
              >
                <span>View on Map</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Quick Switch to Resolution & Feedback */}
            <button
              onClick={() => setScreen("feedback")}
              className="text-[11px] text-center font-semibold text-[#296440] hover:underline"
            >
              Jump to Resolution & Feedback Screen →
            </button>
          </div>
        )}

        {/* ================= SCREEN 5: RESOLUTION & FEEDBACK ================= */}
        {currentScreen === "feedback" && (
          <div className="px-5 pt-1 pb-6 flex flex-col gap-3.5 animate-in fade-in duration-200">
            {/* Header */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setScreen("track")}
                className="w-8 h-8 rounded-full bg-white border border-[#e1e8dc] flex items-center justify-center text-[#2d372d]"
              >
                <ChevronLeft size={20} />
              </button>
              <h2 className="text-base font-bold text-[#1b3d2b]">Resolution & Feedback</h2>
              <div className="w-8" />
            </div>

            {/* Status Banner */}
            <div className="flex items-center justify-between bg-white border border-[#d6e2cf] rounded-xl px-3.5 py-2.5 shadow-2xs">
              <span className="flex items-center gap-1.5 text-xs font-bold bg-[#dcfce7] text-[#15803d] px-2.5 py-1 rounded-full">
                <CheckCircle2 size={14} />
                Resolved
              </span>
              <span className="text-[11px] text-[#6b7d6b] font-medium">12 Oct, 4:30 PM</span>
            </div>

            {/* Interactive Before & After Photos */}
            <div className="bg-white border border-[#d6e2cf] rounded-2xl p-3 shadow-2xs flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#1e3422]">Site Proof Comparison</span>
                <div className="flex bg-[#eef4ea] p-0.5 rounded-lg text-[10px] font-semibold text-[#305c3d]">
                  <button
                    onClick={() => setBeforeAfterMode("split")}
                    className={`px-2 py-0.5 rounded ${beforeAfterMode === "split" ? "bg-white shadow-2xs font-bold" : ""}`}
                  >
                    Side by Side
                  </button>
                  <button
                    onClick={() => setBeforeAfterMode("before")}
                    className={`px-2 py-0.5 rounded ${beforeAfterMode === "before" ? "bg-white shadow-2xs font-bold" : ""}`}
                  >
                    Before
                  </button>
                  <button
                    onClick={() => setBeforeAfterMode("after")}
                    className={`px-2 py-0.5 rounded ${beforeAfterMode === "after" ? "bg-white shadow-2xs font-bold" : ""}`}
                  >
                    After
                  </button>
                </div>
              </div>

              {beforeAfterMode === "split" ? (
                <div className="grid grid-cols-2 gap-2 h-36">
                  <div className="relative rounded-xl overflow-hidden border border-[#d6dfce]">
                    <img src="/garbage_pile.jpg" alt="Before cleanup" className="w-full h-full object-cover" />
                    <span className="absolute bottom-1.5 left-1.5 bg-black/60 text-white text-[9px] font-bold px-2 py-0.5 rounded">
                      Before
                    </span>
                  </div>
                  <div className="relative rounded-xl overflow-hidden border border-[#d6dfce]">
                    <img src="/cleaned_street.jpg" alt="After cleanup" className="w-full h-full object-cover" />
                    <span className="absolute bottom-1.5 left-1.5 bg-[#205136] text-white text-[9px] font-bold px-2 py-0.5 rounded">
                      After
                    </span>
                  </div>
                </div>
              ) : beforeAfterMode === "before" ? (
                <div className="relative rounded-xl overflow-hidden border border-[#d6dfce] h-36">
                  <img src="/garbage_pile.jpg" alt="Before cleanup" className="w-full h-full object-cover" />
                  <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    Before (Accumulated waste on roadside)
                  </span>
                </div>
              ) : (
                <div className="relative rounded-xl overflow-hidden border border-[#d6dfce] h-36">
                  <img src="/cleaned_street.jpg" alt="After cleanup" className="w-full h-full object-cover" />
                  <span className="absolute bottom-2 left-2 bg-[#205136] text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    After (Cleaned & swept clear)
                  </span>
                </div>
              )}
            </div>

            {/* Work Done Card */}
            <div className="bg-white border border-[#d6e2cf] rounded-xl p-3 flex items-start gap-3 shadow-2xs">
              <div className="w-7 h-7 rounded-lg bg-[#dcfce7] text-[#15803d] flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 size={16} />
              </div>
              <div>
                <span className="text-xs font-bold text-[#1a2e1c] block">Work Done</span>
                <p className="text-[11px] text-[#4a5c4a] leading-snug mt-0.5">
                  Garbage collected, area cleaned. Additional bin requested for this location.
                </p>
              </div>
            </div>

            {/* Resolved By Card */}
            <div className="bg-white border border-[#d6e2cf] rounded-xl p-3 flex items-center gap-3 shadow-2xs">
              <div className="w-7 h-7 rounded-lg bg-[#e0f2fe] text-[#0369a1] flex items-center justify-center shrink-0">
                <Building2 size={16} />
              </div>
              <div>
                <span className="text-[10px] text-[#697c69] font-medium block">Resolved By</span>
                <span className="text-xs font-bold text-[#1a2d1a]">Ward 12 Sanitation Team</span>
              </div>
            </div>

            {/* Your Feedback Card */}
            <div className="bg-white border border-[#d6e2cf] rounded-2xl p-3.5 shadow-2xs flex flex-col gap-2.5">
              <span className="text-xs font-bold text-[#1b2e1c]">Your Feedback</span>
              <p className="text-[11px] text-[#556955] -mt-1">Is the issue resolved?</p>

              {/* Thumbs Up / Down */}
              <div className="flex gap-2">
                <button
                  onClick={() => setFeedbackRating(true)}
                  className={`flex-1 py-2 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-bold transition ${
                    feedbackRating === true
                      ? "bg-[#e8f5e9] border-[#256037] text-[#1e522f]"
                      : "bg-white border-[#d8e2d2] text-[#4d5e4d]"
                  }`}
                >
                  <ThumbsUp size={16} />
                  <span>Yes, satisfied</span>
                </button>
                <button
                  onClick={() => setFeedbackRating(false)}
                  className={`flex-1 py-2 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-bold transition ${
                    feedbackRating === false
                      ? "bg-rose-50 border-rose-400 text-rose-700"
                      : "bg-white border-[#d8e2d2] text-[#4d5e4d]"
                  }`}
                >
                  <ThumbsDown size={16} />
                  <span>Not satisfied</span>
                </button>
              </div>

              {/* Feedback Textarea */}
              <input
                type="text"
                placeholder="Share more feedback (optional)"
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                className="w-full text-xs p-2.5 border border-[#d6dfce] rounded-xl bg-[#fafcfa] focus:outline-none focus:ring-1 focus:ring-[#22543d]"
              />

              {/* Submit Feedback Button */}
              <button
                onClick={handleFeedback}
                className="w-full bg-[#204e37] hover:bg-[#183d2b] text-white py-2.5 rounded-xl font-bold text-xs shadow-sm transition"
              >
                {feedbackSubmitted ? "✓ Feedback Recorded!" : "Submit Feedback"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-[#e2e8de] rounded-t-3xl flex items-center justify-around px-4 z-20 shadow-lg">
        <button
          onClick={() => setScreen("home")}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition cursor-pointer ${
            currentScreen === "home" ? "text-[#1b4329]" : "text-[#718274] hover:text-[#1b4329]"
          }`}
        >
          <Home size={19} className={currentScreen === "home" ? "fill-[#1b4329]" : ""} />
          <span>Home</span>
        </button>

        <button
          onClick={() => setScreen("report")}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition cursor-pointer ${
            currentScreen === "report" || currentScreen === "confirm" ? "text-[#1b4329]" : "text-[#718274] hover:text-[#1b4329]"
          }`}
        >
          <Clock size={19} />
          <span>Report</span>
        </button>

        <button
          onClick={() => setScreen("track")}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition cursor-pointer ${
            currentScreen === "track" || currentScreen === "feedback" ? "text-[#1b4329]" : "text-[#718274] hover:text-[#1b4329]"
          }`}
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

      {/* Location Modal */}
      {showLocationModal && (
        <div className="absolute inset-0 bg-black/40 z-50 flex items-end animate-in fade-in duration-150">
          <div className="w-full bg-white rounded-t-3xl p-5 flex flex-col gap-3 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#e5ece1]">
              <h3 className="text-sm font-bold text-[#1d3521]">Select Raipur Location</h3>
              <button onClick={() => setShowLocationModal(false)} className="text-xs font-bold text-[#556955]">
                Done
              </button>
            </div>
            {[
              "Sundar Nagar, Raipur",
              "Shankar Nagar, Raipur",
              "Civil Lines, Raipur",
              "Kota Road, Raipur",
              "Telibandha Lake Road, Raipur",
              "Mowa Main Road, Raipur",
            ].map((loc) => (
              <button
                key={loc}
                onClick={() => {
                  setSelectedLocation(loc);
                  setShowLocationModal(false);
                }}
                className={`w-full p-2.5 rounded-xl text-left text-xs font-semibold flex items-center justify-between ${
                  selectedLocation === loc ? "bg-[#eaf4e5] text-[#205136]" : "hover:bg-[#f6f9f3] text-[#344634]"
                }`}
              >
                <span>{loc}</span>
                {selectedLocation === loc && <CheckCircle2 size={16} />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* General Info Modal */}
      {showModalInfo && (
        <div className="absolute inset-0 bg-black/40 z-50 flex items-center justify-center p-6 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-5 max-w-xs w-full shadow-2xl flex flex-col gap-3">
            <h4 className="text-sm font-bold text-[#19321c]">WasteLoop Info</h4>
            <p className="text-xs text-[#4c5e4c] leading-relaxed">{showModalInfo}</p>
            <button
              onClick={() => setShowModalInfo(null)}
              className="mt-1 bg-[#204e37] text-white py-2 rounded-xl text-xs font-bold shadow-xs cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* AI Duplicate Detected Modal */}
      {duplicateAlert && (
        <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-5 animate-in fade-in duration-150 backdrop-blur-2xs">
          <div className="bg-white rounded-3xl p-5 max-w-xs w-full shadow-2xl flex flex-col gap-3 border-2 border-emerald-600">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <h4 className="text-xs font-black text-[#143826]">Similar Complaint Active</h4>
                <span className="text-[10px] font-bold text-emerald-700">Case {duplicateAlert.matchedCaseId} · Merged</span>
              </div>
            </div>
            
            <p className="text-[11px] text-[#3b4d3e] leading-snug bg-[#f3f8f1] p-2.5 rounded-xl border border-[#d6e5d2]">
              {duplicateAlert.reason}
            </p>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-2 text-[10px] text-amber-900 font-semibold">
              ⚡ Priority escalated to Urgent! Multiple citizens reporting this same garbage spot.
            </div>

            <button
              onClick={() => {
                setDuplicateAlert(null);
                setScreen("track");
              }}
              className="mt-1 bg-[#1b4329] hover:bg-[#153721] text-white py-2.5 rounded-xl text-xs font-bold shadow-md transition cursor-pointer"
            >
              Track Active Cleanup →
            </button>
          </div>
        </div>
      )}

      {/* Add Comment Modal */}
      {showCommentModal && (
        <div className="absolute inset-0 bg-black/40 z-50 flex items-end animate-in fade-in duration-150">
          <div className="w-full bg-white rounded-t-3xl p-5 flex flex-col gap-3 shadow-xl">
            <h3 className="text-sm font-bold text-[#1d3521]">Add Citizen Comment</h3>
            <textarea
              placeholder="e.g. Smell is spreading to nearby school..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="w-full text-xs p-3 border border-[#d6dfce] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#204e37] h-20"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowCommentModal(false)}
                className="flex-1 py-2 border border-[#d8e2d2] rounded-xl text-xs font-bold text-[#445844]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowCommentModal(false);
                  setCommentText("");
                }}
                className="flex-1 py-2 bg-[#204e37] text-white rounded-xl text-xs font-bold"
              >
                Post Comment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-[#f8faf7] shadow-xl flex flex-col relative border-x border-[#e3ebdf]">
      {phoneContent}
    </div>
  );
}
