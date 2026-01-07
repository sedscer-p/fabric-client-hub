// API route handlers for client endpoints

import express, { Request, Response } from 'express';
import { getAllClients, addClient, getClientById } from '../services/clients.js';

const router = express.Router();

/**
 * GET /api/clients
 * Get all clients
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    console.log('Fetching all clients');
    const clients = await getAllClients();

    res.json({
      success: true,
      clients,
    });
  } catch (error: any) {
    console.error('Error fetching clients:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An unexpected error occurred while fetching clients',
    });
  }
});

/**
 * GET /api/clients/:clientId
 * Get a specific client by ID
 */
router.get('/:clientId', async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;
    console.log(`Fetching client ${clientId}`);

    const client = await getClientById(clientId);

    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Client not found',
      });
    }

    res.json({
      success: true,
      client,
    });
  } catch (error: any) {
    console.error('Error fetching client:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An unexpected error occurred while fetching client',
    });
  }
});

/**
 * POST /api/clients
 * Add a new client
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, advisor, email } = req.body;

    // Validate request
    if (!name || !advisor || !email) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Missing required fields: name, advisor, and email',
      });
    }

    // Validate email format
    if (!email.includes('@')) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Invalid email address',
      });
    }

    console.log(`Adding new client: ${name}`);

    const newClient = await addClient({ name, advisor, email });

    res.status(201).json({
      success: true,
      client: newClient,
      message: 'Client added successfully',
    });
  } catch (error: any) {
    console.error('Error adding client:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An unexpected error occurred while adding client',
    });
  }
});

export default router;
