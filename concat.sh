#!/bin/bash

# Create or clear the 'parse' file
> parse.txt

# Loop through all .ts and .tsx files in current and child directories, excluding node_modules
find . -type d -name 'node_modules' -prune -o -type f \( -name "*.ts" -o -name "*.tsx" \) -print0 | while IFS= read -r -d '' file; do
    # Print the title (filename)
    echo "File: $file" >> parse.txt

    # Print the content of the file
    cat "$file" >> parse.txt

    # Print a separator
    echo -e "\n\n" >> parse.txt
done

echo "Concatenation complete. Output in 'parse.txt'."