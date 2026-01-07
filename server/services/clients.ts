// Client management service
// Handles CRUD operations for clients

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Root data folder path
const DATA_FOLDER = path.join(__dirname, '../../data_folder');
const CLIENTS_FILE = path.join(DATA_FOLDER, 'clients.json');

export interface Client {
  id: string;
  name: string;
  advisor: string;
  lastMeetingDate: string;
  email: string;
}

/**
 * Ensure the data folder and clients file exist
 */
async function ensureClientsFile(): Promise<void> {
  try {
    await fs.access(DATA_FOLDER);
  } catch {
    await fs.mkdir(DATA_FOLDER, { recursive: true });
  }

  try {
    await fs.access(CLIENTS_FILE);
  } catch {
    // Create initial clients file with Sarah Mitchell
    const initialClients: Client[] = [
      {
        id: '1',
        name: 'Sarah Mitchell',
        advisor: 'James Thompson',
        lastMeetingDate: '2024-12-15',
        email: 'sarah.mitchell@email.com',
      },
    ];
    await fs.writeFile(CLIENTS_FILE, JSON.stringify(initialClients, null, 2), 'utf-8');
  }
}

/**
 * Get all clients from storage
 */
export async function getAllClients(): Promise<Client[]> {
  await ensureClientsFile();

  try {
    const data = await fs.readFile(CLIENTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading clients file:', error);
    return [];
  }
}

/**
 * Get a specific client by ID
 */
export async function getClientById(clientId: string): Promise<Client | null> {
  const clients = await getAllClients();
  return clients.find(c => c.id === clientId) || null;
}

/**
 * Add a new client
 */
export async function addClient(clientData: Omit<Client, 'id' | 'lastMeetingDate'>): Promise<Client> {
  await ensureClientsFile();

  const clients = await getAllClients();

  // Generate unique ID
  const newClient: Client = {
    id: randomUUID(),
    name: clientData.name,
    advisor: clientData.advisor,
    email: clientData.email,
    lastMeetingDate: new Date().toISOString(),
  };

  // Add to clients array
  clients.push(newClient);

  // Save to file
  await fs.writeFile(CLIENTS_FILE, JSON.stringify(clients, null, 2), 'utf-8');

  // Create client folder in data_folder
  const clientFolderName = clientData.name.toLowerCase().replace(/\s+/g, '-');
  const clientFolderPath = path.join(DATA_FOLDER, clientFolderName);

  try {
    await fs.mkdir(clientFolderPath, { recursive: true });
    console.log(`Created folder for new client: ${clientFolderPath}`);
  } catch (error) {
    console.error(`Failed to create client folder: ${error}`);
  }

  return newClient;
}

/**
 * Update client's last meeting date
 */
export async function updateClientLastMeetingDate(clientId: string, date: string): Promise<void> {
  await ensureClientsFile();

  const clients = await getAllClients();
  const clientIndex = clients.findIndex(c => c.id === clientId);

  if (clientIndex !== -1) {
    clients[clientIndex].lastMeetingDate = date;
    await fs.writeFile(CLIENTS_FILE, JSON.stringify(clients, null, 2), 'utf-8');
  }
}

/**
 * Convert client ID to folder name
 * Uses the client's name from the clients.json file
 */
export async function getClientFolderName(clientId: string): Promise<string> {
  const client = await getClientById(clientId);

  if (client) {
    return client.name.toLowerCase().replace(/\s+/g, '-');
  }

  // Fallback for unknown clients
  return clientId.toLowerCase().replace(/\s+/g, '-');
}
