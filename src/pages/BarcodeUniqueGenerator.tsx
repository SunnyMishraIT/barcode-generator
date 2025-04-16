import { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Alert, 
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Divider,
  Card,
  CardActions,
  Checkbox,
  FormControlLabel,
  Tooltip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  Stack,
  FormHelperText,
  SelectChangeEvent,
  Dialog,
  DialogContent,
  DialogActions,
  Backdrop,
  Snackbar,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PrintIcon from '@mui/icons-material/Print';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import PrintAllIcon from '@mui/icons-material/LocalPrintshop';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/GetApp';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import * as XLSX from 'xlsx';
import JsBarcode from 'jsbarcode';
import html2canvas from 'html2canvas';
import axios from 'axios';

interface BarcodeData {
  id: string;
  value: string; // This will be the FNS
  identifier: string; // This will be the unique numeric identifier
  selected: boolean;
  label?: string;
}

const BarcodeUniqueGenerator = () => {
  // const baseUrl = 'https://flipkartstagingapi.viralfission.com/';
  const baseUrl = 'https://fkprodapi.viralfission.com/';
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [barcodeData, setBarcodeData] = useState<BarcodeData[]>([]);
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [labelColumn, setLabelColumn] = useState<string>('');
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState<boolean>(true);
  const [displayMode, setDisplayMode] = useState<'grid' | 'table'>('table');
  const [printDialogOpen, setPrintDialogOpen] = useState<boolean>(false);
  const [currentPrintBarcode, setCurrentPrintBarcode] = useState<BarcodeData | null>(null);
  const barcodeContainerRef = useRef<HTMLDivElement>(null);
  const printFrameRef = useRef<HTMLIFrameElement>(null);
  const [counterValue, setCounterValue] = useState<number>(0);

  const fetchLastCounter = async () => {
    try {
      const response = await axios.get(`${baseUrl}api/flipkart/custom/wid/get-sequence`);
      console.log('Response:', response.data); 
      if(response.data.success){
        console.log('Setting counter value:', response.data.data);
        setCounterValue(response.data.data);
        return response.data.data;
      }
      return counterValue; // Return current value if API doesn't return success
    } catch (error) {
      console.error('Error fetching counter:', error);
      return counterValue; // Return current value in case of error
    }
  };

  useEffect(() => {
    fetchLastCounter();
  }, []);

  // Apply barcodes whenever barcode data changes
  useEffect(() => {
    setTimeout(() => {
      if (barcodeData.length > 0) {
        barcodeData.forEach((data) => {
          try {
            const selector = `#barcode-${data.id}`;
            const elements = document.querySelectorAll(selector);
            if (elements && elements.length > 0) {
              elements.forEach(element => {
                // If there's a label, use it for the barcode, otherwise use the identifier
                if (data.label) {
                  JsBarcode(element, data.identifier, {
                    format: "CODE128",
                    displayValue: false,
                    fontSize: 10,
                    margin: 5,
                    width: 1,
                    height: 40,
                    textMargin: 0,
                    textPosition: "bottom",
                    lineColor: "#000",
                  });
                }
              });
            }
          } catch (error) {
            console.error(`Failed to generate barcode for ${data.value}:`, error);
          }
        });
      }
    }, 100);
  }, [barcodeData, displayMode]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const uploadedFile = files[0];
    setFile(uploadedFile);
    setError(null);
    setIsLoading(true);
    
    try {
      // Fetch the latest counter value when a new file is uploaded
      await fetchLastCounter();
      
      // Process the file
      const jsonData = await new Promise<Record<string, unknown>[]>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = e.target?.result;
            const workbook = XLSX.read(data, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const parsedData = XLSX.utils.sheet_to_json(worksheet);
            
            if (parsedData.length === 0) {
              reject(new Error('Uploaded file contains no data'));
              return;
            }
            
            resolve(parsedData as Record<string, unknown>[]);
          } catch (error) {
            reject(error);
          }
        };

        reader.onerror = () => {
          reject(new Error('Error reading the file'));
        };

        reader.readAsBinaryString(uploadedFile);
      });

      // Extract column names from the first object in the array
      const firstItem = jsonData[0];
      const columns = Object.keys(firstItem);
      setAvailableColumns(columns);
      
      // Reset selected column if it's not in the new columns
      if (!columns.includes(selectedColumn)) {
        setSelectedColumn('');
      }
    } catch (error) {
      console.error('File processing error:', error);
      setError((error as Error).message || 'Failed to process the file. Please ensure it is a valid Excel or CSV file.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateBarcodes = async () => {
    if (!file || !selectedColumn) {
      setError('Please select a file and a column for barcode values');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Fetch the latest counter value before generating barcodes
      await fetchLastCounter();

      // Use a promise for file reading
      const jsonData = await new Promise<Record<string, unknown>[]>((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
          try {
            const data = e.target?.result;
            const workbook = XLSX.read(data, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const parsedData = XLSX.utils.sheet_to_json(worksheet);
            
            if (parsedData.length === 0) {
              reject(new Error('No data found in the selected file'));
              return;
            }
            
            resolve(parsedData as Record<string, unknown>[]);
          } catch (error) {
            reject(error);
          }
        };

        reader.onerror = () => {
          reject(new Error('Error reading the file'));
        };

        reader.readAsBinaryString(file);
      });

      // Track used identifiers to ensure uniqueness
      const usedIdentifiers = new Set<string>();
      let currentCounter = counterValue; // Start with the latest counter value
      
      const barcodes: BarcodeData[] = jsonData.map((row, index) => {
        const value = row[selectedColumn]?.toString() || '';
        const label = labelColumn ? row[labelColumn]?.toString() || '' : '';
        
        // Generate base identifier - increment counter for each item
        currentCounter += 1;
        const identifier = String(currentCounter).padStart(6, '0');
        
        // Only add to used identifiers if it's a valid value
        if (value !== '') {
          usedIdentifiers.add(identifier);
        }
        
        return {
          id: `${index}-${value}`,
          value,
          label,
          selected: true,
          identifier
        };
      }).filter(item => item.value !== '');

      if (barcodes.length === 0) {
        throw new Error('No valid barcode values found in the selected column');
      }

      // Update the counter value after generating all barcodes
      setCounterValue(currentCounter);
      setBarcodeData(barcodes);
      
      // Send data to server to ensure counter is updated
      // await sendDataToApi(barcodes);
    } catch (error) {
      console.error('Barcode generation error:', error);
      setError((error as Error).message || 'Failed to generate barcodes');
    } finally {
      setIsLoading(false);
    }
  };

  const createPrintContent = (barcodesToPrint: BarcodeData[]) => {
    // Filter barcodes to only include those with labels
    const printableBarcodes = barcodesToPrint.filter(barcode => barcode.label);
    
    if (printableBarcodes.length === 0) {
      setError('No barcodes with labels found for printing');
      return '';
    }
    
    // Create a new document with just the barcodes to print
    let printContent = `
      <html>
        <head>
          <title>Barcodes</title>
          <style>
            @media print {
              @page {
                size: auto;
                margin: 10mm;
              }
              body {
                margin: 0;
                padding: 20px;
                font-family: Arial, sans-serif;
              }
              .barcode-container {
                display: flex;
                flex-wrap: wrap;
                gap: 20px;
                justify-content: center;
              }
              .barcode-item {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 15px;
                border: 1px solid #eee;
                border-radius: 8px;
                margin-bottom: 20px;
                page-break-inside: avoid;
              }
              .barcode-label {
                margin-bottom: 3px;
                font-size: 12px;
                text-align: center;
                font-weight: 600;
              }
              .barcode-identifier {
                margin-top: 3px;
                font-size: 10px;
                text-align: center;
                font-weight: 500;
              }
              .barcode-fns {
                margin-top: 2px;
                font-size: 8px;
                text-align: center;
                font-weight: 600;
              }
            }
          </style>
        </head>
        <body>
          <div class="barcode-container">
    `;

    printableBarcodes.forEach(barcode => {
      printContent += `
        <div class="barcode-item">
          <div class="barcode-label">${barcode.label}</div>
          <svg id="print-barcode-${barcode.id}" class="barcode-svg"></svg>
          <div class="barcode-identifier">${barcode.identifier}</div>
          <div class="barcode-fns">${barcode.value}</div>
        </div>
      `;
    });

    printContent += `
          </div>
          <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
          <script>
            document.addEventListener('DOMContentLoaded', function() {
              ${printableBarcodes.map(barcode => `
                JsBarcode("#print-barcode-${barcode.id}", "${barcode.identifier}", {
                  format: "CODE128",
                  displayValue: false,
                  fontSize: 10,
                  margin: 5,
                  background: '#fff',
                  width: 1,
                  height: 40,
                  textMargin: 0,
                  textPosition: "bottom",
                  lineColor: "#000",
                });
              `).join('')}
              setTimeout(function() { window.print(); window.close(); }, 500);
            });
          </script>
        </body>
      </html>
    `;

    return printContent;
  };

  const handlePrintSelected = () => {
    const selectedBarcodes = barcodeData.filter(barcode => barcode.selected);
    
    if (selectedBarcodes.length === 0) {
      setError('No barcodes selected for printing');
      return;
    }
    
    // Filter for barcodes with labels
    const printableBarcodes = selectedBarcodes.filter(barcode => barcode.label);
    
    if (printableBarcodes.length === 0) {
      setError('None of the selected barcodes have labels for printing');
      return;
    }
    
    // Create a new window with just the barcodes to print
    const printContent = createPrintContent(selectedBarcodes);
    // sendDataToApi();
    if (!printContent) return; // If empty, createPrintContent already set an error
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(printContent);
      printWindow.document.close();
    } else {
      setError('Could not open print window. Please check your popup blocker settings.');
    }
  };

  const sendDataToApi = async (customData = null) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    const dataToSend = customData || barcodeData;
    const payload = {
      "data": dataToSend.map(item => ({
        "fsn": item.value,
        "uid": Number(item.identifier),
        "cid": item.label
      }))
    }
    try {
      const response = await axios.post(`${baseUrl}api/flipkart/custom/wid/create`, payload);
      console.log('Response:', response);
      if(response.data.success){
        await fetchLastCounter();
        setSuccess("Data Saved Successfully");
      } else {
        setError(response.data.description || "Failed to save data to server");
      }
      return response;
    } catch (error) {
      console.error('Error sending data to API:', error);
      setError('Failed to send data to API');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrintSingle = (barcode: BarcodeData) => {
    
    // Only allow printing if the barcode has a label
    if (!barcode.label) {
      setError('This item has no label to print as a barcode');
      return;
    }
    
    setCurrentPrintBarcode(barcode);
    setPrintDialogOpen(true);
  };

  const handleClosePrintDialog = () => {
    setPrintDialogOpen(false);
    setCurrentPrintBarcode(null);
  };

  const handlePrintSingleConfirm = () => {
    if (currentPrintBarcode) {
      // sendDataToApi();
      const printContent = createPrintContent([currentPrintBarcode]);
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(printContent);
        printWindow.document.close();
      } else {
        setError('Could not open print window. Please check your popup blocker settings.');
      }
    }
    setPrintDialogOpen(false);
  };

  const handleToggleSelect = (id: string) => {
    setBarcodeData(prevData => 
      prevData.map(item => 
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const handleToggleSelectAll = () => {
    setSelectAll(!selectAll);
    setBarcodeData(prevData => 
      prevData.map(item => ({ ...item, selected: !selectAll }))
    );
  };

  const handleExportCsv = () => {
    if (barcodeData.length === 0) return;
    
    try {
      setIsLoading(true);
      
      // Create a new worksheet
      const ws = XLSX.utils.json_to_sheet(
        barcodeData.map(item => ({
          Identifier: item.identifier,
          FNS: item.value,
          ...(item.label ? { Label: item.label } : {})
        }))
      );
      
      // Create a workbook and add the worksheet
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Barcodes");
      
      // Generate the file and trigger download
      XLSX.writeFile(wb, "barcodes-with-identifiers.xlsx");
      
      setIsLoading(false);
    } catch (error) {
      console.error('CSV export error:', error);
      setError('Failed to export data as CSV');
      setIsLoading(false);
    }
  };

  const handleDownloadAllAsPDF = async () => {
    if (!barcodeContainerRef.current || barcodeData.length === 0) return;
    
    try {
      setIsLoading(true);
      const canvas = await html2canvas(barcodeContainerRef.current);
      const imgData = canvas.toDataURL('image/png');
      
      // Create a link element to download the image
      const link = document.createElement('a');
      link.href = imgData;
      link.download = 'barcodes.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Download error:', error);
      setError('Failed to download barcodes');
      setIsLoading(false);
    }
  };

  const handleClearAll = () => {
    setBarcodeData([]);
    setFile(null);
    setSelectedColumn('');
    setLabelColumn('');
    setError(null);
    
    // Reset the file input to allow selecting the same file again
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const toggleDisplayMode = () => {
    setDisplayMode(prev => prev === 'grid' ? 'table' : 'grid');
  };

  const handleColumnChange = (event: SelectChangeEvent<string>) => {
    setSelectedColumn(event.target.value);
  };

  const handleLabelColumnChange = (event: SelectChangeEvent<string>) => {
    setLabelColumn(event.target.value);
  };

  // Fix the barcode rendering in the dialog
  useEffect(() => {
    // Special handling for dialog barcode
    if (printDialogOpen && currentPrintBarcode && currentPrintBarcode.label) {
      setTimeout(() => {
        const dialogBarcodeSelector = `#dialog-barcode-${currentPrintBarcode.id}`;
        const dialogBarcodeElement = document.querySelector(dialogBarcodeSelector);
        if (dialogBarcodeElement) {
          JsBarcode(dialogBarcodeSelector, currentPrintBarcode.identifier, {
            format: "CODE128",
            displayValue: false,
            fontSize: 10,
            margin: 5,
            width: 1,
            height: 40,
            textMargin: 0,
            textPosition: "bottom",
            lineColor: "#000",
          });
        }
      }, 100);
    }
  }, [printDialogOpen, currentPrintBarcode]);

  // Function to handle closing success/error messages
  const handleCloseMessages = () => {
    setSuccess(null);
    setError(null);
  };

  return (
    <Box>
      {/* Full Page Loader */}
      <Backdrop
        sx={{ 
          color: '#fff', 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          flexDirection: 'column',
          gap: 2
        }}
        open={isLoading}
      >
        <CircularProgress color="inherit" size={60} />
        <Typography variant="h6" component="div">
          Processing...
        </Typography>
      </Backdrop>

      {/* Success message snackbar */}
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={handleCloseMessages}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseMessages} 
          severity="success" 
          sx={{ width: '100%', alignItems: 'center' }}
          icon={<CheckCircleOutlineIcon fontSize="large" />}
        >
          <Typography variant="subtitle1">{success}</Typography>
        </Alert>
      </Snackbar>

      {/* Error message snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseMessages}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseMessages} 
          severity="error"
          sx={{ width: '100%', alignItems: 'center' }}
          icon={<ErrorOutlineIcon fontSize="large" />}
        >
          <Typography variant="subtitle1">{error}</Typography>
        </Alert>
      </Snackbar>

      <Typography variant="h4" component="h1" gutterBottom>
        Barcode Generator
      </Typography>
      
      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Upload Data File
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1.5 }}>
          <Box sx={{ width: { xs: '100%', md: '33.33%' }, px: 1.5, mb: 2 }}>
            <Box sx={{ mb: 1 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="body2" fontWeight={500}>Upload your CSV/Excel file</Typography>
                <Tooltip title="Upload a CSV or Excel file containing data for barcode generation. The file should have at least one column with values you want to convert to barcodes." arrow>
                  <HelpOutlineIcon fontSize="small" color="primary" />
                </Tooltip>
              </Stack>
            </Box>
            <Button
              variant="contained"
              component="label"
              startIcon={<CloudUploadIcon />}
              fullWidth
              sx={{ py: 1.5 }}
            >
              Upload CSV/Excel
              <input
                type="file"
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                hidden
                onChange={handleFileUpload}
              />
            </Button>
            {file && (
              <Typography variant="body2" sx={{ mt: 1.5 }}>
                File: {file.name}
              </Typography>
            )}
          </Box>
          
          <Box sx={{ width: { xs: '100%', md: '33.33%' }, px: 1.5, mb: 2 }}>
            <FormControl fullWidth disabled={availableColumns.length === 0} sx={{ mb: 0.5 }}>
              <InputLabel>Barcode Value Column</InputLabel>
              <Select
                value={selectedColumn}
                label="Barcode Value Column"
                onChange={handleColumnChange}
              >
                {availableColumns.map((column) => (
                  <MenuItem key={column} value={column}>
                    {column}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                Select the column containing values to convert to barcodes
              </FormHelperText>
            </FormControl>
            <Tooltip 
              title="This dropdown lets you select which column from your data file contains the values you want to convert into barcodes." 
              arrow
              placement="bottom-start"
            >
              <IconButton size="small" color="primary" sx={{ mt: 0.5 }}>
                <InfoIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          
          <Box sx={{ width: { xs: '100%', md: '33.33%' }, px: 1.5, mb: 2 }}>
            <FormControl fullWidth disabled={availableColumns.length === 0} sx={{ mb: 0.5 }}>
              <InputLabel>Label Column (Optional)</InputLabel>
              <Select
                value={labelColumn}
                label="Label Column (Optional)"
                onChange={handleLabelColumnChange}
              >
                <MenuItem value="">None</MenuItem>
                {availableColumns.map((column) => (
                  <MenuItem key={column} value={column}>
                    {column}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                Select a column to use as labels below each barcode (optional)
              </FormHelperText>
            </FormControl>
            <Tooltip 
              title="This optional dropdown lets you select a column to display as text labels beneath each barcode for additional context." 
              arrow
              placement="bottom-start"
            >
              <IconButton size="small" color="primary" sx={{ mt: 0.5 }}>
                <InfoIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleGenerateBarcodes}
            disabled={!file || !selectedColumn || isLoading}
            sx={{ py: 1.2, px: 3 }}
          >
            Generate Barcodes
          </Button>
          
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleClearAll}
            disabled={isLoading || barcodeData.length === 0}
          >
            Clear All
          </Button>
        </Box>
      </Paper>
      
      {barcodeData.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Paper sx={{ p: 4, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">
                Generated Barcodes ({barcodeData.length})
              </Typography>
              
              <Box>
                <Stack direction="row" spacing={3} alignItems="center">
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectAll}
                        onChange={handleToggleSelectAll}
                      />
                    }
                    label="Select All"
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={displayMode === 'table'}
                        onChange={toggleDisplayMode}
                        color="primary"
                      />
                    }
                    label={displayMode === 'table' ? "Tabular view" : "Grid view"}
                  />
                  
                  <Tooltip title="Print all selected barcodes">
                    <Button
                      variant="contained"
                      startIcon={<PrintAllIcon />}
                      onClick={handlePrintSelected}
                      disabled={!barcodeData.some(b => b.selected)}
                      className="hide-on-print"
                    >
                      Print Selected
                    </Button>
                  </Tooltip>
                  
                  <Tooltip title="Download as Excel with identifiers">
                    <Button
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={handleExportCsv}
                      className="hide-on-print"
                    >
                      Export Data
                    </Button>
                  </Tooltip>
                  
                  <Tooltip title="Download as image">
                    <Button
                      variant="outlined"
                      onClick={handleDownloadAllAsPDF}
                      className="hide-on-print"
                    >
                      Download as Image
                    </Button>
                  </Tooltip>
                  
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => sendDataToApi()}
                    className="hide-on-print"
                  >
                    Save to Server
                  </Button>
                </Stack>
              </Box>
            </Box>
            
            <Divider sx={{ mb: 4 }} />
            
            <Box className="" ref={barcodeContainerRef} sx={{ 
              '.barcode-svg': { 
                display: 'block', 
                width: '100%',
                maxWidth: '200px',
                minHeight: '50px',
                margin: '0 auto'
              } 
            }}>
              {displayMode === 'grid' ? (
                <div className="barcode-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                  {barcodeData.map((barcode) => (
                    <Card 
                      key={barcode.id} 
                      className={`barcode-item ${!barcode.selected ? 'deselected' : ''}`}
                      sx={{ padding: 2 }}
                    >
                      {/* Display label above barcode if present */}
                      {barcode.label && (
                        <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 600, textAlign: 'center', fontSize: '0.75rem' }}>
                          {barcode.label}
                        </Typography>
                      )}
                      <svg id={`barcode-${barcode.id}`} className="barcode-svg"></svg>
                      {/* Display identifier below barcode */}
                      <Typography variant="body2" sx={{ mt: 1.5, fontWeight: 500, textAlign: 'center', fontSize: '0.65rem' }}>
                        {barcode.identifier}
                      </Typography>
                      {/* Display FNS value below identifier */}
                      <Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary', textAlign: 'center', fontSize: '0.6rem' }}>
                        {barcode.value}
                      </Typography>
                      <CardActions className="hide-on-print">
                        <Checkbox
                          checked={barcode.selected}
                          onChange={() => handleToggleSelect(barcode.id)}
                          size="small"
                        />
                        <Tooltip title="Print this barcode">
                          <IconButton 
                            size="small" 
                            onClick={() => handlePrintSingle(barcode)}
                            color="primary"
                            disabled={!barcode.label}
                          >
                            <PrintIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </CardActions>
                    </Card>
                  ))}
                </div>
              ) : (
                <TableContainer sx={{ width: '100%' }}>
                  <Table className="barcode-table" sx={{ width: '100%' }}>
                    <TableHead>
                      <TableRow>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectAll}
                            onChange={handleToggleSelectAll}
                          />
                        </TableCell>
                        <TableCell>Identifier</TableCell>
                        <TableCell>Barcode</TableCell>
                        <TableCell>FNS</TableCell>
                        {labelColumn && <TableCell>Label</TableCell>}
                        <TableCell align="right" className="hide-on-print">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {barcodeData.map((barcode) => (
                        <TableRow
                          key={barcode.id}
                          className={!barcode.selected ? 'deselected' : ''}
                          sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={barcode.selected}
                              onChange={() => handleToggleSelect(barcode.id)}
                            />
                          </TableCell>
                          <TableCell>{barcode.identifier}</TableCell>
                          <TableCell className="barcode-cell" sx={{ minWidth: '200px' }}>
                            <svg id={`barcode-${barcode.id}`} className="barcode-svg"></svg>
                          </TableCell>
                          <TableCell>{barcode.value}</TableCell>
                          {labelColumn && <TableCell>{barcode.label}</TableCell>}
                          <TableCell align="right" className="hide-on-print">
                            <Tooltip title="Print this barcode">
                              <IconButton 
                                onClick={() => handlePrintSingle(barcode)} 
                                color="primary"
                                size="medium"
                                disabled={!barcode.label}
                              >
                                <PrintIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          </Paper>
        </Box>
      )}

      {/* Print Dialog */}
      <Dialog
        open={printDialogOpen}
        onClose={handleClosePrintDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent>
          <Box sx={{ position: 'absolute', right: 8, top: 8 }}>
            <IconButton onClick={handleClosePrintDialog}>
              <CloseIcon />
            </IconButton>
          </Box>
          
          <Box sx={{ pt: 2, pb: 1, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Print Barcode
            </Typography>
            
            {currentPrintBarcode && (
              <Box sx={{ my: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {currentPrintBarcode.label && (
                  <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 600, fontSize: '0.75rem' }}>
                    {currentPrintBarcode.label}
                  </Typography>
                )}
                <svg id={`dialog-barcode-${currentPrintBarcode.id}`} className="barcode-svg"></svg>
                <Typography variant="body2" sx={{ mt: 1.5, fontWeight: 500, fontSize: '0.65rem' }}>
                  {currentPrintBarcode.identifier}
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 600, fontSize: '0.6rem' }}>
                  {currentPrintBarcode.value}
                </Typography>
              </Box>
            )}
            
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              A new window will open with your barcode for printing.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleClosePrintDialog} variant="outlined">
            Cancel
          </Button>
          <Button 
            onClick={handlePrintSingleConfirm} 
            variant="contained" 
            startIcon={<PrintIcon />}
          >
            Print
          </Button>
        </DialogActions>
      </Dialog>

      {/* Hidden iframe for printing */}
      <iframe
        ref={printFrameRef}
        style={{ display: 'none' }}
        title="Print Frame"
      />
    </Box>
  );
};

export default BarcodeUniqueGenerator; 