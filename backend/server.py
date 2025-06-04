from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, date
import os
import uuid

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017/')
client = MongoClient(MONGO_URL)
db = client.vegetable_procurement

# Collections
hotels_collection = db.hotels
sellers_collection = db.sellers
vegetables_collection = db.vegetables
requirements_collection = db.requirements

# Pydantic models
class Hotel(BaseModel):
    id: str
    name: str
    manager_name: str
    manager_phone: str

class HotelCreate(BaseModel):
    name: str
    manager_name: str
    manager_phone: str

class HotelUpdate(BaseModel):
    name: Optional[str] = None
    manager_name: Optional[str] = None
    manager_phone: Optional[str] = None

class Seller(BaseModel):
    id: str
    name: str
    phone: str

class SellerCreate(BaseModel):
    name: str
    phone: str

class SellerUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None

class VegetableCreate(BaseModel):
    name: str
    unit: str
    seller_id: str

class DailyRequirement(BaseModel):
    id: str
    hotel_id: str
    vegetable_id: str
    quantity: float
    unit: str = "kg"
    date: str
    status: str = "pending"
    created_at: str
    updated_at: str

class RequirementCreate(BaseModel):
    hotel_id: str
    vegetable_id: str
    quantity: float
    unit: str = "kg"
    date: str

class RequirementUpdate(BaseModel):
    quantity: Optional[float] = None
    unit: Optional[str] = None
    status: Optional[str] = None

# Initialize sample data
@app.on_event("startup")
async def initialize_data():
    if hotels_collection.count_documents({}) > 0:
        return
    
    # Create sample hotels
    hotels = []
    for i in range(1, 11):
        hotel = {
            "id": str(uuid.uuid4()),
            "name": f"Hotel {i}",
            "manager_name": f"Manager {i}",
            "manager_phone": f"+1234567{i:03d}"
        }
        hotels.append(hotel)
    hotels_collection.insert_many(hotels)
    
    # Create sample sellers and vegetables
    sellers_data = [
        {"name": "Green Grocers", "vegetables": ["Spinach", "Lettuce", "Cabbage", "Broccoli", "Kale"]},
        {"name": "Fresh Farms", "vegetables": ["Tomatoes", "Onions", "Potatoes", "Carrots", "Garlic"]},
        {"name": "Organic Supply", "vegetables": ["Bell Peppers", "Cucumber", "Eggplant", "Zucchini", "Okra"]},
        {"name": "Herb Masters", "vegetables": ["Mint", "Coriander", "Parsley", "Basil", "Dill"]},
        {"name": "Root Veggies Co", "vegetables": ["Beetroot", "Radish", "Turnip", "Sweet Potato", "Ginger"]}
    ]
    
    sellers = []
    vegetables = []
    for i, seller_data in enumerate(sellers_data):
        seller_id = str(uuid.uuid4())
        seller = {
            "id": seller_id,
            "name": seller_data["name"],
            "phone": f"+9876543{i:03d}"
        }
        sellers.append(seller)
        
        for veg_name in seller_data["vegetables"]:
            vegetable = {
                "id": str(uuid.uuid4()),
                "name": veg_name,
                "unit": "kg",
                "seller_id": seller_id
            }
            vegetables.append(vegetable)
    
    sellers_collection.insert_many(sellers)
    vegetables_collection.insert_many(vegetables)

# Hotel CRUD endpoints
@app.get("/api/hotels")
async def get_hotels():
    hotels = list(hotels_collection.find({}, {"_id": 0}))
    return hotels

@app.post("/api/hotels")
async def create_hotel(hotel: HotelCreate):
    new_hotel = {
        "id": str(uuid.uuid4()),
        "name": hotel.name,
        "manager_name": hotel.manager_name,
        "manager_phone": hotel.manager_phone
    }
    hotels_collection.insert_one(new_hotel)
    del new_hotel["_id"]
    return new_hotel

