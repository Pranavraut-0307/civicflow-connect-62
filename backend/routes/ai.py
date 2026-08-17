import os
import base64
import json
import math
import re
import requests

from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel


# =========================================================
# ENV
# =========================================================

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

GEMINI_MODEL = os.getenv(
    "GEMINI_MODEL",
    "gemini-3.5-flash"
)

GEMINI_URL = (
    "https://generativelanguage.googleapis.com/"
    f"v1beta/models/{GEMINI_MODEL}:generateContent"
)

if not GEMINI_API_KEY:
    raise RuntimeError(
        "GEMINI_API_KEY is missing from backend .env"
    )


# =========================================================
# ROUTER
# =========================================================

router = APIRouter(
    prefix="/api/ai",
    tags=["AI"]
)


# =========================================================
# IMAGE ANALYSIS REQUEST
# =========================================================

class ImageAnalysisRequest(BaseModel):
    image_url: str
    issue_type: str | None = None
    description: str | None = None


# =========================================================
# JSON EXTRACTION
# =========================================================

def extract_json(text: str):

    if not text:
        return None

    text = text.strip()

    # Remove markdown fences
    text = re.sub(
        r"```json",
        "",
        text,
        flags=re.IGNORECASE
    )

    text = text.replace("```", "").strip()

    # First try direct JSON
    try:
        data = json.loads(text)

        if isinstance(data, dict):
            return data

    except Exception:
        pass

    # Find first JSON object
    start = text.find("{")

    if start == -1:
        return None

    depth = 0
    in_string = False
    escaped = False

    for i in range(start, len(text)):

        char = text[i]

        if in_string:

            if escaped:
                escaped = False

            elif char == "\\":
                escaped = True

            elif char == '"':
                in_string = False

            continue

        if char == '"':
            in_string = True

        elif char == "{":
            depth += 1

        elif char == "}":

            depth -= 1

            if depth == 0:

                candidate = text[
                    start:i + 1
                ]

                try:
                    data = json.loads(
                        candidate
                    )

                    if isinstance(data, dict):
                        return data

                except Exception:
                    pass

                # Remove trailing commas
                candidate = re.sub(
                    r",\s*([}\]])",
                    r"\1",
                    candidate
                )

                try:
                    data = json.loads(
                        candidate
                    )

                    if isinstance(data, dict):
                        return data

                except Exception:
                    pass

                return None

    return None


# =========================================================
# NORMALIZE AI RESPONSE
# =========================================================

def normalize_analysis(data: dict):

    # Gemini sometimes returns "issue"
    # instead of "issue_type".
    issue_type = (
        data.get("issue_type")
        or data.get("issue")
        or data.get("category")
        or "other"
    )

    issue_type = str(
        issue_type
    ).strip().lower()

    # Convert common variations
    aliases = {
        "potholes": "pothole",
        "road damage": "road damage",
        "road_damage": "road damage",
        "garbage/waste": "garbage",
        "street light": "streetlight",
        "street_light": "streetlight",
        "sewer": "sewage",
        "water leak": "water leakage",
        "traffic": "traffic obstruction",
    }

    issue_type = aliases.get(
        issue_type,
        issue_type
    )

    allowed_issue_types = {
        "pothole",
        "garbage",
        "streetlight",
        "drainage",
        "sewage",
        "water leakage",
        "road damage",
        "traffic obstruction",
        "other",
    }

    if issue_type not in allowed_issue_types:
        issue_type = "other"

    # -----------------------------------------------------
    # CONFIDENCE
    # -----------------------------------------------------

    confidence = (
        data.get("confidence")
        or data.get("detection_confidence")
        or data.get("score")
        or 0
    )

    try:
        confidence = float(
            confidence
        )
    except Exception:
        confidence = 0.0

    # Handle percentage like 95
    if confidence > 1:
        confidence /= 100

    confidence = max(
        0.0,
        min(1.0, confidence)
    )

    # -----------------------------------------------------
    # AREA
    # -----------------------------------------------------

    affected_area = (
        data.get("affected_area")
        or data.get("area")
        or data.get("affected_area_estimate")
        or "unknown"
    )

    affected_area = str(
        affected_area
    ).strip().lower()

    if affected_area not in {
        "small",
        "medium",
        "large",
        "unknown",
    }:
        affected_area = "unknown"

    # -----------------------------------------------------
    # DEPARTMENT
    # -----------------------------------------------------

    department = (
        data.get("recommended_department")
        or data.get("department")
        or "Municipal Corporation"
    )

    department = str(
        department
    ).strip()

    # -----------------------------------------------------
    # SEVERITY
    # -----------------------------------------------------

    severity = (
        data.get("severity")
        or "unknown"
    )

    severity = str(
        severity
    ).strip().lower()

    if severity not in {
        "low",
        "medium",
        "high",
        "unknown",
    }:
        severity = "unknown"

    # -----------------------------------------------------
    # SUMMARY
    # -----------------------------------------------------

    summary = (
        data.get("summary")
        or data.get("description")
        or f"{issue_type} detected in uploaded image."
    )

    return {
        "issue_type": issue_type,
        "confidence": round(
            confidence,
            2
        ),
        "affected_area": affected_area,
        "recommended_department": department,
        "severity": severity,
        "summary": str(summary).strip(),
    }


