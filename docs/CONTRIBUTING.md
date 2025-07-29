# Contributing to VisionMatch

Thank you for your interest in contributing to the VisionMatch website! This document provides guidelines for development, code standards, and the contribution process.

## Development Philosophy

### MVP First Approach
- Always prioritize core functionality over features
- Build the simplest solution that works
- Test thoroughly before adding complexity
- Document the rationale behind technical decisions

### Conversion Optimization
- Every change should be evaluated for its impact on conversion rates
- Performance is critical - fast loading times improve conversion
- Accessibility is not optional - all users should have equal access
- Mobile-first design is mandatory

## Code Standards

### HTML
- Use semantic HTML5 elements
- Maintain proper heading hierarchy (h1-h6)
- Include alt text for all images
- Add ARIA labels for interactive elements
- Validate HTML using [W3C Validator](https://validator.w3.org/)

### CSS
- Use mobile-first responsive design
- Prefer CSS Grid and Flexbox over older layout methods
- Use CSS custom properties for consistent theming
- Keep specificity low and avoid !important
- Use meaningful class names that describe purpose, not appearance

### JavaScript
- Use modern ES6+ syntax
- Keep functions small and focused
- Add comments explaining complex logic
- Handle errors gracefully
- Test in multiple browsers

## File Organization

### Current Structure
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
    ├── SETUP.md           # Setup instructions
    └── CONTRIBUTING.md    # This file
```

### Future Structure (if project grows)
```
visionmatch-simple/
├── src/
│   ├── css/
│   │   ├── base.css
│   │   ├── components.css
│   │   └── utilities.css
│   ├── js/
│   │   ├── main.js
│   │   └── components.js
│   └── images/
├── dist/                   # Built files
├── docs/
└── tests/
```

## Development Workflow

### 1. Planning Phase
- Update `.cursor/scratchpad.md` with new requirements
- Document the rationale in `DECISIONS.md`
- Update `ARCHITECTURE.md` if structural changes are needed

### 2. Implementation Phase
- Follow the established coding standards
- Test your changes thoroughly
- Update documentation as needed
- Commit with meaningful messages

### 3. Testing Phase
- Test on multiple devices and browsers
- Validate accessibility
- Check performance impact
- Verify conversion elements still work

### 4. Documentation Phase
- Update relevant documentation files
- Record any new decisions in `DECISIONS.md`
- Update `ARCHITECTURE.md` if needed

## Git Workflow

### Commit Message Format
```
type: description - rationale

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation update
- refactor: Code restructuring
- test: Test additions
- chore: Maintenance tasks

Examples:
feat: Add vision profile quiz - Increases engagement and lead generation
fix: Resolve mobile navigation overlap - Improves mobile user experience
docs: Update API documentation - Clarifies integration requirements
```

### Branch Naming
- `feature/vision-quiz` - New features
- `fix/mobile-nav` - Bug fixes
- `docs/api-update` - Documentation updates
- `refactor/css-organization` - Code restructuring

## Testing Guidelines

### Manual Testing Checklist
- [ ] Test on mobile devices (iOS, Android)
- [ ] Test on desktop browsers (Chrome, Firefox, Safari, Edge)
- [ ] Test keyboard navigation
- [ ] Test with screen reader
- [ ] Validate HTML and CSS
- [ ] Check performance with Lighthouse
- [ ] Test all interactive elements
- [ ] Verify responsive breakpoints

### Automated Testing (Future)
- Unit tests for JavaScript functions
- Visual regression testing
- Accessibility testing with axe-core
- Performance testing with Lighthouse CI

## Performance Standards

### Core Web Vitals Targets
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### Loading Performance
- Total page size: < 2MB
- JavaScript execution: < 100ms
- CSS parsing: < 50ms

## Accessibility Standards

### WCAG 2.1 AA Compliance
- Color contrast ratio: 4.5:1 minimum
- Keyboard navigation: All interactive elements accessible
- Screen reader support: Semantic HTML and ARIA labels
- Focus management: Clear focus indicators

### Testing Tools
- Chrome DevTools Accessibility audit
- axe-core browser extension
- WAVE Web Accessibility Evaluator
- Manual testing with screen readers

## Review Process

### Before Submitting
1. Self-review your changes
2. Test thoroughly on multiple devices
3. Validate HTML and CSS
4. Check accessibility compliance
5. Update documentation
6. Commit with clear message

### Code Review Checklist
- [ ] Code follows established standards
- [ ] Changes are well-documented
- [ ] Performance impact is acceptable
- [ ] Accessibility is maintained
- [ ] Mobile responsiveness is preserved
- [ ] Conversion elements are intact

## Common Issues and Solutions

### CSS Specificity Problems
**Problem**: Styles not applying as expected
**Solution**: Use CSS custom properties and avoid high specificity selectors

### Mobile Layout Issues
**Problem**: Elements overlapping or misaligned on mobile
**Solution**: Test with actual devices, not just browser dev tools

### Performance Degradation
**Problem**: Page loading slowly after changes
**Solution**: Use Lighthouse to identify bottlenecks, optimize images, minimize JavaScript

### Accessibility Issues
**Problem**: Screen readers not working properly
**Solution**: Use semantic HTML, add ARIA labels, test with actual screen readers

## Getting Help

### Resources
- [MDN Web Docs](https://developer.mozilla.org/) - HTML, CSS, JavaScript reference
- [Web.dev](https://web.dev/) - Performance and best practices
- [A11y Project](https://www.a11yproject.com/) - Accessibility guidelines
- [CSS-Tricks](https://css-tricks.com/) - CSS solutions and techniques

### Questions and Discussions
- Check existing documentation first
- Review `DECISIONS.md` for implementation rationale
- Update `.cursor/scratchpad.md` with questions
- Document solutions in the "Lessons Learned" section

## Future Enhancements

### Planned Features
- Interactive store locator map
- Vision profile quiz functionality
- Testimonials carousel
- Analytics integration
- A/B testing framework

### Technical Debt
- Consider CSS preprocessor for larger scale
- Implement build process for optimization
- Add automated testing suite
- Consider framework migration if complexity increases

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Prioritize user experience and accessibility
- Document decisions and rationale
- Test thoroughly before submitting changes 