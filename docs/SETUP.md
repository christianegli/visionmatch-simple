# VisionMatch Website Setup Guide

## Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Text editor (VS Code, Sublime Text, Atom)
- Git (for version control)

## Quick Start

### 1. Clone or Download the Project

```bash
# If using Git
git clone [repository-url]
cd visionmatch-simple

# Or download and extract the ZIP file
```

### 2. Open the Website

```bash
# Option 1: Double-click index.html
# Option 2: Open with browser
open index.html

# Option 3: Use a local server (recommended for development)
python -m http.server 8000
# Then visit http://localhost:8000
```

### 3. Development Server (Optional but Recommended)

For the best development experience, use a local server:

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js (if you have http-server installed)
npx http-server

# PHP
php -S localhost:8000
```

## Project Structure

```
visionmatch-simple/
├── index.html              # Main website file
├── .cursor/
│   └── scratchpad.md       # Multi-agent working document
├── README.md               # Project overview
├── ARCHITECTURE.md         # System design & rationale
├── DECISIONS.md           # Architecture Decision Records
└── docs/
    ├── API.md             # API documentation (future)
    ├── SETUP.md           # This file
    └── CONTRIBUTING.md    # Development guidelines
```

## Development Workflow

### 1. Making Changes

1. Open `index.html` in your text editor
2. Make your changes to the HTML, CSS, or JavaScript
3. Save the file
4. Refresh your browser to see changes

### 2. Testing

- Test on different screen sizes (mobile, tablet, desktop)
- Test in different browsers
- Check accessibility with browser dev tools
- Validate HTML at [validator.w3.org](https://validator.w3.org/)

### 3. Version Control

```bash
# Add your changes
git add .

# Commit with a descriptive message
git commit -m "feat: [description of changes] - [rationale]"

# Push to repository
git push origin main
```

## Browser Compatibility

### Supported Browsers
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### CSS Features Used
- CSS Grid
- CSS Flexbox
- CSS Variables (Custom Properties)
- CSS Transitions and Animations
- Backdrop Filter

### JavaScript Features Used
- ES6+ syntax
- Fetch API
- Intersection Observer API

## Performance Optimization

### Current Optimizations
- Inline critical CSS
- Minimal JavaScript
- Optimized images (when added)
- Semantic HTML for better parsing

### Testing Performance
- Use Chrome DevTools Lighthouse
- Test Core Web Vitals
- Monitor First Contentful Paint (FCP)
- Check Largest Contentful Paint (LCP)

## Accessibility Testing

### Manual Testing
1. Navigate with keyboard only
2. Test with screen reader
3. Check color contrast ratios
4. Verify focus indicators

### Automated Testing
- Use browser accessibility dev tools
- Run Lighthouse accessibility audit
- Test with axe-core browser extension

## Deployment

### Static Hosting Options
- **Netlify**: Drag and drop deployment
- **Vercel**: Git-based deployment
- **GitHub Pages**: Free hosting for public repos
- **AWS S3**: Scalable static hosting

### Deployment Steps
1. Build/minify assets (if needed)
2. Upload files to hosting provider
3. Configure custom domain (optional)
4. Set up SSL certificate
5. Test live site

## Troubleshooting

### Common Issues

**Page not loading properly**
- Check file paths
- Ensure all files are in correct locations
- Clear browser cache

**Styles not applying**
- Check CSS syntax
- Verify CSS selectors
- Inspect with browser dev tools

**JavaScript errors**
- Check browser console for errors
- Verify JavaScript syntax
- Test in different browsers

**Responsive issues**
- Test on actual devices
- Use browser dev tools device simulation
- Check CSS media queries

### Getting Help

1. Check browser console for errors
2. Validate HTML and CSS
3. Test in different browsers
4. Review the ARCHITECTURE.md file
5. Check DECISIONS.md for implementation rationale

## Environment Variables

Currently, no environment variables are needed as this is a static site. Future enhancements may require:

- Google Maps API key (for store locator)
- Analytics tracking IDs
- Form submission endpoints

## Security Considerations

### Current Implementation
- No sensitive data collection
- No server-side processing
- No external dependencies

### Future Considerations
- HTTPS enforcement
- Content Security Policy (CSP)
- Input validation for forms
- Privacy policy compliance 