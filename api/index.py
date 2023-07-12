from beanie import init_beanie
from fastapi import FastAPI, UploadFile, File
from fastapi.responses import FileResponse
from facturx import get_xml_from_pdf
import os
from motor.motor_asyncio import AsyncIOMotorClient
from io import BytesIO
import base64
from fastapi.responses import StreamingResponse

from api.models import Invoice

dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
if os.path.exists(dotenv_path):
    print("Loading .env file")
    from dotenv import load_dotenv
    load_dotenv(dotenv_path)


app = FastAPI()


@app.on_event("startup")
async def startup_event():
    client = AsyncIOMotorClient(os.environ.get("MONGODB_URI"))
    await init_beanie(database=client.invoice, document_models=[Invoice])


@app.post("/api/upload")
async def upload_invoice(file: UploadFile = File(...)) -> dict:
    pdf_file = BytesIO(await file.read())
    xml_filename, xml_string = get_xml_from_pdf(pdf_file, True)
    xml_file = BytesIO(xml_string)

    # just a POC
    pdf_file_base64 = base64.b64encode(pdf_file.getvalue()).decode('utf-8')
    xml_file_base64 = base64.b64encode(xml_file.getvalue()).decode('utf-8')
    invoice = Invoice(file_name=file.filename,
                      pdf_file=pdf_file_base64, xml_file=xml_file_base64)
    await invoice.insert()
    print(invoice.id)
    return {"id": str(invoice.id)}


@app.get("/api/download/{invoice_id}")
async def download_invoice(invoice_id: str):
    invoice = await Invoice.get(invoice_id)
    xml_file = base64.b64decode(invoice.xml_file)
    return StreamingResponse(BytesIO(xml_file), media_type="application/xml", headers={
        'Content-Disposition': f'attachment; filename={invoice.file_name.replace(".pdf", ".xml")}'
    })
