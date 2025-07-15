import { useState, useEffect } from 'react';
import { 
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Grid,
  Chip
} from '@mui/material';
import Header from '../components/Header';
import { getUrls } from '../utils/storage';
import logger from '../utils/logger';

// Fallback date formatting if dayjs isn't available
const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleString();
  } catch {
    return dateString;
  }
};

const formatRelativeTime = (dateString) => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    return `${days} days ago`;
  } catch {
    return dateString;
  }
};

export default function StatsPage() {
  const [urls, setUrls] = useState([]);
  const [filteredUrls, setFilteredUrls] = useState([]);
  const [selectedUrl, setSelectedUrl] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [timeRange, setTimeRange] = useState('all');

  useEffect(() => {
    const storedUrls = getUrls();
    setUrls(storedUrls);
    setFilteredUrls(storedUrls);
    logger.log('PAGE_LOADED', { page: 'Statistics' });
  }, []);

  useEffect(() => {
    let result = [...urls];
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(url => 
        url.shortCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        url.longUrl.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply time range filter
    if (timeRange !== 'all') {
      const now = new Date();
      result = result.filter(url => {
        const created = new Date(url.createdAt);
        const diff = now - created;
        
        switch(timeRange) {
          case 'day': return diff <= 24 * 60 * 60 * 1000;
          case 'week': return diff <= 7 * 24 * 60 * 60 * 1000;
          case 'month': return diff <= 30 * 24 * 60 * 60 * 1000;
          default: return true;
        }
      });
    }
    
    // Apply sorting
    result.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    
    setFilteredUrls(result);
  }, [urls, searchTerm, timeRange, sortConfig]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleUrlSelect = (url) => {
    setSelectedUrl(url);
    logger.log('URL_SELECTED', { shortCode: url.shortCode });
  };

  const getClickSourcePercentage = (source) => {
    if (!selectedUrl || !selectedUrl.clickData) return 0;
    const sourceCount = selectedUrl.clickData.filter(click => click.source === source).length;
    return Math.round((sourceCount / selectedUrl.clicks) * 100);
  };

  return (
    <>
      <Header />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          URL Statistics
        </Typography>
        
        <Grid container spacing={3}>
          {/* Filters and URL List */}
          <Grid item xs={12} md={5}>
            <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
              <TextField
                fullWidth
                label="Search URLs"
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ mb: 2 }}
              />
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Time Range</InputLabel>
                <Select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  label="Time Range"
                >
                  <MenuItem value="all">All Time</MenuItem>
                  <MenuItem value="day">Last 24 Hours</MenuItem>
                  <MenuItem value="week">Last Week</MenuItem>
                  <MenuItem value="month">Last Month</MenuItem>
                </Select>
              </FormControl>
            </Paper>

            <Paper elevation={3}>
              <List>
                {filteredUrls.length === 0 ? (
                  <Typography sx={{ p: 2 }}>No URLs found</Typography>
                ) : (
                  filteredUrls.map((url, index) => (
                    <div key={url.shortCode}>
                      <ListItem 
                        button
                        selected={selectedUrl?.shortCode === url.shortCode}
                        onClick={() => handleUrlSelect(url)}
                      >
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span>{url.shortCode}</span>
                              <Chip label={`${url.clicks} clicks`} size="small" />
                            </Box>
                          }
                          secondary={
                            <>
                              <div>{truncateUrl(url.longUrl, 40)}</div>
                              <div>Created {formatRelativeTime(url.createdAt)}</div>
                            </>
                          }
                        />
                      </ListItem>
                      {index < filteredUrls.length - 1 && <Divider />}
                    </div>
                  ))
                )}
              </List>
            </Paper>
          </Grid>

          {/* Detailed Analytics */}
          <Grid item xs={12} md={7}>
            {selectedUrl ? (
              <Paper elevation={3} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Analytics for: {selectedUrl.shortCode}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Original URL: {selectedUrl.longUrl}
                </Typography>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={6} sm={3}>
                    <Paper sx={{ p: 1, textAlign: 'center' }}>
                      <Typography variant="h5">{selectedUrl.clicks}</Typography>
                      <Typography variant="caption">Total Clicks</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Paper sx={{ p: 1, textAlign: 'center' }}>
                      <Typography variant="h5">
                        {formatDate(selectedUrl.createdAt)}
                      </Typography>
                      <Typography variant="caption">Created</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Paper sx={{ p: 1, textAlign: 'center' }}>
                      <Typography variant="h5">
                        {formatRelativeTime(selectedUrl.expiresAt)}
                      </Typography>
                      <Typography variant="caption">Expires In</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Paper sx={{ p: 1, textAlign: 'center' }}>
                      <Typography variant="h5">
                        {selectedUrl.clickData?.length > 0 
                          ? formatRelativeTime(selectedUrl.clickData[0].timestamp)
                          : 'Never'}
                      </Typography>
                      <Typography variant="caption">Last Click</Typography>
                    </Paper>
                  </Grid>
                </Grid>

                <Typography variant="subtitle1" gutterBottom>
                  Click Sources
                </Typography>
                <Grid container spacing={1} sx={{ mb: 3 }}>
                  {['direct', 'social', 'email', 'search', 'other'].map(source => (
                    <Grid item xs={6} sm={4} key={source}>
                      <Paper sx={{ p: 1 }}>
                        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                          {source}
                        </Typography>
                        <Typography variant="h6">
                          {getClickSourcePercentage(source)}%
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>

                <Typography variant="subtitle1" gutterBottom>
                  Recent Clicks
                </Typography>
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          <TableSortLabel
                            active={sortConfig.key === 'timestamp'}
                            direction={sortConfig.direction}
                            onClick={() => requestSort('timestamp')}
                          >
                            Time
                          </TableSortLabel>
                        </TableCell>
                        <TableCell>Source</TableCell>
                        <TableCell>Location</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedUrl.clickData?.slice(0, 10).map((click, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            {formatDate(click.timestamp)}
                          </TableCell>
                          <TableCell sx={{ textTransform: 'capitalize' }}>
                            {click.source}
                          </TableCell>
                          <TableCell>
                            {click.location || 'Unknown'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            ) : (
              <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body1">
                  Select a URL from the list to view detailed analytics
                </Typography>
              </Paper>
            )}
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

function truncateUrl(url, maxLength) {
  if (url.length <= maxLength) return url;
  return `${url.substring(0, maxLength)}...`;
}