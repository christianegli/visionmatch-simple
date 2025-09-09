#!/usr/bin/env python3
import re

def check_parentheses():
    with open('quiz.html', 'r') as f:
        lines = f.readlines()
    
    in_script = False
    paren_stack = []
    errors = []
    
    for i, line in enumerate(lines):
        if '<script>' in line:
            in_script = True
            continue
        elif '</script>' in line:
            break
        
        if not in_script:
            continue
        
        # Skip pure comment lines
        if line.strip().startswith('//'):
            continue
        
        # Clean the line - remove strings and comments
        clean_line = line
        
        # Remove string literals (basic approach)
        clean_line = re.sub(r'"[^"]*"', '""', clean_line)
        clean_line = re.sub(r"'[^']*'", "''", clean_line)
        clean_line = re.sub(r'`[^`]*`', '``', clean_line)
        
        # Remove comments
        if '//' in clean_line:
            clean_line = clean_line[:clean_line.find('//')]
        
        # Count parentheses
        for j, char in enumerate(clean_line):
            if char == '(':
                paren_stack.append({
                    'line': i+1,
                    'col': j,
                    'text': line.strip()
                })
            elif char == ')':
                if not paren_stack:
                    errors.append({
                        'line': i+1,
                        'type': 'unexpected_close',
                        'text': line.strip()
                    })
                else:
                    paren_stack.pop()
    
    # Report errors
    print("=== SYNTAX CHECK RESULTS ===\n")
    
    if errors:
        print(f"Found {len(errors)} errors:\n")
        for err in errors:
            if 4650 <= err['line'] <= 4660:
                print(f">>> LINE {err['line']}: Unexpected closing parenthesis (NEAR ERROR!)")
            else:
                print(f"Line {err['line']}: Unexpected closing parenthesis")
            print(f"  {err['text'][:100]}...")
            print()
    
    if paren_stack:
        print(f"\n{len(paren_stack)} unclosed parentheses:")
        for item in paren_stack[-10:]:
            print(f"Line {item['line']}: {item['text'][:80]}...")
    
    if not errors and not paren_stack:
        print("No parenthesis errors found!")
    
    # Focus on the error area
    print("\n=== CHECKING LINES 4650-4660 ===")
    for i in range(4649, min(4660, len(lines))):
        if i < len(lines):
            print(f"{i+1}: {lines[i].rstrip()}")

if __name__ == "__main__":
    check_parentheses()