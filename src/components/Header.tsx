import { AppBar, Toolbar, Typography, Button, Box, useTheme, useMediaQuery } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import BarcodeIcon from '@mui/icons-material/QrCode2';

const Header = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <AppBar position="static" color="primary" elevation={0}>
      <Toolbar sx={{ px: { xs: 2, sm: 4 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <BarcodeIcon sx={{ mr: 1.5, fontSize: 28 }} />
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              fontWeight: 600,
              display: 'flex',
              letterSpacing: '-0.5px',
            }}
          >
            Barcode Printer
          </Typography>
        </Box>
        
        <Box sx={{ flexGrow: 1 }} />
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            color="inherit" 
            component={RouterLink} 
            to="/"
            sx={{ 
              borderRadius: 2,
              px: 2,
              py: 1,
              opacity: 0.9,
              '&:hover': { opacity: 1, backgroundColor: 'rgba(255, 255, 255, 0.1)' },
            }}
          >
            Home
          </Button>
          <Button 
            color="inherit" 
            component={RouterLink} 
            to="/generator"
            sx={{ 
              borderRadius: 2,
              px: 2,
              py: 1,
              opacity: 0.9,
              '&:hover': { opacity: 1, backgroundColor: 'rgba(255, 255, 255, 0.1)' },
              ml: isMobile ? 0 : 1,
            }}
          >
            {isMobile ? 'Generate' : 'Generate Barcodes'}
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 