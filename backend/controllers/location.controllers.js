import LocationService from "../services/location.services.js";

class LocationController {
  async create(req, res) {
    try {
      const location = await LocationService.createLocation(req.body);
      res.status(201).json(location);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const location = await LocationService.getLocationById(req.params.id);
      res.status(200).json(location);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const locations = await LocationService.getAllLocations();
      res.status(200).json(locations);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getByType(req, res) {
    try {
      const locations = await LocationService.getLocationsByType(req.params.type);
      res.status(200).json(locations);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async update(req, res) {
    try {
      const updated = await LocationService.updateLocation(req.params.id, req.body);
      res.status(200).json(updated);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async delete(req, res) {
    try {
      const deleted = await LocationService.deleteLocation(req.params.id);
      res.status(200).json(deleted);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

export default new LocationController();
