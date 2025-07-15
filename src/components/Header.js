import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          URL Shortener
        </Typography>
        <Button color="inherit" component={Link} to="/">Shorten</Button>
        <Button color="inherit" component={Link} to="/stats">Statistics</Button>
      </Toolbar>
    </AppBar>
  );
}