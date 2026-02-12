const express = require('express');
const router = express.Router();
const employeesController = require('../controllers/employeesController');
const vehiclesController = require('../controllers/vehiclesController');
const vehiclesTypesController = require('../controllers/vehiclesTypesController');
const companiesController = require('../controllers/companiesController');
const operationsController = require('../controllers/operationsController');
const usersController = require('../controllers/usersController');
const authMiddleware = require('../middlewares/authMiddleware');

// Employees
router.use('/employees', authMiddleware);
router.get('/employees', employeesController.getAllEmployees);
router.get('/employees/:id', employeesController.getEmployeeById);
router.post('/employees', employeesController.createEmployee);
router.put('/employees/:id', employeesController.updateEmployee);
router.delete('/employees/:id', employeesController.deleteEmployee);

// Vehicles
router.use('/vehicles', authMiddleware);
router.get('/vehicles', vehiclesController.getAllVehicles);
router.get('/vehicles/:id', vehiclesController.getVehicleById);
router.post('/vehicles', vehiclesController.createVehicle);
router.put('/vehicles/:id', vehiclesController.updateVehicle);
router.delete('/vehicles/:id', vehiclesController.deleteVehicle);

// Vehicle Types
router.use('/vehicles-types', authMiddleware);
router.get('/vehicles-types', vehiclesTypesController.getAllVehicleTypes);
router.get('/vehicles-types/:id', vehiclesTypesController.getVehicleTypeById);
router.post('/vehicles-types', vehiclesTypesController.createVehicleType);
router.put('/vehicles-types/:id', vehiclesTypesController.updateVehicleType);
router.delete('/vehicles-types/:id', vehiclesTypesController.deleteVehicleType);

// Companies
router.use('/companies', authMiddleware);
router.get('/companies', companiesController.getAllCompanies);
router.get('/companies/:id', companiesController.getCompanyById);
router.post('/companies', companiesController.createCompany);
router.put('/companies/:id', companiesController.updateCompany);
router.delete('/companies/:id', companiesController.deleteCompany);

// Operations
router.use('/operations', authMiddleware);
router.get('/operations', operationsController.getAllOperations);
router.get('/operations/:id', operationsController.getOperationById);
router.post('/operations', operationsController.createOperation);
router.put('/operations/:id', operationsController.updateOperation);
router.delete('/operations/:id', operationsController.deleteOperation);

// Users
// router.use('/users', authMiddleware); // Uncomment if users should be protected too, but usually creation might be public or protected by admin
router.get('/users', authMiddleware, usersController.getAllUsers);
router.get('/users/:id', authMiddleware, usersController.getUserById);
router.post('/users', usersController.createUser); // Allow public creation for now or keep it open for registration
router.put('/users/:id', authMiddleware, usersController.updateUser);
router.delete('/users/:id', authMiddleware, usersController.deleteUser);

const dashboardController = require('../controllers/dashboardController');

// ... (existing imports)

// Dashboard Routes
router.get('/dashboard', authMiddleware, dashboardController.getDashboardData);

module.exports = router;