# =========================================================
# ANALYZE IMAGE
# =========================================================

@router.post("/analyze-image")
def analyze_image(
    request: ImageAnalysisRequest
):

    try:

        # =================================================
        # DOWNLOAD IMAGE
        # =================================================

        try:

            image_response = requests.get(
                request.image_url,
                timeout=(15, 60),
                headers={
                    "User-Agent":
                    "CivilFlow/1.0"
                }
            )

        except requests.ConnectTimeout:

            raise HTTPException(
                status_code=504,
                detail=(
                    "Could not connect to image server."
                )
            )

        except requests.ReadTimeout:

            raise HTTPException(
                status_code=504,
                detail=(
                    "Image download timed out."
                )
            )

        except requests.RequestException as e:

            raise HTTPException(
                status_code=502,
                detail=(
                    f"Image download failed: {str(e)}"
                )
            )

        if image_response.status_code != 200:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Could not download image. "
                    f"HTTP {image_response.status_code}"
                )
            )

        image_bytes = image_response.content

        if not image_bytes:

            raise HTTPException(
                status_code=400,
                detail="Image is empty."
            )

        if len(image_bytes) > 15 * 1024 * 1024:

            raise HTTPException(
                status_code=400,
                detail="Image is larger than 15 MB."
            )

        # =================================================
        # MIME TYPE
        # =================================================

        mime_type = (
            image_response.headers
            .get(
                "content-type",
                ""
            )
            .split(";")[0]
            .strip()
            .lower()
        )

        allowed_types = {
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/heic",
            "image/heif",
        }

        if mime_type not in allowed_types:
            mime_type = "image/jpeg"

        # =================================================
        # BASE64
        # =================================================

        image_base64 = base64.b64encode(
            image_bytes
        ).decode("utf-8")

        # =================================================
        # PROMPT
        # =================================================

        prompt = """
You are CivilFlow AI for Nagpur Municipal Corporation.

Analyze the uploaded image and detect the main civic issue.

Possible issue types:

pothole
garbage
streetlight
drainage
sewage
water leakage
road damage
traffic obstruction
other

Return the result according to the provided JSON schema.

Rules:

- Identify the main visible civic issue.
- Do not identify people.
- Do not guess personal information.
- Confidence must be between 0 and 1.
- affected_area must be small, medium, large, or unknown.
- severity must be low, medium, high, or unknown.
- recommended_department must be a relevant municipal department.
- summary must be short and factual.
"""

        if request.issue_type:

            prompt += f"""

Citizen selected issue:
{request.issue_type}
"""

        if request.description:

            prompt += f"""

Citizen description:
{request.description}
"""

        # =================================================
        # STRUCTURED JSON SCHEMA
        # =================================================

        response_schema = {
            "type": "object",

            "properties": {

                "issue_type": {
                    "type": "string",
                    "enum": [
                        "pothole",
                        "garbage",
                        "streetlight",
                        "drainage",
                        "sewage",
                        "water leakage",
                        "road damage",
                        "traffic obstruction",
                        "other",
                    ]
                },

                "confidence": {
                    "type": "number"
                },

                "affected_area": {
                    "type": "string",
                    "enum": [
                        "small",
                        "medium",
                        "large",
                        "unknown",
                    ]
                },

                "recommended_department": {
                    "type": "string"
                },

                "severity": {
                    "type": "string",
                    "enum": [
                        "low",
                        "medium",
                        "high",
                        "unknown",
                    ]
                },

                "summary": {
                    "type": "string"
                }
            },

            "required": [
                "issue_type",
                "confidence",
                "affected_area",
                "recommended_department",
                "severity",
                "summary"
            ]
        }

        # =================================================
        # GEMINI PAYLOAD
        # =================================================

        payload = {

            "contents": [
                {
                    "role": "user",

                    "parts": [
                        {
                            "inline_data": {
                                "mime_type":
                                    mime_type,
                                "data":
                                    image_base64
                            }
                        },

                        {
                            "text": prompt
                        }
                    ]
                }
            ],

            "generationConfig": {

                "responseMimeType":
                    "application/json",

                "responseJsonSchema":
                    response_schema,

                "maxOutputTokens":
                    1000
            }
        }

        # =================================================
        # CALL GEMINI
        # =================================================

        try:

            response = requests.post(
                GEMINI_URL,

                headers={
                    "x-goog-api-key":
                        GEMINI_API_KEY,

                    "Content-Type":
                        "application/json"
                },

                json=payload,

                timeout=(15, 120)
            )

        except requests.ConnectTimeout:

            raise HTTPException(
                status_code=504,
                detail=(
                    "Could not connect to Gemini."
                )
            )

        except requests.ReadTimeout:

            raise HTTPException(
                status_code=504,
                detail=(
                    "Gemini request timed out."
                )
            )

        except requests.ConnectionError:

            raise HTTPException(
                status_code=502,
                detail=(
                    "Could not connect to Gemini AI."
                )
            )

        except requests.RequestException as e:

            raise HTTPException(
                status_code=502,
                detail=(
                    f"Gemini request failed: {str(e)}"
                )
            )

        # =================================================
        # GEMINI API ERROR
        # =================================================

        if response.status_code != 200:

            try:

                error_json = response.json()

                error_message = (
                    error_json
                    .get("error", {})
                    .get("message")
                )

            except Exception:

                error_message = None

            if not error_message:

                error_message = response.text[:1000]

            raise HTTPException(
                status_code=502,
                detail=(
                    f"Gemini API error "
                    f"(HTTP {response.status_code}): "
                    f"{error_message}"
                )
            )

        # =================================================
        # PARSE API RESPONSE
        # =================================================

        try:

            result = response.json()

        except Exception:

            raise HTTPException(
                status_code=502,
                detail=(
                    "Gemini API returned invalid JSON."
                )
            )

        # =================================================
        # GET GENERATED TEXT
        # =================================================

        try:

            candidates = result.get(
                "candidates",
                []
            )

            if not candidates:

                raise ValueError(
                    "No candidates returned."
                )

            parts = (
                candidates[0]
                .get("content", {})
                .get("parts", [])
            )

            text = ""

            for part in parts:

                if part.get("text"):

                    text += str(
                        part["text"]
                    )

            if not text:

                raise ValueError(
                    "Gemini returned empty output."
                )

        except Exception as e:

            raise HTTPException(
                status_code=502,
                detail=(
                    f"Could not read Gemini output: {str(e)}"
                )
            )

        # =================================================
        # PARSE GENERATED JSON
        # =================================================

        analysis_data = extract_json(
            text
        )

        if analysis_data is None:

            # IMPORTANT:
            # Return the actual response so we can diagnose
            # instead of blindly saying "invalid JSON".

            raise HTTPException(
                status_code=502,
                detail=(
                    "Gemini generated an invalid "
                    f"analysis response: {text[:1500]}"
                )
            )

        # =================================================
        # NORMALIZE
        # =================================================

        analysis = normalize_analysis(
            analysis_data
        )

        # =================================================
        # SUCCESS
        # =================================================

        return {
            "success": True,
            "analysis": analysis
        }

    except HTTPException:
        raise

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=(
                f"AI analysis failed: {str(e)}"
            )
        )


