#!/bin/bash

# Test Runner for Anime Scrapers
RESULT_FILE="test-scraper/test-result.txt"

echo "Starting Scraper Tests..." > "$RESULT_FILE"
echo "" >> "$RESULT_FILE"

for file in test-scraper/*.ts; do
  if [[ "$file" == *"types.ts" || "$file" == *"test.ts" || "$file" == *"test.sh" ]]; then
    continue
  fi
  
  echo "Testing: ${file}"
  echo "Testing: ${file}" >> "$RESULT_FILE"
  
  # Run the scraper with bun
  output=$(bun "$file" 2>&1)
  exit_code=$?
  
  if [ $exit_code -eq 0 ]; then
    echo "SUCCESS: ${file}" >> "$RESULT_FILE"
    echo "$output" >> "$RESULT_FILE"
  else
    echo "FAILED: ${file}" >> "$RESULT_FILE"
    echo "$output" >> "$RESULT_FILE"
  fi
  
  echo "" >> "$RESULT_FILE"
  echo "----------------------------------------" >> "$RESULT_FILE"
  echo "" >> "$RESULT_FILE"
done

echo "All tests completed." >> "$RESULT_FILE"
echo "Results saved to $RESULT_FILE"

# Print the full result to console as requested
cat "$RESULT_FILE"
