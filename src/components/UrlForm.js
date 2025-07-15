import { useState } from 'react';
import { 
  TextField, 
  Button, 
  Paper, 
  Typography,
  Box,
  Divider
} from '@mui/material';
import logger from '../utils/logger';
import { saveUrls, getUrls } from '../utils/storage';

export default function UrlForm({ onAddUrl }) {
  const [urls, setUrls] = useState([{ longUrl: '', validity: 30, shortCode: '' }]);
  const [errors, setErrors] = useState([]);

  const validateUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = [];
    const validUrls = [];
    const existingUrls = getUrls();
    const existingShortCodes = existingUrls.map(url => url.shortCode);

    urls.forEach((url, index) => {
      const currentErrors = {};
      
      // Validate URL
      if (!url.longUrl.trim()) {
        if (urls.length > 1) {
          // Skip empty URLs if there are multiple
          return;
        }
        currentErrors.longUrl = 'URL is required';
      } else if (!validateUrl(url.longUrl)) {
        currentErrors.longUrl = 'Invalid URL format';
      }

      // Validate validity
      if (url.validity && (isNaN(url.validity) || Number(url.validity) <= 0)) {
        currentErrors.validity = 'Must be a positive number';
      }

      // Validate short code
      if (url.shortCode) {
        if (existingShortCodes.includes(url.shortCode)) {
          currentErrors.shortCode = 'Short code already exists';
        } else if (!/^[a-zA-Z0-9_-]+$/.test(url.shortCode)) {
          currentErrors.shortCode = 'Only letters, numbers, hyphens and underscores allowed';
        } else if (url.shortCode.length > 20) {
          currentErrors.shortCode = 'Maximum 20 characters allowed';
        }
      }

      if (Object.keys(currentErrors).length > 0) {
        newErrors[index] = currentErrors;
        return;
      }

      validUrls.push(url);
    });

    if (newErrors.length > 0) {
      setErrors(newErrors);
      logger.log('FORM_VALIDATION_ERROR', { errors: newErrors });
      return;
    }

    const newShortenedUrls = validUrls.map(url => {
      const shortCode = url.shortCode || generateShortCode();
      const now = new Date();
      const expiry = new Date(now.getTime() + (url.validity || 30) * 60000);

      return {
        longUrl: url.longUrl,
        shortCode,
        createdAt: now.toISOString(),
        expiresAt: expiry.toISOString(),
        clicks: 0,
        clickData: []
      };
    });

    const allUrls = [...existingUrls, ...newShortenedUrls];
    saveUrls(allUrls);
    onAddUrl(allUrls);
    setUrls([{ longUrl: '', validity: 30, shortCode: '' }]);
    setErrors([]);
    logger.log('URLS_SHORTENED', { count: newShortenedUrls.length });
  };

  const generateShortCode = () => {
    return Math.random().toString(36).substring(2, 8);
  };

  const handleChange = (index, field, value) => {
    const newUrls = [...urls];
    newUrls[index] = { ...newUrls[index], [field]: value };
    setUrls(newUrls);

    // Clear error when user starts typing
    if (errors[index]?.[field]) {
      const newErrors = [...errors];
      delete newErrors[index][field];
      if (Object.keys(newErrors[index]).length === 0) {
        delete newErrors[index];
      }
      setErrors(newErrors);
    }
  };

  const addUrlField = () => {
    if (urls.length < 5) {
      setUrls([...urls, { longUrl: '', validity: 30, shortCode: '' }]);
    }
  };

  const removeUrlField = (index) => {
    if (urls.length > 1) {
      const newUrls = urls.filter((_, i) => i !== index);
      setUrls(newUrls);
      
      // Remove corresponding errors
      const newErrors = [...errors];
      delete newErrors[index];
      setErrors(newErrors);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Shorten URLs
      </Typography>
      <form onSubmit={handleSubmit}>
        {urls.map((url, index) => (
          <div key={index}>
            <TextField 
              label="Long URL" 
              required 
              fullWidth
              value={url.longUrl}
              onChange={(e) => handleChange(index, 'longUrl', e.target.value)}
              error={!!errors[index]?.longUrl}
              helperText={errors[index]?.longUrl}
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField 
                label="Validity (mins)" 
                type="number" 
                value={url.validity}
                onChange={(e) => handleChange(index, 'validity', e.target.value)}
                error={!!errors[index]?.validity}
                helperText={errors[index]?.validity}
                inputProps={{ min: 1 }}
                sx={{ flex: 1 }}
              />
              <TextField 
                label="Custom Short Code" 
                placeholder="Optional"
                value={url.shortCode}
                onChange={(e) => handleChange(index, 'shortCode', e.target.value)}
                error={!!errors[index]?.shortCode}
                helperText={errors[index]?.shortCode}
                sx={{ flex: 1 }}
              />
            </Box>
            {urls.length > 1 && (
              <Button
                variant="outlined"
                color="error"
                onClick={() => removeUrlField(index)}
                sx={{ mb: 2 }}
              >
                Remove URL
              </Button>
            )}
            {index < urls.length - 1 && <Divider sx={{ my: 2 }} />}
          </div>
        ))}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            type="submit"
          >
            Shorten URLs
          </Button>
          {urls.length < 5 && (
            <Button
              variant="outlined"
              onClick={addUrlField}
            >
              Add Another URL
            </Button>
          )}
        </Box>
      </form>
    </Paper>
  );
}