@app.put("/api/hotels/{hotel_id}")
async def update_hotel(hotel_id: str, hotel_update: HotelUpdate):
    existing = hotels_collection.find_one({"id": hotel_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Hotel not found")
    
    update_data = {}
    if hotel_update.name is not None:
        update_data["name"] = hotel_update.name
    if hotel_update.manager_name is not None:
        update_data["manager_name"] = hotel_update.manager_name
    if hotel_update.manager_phone is not None:
        update_data["manager_phone"] = hotel_update.manager_phone
    
    if update_data:
        hotels_collection.update_one({"id": hotel_id}, {"$set": update_data})
    
    updated = hotels_collection.find_one({"id": hotel_id}, {"_id": 0})
    return updated

@app.delete("/api/hotels/{hotel_id}")
async def delete_hotel(hotel_id: str):
    result = hotels_collection.delete_one({"id": hotel_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Hotel not found")
    requirements_collection.delete_many({"hotel_id": hotel_id})
    return {"message": "Hotel deleted successfully"}

# Seller CRUD endpoints
@app.get("/api/sellers")
async def get_sellers():
    sellers = list(sellers_collection.find({}, {"_id": 0}))
    return sellers

@app.post("/api/sellers")
async def create_seller(seller: SellerCreate):
    new_seller = {
        "id": str(uuid.uuid4()),
        "name": seller.name,
        "phone": seller.phone
    }
    sellers_collection.insert_one(new_seller)
    del new_seller["_id"]
    return new_seller

@app.put("/api/sellers/{seller_id}")
async def update_seller(seller_id: str, seller_update: SellerUpdate):
    existing = sellers_collection.find_one({"id": seller_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Seller not found")
    
    update_data = {}
    if seller_update.name is not None:
        update_data["name"] = seller_update.name
    if seller_update.phone is not None:
        update_data["phone"] = seller_update.phone
    
    if update_data:
        sellers_collection.update_one({"id": seller_id}, {"$set": update_data})
    
    updated = sellers_collection.find_one({"id": seller_id}, {"_id": 0})
    return updated

@app.delete("/api/sellers/{seller_id}")
async def delete_seller(seller_id: str):
    result = sellers_collection.delete_one({"id": seller_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Seller not found")
    vegetables_collection.delete_many({"seller_id": seller_id})
    return {"message": "Seller deleted successfully"}

# Vegetable endpoints
@app.get("/api/vegetables")
async def get_vegetables():
    vegetables = list(vegetables_collection.find({}, {"_id": 0}))
    return vegetables

@app.post("/api/vegetables")
async def create_vegetable(vegetable: VegetableCreate):
    new_vegetable = {
        "id": str(uuid.uuid4()),
        "name": vegetable.name,
        "unit": vegetable.unit,
        "seller_id": vegetable.seller_id
    }
    vegetables_collection.insert_one(new_vegetable)
    del new_vegetable["_id"]
    return new_vegetable

@app.get("/api/vegetables/by-seller/{seller_id}")
async def get_vegetables_by_seller(seller_id: str):
    vegetables = list(vegetables_collection.find({"seller_id": seller_id}, {"_id": 0}))
    return vegetables

# Requirements endpoints
@app.get("/api/requirements")
async def get_requirements(hotel_id: Optional[str] = None, seller_id: Optional[str] = None, date: Optional[str] = None):
    query = {}
    if hotel_id:
        query["hotel_id"] = hotel_id
    if date:
        query["date"] = date
    
    requirements = list(requirements_collection.find(query, {"_id": 0}))
    
    if seller_id:
        seller_vegetables = list(vegetables_collection.find({"seller_id": seller_id}, {"_id": 0}))
        seller_veg_ids = [veg["id"] for veg in seller_vegetables]
        requirements = [req for req in requirements if req["vegetable_id"] in seller_veg_ids]
    
    # Enrich with hotel and vegetable details
    for req in requirements:
        hotel = hotels_collection.find_one({"id": req["hotel_id"]}, {"_id": 0})
        vegetable = vegetables_collection.find_one({"id": req["vegetable_id"]}, {"_id": 0})
        req["hotel_name"] = hotel["name"] if hotel else "Unknown"
        req["vegetable_name"] = vegetable["name"] if vegetable else "Unknown"
        req["unit"] = vegetable["unit"] if vegetable else "kg"
    
    return requirements

@app.post("/api/requirements")
async def create_requirement(requirement: RequirementCreate):
    existing = requirements_collection.find_one({
        "hotel_id": requirement.hotel_id,
        "vegetable_id": requirement.vegetable_id,
        "date": requirement.date
    })
    
    if existing:
        raise HTTPException(status_code=400, detail="Requirement already exists for this date")
    
    new_requirement = {
        "id": str(uuid.uuid4()),
        "hotel_id": requirement.hotel_id,
        "vegetable_id": requirement.vegetable_id,
        "quantity": requirement.quantity,
        "unit": requirement.unit,
        "date": requirement.date,
        "status": "pending",
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    }
    
    requirements_collection.insert_one(new_requirement)
    del new_requirement["_id"]
    return new_requirement

@app.post("/api/requirements/bulk")
async def create_bulk_requirements(requirements_data: List[RequirementCreate]):
    created_requirements = []
    
    for requirement in requirements_data:
        existing = requirements_collection.find_one({
            "hotel_id": requirement.hotel_id,
            "vegetable_id": requirement.vegetable_id,
            "date": requirement.date
        })
        
        if existing:
            requirements_collection.update_one(
                {"id": existing["id"]},
                {"$set": {
                    "quantity": requirement.quantity,
                    "updated_at": datetime.now().isoformat()
                }}
            )
            updated = requirements_collection.find_one({"id": existing["id"]}, {"_id": 0})
            created_requirements.append(updated)
        else:
            new_requirement = {
                "id": str(uuid.uuid4()),
                "hotel_id": requirement.hotel_id,
                "vegetable_id": requirement.vegetable_id,
                "quantity": requirement.quantity,
                "unit": requirement.unit,
                "date": requirement.date,
                "status": "pending",
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat()
            }
            requirements_collection.insert_one(new_requirement)
            del new_requirement["_id"]
            created_requirements.append(new_requirement)
    
    return created_requirements

@app.put("/api/requirements/{requirement_id}")
async def update_requirement(requirement_id: str, update: RequirementUpdate):
    existing = requirements_collection.find_one({"id": requirement_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Requirement not found")
    
    update_data = {}
    if update.quantity is not None:
        update_data["quantity"] = update.quantity
    if update.unit is not None:
        update_data["unit"] = update.unit
    if update.status is not None:
        update_data["status"] = update.status
    
    update_data["updated_at"] = datetime.now().isoformat()
    
    requirements_collection.update_one({"id": requirement_id}, {"$set": update_data})
    
    updated = requirements_collection.find_one({"id": requirement_id}, {"_id": 0})
    return updated

@app.delete("/api/requirements/{requirement_id}")
async def delete_requirement(requirement_id: str):
    result = requirements_collection.delete_one({"id": requirement_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Requirement not found")
    return {"message": "Requirement deleted"}

# Dashboard endpoints
@app.get("/api/dashboard/admin")
async def get_admin_dashboard():
    total_hotels = hotels_collection.count_documents({})
    total_sellers = sellers_collection.count_documents({})
    total_vegetables = vegetables_collection.count_documents({})
    
    today = date.today().isoformat()
    today_requirements = list(requirements_collection.find({"date": today}, {"_id": 0}))
    
    pending_count = requirements_collection.count_documents({"status": "pending"})
    delivered_count = requirements_collection.count_documents({"status": "delivered"})
    
    return {
        "total_hotels": total_hotels,
        "total_sellers": total_sellers,
        "total_vegetables": total_vegetables,
        "today_requirements_count": len(today_requirements),
        "pending_count": pending_count,
        "delivered_count": delivered_count
    }

@app.get("/api/dashboard/admin/matrix")
async def get_admin_matrix_dashboard(date: Optional[str] = None):
    if not date:
        date = datetime.now().date().isoformat()
    
    requirements = list(requirements_collection.find({"date": date}, {"_id": 0}))
    hotels = list(hotels_collection.find({}, {"_id": 0}))
    try:
        hotels.sort(key=lambda x: int(x["name"].replace("Hotel ", "")))
    except (ValueError, IndexError):
        hotels.sort(key=lambda x: x["name"])
    
    all_vegetables = list(vegetables_collection.find({}, {"_id": 0}))
    
    hotel_status = {}
    for hotel in hotels:
        hotel_requirements = [req for req in requirements if req["hotel_id"] == hotel["id"]]
        if hotel_requirements:
            all_delivered = all(req["status"] == "delivered" for req in hotel_requirements)
            hotel_status[hotel["id"]] = "delivered" if all_delivered else "pending"
        else:
            hotel_status[hotel["id"]] = "none"
    
    matrix_data = []
    for veg in all_vegetables:
        vegetable_row = {
            "vegetable_id": veg["id"],
            "vegetable_name": veg["name"],
            "unit": veg["unit"],
            "hotel_quantities": {}
        }
        
        for hotel in hotels:
            req = next((r for r in requirements if r["vegetable_id"] == veg["id"] and r["hotel_id"] == hotel["id"]), None)
            vegetable_row["hotel_quantities"][hotel["id"]] = req["quantity"] if req else 0
        
        if any(vegetable_row["hotel_quantities"].values()):
            matrix_data.append(vegetable_row)
    
    return {
        "date": date,
        "hotels": hotels,
        "hotel_status": hotel_status,
        "matrix_data": matrix_data,
        "total_requirements": len(requirements)
    }

@app.put("/api/hotels/{hotel_id}/mark-delivered")
async def mark_hotel_delivered(hotel_id: str, date: str):
    result = requirements_collection.update_many(
        {
            "hotel_id": hotel_id,
            "date": date,
            "status": "pending"
        },
        {
            "$set": {
                "status": "delivered",
                "updated_at": datetime.now().isoformat()
            }
        }
    )
    
    return {
        "message": f"Marked {result.modified_count} requirements as delivered for hotel",
        "modified_count": result.modified_count
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8001))
    uvicorn.run(app, host="0.0.0.0", port=port)
