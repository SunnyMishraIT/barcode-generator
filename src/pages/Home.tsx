import { Box, Typography, Button, Paper, Container } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import QrCodeIcon from '@mui/icons-material/QrCode2';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import PrintIcon from '@mui/icons-material/Print';
import SettingsIcon from '@mui/icons-material/Settings';

const Home = () => {
  return (
    <Container maxWidth="lg">
      {/* Hero Section */}
      <Box 
        sx={{ 
          textAlign: 'center', 
          my: { xs: 4, md: 8 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Box 
          sx={{
            backgroundColor: 'primary.main',
            color: 'white',
            borderRadius: '50%',
            width: 80,
            height: 80,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 3,
            boxShadow: '0 8px 16px rgba(37, 99, 235, 0.2)',
          }}
        >
          <QrCodeIcon sx={{ fontSize: 40 }} />
        </Box>
        
        <Typography 
          variant="h2" 
          component="h1" 
          gutterBottom
          sx={{ 
            fontWeight: 700, 
            fontSize: { xs: '2.5rem', md: '3.5rem' },
            background: 'linear-gradient(90deg, #2563eb 0%, #10b981 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2,
          }}
        >
          Barcode Printer
        </Typography>
        
        <Typography 
          variant="h5" 
          color="text.secondary" 
          paragraph
          sx={{ 
            maxWidth: '800px',
            mb: 4,
            fontSize: { xs: '1.1rem', md: '1.3rem' },
            lineHeight: 1.6,
          }}
        >
          Generate and print professional barcodes directly from your CSV and Excel files with our powerful, easy-to-use tool
        </Typography>
        
        <Button
          variant="contained"
          size="large"
          component={RouterLink}
          to="/generator"
          startIcon={<QrCodeIcon />}
          sx={{ 
            py: 1.5, 
            px: 4, 
            fontSize: '1.1rem',
            borderRadius: 3,
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
            '&:hover': {
              boxShadow: '0 6px 20px rgba(37, 99, 235, 0.35)',
            },
          }}
        >
          Start Generating Barcodes
        </Button>
        <Button
          variant="contained"
          size="large"
          component={RouterLink}
          to="/barcode-unique-generator"
          startIcon={<QrCodeIcon />}
          sx={{ 
            py: 1.5, 
            px: 4, 
            marginTop: 2,
            fontSize: '1.1rem',
            borderRadius: 3,
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
            '&:hover': {
              boxShadow: '0 6px 20px rgba(37, 99, 235, 0.35)',
            },
          }}
        >
          Start Generating Unique Barcodes
        </Button>
      </Box>

      {/* Features Section */}
      <Typography 
        variant="h4" 
        component="h2" 
        gutterBottom 
        sx={{ 
          textAlign: 'center', 
          mt: 8, 
          mb: 4,
          fontWeight: 600,
        }}
      >
        Key Features
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, justifyContent: 'center', mb: 6 }}>
        <Paper 
          sx={{ 
            p: 3,
            display: 'flex', 
            flexDirection: 'row', 
            alignItems: 'center',
            borderLeft: '4px solid',
            borderColor: 'primary.light',
            flex: 1,
            maxWidth: '300px',
          }}
        >
          <Box 
            sx={{
              backgroundColor: 'primary.light',
              width: 50,
              height: 50,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 2,
              color: 'white',
            }}
          >
            <UploadFileIcon sx={{ fontSize: 24 }} />
          </Box>
          <Box>
            <Typography 
              variant="h6" 
              component="h3" 
              sx={{ fontWeight: 600, mb: 0.5 }}
            >
              Easy Import
            </Typography>
            <Typography 
              variant="body2"
              color="text.secondary"
            >
              Upload CSV/Excel files
            </Typography>
          </Box>
        </Paper>
        
        <Paper 
          sx={{ 
            p: 3,
            display: 'flex', 
            flexDirection: 'row', 
            alignItems: 'center',
            borderLeft: '4px solid',
            borderColor: 'secondary.main',
            flex: 1,
            maxWidth: '300px',
          }}
        >
          <Box 
            sx={{
              backgroundColor: 'secondary.main',
              width: 50,
              height: 50,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 2,
              color: 'white',
            }}
          >
            <SettingsIcon sx={{ fontSize: 24 }} />
          </Box>
          <Box>
            <Typography 
              variant="h6" 
              component="h3" 
              sx={{ fontWeight: 600, mb: 0.5 }}
            >
              Customizable
            </Typography>
            <Typography 
              variant="body2"
              color="text.secondary"
            >
              Choose columns and labels
            </Typography>
          </Box>
        </Paper>
        
        <Paper 
          sx={{ 
            p: 3,
            display: 'flex', 
            flexDirection: 'row', 
            alignItems: 'center',
            borderLeft: '4px solid',
            borderColor: 'error.main',
            flex: 1,
            maxWidth: '300px',
          }}
        >
          <Box 
            sx={{
              backgroundColor: 'error.main',
              width: 50,
              height: 50,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 2,
              color: 'white',
            }}
          >
            <PrintIcon sx={{ fontSize: 24 }} />
          </Box>
          <Box>
            <Typography 
              variant="h6" 
              component="h3" 
              sx={{ fontWeight: 600, mb: 0.5 }}
            >
              Quick Print
            </Typography>
            <Typography 
              variant="body2"
              color="text.secondary"
            >
              Print individual or batches
            </Typography>
          </Box>
        </Paper>
      </Box>
      
      {/* CTA Section */}
      <Box sx={{ 
        textAlign: 'center', 
        mt: 10, 
        mb: 6, 
        bgcolor: 'primary.light', 
        borderRadius: 4, 
        p: { xs: 4, md: 6 },
        color: 'white',
        boxShadow: '0 8px 32px rgba(59, 130, 246, 0.25)',
      }}>
        <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
          Ready to streamline your barcode creation?
        </Typography>
        <Typography variant="h6" sx={{ mb: 4, fontWeight: 400, opacity: 0.9 }}>
          Our tool makes barcode generation from spreadsheets simple and efficient
        </Typography>
        <Button
          variant="contained"
          size="large"
          component={RouterLink}
          to="/generator"
          sx={{ 
            bgcolor: 'white', 
            color: 'primary.dark',
            py: 1.5, 
            px: 4,
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.9)',
            },
          }}
        >
          Get Started Now
        </Button>
      </Box>
    </Container>
  );
};

export default Home; 