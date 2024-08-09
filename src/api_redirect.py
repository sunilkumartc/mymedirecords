from fastapi import FastAPI, HTTPException
import httpx

app = FastAPI()

@app.post("/v3/patient/generate/byAadhaar/{aadhaar_number}")
async def forward_request(aadhaar_number: str):
    url = f"http://192.168.29.165:8082/v3/patient/generate/byAadhaar/{aadhaar_number}"
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url)
            response.raise_for_status()
            return response.json()  # Return the JSON response from the external API
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=e.response.text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
