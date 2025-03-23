from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import pandas as pd
import time
import csv

# URL to scrape
url = "https://stg.hawkeye.chaostheory.app/players/052dfa6f-19c5-4b30-928f-ea24a4455b14?tab=casino&sub-tab=by_rounds"

# Configure Chrome options
chrome_options = Options()
chrome_options.add_argument("--headless")  # Run in headless mode (no browser UI)
chrome_options.add_argument("--disable-gpu")
chrome_options.add_argument("--window-size=1920,1080")

# Initialize the Chrome driver
driver = webdriver.Chrome(options=chrome_options)

try:
    # Navigate to the URL
    print(f"Navigating to {url}")
    driver.get(url)

    # Wait for the page to load completely (adjust time as needed)
    time.sleep(5)

    # Wait for the table to be visible
    print("Waiting for table to load...")
    wait = WebDriverWait(driver, 20)
    table = wait.until(EC.presence_of_element_located((By.TAG_NAME, "table")))

    # Extract table headers
    headers = []
    header_cells = table.find_elements(By.TAG_NAME, "th")
    for cell in header_cells:
        headers.append(cell.text)

    print(f"Found headers: {headers}")

    # Extract table rows
    rows = []
    row_elements = table.find_elements(By.TAG_NAME, "tr")[1:]  # Skip header row

    for row_element in row_elements:
        row_data = []
        cell_elements = row_element.find_elements(By.TAG_NAME, "td")
        for cell in cell_elements:
            row_data.append(cell.text)
        rows.append(row_data)

    print(f"Found {len(rows)} rows of data")

    # Save to CSV
    output_file = "table_data.csv"
    with open(output_file, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        writer.writerows(rows)

    print(f"Data successfully saved to {output_file}")

    # Alternative using pandas
    # df = pd.DataFrame(rows, columns=headers)
    # df.to_csv("table_data.csv", index=False)

except Exception as e:
    print(f"An error occurred: {e}")

finally:
    # Close the browser
    driver.quit()
    print("Browser closed")