# =========================================================
# DUPLICATE CHECK
# =========================================================

class DuplicateCheckRequest(BaseModel):

    image_url: str | None = None
    issue_type: str | None = None
    description: str | None = None
    latitude: float | None = None
    longitude: float | None = None


# =========================================================
# DISTANCE
# =========================================================

def calculate_distance_km(
    lat1,
    lon1,
    lat2,
    lon2
):

    earth_radius = 6371.0

    lat1 = math.radians(lat1)
    lat2 = math.radians(lat2)

    dlat = lat2 - lat1

    dlon = math.radians(
        lon2 - lon1
    )

    a = (
        math.sin(dlat / 2) ** 2
        +
        math.cos(lat1)
        *
        math.cos(lat2)
        *
        math.sin(dlon / 2) ** 2
    )

    c = 2 * math.atan2(
        math.sqrt(a),
        math.sqrt(1 - a)
    )

    return earth_radius * c


# =========================================================
# TEXT SIMILARITY
# =========================================================

def calculate_text_similarity(
    text1,
    text2
):

    if not text1 or not text2:
        return 0.0

    words1 = set(
        str(text1)
        .lower()
        .split()
    )

    words2 = set(
        str(text2)
        .lower()
        .split()
    )

    if not words1 or not words2:
        return 0.0

    return (
        len(words1 & words2)
        /
        len(words1 | words2)
    )


