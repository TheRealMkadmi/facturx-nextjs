from datetime import datetime
from beanie import Document, PydanticObjectId, init_beanie
from pydantic import Field
from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional


class Invoice(Document):
    id: PydanticObjectId = Field(None, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    file_name: str
    pdf_file: str
    xml_file: str

    class Settings:
        collection = "invoices"
