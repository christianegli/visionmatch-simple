const { db } = require('./database');

class Optician {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.address = data.address;
        this.city = data.city;
        this.state = data.state;
        this.zipCode = data.zipCode;
        this.phone = data.phone;
        this.email = data.email;
        this.website = data.website;
        this.hours = data.hours;
        this.services = data.services || [];
        this.specialties = data.specialties || [];
        this.latitude = data.latitude;
        this.longitude = data.longitude;
        this.rating = data.rating || 0.0;
        this.reviewCount = data.reviewCount || 0;
        this.verified = data.verified || false;
    }

    /**
     * Save optician to database
     */
    async save() {
        return new Promise((resolve, reject) => {
            const stmt = db.prepare(`
                INSERT OR REPLACE INTO opticians (
                    id, name, address, city, state, zip_code, phone, email, website,
                    hours, services, specialties, latitude, longitude, rating,
                    review_count, verified, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            `);

            stmt.run([
                this.id,
                this.name,
                this.address,
                this.city,
                this.state,
                this.zipCode,
                this.phone,
                this.email,
                this.website,
                this.hours,
                JSON.stringify(this.services),
                JSON.stringify(this.specialties),
                this.latitude,
                this.longitude,
                this.rating,
                this.reviewCount,
                this.verified ? 1 : 0
            ], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            });
        });
    }

    /**
     * Find opticians by zip code with distance calculation
     */
    static async findByZipCode(zipCode, radius = 50) {
        return new Promise((resolve, reject) => {
            // For demo purposes, we'll do a simple zip code match
            // In production, you'd use geolocation services for real distance calculation
            db.all(
                `SELECT * FROM opticians 
                 WHERE zip_code LIKE ? OR zip_code = ?
                 ORDER BY rating DESC, review_count DESC
                 LIMIT 10`,
                [`${zipCode.substring(0, 3)}%`, zipCode],
                (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        const opticians = rows.map(row => new Optician({
                            id: row.id,
                            name: row.name,
                            address: row.address,
                            city: row.city,
                            state: row.state,
                            zipCode: row.zip_code,
                            phone: row.phone,
                            email: row.email,
                            website: row.website,
                            hours: row.hours,
                            services: row.services ? JSON.parse(row.services) : [],
                            specialties: row.specialties ? JSON.parse(row.specialties) : [],
                            latitude: row.latitude,
                            longitude: row.longitude,
                            rating: row.rating,
                            reviewCount: row.review_count,
                            verified: row.verified === 1
                        }));
                        resolve(opticians);
                    }
                }
            );
        });
    }

    /**
     * Get all opticians
     */
    static async findAll() {
        return new Promise((resolve, reject) => {
            db.all(`SELECT * FROM opticians ORDER BY name`, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    const opticians = rows.map(row => new Optician({
                        id: row.id,
                        name: row.name,
                        address: row.address,
                        city: row.city,
                        state: row.state,
                        zipCode: row.zip_code,
                        phone: row.phone,
                        email: row.email,
                        website: row.website,
                        hours: row.hours,
                        services: row.services ? JSON.parse(row.services) : [],
                        specialties: row.specialties ? JSON.parse(row.specialties) : [],
                        latitude: row.latitude,
                        longitude: row.longitude,
                        rating: row.rating,
                        reviewCount: row.review_count,
                        verified: row.verified === 1
                    }));
                    resolve(opticians);
                }
            });
        });
    }

    /**
     * Populate database with dummy optician data
     */
    static async seedDatabase() {
        const dummyOpticians = [
            {
                name: "VisionCare Optometry",
                address: "123 Main Street",
                city: "New York",
                state: "NY",
                zipCode: "10001",
                phone: "(212) 555-0101",
                email: "info@visioncare-ny.com",
                website: "https://visioncare-ny.com",
                hours: "Mon-Fri 9AM-6PM, Sat 9AM-4PM",
                services: ["Eye Exams", "Contact Lens Fitting", "Glasses Repair", "Emergency Care"],
                specialties: ["Pediatric Optometry", "Dry Eye Treatment", "Sports Vision"],
                latitude: 40.7128,
                longitude: -74.0060,
                rating: 4.8,
                reviewCount: 156,
                verified: true
            },
            {
                name: "EyeHealth Partners",
                address: "456 Oak Avenue",
                city: "Los Angeles",
                state: "CA",
                zipCode: "90210",
                phone: "(323) 555-0202",
                email: "contact@eyehealth-la.com",
                website: "https://eyehealth-partners.com",
                hours: "Mon-Sat 8AM-7PM",
                services: ["Comprehensive Eye Exams", "Designer Frames", "Progressive Lenses", "Sunglasses"],
                specialties: ["Myopia Management", "Digital Eye Strain", "Fashion Eyewear"],
                latitude: 34.0522,
                longitude: -118.2437,
                rating: 4.6,
                reviewCount: 203,
                verified: true
            },
            {
                name: "ClearSight Vision Center",
                address: "789 Pine Road",
                city: "Chicago",
                state: "IL",
                zipCode: "60601",
                phone: "(312) 555-0303",
                email: "appointments@clearsight-chicago.com",
                website: "https://clearsight-vision.com",
                hours: "Tue-Fri 10AM-8PM, Sat 9AM-5PM",
                services: ["Eye Exams", "Contact Lenses", "LASIK Consultation", "Frame Styling"],
                specialties: ["Glaucoma Screening", "Diabetic Eye Care", "Age-Related Macular Degeneration"],
                latitude: 41.8781,
                longitude: -87.6298,
                rating: 4.7,
                reviewCount: 89,
                verified: true
            },
            {
                name: "Premier Eye Care",
                address: "321 Elm Street",
                city: "Houston",
                state: "TX",
                zipCode: "77001",
                phone: "(713) 555-0404",
                email: "info@premiereye-houston.com",
                website: "https://premier-eyecare.com",
                hours: "Mon-Fri 8AM-6PM, Sat 9AM-3PM",
                services: ["Family Eye Care", "Contact Lens Exams", "Optical Shop", "Insurance Processing"],
                specialties: ["Children's Vision", "Computer Vision Syndrome", "Low Vision Aids"],
                latitude: 29.7604,
                longitude: -95.3698,
                rating: 4.5,
                reviewCount: 127,
                verified: true
            },
            {
                name: "Sunrise Optical",
                address: "654 Maple Drive",
                city: "Phoenix",
                state: "AZ",
                zipCode: "85001",
                phone: "(602) 555-0505",
                email: "hello@sunrise-optical.com",
                website: "https://sunrise-optical.com",
                hours: "Mon-Fri 9AM-7PM, Sat 10AM-4PM",
                services: ["Eye Exams", "Designer Glasses", "Sunglasses", "Lens Upgrades"],
                specialties: ["UV Protection", "Sports Eyewear", "Blue Light Filtering"],
                latitude: 33.4484,
                longitude: -112.0740,
                rating: 4.4,
                reviewCount: 92,
                verified: true
            },
            {
                name: "Metropolitan Vision",
                address: "987 Broadway",
                city: "Boston",
                state: "MA",
                zipCode: "02101",
                phone: "(617) 555-0606",
                email: "care@metro-vision.com",
                website: "https://metropolitan-vision.com",
                hours: "Mon-Thu 9AM-6PM, Fri 9AM-5PM, Sat 9AM-2PM",
                services: ["Comprehensive Exams", "Specialty Contact Lenses", "Frame Repair", "Emergency Services"],
                specialties: ["Keratoconus Treatment", "Orthokeratology", "Myopia Control"],
                latitude: 42.3601,
                longitude: -71.0589,
                rating: 4.9,
                reviewCount: 178,
                verified: true
            }
        ];

        console.log('Seeding opticians database...');
        let seededCount = 0;

        for (const data of dummyOpticians) {
            try {
                const optician = new Optician(data);
                await optician.save();
                seededCount++;
            } catch (error) {
                console.error(`Error seeding optician ${data.name}:`, error);
            }
        }

        console.log(`Successfully seeded ${seededCount} opticians`);
        return seededCount;
    }
}

module.exports = Optician;