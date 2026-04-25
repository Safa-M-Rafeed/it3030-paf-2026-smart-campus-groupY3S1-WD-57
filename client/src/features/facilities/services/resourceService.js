// Mock API Service for Facilities & Assets Catalogue
// This service provides sample data for immediate testing without backend dependency

// Mock data for resources
const MOCK_RESOURCES = [
  {
    id: '1',
    name: 'Main Lecture Hall A',
    type: 'LECTURE_HALL',
    capacity: 250,
    location: 'Building A - Floor 2',
    status: 'ACTIVE',
    description: 'Large lecture hall with multimedia setup, seating for 250 students',
    createdAt: new Date('2026-01-15'),
    updatedAt: new Date('2026-01-15'),
  },
  {
    id: '2',
    name: 'Physics Laboratory 1',
    type: 'LAB',
    capacity: 40,
    location: 'Building B - Floor 1',
    status: 'ACTIVE',
    description: 'Experimental physics lab with advanced equipment',
    createdAt: new Date('2026-01-20'),
    updatedAt: new Date('2026-01-20'),
  },
  {
    id: '3',
    name: 'Chemistry Lab 2',
    type: 'LAB',
    capacity: 35,
    location: 'Building B - Floor 2',
    status: 'OUT_OF_SERVICE',
    description: 'Chemistry laboratory - Currently under maintenance',
    createdAt: new Date('2026-02-01'),
    updatedAt: new Date('2026-02-10'),
  },
  {
    id: '4',
    name: 'Projector - Room 101',
    type: 'EQUIPMENT',
    capacity: 1,
    location: 'Building A - Room 101',
    status: 'ACTIVE',
    description: '4K projector with wireless connectivity',
    createdAt: new Date('2026-01-10'),
    updatedAt: new Date('2026-01-10'),
  },
  {
    id: '5',
    name: 'Computer Lab 3',
    type: 'LAB',
    capacity: 50,
    location: 'Building C - Floor 3',
    status: 'ACTIVE',
    description: 'Computer lab with 50 workstations, Intel i7, 16GB RAM',
    createdAt: new Date('2026-01-25'),
    updatedAt: new Date('2026-01-25'),
  },
  {
    id: '6',
    name: 'Microscopes - Biology Wing',
    type: 'EQUIPMENT',
    capacity: 20,
    location: 'Building D - Floor 1',
    status: 'ACTIVE',
    description: 'Collection of 20 high-resolution microscopes',
    createdAt: new Date('2026-02-05'),
    updatedAt: new Date('2026-02-05'),
  },
];

let resourceStore = JSON.parse(JSON.stringify(MOCK_RESOURCES));

// Simulate API delay
const API_DELAY = 500; // ms

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const resourceService = {
  /**
   * Get all resources with optional filtering
   */
  async getResources(filters = {}) {
    await delay(API_DELAY);

    let results = [...resourceStore];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      results = results.filter(
        (r) =>
          r.name.toLowerCase().includes(searchLower) ||
          r.description.toLowerCase().includes(searchLower) ||
          r.location.toLowerCase().includes(searchLower)
      );
    }

    // Apply type filter
    if (filters.type && filters.type !== 'ALL') {
      results = results.filter((r) => r.type === filters.type);
    }

    // Apply status filter
    if (filters.status) {
      results = results.filter((r) => r.status === filters.status);
    }

    // Apply location filter
    if (filters.location) {
      results = results.filter((r) => r.location.includes(filters.location));
    }

    return results;
  },

  /**
   * Get a single resource by ID
   */
  async getResourceById(id) {
    await delay(API_DELAY);
    const resource = resourceStore.find((r) => r.id === id);
    if (!resource) {
      throw new Error(`Resource with ID ${id} not found`);
    }
    return resource;
  },

  /**
   * Create a new resource
   */
  async createResource(resourceData) {
    await delay(API_DELAY);
    const newResource = {
      id: String(Date.now()),
      ...resourceData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    resourceStore.push(newResource);
    return newResource;
  },

  /**
   * Update an existing resource
   */
  async updateResource(id, resourceData) {
    await delay(API_DELAY);
    const index = resourceStore.findIndex((r) => r.id === id);
    if (index === -1) {
      throw new Error(`Resource with ID ${id} not found`);
    }
    resourceStore[index] = {
      ...resourceStore[index],
      ...resourceData,
      updatedAt: new Date(),
    };
    return resourceStore[index];
  },

  /**
   * Delete a resource
   */
  async deleteResource(id) {
    await delay(API_DELAY);
    const index = resourceStore.findIndex((r) => r.id === id);
    if (index === -1) {
      throw new Error(`Resource with ID ${id} not found`);
    }
    const deleted = resourceStore.splice(index, 1);
    return deleted[0];
  },

  /**
   * Get dashboard statistics
   */
  async getDashboardStats() {
    await delay(API_DELAY);
    const total = resourceStore.length;
    const active = resourceStore.filter((r) => r.status === 'ACTIVE').length;
    const outOfService = resourceStore.filter(
      (r) => r.status === 'OUT_OF_SERVICE'
    ).length;

    // Type breakdown
    const typeBreakdown = {
      LECTURE_HALL: resourceStore.filter((r) => r.type === 'LECTURE_HALL')
        .length,
      LAB: resourceStore.filter((r) => r.type === 'LAB').length,
      EQUIPMENT: resourceStore.filter((r) => r.type === 'EQUIPMENT').length,
    };

    return {
      total,
      active,
      outOfService,
      typeBreakdown,
      utilizationRate: Math.round((active / total) * 100),
    };
  },

  /**
   * Reset resources to mock data (for demo purposes)
   */
  resetToMockData() {
    resourceStore = JSON.parse(JSON.stringify(MOCK_RESOURCES));
  },

  /**
   * Get all unique locations from resources
   */
  getLocations() {
    const locations = [...new Set(resourceStore.map((r) => r.location))];
    return locations.sort();
  },
};

export default resourceService;
