const db = require('../config/db');

const seedVehicleTypes = async () => {
    const types = ['Carro', 'Moto', 'Caminhão'];

    try {
        for (const type of types) {
            await db.query(
                'INSERT INTO vehicles_types (name) VALUES ($1)',
                [type]
            );
            console.log(`Inserted: ${type}`);
        }
        console.log('Vehicle types seeded successfully');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding vehicle types', err);
        process.exit(1);
    }
};

seedVehicleTypes();
