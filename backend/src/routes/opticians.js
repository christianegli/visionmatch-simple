const express = require('express');
const { query, validationResult } = require('express-validator');
const Optician = require('../models/Optician');

const router = express.Router();

/**
 * Get opticians by zip code
 * GET /api/opticians/search?zipCode=12345&radius=25
 */
router.get('/search', [
    query('zipCode').trim().isLength({ min: 5, max: 10 }),
    query('radius').optional().isInt({ min: 1, max: 100 })
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: true,
                message: 'Validation failed',
                details: errors.array()
            });
        }

        const { zipCode, radius = 50 } = req.query;
        const opticians = await Optician.findByZipCode(zipCode, radius);

        res.json({
            success: true,
            searchCriteria: {
                zipCode: zipCode,
                radius: radius
            },
            count: opticians.length,
            opticians: opticians.map(optician => ({
                id: optician.id,
                name: optician.name,
                address: optician.address,
                city: optician.city,
                state: optician.state,
                zipCode: optician.zipCode,
                phone: optician.phone,
                website: optician.website,
                hours: optician.hours,
                services: optician.services,
                specialties: optician.specialties,
                rating: optician.rating,
                reviewCount: optician.reviewCount,
                verified: optician.verified,
                distance: optician.distance || 'Unknown' // In real app, calculate distance
            }))
        });

    } catch (error) {
        next(error);
    }
});

/**
 * Get all opticians
 * GET /api/opticians
 */
router.get('/', async (req, res, next) => {
    try {
        const opticians = await Optician.findAll();

        res.json({
            success: true,
            count: opticians.length,
            opticians: opticians.map(optician => ({
                id: optician.id,
                name: optician.name,
                address: optician.address,
                city: optician.city,
                state: optician.state,
                zipCode: optician.zipCode,
                phone: optician.phone,
                website: optician.website,
                hours: optician.hours,
                services: optician.services,
                specialties: optician.specialties,
                rating: optician.rating,
                reviewCount: optician.reviewCount,
                verified: optician.verified
            }))
        });

    } catch (error) {
        next(error);
    }
});

/**
 * Get optician details by ID
 * GET /api/opticians/:id
 */
router.get('/:id', async (req, res, next) => {
    try {
        const opticianId = req.params.id;
        
        // Find optician (in a real app, you'd have a findById method)
        const opticians = await Optician.findAll();
        const optician = opticians.find(o => o.id == opticianId);

        if (!optician) {
            return res.status(404).json({
                error: true,
                message: 'Optician not found'
            });
        }

        res.json({
            success: true,
            optician: {
                id: optician.id,
                name: optician.name,
                address: optician.address,
                city: optician.city,
                state: optician.state,
                zipCode: optician.zipCode,
                phone: optician.phone,
                email: optician.email,
                website: optician.website,
                hours: optician.hours,
                services: optician.services,
                specialties: optician.specialties,
                rating: optician.rating,
                reviewCount: optician.reviewCount,
                verified: optician.verified,
                // Additional details for single optician view
                detailedInfo: {
                    acceptsInsurance: true, // This would be stored in DB
                    parkingAvailable: true,
                    wheelchairAccessible: true,
                    languagesSpoken: ['English', 'Spanish'],
                    emergencyHours: 'Call (555) 123-4567 for emergencies',
                    appointmentBooking: {
                        online: optician.website ? `${optician.website}/book` : null,
                        phone: optician.phone,
                        walkInsAccepted: false
                    }
                }
            }
        });

    } catch (error) {
        next(error);
    }
});

/**
 * Initialize/seed opticians database (development only)
 * POST /api/opticians/seed
 */
router.post('/seed', async (req, res, next) => {
    try {
        if (process.env.NODE_ENV === 'production') {
            return res.status(403).json({
                error: true,
                message: 'Database seeding not allowed in production'
            });
        }

        const seededCount = await Optician.seedDatabase();

        res.json({
            success: true,
            message: `Successfully seeded ${seededCount} opticians into the database`,
            seededCount: seededCount
        });

    } catch (error) {
        next(error);
    }
});

/**
 * Get available services across all opticians
 * GET /api/opticians/services
 */
router.get('/meta/services', async (req, res, next) => {
    try {
        const opticians = await Optician.findAll();
        
        // Collect all unique services
        const allServices = new Set();
        const allSpecialties = new Set();
        
        opticians.forEach(optician => {
            optician.services.forEach(service => allServices.add(service));
            optician.specialties.forEach(specialty => allSpecialties.add(specialty));
        });

        res.json({
            success: true,
            services: Array.from(allServices).sort(),
            specialties: Array.from(allSpecialties).sort(),
            totalOpticians: opticians.length
        });

    } catch (error) {
        next(error);
    }
});

module.exports = router;