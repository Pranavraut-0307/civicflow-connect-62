from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, ConfigDict
from typing import Optional

from app.database import supabase


router = APIRouter(
    prefix="/complaints",
    tags=["Complaints"]
)


# =========================================================
# CREATE COMPLAINT MODEL
# =========================================================

class Complaint(BaseModel):
    model_config = ConfigDict(extra="ignore")

    title: str
    description: Optional[str] = None
    issue_type: Optional[str] = None
    image_url: Optional[str] = None

    latitude: Optional[float] = None
    longitude: Optional[float] = None

    location: Optional[str] = None
    ward: Optional[str] = None

    status: Optional[str] = "open"
    priority: Optional[str] = "medium"

    user_id: Optional[str] = None


# =========================================================
# UPDATE COMPLAINT MODEL
# =========================================================

class ComplaintUpdate(BaseModel):
    model_config = ConfigDict(extra="ignore")

    status: Optional[str] = None
    priority: Optional[str] = None
    internal_note: Optional[str] = None

    # Used to resolve frontend demo IDs like CF-2041
    title: Optional[str] = None


# =========================================================
# CREATE COMPLAINT
# =========================================================

@router.post("/")
def create_complaint(complaint: Complaint):

    try:
        data = complaint.model_dump(exclude_none=True)

        if not complaint.user_id:
            data.pop("user_id", None)

        print("CREATE COMPLAINT DATA:")
        print(data)

        response = (
            supabase
            .table("complaints")
            .insert(data)
            .execute()
        )

        print("CREATE RESPONSE:")
        print(response.data)

        return {
            "success": True,
            "message": "Complaint created successfully",
            "data": response.data
        }

    except Exception as e:

        print("CREATE COMPLAINT ERROR:", repr(e))

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# =========================================================
# GET ALL COMPLAINTS
# =========================================================

@router.get("/")
def get_complaints():

    try:

        response = (
            supabase
            .table("complaints")
            .select("*")
            .order("id", desc=True)
            .execute()
        )

        return {
            "success": True,
            "data": response.data
        }

    except Exception as e:

        print("GET COMPLAINTS ERROR:", repr(e))

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# =========================================================
# GET SINGLE COMPLAINT
# =========================================================

@router.get("/{complaint_id}")
def get_complaint(complaint_id: str):

    try:

        print("GET COMPLAINT ID:", complaint_id)

        # -------------------------------------------------
        # Numeric database ID
        # -------------------------------------------------

        if complaint_id.isdigit():

            database_id = int(complaint_id)

            response = (
                supabase
                .table("complaints")
                .select("*")
                .eq("id", database_id)
                .limit(1)
                .execute()
            )

        else:

            # -------------------------------------------------
            # Frontend IDs such as CF-2041
            #
            # These are resolved using the complaint title
            # when supplied by the frontend.
            # -------------------------------------------------

            raise HTTPException(
                status_code=400,
                detail="Complaint lookup requires numeric database ID"
            )

        print("GET RESPONSE:", response.data)

        if not response.data:

            raise HTTPException(
                status_code=404,
                detail="Complaint not found"
            )

        return {
            "success": True,
            "data": response.data[0]
        }

    except HTTPException:
        raise

    except Exception as e:

        print(
            "GET SINGLE COMPLAINT ERROR:",
            repr(e)
        )

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# =========================================================
# UPDATE COMPLAINT
# =========================================================

@router.patch("/{complaint_id}")
def update_complaint(
    complaint_id: str,
    update: ComplaintUpdate
):

    try:

        print("")
        print("========================================")
        print("UPDATE REQUEST")
        print("========================================")
        print("FRONTEND ID:", complaint_id)
        print("DATA:", update.model_dump())
        print("========================================")


        # =================================================
        # BUILD UPDATE DATA
        # =================================================

        update_data = {}

        if update.status is not None:
            update_data["status"] = update.status

        if update.priority is not None:
            update_data["priority"] = update.priority

        if update.internal_note is not None:
            update_data["internal_note"] = update.internal_note


        if not update_data:

            raise HTTPException(
                status_code=400,
                detail="No update data provided"
            )


        print(
            "UPDATE DATA TO SUPABASE:",
            update_data
        )


        # =================================================
        # RESOLVE DATABASE ID
        # =================================================

        database_id = None


        # -------------------------------------------------
        # CASE 1:
        # Actual numeric Supabase ID
        # -------------------------------------------------

        if complaint_id.isdigit():

            database_id = int(complaint_id)

            print(
                "Using numeric database ID:",
                database_id
            )


        # -------------------------------------------------
        # CASE 2:
        # Frontend demo ID like CF-2041
        #
        # Resolve using complaint title.
        # -------------------------------------------------

        else:

            print(
                "Frontend demo ID detected:",
                complaint_id
            )

            if not update.title:

                raise HTTPException(
                    status_code=400,
                    detail=(
                        "Complaint title is required "
                        "to resolve frontend complaint ID"
                    )
                )


            print(
                "Resolving complaint using title:",
                update.title
            )


            lookup = (
                supabase
                .table("complaints")
                .select("id,title")
                .eq("title", update.title)
                .limit(1)
                .execute()
            )


            print(
                "TITLE LOOKUP RESPONSE:",
                lookup.data
            )


            if not lookup.data:

                raise HTTPException(
                    status_code=404,
                    detail=(
                        f"Complaint not found for "
                        f"frontend ID {complaint_id}"
                    )
                )


            database_id = lookup.data[0]["id"]


            print(
                "Resolved frontend ID",
                complaint_id,
                "-> database ID",
                database_id
            )


        # =================================================
        # CHECK COMPLAINT EXISTS
        # =================================================

        lookup = (
            supabase
            .table("complaints")
            .select("*")
            .eq("id", database_id)
            .limit(1)
            .execute()
        )


        print(
            "DATABASE LOOKUP:",
            lookup.data
        )


        if not lookup.data:

            raise HTTPException(
                status_code=404,
                detail="Complaint not found in database"
            )


        # =================================================
        # UPDATE ACTUAL COMPLAINT
        # =================================================

        response = (
            supabase
            .table("complaints")
            .update(update_data)
            .eq("id", database_id)
            .execute()
        )


        print(
            "SUPABASE UPDATE RESPONSE:",
            response.data
        )


        # =================================================
        # VERIFY UPDATE
        # =================================================

        verify = (
            supabase
            .table("complaints")
            .select("*")
            .eq("id", database_id)
            .limit(1)
            .execute()
        )


        print(
            "UPDATED ROW:",
            verify.data
        )


        if not verify.data:

            raise HTTPException(
                status_code=404,
                detail="Complaint update verification failed"
            )


        updated_row = verify.data[0]


        # =================================================
        # SUCCESS
        # =================================================

        return {
            "success": True,
            "message": "Complaint updated successfully",
            "frontend_id": complaint_id,
            "database_id": database_id,
            "data": updated_row
        }


    except HTTPException:
        raise


    except Exception as e:

        print(
            "UPDATE COMPLAINT ERROR:",
            repr(e)
        )

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )