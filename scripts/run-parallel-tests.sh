#!/bin/bash

# Script to run visual regression tests in parallel
# Usage: ./scripts/run-parallel-tests.sh <brand> <page_type> <url1> <url2>

# Track start time
START_TIME=$(date +%s)

# Check if enough arguments were provided
if [ "$#" -ne 4 ]; then
    echo "Usage: $0 <brand> <page_type> <url1> <url2>"
    echo "Example: $0 hm homepage https://dev--hm-uat-global--alshaya-axp.aem.page/en/ https://ldhub-92012--hm-uat-global--alshaya-axp.aem.page/en/"
    exit 1
fi

# Parse arguments
BRAND=$1
PAGE_TYPE=$2
URL_1=$3
URL_2=$4

# Create results directory
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RESULTS_DIR="test-results/parallel-regression-${TIMESTAMP}"
mkdir -p $RESULTS_DIR

echo "Starting parallel visual regression tests..."
echo "Brand: $BRAND"
echo "Page Type: $PAGE_TYPE"
echo "URL 1: $URL_1"
echo "URL 2: $URL_2"
echo "Results will be saved in: $RESULTS_DIR"

# Run tests in parallel
npx cypress run --spec cypress/e2e/regression-desktop.cy.js --env Brandcode=$BRAND,PageType=$PAGE_TYPE,URL_1=$URL_1,URL_2=$URL_2 --headless > $RESULTS_DIR/desktop.log 2>&1 &
DESKTOP_PID=$!

npx cypress run --spec cypress/e2e/regression-tablet.cy.js --env Brandcode=$BRAND,PageType=$PAGE_TYPE,URL_1=$URL_1,URL_2=$URL_2 --headless > $RESULTS_DIR/tablet.log 2>&1 &
TABLET_PID=$!

npx cypress run --spec cypress/e2e/regression-mobile.cy.js --env Brandcode=$BRAND,PageType=$PAGE_TYPE,URL_1=$URL_1,URL_2=$URL_2 --headless > $RESULTS_DIR/mobile.log 2>&1 &
MOBILE_PID=$!

echo "Tests running in parallel with PIDs: $DESKTOP_PID (desktop), $TABLET_PID (tablet), $MOBILE_PID (mobile)"
echo "Waiting for all tests to complete..."

# Wait for all tests to complete
wait $DESKTOP_PID $TABLET_PID $MOBILE_PID

echo "All tests completed!"
echo "-------------------------------------------"

# Check exit codes and output summary
DESKTOP_EXIT=$?
TABLET_EXIT=$?
MOBILE_EXIT=$?

echo "Summary:"
echo "Desktop: $([ $DESKTOP_EXIT -eq 0 ] && echo "PASSED" || echo "FAILED")"
echo "Tablet: $([ $TABLET_EXIT -eq 0 ] && echo "PASSED" || echo "FAILED")"
echo "Mobile: $([ $MOBILE_EXIT -eq 0 ] && echo "PASSED" || echo "FAILED")"
echo "-------------------------------------------"
echo "Screenshots saved in: cypress/screenshots"
echo "Logs saved in: $RESULTS_DIR"

# Calculate total time
END_TIME=$(date +%s)
TOTAL_TIME=$((END_TIME - START_TIME))
echo "Total execution time: $TOTAL_TIME seconds"

# Open the screenshot directory
node scripts/view-results.js

exit 0 