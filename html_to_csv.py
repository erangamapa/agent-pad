import csv
from bs4 import BeautifulSoup

# Input and output file paths
html_file = 'rounds.html'
csv_file = 'rounds_data.csv'

# Read the HTML file
with open(html_file, 'r', encoding='utf-8') as file:
    html_content = file.read()

# Parse the HTML
soup = BeautifulSoup(html_content, 'html.parser')

# Find the table
table = soup.find('table')

# Extract headers
headers = []
header_row = table.find('thead').find('tr')
header_cells = header_row.find_all('th')

for cell in header_cells:
    # Try to get the text from the button inside the th
    button = cell.find('button')
    if button:
        headers.append(button.get_text(strip=True).replace('Bonus Return Amount', 'BonusReturnAmount'))
    else:
        # If no button text, use empty string
        headers.append('')

# Remove empty headers
headers = [h for h in headers if h]

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

# Write to CSV
with open(csv_file, 'w', newline='', encoding='utf-8') as file:
    writer = csv.writer(file)
    writer.writerow(headers)
    writer.writerows(rows)

print(f"Data extracted from {html_file}")
print(f"CSV file created: {csv_file}")
print(f"Total rows: {len(rows)}")