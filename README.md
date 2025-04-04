# Barcode Printer

A professional React application for generating and printing barcodes from CSV or Excel files.

## Features

- Upload CSV or Excel files containing product data
- Select specific columns for barcode values and optional labels
- Generate barcodes from selected data
- Select individual barcodes or all at once
- Print selected barcodes
- Download barcodes as an image
- Clean, professional UI built with Material UI

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository
```
git clone https://github.com/yourusername/barcode-printer.git
cd barcode-printer
```

2. Install dependencies
```
npm install
```

3. Start the development server
```
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

1. On the home page, click "Start Generating Barcodes" or use the navigation menu to go to the Generator page
2. Upload a CSV or Excel file containing your product data
3. Select the column that contains your barcode values
4. Optionally select a column for labels to display below each barcode
5. Click "Generate Barcodes" to create the barcodes
6. Use the checkboxes to select which barcodes to print
7. Click "Print Selected" to print the selected barcodes
8. Alternatively, click "Download as Image" to save the barcodes as a PNG file

## Building for Production

To build the application for production:

```
npm run build
```

The built files will be in the `dist` directory, ready to be deployed to a web server.

## Technologies Used

- React
- TypeScript
- Vite
- Material UI
- xlsx (for parsing Excel/CSV files)
- jsbarcode (for barcode generation)
- html2canvas (for image export)
- file-saver (for downloading images)

## License

This project is licensed under the MIT License.
