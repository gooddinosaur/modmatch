import re

def check_basic_fitment(part_name: str, part_desc: str, user_vehicles: list):
    """
    Very simple heuristic fitment engine.
    Checks if a user's vehicle makes/models optionally match the part's name or description.
    """
    fitted_vehicles = []
    if not part_name:
        part_name = ""
    if not part_desc:
        part_desc = ""
        
    text_to_search = f"{part_name} {part_desc}".lower()
    
    for v in user_vehicles:
        make = v.make.lower() if v.make else ""
        model = v.model.lower() if v.model else ""
        
        # Exact match or substring (like "civic fd" containing "civic")
        # In a real engine, this would query a proper catalog DB.
        if make and make in text_to_search:
            fitted_vehicles.append(f"{v.year} {v.make} {v.model}")
        elif model and model in text_to_search:
            fitted_vehicles.append(f"{v.year} {v.make} {v.model}")
            
    return list(set(fitted_vehicles))
