
import re
import json
import requests # 导入 requests 库

def parse_awesome_list(markdown_content):
    data = []
    lines = markdown_content.split('
')
    
    # State variables for parsing
    in_contents_section = False
    current_main_category_title = None
    current_main_category_obj = None
    
    # Regular expressions for parsing
    main_header_re = re.compile(r'^##\s+(.+)')
    list_item_re = re.compile(r'^-+\s+\[([^\]]+)\]\(([^)]+)\)(?:\s+-\s+(.*))?')
    nested_list_item_re = re.compile(r'^\s{4,}-\s+\[([^\]]+)\]\(([^)]+)\)(?:\s+-\s+(.*))?')

    for line in lines:
        line = line.strip()

        if line == '## Contents':
            in_contents_section = True
            continue
        
        if in_contents_section:
            if line.startswith('## '): # End of Contents section
                in_contents_section = False
                current_main_category_title = None
                current_main_category_obj = None
                # Now we are in a main category section, process it below
            else:
                # Only parse top-level items in the Contents section for structure, but not content details
                # The content details will be picked up from the actual sections
                continue

        # Parse main categories and their sub-items
        main_header_match = main_header_re.match(line)
        if main_header_match:
            current_main_category_title = main_header_match.group(1).strip()
            # If this is a main category, we should create a new entry for it
            # We'll fill its details later when we encounter its actual list items
            current_main_category_obj = {
                "title": current_main_category_title,
                "link": f"#{current_main_category_title.lower().replace(' ', '-')}", # Placeholder link
                "description": "", # Placeholder, will be empty for main categories
                "sub_categories": []
            }
            data.append(current_main_category_obj)
            continue

        if current_main_category_obj:
            list_item_match = list_item_re.match(line)
            nested_list_item_match = nested_list_item_re.match(line)

            if nested_list_item_match:
                # Handle nested items (sub-sub categories)
                title = nested_list_item_match.group(1).strip()
                link = nested_list_item_match.group(2).strip()
                description = nested_list_item_match.group(3).strip() if nested_list_item_match.group(3) else ""
                
                # Add to the last sub_category of the current_main_category_obj
                if current_main_category_obj['sub_categories']:
                    last_sub_category = current_main_category_obj['sub_categories'][-1]
                    if 'sub_categories' not in last_sub_category:
                        last_sub_category['sub_categories'] = []
                    last_sub_category['sub_categories'].append({
                        "title": title,
                        "link": link,
                        "description": description
                    })
            elif list_item_match:
                title = list_item_match.group(1).strip()
                link = list_item_match.group(2).strip()
                description = list_item_match.group(3).strip() if list_item_match.group(3) else ""
                
                # Update the main category's link and add this as a sub_category
                # If the main category itself has a link and description, that will be the first item
                # For this specific readme, the main categories are just headers, and the first item is the actual content for that category.
                # Let's adjust the logic: the first item under a main header should populate the link/description of the main category itself.
                # Subsequent items are sub-categories. This is an edge case in this specific file.
                
                # Check if the current main category's sub_categories is empty or if it's a new main link for the current main category (unlikely for this specific file, usually first entry defines main)
                # For awesome lists, the main header doesn't have a link/description itself, but the first item under it *is* the main entry for that category.
                # So we should always add them as sub_categories.
                
                # Find the existing main category object by title and add the sub_category to it.
                # The assumption here is that the main categories are already populated in `data` when `## Contents` was processed,
                # or when the `## Category` line was encountered.
                found_main_category = False
                for mc in data:
                    if mc["title"] == current_main_category_title:
                        mc["sub_categories"].append({
                            "title": title,
                            "link": link,
                            "description": description
                        })
                        found_main_category = True
                        break
                if not found_main_category and current_main_category_obj:
                    # This case handles if the main category was just created by `main_header_re`
                    # and now its first item is being added.
                    current_main_category_obj["sub_categories"].append({
                        "title": title,
                        "link": link,
                        "description": description
                    })

    # After parsing, remove the placeholder link for top-level categories if they don't have a specific link defined in the `Contents` section.
    # In this specific file, links in `Contents` are just anchor links to their sections.
    # We should refine the links for the top-level categories later if necessary.
    # For now, we will use the anchor link from the Contents section if available, otherwise fallback to generated.

    # A final pass to clean up and ensure correct hierarchy and details.
    # The current parsing logic for `current_main_category_obj` is correct for building the structure.
    # Let's verify the main category links. The links in the 'Contents' section are relative,
    # but the links within each category section are absolute GitHub links.
    
    # We need to correctly associate the top-level category objects in `data` with their actual content.
    # My current logic for `main_header_match` and `current_main_category_obj` appends the main category object correctly.
    # The `sub_categories` for each main category will be populated by `list_item_match` and `nested_list_item_match`.
    
    # One issue: The initial `data.append(current_main_category_obj)` inside `main_header_match` might create duplicate main category entries if
    # the main categories are also listed in the `Contents` section and processed.
    # Let's modify the flow:
    # 1. First pass: Collect all main category titles from the "Contents" section to establish the order.
    # 2. Second pass: Iterate through the entire document to populate the details for each category and sub-category.

    # Let's restart the parsing strategy to correctly handle the structure.
    # Strategy:
    # 1. Extract all main category names and their anchor links from the "Contents" section first.
    # 2. Then, for each main category, find its actual section in the document (marked by ##)
    # 3. Parse the list items under that section, handling nested items.

    category_structure = []
    temp_category_map = {} # To easily find main categories by title

    # Pass 1: Extract main category names and their anchor links from "Contents"
    in_contents_section = False
    for line in lines:
        line = line.strip()
        if line == '## Contents':
            in_contents_section = True
            continue
        if in_contents_section:
            if line.startswith('- ['):
                match = re.match(r'^-+\s+\[([^\]]+)\]\(([^)]+)\)', line)
                if match:
                    title = match.group(1).strip()
                    link = match.group(2).strip()
                    category_info = {
                        "title": title,
                        "link": link,
                        "description": "", # Descriptions are usually not in the Contents section
                        "sub_categories": []
                    }
                    category_structure.append(category_info)
                    temp_category_map[title] = category_info
            elif line.startswith('## '): # End of Contents section
                in_contents_section = False
    
    # Pass 2: Populate sub-categories and descriptions from the actual sections
    current_category = None
    for line in lines:
        line = line.strip()
        
        main_header_match = re.match(r'^##\s+(.+)', line)
        if main_header_match:
            header_title = main_header_match.group(1).strip()
            if header_title in temp_category_map:
                current_category = temp_category_map[header_title]
            else:
                current_category = None # Not a recognized main category from Contents, ignore
            continue

        if current_category:
            list_item_match = re.match(r'^-+\s+\[([^\]]+)\]\(([^)]+)\)(?:\s+-\s+(.*))?', line)
            nested_list_item_match = re.match(r'^\s{4,}-\s+\[([^\]]+)\]\(([^)]+)\)(?:\s+-\s+(.*))?', line)

            if nested_list_item_match:
                title = nested_list_item_match.group(1).strip()
                link = nested_list_item_match.group(2).strip()
                description = nested_list_item_match.group(3).strip() if nested_list_item_match.group(3) else ""
                
                # Add to the last sub_category of the current_category
                if current_category['sub_categories']:
                    last_sub_category = current_category['sub_categories'][-1]
                    if 'sub_categories' not in last_sub_category:
                        last_sub_category['sub_categories'] = []
                    last_sub_category['sub_categories'].append({
                        "title": title,
                        "link": link,
                        "description": description
                    })
            elif list_item_match:
                title = list_item_match.group(1).strip()
                link = list_item_match.group(2).strip()
                description = list_item_match.group(3).strip() if list_item_match.group(3) else ""
                
                current_category['sub_categories'].append({
                    "title": title,
                    "link": link,
                    "description": description
                })
    
    # The initial `category_structure` already has the correct top-level categories and their order.
    # `temp_category_map` modified these objects by reference, so `category_structure` is already updated.

    return category_structure

if __name__ == "__main__":
    url = "https://raw.githubusercontent.com/sindresorhus/awesome/main/readme.md"
    try:
        response = requests.get(url)
        response.raise_for_status() # Raise an HTTPError for bad responses (4xx or 5xx)
        content = response.text
    except requests.exceptions.RequestException as e:
        print(f"Error fetching the remote readme.md: {e}")
        exit(1) # Exit if we can't fetch the content
    
    parsed_data = parse_awesome_list(content)
    
    with open("awesome_contents.json", "w", encoding="utf-8") as f:
        json.dump(parsed_data, f, indent=2, ensure_ascii=False)

    print("Parsed data saved to awesome_contents.json")
