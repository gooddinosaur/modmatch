import re

def check_basic_fitment(part_name: str, part_desc: str, user_vehicles: list):
    """
    Smarter heuristic fitment engine.
    Checks if a user's vehicle makes/models match the part's name or description using words.
    """
    fitted_vehicles = []
    if not part_name:
        part_name = ""
    if not part_desc:
        part_desc = ""

    # Normalize text: lower case and alphanumeric words only
    text_to_search = f"{part_name} {part_desc}".lower()
    text_tokens = [w for w in re.sub(r'[^a-z0-9]', ' ', text_to_search).split() if w]
    text_words = set(text_tokens)

    for v in user_vehicles:
        # Exclude make from model string if user typed "Honda Honda Civic"
        make = (v.make or "").lower()
        model = (v.model or "").lower()
        clean_model = model.replace(make, "").strip() if make else model
        if not clean_model:
            clean_model = model

        # Preserve order for base vs sub model logic
        model_words = [w for w in re.sub(r'[^a-z0-9]', ' ', clean_model).split() if w]

        if not model_words:
            continue

        base_model = model_words[0]
        sub_models = model_words[1:]

        # Must have at least the base model in the text
        if base_model in text_words:
            conflict = False
            
            if sub_models:
                # If any of the user's exact sub-models is in the text, it's a guaranteed match.
                if any(sm in text_words for sm in sub_models):
                    fitted_vehicles.append(f"{v.year} {v.make} {v.model}".strip())
                    continue
                
                # If none explicitly matched, check for conflicts (e.g. text says "fd" but user has "fc")
                # We identify a chassis code conflict if the word right after the base model is a 2-3 char letter word
                # that doesn't match our sub-models.
                for i, token in enumerate(text_tokens):
                    if token == base_model and i + 1 < len(text_tokens):
                        next_word = text_tokens[i+1]
                        
                        # Handle basic skip words
                        skip_words = {'in', 'on', 'to', 'or', 'of', 'by', 'for', 'is', 'at', 'it', 'up', 'as'}
                        
                        # 2-3 char words are generally chassis (fd, fc, fb, ek, e36).
                        # Let's consider 2 letter words immediately following the base model.
                        if len(next_word) == 2 and next_word.isalpha() and next_word not in skip_words:
                            if next_word not in sub_models:
                                conflict = True
                                break
                                
                        # If the next word is a specific year (e.g. 2008) and it doesn't match the user's vehicle year
                        # And the user's year is not mentioned anywhere else in the text
                        if next_word.isdigit() and len(next_word) == 4 and (next_word.startswith('19') or next_word.startswith('20')):
                            if v.year and str(v.year) not in text_words:
                                conflict = True
                                break
            
            if not conflict:
                fitted_vehicles.append(f"{v.year} {v.make} {v.model}".strip())

    # Return unique matches
    unique_matches = []
    for f in fitted_vehicles:
        if f not in unique_matches:
            unique_matches.append(f)
            
    return unique_matches

