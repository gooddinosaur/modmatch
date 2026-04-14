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
    text_to_search = f"{part_name} {part_desc}".lower()
    year_ranges = re.findall(r'((?:19|20)\d{2})\s*-\s*((?:19|20)\d{2})', text_to_search)

    text_tokens = [w for w in re.sub(r'[^a-z0-9]', ' ', text_to_search).split() if w]
    text_words = set(text_tokens)

    for v in user_vehicles:
        make = (v.make or "").lower()
        model = (v.model or "").lower()
        clean_model = model.replace(make, "").strip() if make else model
        if not clean_model:
            clean_model = model
        user_year = None
        if v.year and str(v.year).isdigit():
            user_year = int(v.year)
            
        implicit_year_match = False
        if user_year:
            for start_yr, end_yr in year_ranges:
                if int(start_yr) <= user_year <= int(end_yr):
                    implicit_year_match = True
                    break
        model_words = [w for w in re.sub(r'[^a-z0-9]', ' ', clean_model).split() if w]

        if not model_words:
            continue

        base_model = model_words[0]
        sub_models = model_words[1:]
        if base_model in text_words:
            conflict = False

            if sub_models:
                if any(sm in text_words for sm in sub_models):
                    fitted_vehicles.append(f"{v.year} {v.make} {v.model}".strip())
                    continue
                for i, token in enumerate(text_tokens):
                    if token == base_model and i + 1 < len(text_tokens):
                        next_word = text_tokens[i+1]
                        skip_words = {'in', 'on', 'to', 'or', 'of', 'by', 'for', 'is', 'at', 'it', 'up', 'as'}
                        if len(next_word) == 2 and next_word.isalpha() and next_word not in skip_words:
                            if next_word not in sub_models:
                                conflict = True
                                break
                        if next_word.isdigit() and len(next_word) == 4 and (next_word.startswith('19') or next_word.startswith('20')):
                            if user_year and str(user_year) not in text_words and not implicit_year_match:
                                conflict = True
                                break

            if not conflict:
                fitted_vehicles.append(f"{v.year} {v.make} {v.model}".strip())
    unique_matches = []
    for f in fitted_vehicles:
        if f not in unique_matches:
            unique_matches.append(f)

    return unique_matches
