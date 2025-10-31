import DroneService from "../services/drone.services.js";

class DroneController {
  async create(req, res) {
    try {
      const drone = await DroneService.createDrone(req.body);
      res.status(201).json(drone);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const drones = await DroneService.getAllDrones();
      res.status(200).json(drones);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const drone = await DroneService.getDroneById(req.params.id);
      res.status(200).json(drone);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  async getByStatus(req, res) {
    try {
      const drones = await DroneService.getDronesByStatus(req.params.status);
      res.status(200).json(drones);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  async update(req, res) {
    try {
      const updated = await DroneService.updateDrone(req.params.id, req.body);
      res.status(200).json(updated);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async delete(req, res) {
    try {
      const deleted = await DroneService.deleteDrone(req.params.id);
      res.status(200).json(deleted);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

export default new DroneController();
