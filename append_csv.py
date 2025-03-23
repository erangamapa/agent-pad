import csv
from bs4 import BeautifulSoup

# Input and output file paths
html_file = 'rounds2.html'
csv_file = 'rounds_data.csv'

# Read the HTML file
with open(html_file, 'r', encoding='utf-8') as file:
    html_content = file.read()

# Parse the HTML
soup = BeautifulSoup(html_content, 'html.parser')

# Find the table
table = soup.find('table')

# Read the existing CSV headers to ensure we match the order
existing_headers = []
with open(csv_file, 'r', encoding='utf-8') as file:
    reader = csv.reader(file)
    existing_headers = next(reader)  # Get the header row

# Extract rows
rows = []
body = table.find('tbody')
for row in body.find_all('tr'):
    row_data = []
    for cell in row.find_all('td'):
        # Get all text content from the cell
        cell_text = cell.get_text(strip=True)
        row_data.append(cell_text)

    if row_data:  # Only add non-empty rows
        rows.append(row_data)

# Append to CSV
with open(csv_file, 'a', newline='', encoding='utf-8') as file:  # 'a' for append mode
    writer = csv.writer(file)
    writer.writerows(rows)

print(f"Data extracted from {html_file}")
print(f"Data appended to {csv_file}")
print(f"Additional rows: {len(rows)}")