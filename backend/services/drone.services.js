import DroneRepository from "../repositories/drone.repositories.js";

class DroneService {
  async createDrone(data) {
    if (!data.name || !data.status) {
      throw new Error("Missing required fields: name or status");
    }
    return await DroneRepository.createDrone(data);
  }

  async getDroneById(id) {
    const drone = await DroneRepository.getDroneById(id);
    if (!drone) throw new Error("Drone not found");
    return drone;
  }

  async getAllDrones() {
    return await DroneRepository.getAllDrones();
  }

  async getDronesByStatus(status) {
    return await DroneRepository.getDronesByStatus(status);
  }

  async updateDrone(id, data) {
    const updated = await DroneRepository.updateDrone(id, data);
    if (!updated) throw new Error("Failed to update drone");
    return updated;
  }

  async deleteDrone(id) {
    const deleted = await DroneRepository.deleteDrone(id);
    if (!deleted) throw new Error("Drone not found or already deleted");
    return deleted;
  }
}

export default new DroneService();
