-- Enable UUID extension if needed, though serial IDs are implied by the prompt description (int id)
-- But using SERIAL is better for IDs. The prompt just says "id", assuming integer unless specified otherwise.
-- "cpf?" and "cnpj?" with question mark implies optional/nullable.

CREATE TABLE IF NOT EXISTS employees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    cpf VARCHAR(14),
    cnpj VARCHAR(18),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vehicles_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vehicles (
    id SERIAL PRIMARY KEY,
    plate VARCHAR(20) NOT NULL UNIQUE,
    km INTEGER NOT NULL DEFAULT 0,
    vehicle_type_id INTEGER REFERENCES vehicles_types (id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    cnpj VARCHAR(18) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS operations (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies (id),
    vehicle_id INTEGER REFERENCES vehicles (id),
    driver_id INTEGER REFERENCES employees (id),
    support_id INTEGER REFERENCES employees (id),
    operation_value NUMERIC(10, 2),
    operation_date TIMESTAMP,
    driver_value NUMERIC(10, 2),
    support_value NUMERIC(10, 2),
    estimated_time VARCHAR(50), -- Could be interval or string, keeping simple string for now
    status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Completed', 'Canceled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);