# =========================================================
# DUPLICATE CHECK
# =========================================================

@router.post("/duplicate-check")
def duplicate_check(
    request: DuplicateCheckRequest
):

    try:

        from app.database import supabase

        response = (
            supabase
            .table("complaints")
            .select(
                "id,title,description,"
                "issue_type,image_url,"
                "latitude,longitude,created_at"
            )
            .limit(100)
            .execute()
        )

        complaints = (
            response.data
            or []
        )

        matches = []

        for complaint in complaints:

            location_score = 0.0
            issue_score = 0.0
            text_score = 0.0
            distance = None

            reasons = []

            # -------------------------------------------------
            # LOCATION
            # -------------------------------------------------

            if (
                request.latitude is not None
                and request.longitude is not None
                and complaint.get("latitude") is not None
                and complaint.get("longitude") is not None
            ):

                try:

                    distance = calculate_distance_km(
                        request.latitude,
                        request.longitude,
                        float(
                            complaint["latitude"]
                        ),
                        float(
                            complaint["longitude"]
                        )
                    )

                except Exception:

                    distance = None

                if (
                    distance is not None
                    and distance <= 0.5
                ):

                    location_score = (
                        1
                        -
                        distance / 0.5
                    )

                    reasons.append(
                        f"Nearby complaint "
                        f"({distance * 1000:.0f}m)"
                    )

            # -------------------------------------------------
            # ISSUE TYPE
            # -------------------------------------------------

            existing_issue = (
                complaint.get(
                    "issue_type"
                )
            )

            if (
                request.issue_type
                and existing_issue
                and
                str(
                    request.issue_type
                ).lower()
                ==
                str(
                    existing_issue
                ).lower()
            ):

                issue_score = 1.0

                reasons.append(
                    "Same issue category"
                )

            # -------------------------------------------------
            # DESCRIPTION
            # -------------------------------------------------

            text_score = (
                calculate_text_similarity(
                    request.description,
                    complaint.get(
                        "description"
                    )
                )
            )

            if text_score >= 0.25:

                reasons.append(
                    "Similar description"
                )

            # -------------------------------------------------
            # FINAL SCORE
            # -------------------------------------------------

            similarity = (
                location_score * 0.45
                +
                issue_score * 0.35
                +
                text_score * 0.20
            )

            if similarity >= 0.45:

                matches.append({

                    "complaint_id":
                        complaint.get("id"),

                    "similarity":
                        round(
                            similarity,
                            2
                        ),

                    "distance_km":
                        (
                            round(
                                distance,
                                3
                            )
                            if distance is not None
                            else None
                        ),

                    "issue_type":
                        existing_issue,

                    "description":
                        complaint.get(
                            "description"
                        ),

                    "reasons":
                        reasons
                })

        matches.sort(
            key=lambda x:
                x["similarity"],
            reverse=True
        )

        best_match = (
            matches[0]
            if matches
            else None
        )

        if best_match:

            similarity = (
                best_match[
                    "similarity"
                ]
            )

            return {

                "success": True,

                "is_duplicate":
                    similarity >= 0.60,

                "similarity":
                    similarity,

                "message":
                    (
                        "Possible duplicate complaint found."
                        if similarity >= 0.60
                        else
                        "No strong duplicate found."
                    ),

                "match":
                    best_match,

                "checked_complaints":
                    len(complaints)
            }

        return {

            "success": True,

            "is_duplicate": False,

            "similarity": 0.0,

            "message":
                "No duplicate complaint found.",

            "match": None,

            "checked_complaints":
                len(complaints)
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=(
                f"Duplicate check failed: {str(e)}"
            )
        )