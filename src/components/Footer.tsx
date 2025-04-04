import { Box, Container, Typography, Link, Divider } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';

const Footer = () => {
  return (
    <Box 
      component="footer" 
      sx={{ 
        py: 3, 
        mt: 'auto', 
        backgroundColor: 'primary.main', 
        color: 'white',
        backgroundImage: 'linear-gradient(to right, #2563eb, #1d4ed8)',
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2
        }}>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            © {new Date().getFullYear()} Barcode Printer — All rights reserved Viral Fission
          </Typography>
          
          {/* <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Link 
              href="#" 
              color="inherit" 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 0.5,
                opacity: 0.8,
                transition: 'opacity 0.2s',
                '&:hover': { opacity: 1 }
              }}
            >
              <GitHubIcon fontSize="small" />
              <Typography variant="body2">
                GitHub
              </Typography>
            </Link>
            
            <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.3)' }} />
            
            <Link 
              href="#" 
              color="inherit"
              sx={{ 
                opacity: 0.8,
                transition: 'opacity 0.2s',
                '&:hover': { opacity: 1 }
              }}
            >
              <Typography variant="body2">
                Documentation
              </Typography>
            </Link>
          </Box> */}
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 