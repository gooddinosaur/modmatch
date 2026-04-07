from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .db.session import engine, Base
from .api import admin_routes, buyer_routes, seller_routes

# Initialize DB Models
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ModMatch API",
    description="High-Performance Car Parts Marketplace APIs",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Should be restricted in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(buyer_routes.router, prefix="/api/v1/buyer", tags=["Buyer"])
app.include_router(seller_routes.router, prefix="/api/v1/seller", tags=["Seller"])
app.include_router(admin_routes.router, prefix="/api/v1/admin", tags=["Admin"])

@app.get("/")
def read_root():
    return {"message": "Welcome to ModMatch API"}
