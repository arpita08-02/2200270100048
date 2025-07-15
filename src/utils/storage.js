import dayjs from 'dayjs';

// Enhanced storage functions with expiration, session persistence, and analytics
export const saveUrls = (urls) => {
  try {
    // Clean up expired URLs before saving
    const cleanedUrls = urls.filter(url => {
      return dayjs(url.expiresAt).isAfter(dayjs());
    });
    
    localStorage.setItem('shortenedUrls', JSON.stringify(cleanedUrls));
    sessionStorage.setItem('shortenedUrls', JSON.stringify(cleanedUrls));
    return cleanedUrls;
  } catch (error) {
    console.error('Error saving URLs:', error);
    return [];
  }
};

export const getUrls = () => {
  try {
    // Check sessionStorage first, fallback to localStorage
    let urls = JSON.parse(sessionStorage.getItem('shortenedUrls')) || 
               JSON.parse(localStorage.getItem('shortenedUrls')) || [];
    
    // Filter out expired URLs
    const currentTime = dayjs();
    const validUrls = urls.filter(url => dayjs(url.expiresAt).isAfter(currentTime));
    
    // If any URLs were expired, update storage
    if (validUrls.length < urls.length) {
      saveUrls(validUrls);
    }
    
    return validUrls;
  } catch (error) {
    console.error('Error retrieving URLs:', error);
    return [];
  }
};

export const incrementClickCount = (shortCode, clickData = {}) => {
  let urls; // Define urls here so it's available in catch block
  try {
    urls = getUrls();
    const updatedUrls = urls.map(url => {
      if (url.shortCode === shortCode) {
        const newClick = {
          timestamp: dayjs().toISOString(),
          source: clickData.source || 'direct',
          location: clickData.location || 'Unknown',
          referrer: clickData.referrer || document.referrer || 'Direct',
          device: clickData.device || getDeviceInfo(),
          ip: clickData.ip || 'Unknown'
        };
        
        return {
          ...url,
          clicks: (url.clicks || 0) + 1,
          lastClicked: dayjs().toISOString(),
          clickData: [
            ...(url.clickData || []),
            newClick
          ]
        };
      }
      return url;
    });
    
    saveUrls(updatedUrls);
    return updatedUrls;
  } catch (error) {
    console.error('Error incrementing click count:', error);
    return urls || []; // Return empty array if urls is undefined
  }
};

// Helper function to get device info
const getDeviceInfo = () => {
  const userAgent = navigator.userAgent;
  let device = 'Desktop';
  
  if (/Mobi|Android/i.test(userAgent)) {
    device = 'Mobile';
  } else if (/Tablet|iPad/i.test(userAgent)) {
    device = 'Tablet';
  }
  
  return device;
};

// Clean up expired URLs on startup
export const initializeUrlStorage = () => {
  const urls = getUrls(); // This automatically cleans expired URLs
  return urls;
};

// Additional analytics functions
export const getUrlAnalytics = (shortCode) => {
  const urls = getUrls();
  const url = urls.find(u => u.shortCode === shortCode);
  
  if (!url) return null;
  
  // Calculate click statistics
  const now = dayjs();
  const created = dayjs(url.createdAt);
  const daysActive = now.diff(created, 'day');
  
  const clickSources = {};
  const clickLocations = {};
  const clickDevices = {};
  const dailyClicks = {};
  
  url.clickData?.forEach(click => {
    const clickDay = dayjs(click.timestamp).format('YYYY-MM-DD');
    
    // Count sources
    clickSources[click.source] = (clickSources[click.source] || 0) + 1;
    
    // Count locations
    clickLocations[click.location] = (clickLocations[click.location] || 0) + 1;
    
    // Count devices
    clickDevices[click.device] = (clickDevices[click.device] || 0) + 1;
    
    // Count daily clicks
    dailyClicks[clickDay] = (dailyClicks[clickDay] || 0) + 1;
  });
  
  return {
    totalClicks: url.clicks || 0,
    daysActive,
    averageClicksPerDay: daysActive > 0 ? (url.clicks / daysActive).toFixed(2) : url.clicks,
    clickSources,
    clickLocations,
    clickDevices,
    dailyClicks,
    lastClicked: url.lastClicked,
    createdAt: url.createdAt
  };
};