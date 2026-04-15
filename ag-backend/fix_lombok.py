import os
import re

def process_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the class block
    class_match = re.search(r'public class (\w+)(.*?)\{', content)
    if not class_match:
        return
    
    class_name = class_match.group(1)
    
    # Extract fields
    fields = []
    # match standard fields like `private String nom;` or `private User user;`
    for match in re.finditer(r'private\s+([\w<>]+)\s+(\w+)\s*;', content):
        fields.append((match.group(1), match.group(2)))

    if not fields:
        return
    
    # Generate getters and setters
    methods = []
    for ftype, fname in fields:
        Capitalized = fname[0].upper() + fname[1:]
        methods.append(f"""
    public {ftype} get{Capitalized}() {{
        return {fname};
    }}

    public void set{Capitalized}({ftype} {fname}) {{
        this.{fname} = {fname};
    }}""")

    # Generate No-args and All-args Constructors
    # Generate builder if this is an entity (has @Entity) or DTO
    # Actually, just standard constructors
    args = ", ".join([f"{ft} {fn}" for ft, fn in fields])
    assigns = "\n".join([f"        this.{fn} = {fn};" for ft, fn in fields])
    
    constructors = f"""
    public {class_name}() {{}}

    public {class_name}({args}) {{
{assigns}
    }}
"""

    # For builder, let's create a nested Builder class
    builder = f"""
    public static {class_name}Builder builder() {{
        return new {class_name}Builder();
    }}
    
    public static class {class_name}Builder {{
"""
    for ftype, fname in fields:
        builder += f"        private {ftype} {fname};\n"
        
    for ftype, fname in fields:
        builder += f"""
        public {class_name}Builder {fname}({ftype} {fname}) {{
            this.{fname} = {fname};
            return this;
        }}"""
        
    builder += f"""
        public {class_name} build() {{
            return new {class_name}({", ".join([fn for ft, fn in fields])});
        }}
    }}
"""

    # Services and Controllers need constructors for injection
    # They usually have `private final` fields
    is_service_or_controller = 'Service' in class_name or 'Controller' in class_name or 'Filter' in class_name or 'config' in path.lower()
    
    final_fields = []
    for match in re.finditer(r'private\s+final\s+([\w<>]+)\s+(\w+)\s*;', content):
        final_fields.append((match.group(1), match.group(2)))
        
    if is_service_or_controller and final_fields:
        args_final = ", ".join([f"{ft} {fn}" for ft, fn in final_fields])
        assigns_final = "\n".join([f"        this.{fn} = {fn};" for ft, fn in final_fields])
        inj_constructor = f"""
    public {class_name}({args_final}) {{
{assigns_final}
    }}
"""
        # Insert before last bracket
        content = content[:content.rfind('}')] + inj_constructor + "\n}\n"
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        return

    if is_service_or_controller: return

    # Standard Pojo/Entity/DTO
    all_methods = constructors + builder + "".join(methods)
    
    content = content[:content.rfind('}')] + all_methods + "\n}\n"
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)


for root, dirs, files in os.walk('src/main/java'):
    for file in files:
        if file.endswith('.java'):
            process_file(os.path.join(root, file))
