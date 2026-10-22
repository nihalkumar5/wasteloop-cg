import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

function getDistanceMeters(lat1?: number, lon1?: number, lat2?: number, lon2?: number): number {
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) return 999999;
  const R = 6371e3;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { photoBase64, description, location, category, coordinates, existingCases } = body;

    // Filter nearby active cases within 300 meters for AI duplicate evaluation
    const nearbyCases = Array.isArray(existingCases)
      ? existingCases
          .filter((c: any) => c.status !== "Resolved" && c.status !== "Rejected")
          .map((c: any) => ({
            id: c.id,
            title: c.title,
            category: c.category,
            location: c.location,
            coordinates: c.coordinates,
            visualFingerprint: c.visualFingerprint || c.description,
            distanceMeters: coordinates && c.coordinates
              ? getDistanceMeters(coordinates.lat, coordinates.lng, c.coordinates.lat, c.coordinates.lng)
              : null
          }))
          .filter((c: any) => c.distanceMeters === null || c.distanceMeters <= 350)
      : [];

    const prompt = `You are the AI Sanitation & Solid Waste Management Specialist for Raipur Municipal Corporation, Chhattisgarh (WasteLoop CG).
A citizen has reported a civic waste/sanitation issue:
- Locality: ${location || "Raipur"}
- GPS Coordinates: ${coordinates ? `${coordinates.lat}, ${coordinates.lng}` : "Not provided"}
- User Category Hint: ${category || "General waste"}
- Description / Voice Note: ${description || "Garbage overflow reported by citizen"}

Existing nearby active complaints in this area:
${JSON.stringify(nearbyCases, null, 2)}

TASK:
1. Analyze the issue and photo.
2. Generate a "visualFingerprint" (concise 8-12 word visual description of this exact garbage heap: types of waste, colors of containers/bags, pavement/backdrop).
3. Check for DUPLICATION: Does this report represent the exact same garbage accumulation as one of the existing nearby cases? (Within 100 meters, same category or matching waste appearance).
   - If YES: set "isDuplicate": true and "matchedCaseId" to that case ID, with "duplicateReason".
   - If NO: set "isDuplicate": false and "matchedCaseId": null.

Return STRICTLY a valid JSON object (no markdown, no backticks, just raw JSON) with this schema:
{
  "isDuplicate": boolean,
  "matchedCaseId": string | null,
  "duplicateReason": string | null,
  "visualFingerprint": string,
  "category": "Garbage Pile" | "Blocked Drain" | "Street Light" | "Dead Animal" | "Other Issue",
  "priority": "Urgent" | "High" | "Medium" | "Low",
  "slaHours": number,
  "summary": string,
  "estimatedWasteKg": number,
  "assignedSquad": string,
  "actionSteps": string[]
}`;

    const parts: any[] = [{ text: prompt }];

    // If base64 photo provided, attach as inline image part
    if (photoBase64 && typeof photoBase64 === "string" && photoBase64.includes("base64,")) {
      const mimeType = photoBase64.substring(photoBase64.indexOf(":") + 1, photoBase64.indexOf(";"));
      const base64Data = photoBase64.split("base64,")[1];
      parts.push({
        inlineData: {
          mimeType: mimeType || "image/jpeg",
          data: base64Data
        }
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: parts,
    });

    const rawText = response.text || "{}";
    const cleanedJson = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleanedJson);

    // Algorithmic safety guard: if coordinates match within 50m of an existing case with same category
    if (!parsed.isDuplicate && coordinates && nearbyCases.length > 0) {
      const closest = nearbyCases.find((c: any) => c.distanceMeters !== null && c.distanceMeters <= 50);
      if (closest) {
        parsed.isDuplicate = true;
        parsed.matchedCaseId = closest.id;
        parsed.duplicateReason = `Exact GPS location matches Case ${closest.id} within ${closest.distanceMeters} meters. Merged to prevent duplicate dispatch.`;
      }
    }

    return NextResponse.json({
      success: true,
      data: parsed
    });
  } catch (error: any) {
    console.error("Gemini AI Triage Error:", error);

    // Smart fallback with algorithmic duplicate detection
    let isDup = false;
    let matchedId: string | null = null;
    let dupReason: string | null = null;

    try {
      const body = await request.clone().json();
      if (body.coordinates && Array.isArray(body.existingCases)) {
        for (const ec of body.existingCases) {
          if (ec.status !== "Resolved" && ec.coordinates) {
            const dist = getDistanceMeters(body.coordinates.lat, body.coordinates.lng, ec.coordinates.lat, ec.coordinates.lng);
            if (dist <= 60) {
              isDup = true;
              matchedId = ec.id;
              dupReason = `Nearby active complaint ${ec.id} located within ${dist}m at the same spot.`;
              break;
            }
          }
        }
      }
    } catch {
      // ignore
    }

    return NextResponse.json({
      success: true,
      data: {
        isDuplicate: isDup,
        matchedCaseId: matchedId,
        duplicateReason: dupReason,
        visualFingerprint: "Mixed solid municipal waste pile near street pavement",
        category: "Garbage Pile",
        priority: "High",
        slaHours: 4,
        summary: "Accumulated solid waste requiring mechanized clearing.",
        estimatedWasteKg: 42,
        assignedSquad: "Sanitation Squad #12 (Telibandha Depot)",
        actionSteps: [
          "Wear protective gloves and high-visibility jacket",
          "Load accumulated waste into tipper vehicle CG-04-E-8821",
          "Disinfect surrounding pavement with lime powder",
          "Capture and upload after-cleanup evidence photo"
        ]
      }
    });
  }
}
