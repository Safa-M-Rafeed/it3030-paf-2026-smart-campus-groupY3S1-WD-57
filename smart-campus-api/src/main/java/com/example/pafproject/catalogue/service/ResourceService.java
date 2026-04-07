package com.example.pafproject.catalogue.service;

import com.example.pafproject.catalogue.model.Resource;
import com.example.pafproject.catalogue.model.ResourceType;
import com.example.pafproject.catalogue.model.ResourceStatus;
import com.example.pafproject.catalogue.repository.ResourceRepository;
import com.example.pafproject.catalogue.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ResourceService {

    @Autowired
    private ResourceRepository resourceRepository;

    public List<Resource> getAllResources() {
        return resourceRepository.findAll();
    }

    public Resource getResourceById(String id) {
        Optional<Resource> resource = resourceRepository.findById(id);
        if (resource.isEmpty()) {
            throw new ResourceNotFoundException("Resource not found with id: " + id);
        }
        return resource.get();
    }

    public Resource createResource(Resource resource) {
        resource.setCreatedAt(LocalDateTime.now());
        resource.setUpdatedAt(LocalDateTime.now());
        resource.setStatus(resource.getStatus() != null ? resource.getStatus() : ResourceStatus.ACTIVE);
        return resourceRepository.save(resource);
    }

    public Resource updateResource(String id, Resource resourceDetails) {
        Resource existingResource = getResourceById(id);

        existingResource.setName(resourceDetails.getName());
        existingResource.setType(resourceDetails.getType());
        existingResource.setCapacity(resourceDetails.getCapacity());
        existingResource.setLocation(resourceDetails.getLocation());
        existingResource.setAvailabilityWindows(resourceDetails.getAvailabilityWindows());
        existingResource.setStatus(resourceDetails.getStatus());
        existingResource.setDescription(resourceDetails.getDescription());
        existingResource.setUpdatedAt(LocalDateTime.now());

        return resourceRepository.save(existingResource);
    }

    public void deleteResource(String id) {
        Resource resource = getResourceById(id);
        resourceRepository.delete(resource);
    }

    public List<Resource> searchResources(ResourceType type, Integer capacity, String location) {
        if (type != null && capacity != null && location != null) {
            return resourceRepository.findByTypeAndCapacityGreaterThanEqualAndLocationContainingIgnoreCaseAndStatus(
                type, capacity, location, ResourceStatus.ACTIVE);
        } else if (type != null && capacity != null) {
            return resourceRepository.findByTypeAndCapacityGreaterThanEqualAndLocationContainingIgnoreCase(
                type, capacity, "");
        } else if (type != null && location != null) {
            return resourceRepository.findByTypeAndCapacityGreaterThanEqualAndLocationContainingIgnoreCase(
                type, 0, location);
        } else if (capacity != null && location != null) {
            List<Resource> resources = resourceRepository.findByCapacityGreaterThanEqual(capacity);
            return resources.stream()
                .filter(r -> r.getLocation().toLowerCase().contains(location.toLowerCase()))
                .filter(r -> r.getStatus() == ResourceStatus.ACTIVE)
                .toList();
        } else if (type != null) {
            return resourceRepository.findByTypeAndCapacityGreaterThanEqualAndLocationContainingIgnoreCase(
                type, 0, "");
        } else if (capacity != null) {
            return resourceRepository.findByCapacityGreaterThanEqual(capacity).stream()
                .filter(r -> r.getStatus() == ResourceStatus.ACTIVE)
                .toList();
        } else if (location != null) {
            return resourceRepository.findByLocationContainingIgnoreCase(location).stream()
                .filter(r -> r.getStatus() == ResourceStatus.ACTIVE)
                .toList();
        } else {
            return resourceRepository.findByStatus(ResourceStatus.ACTIVE);
        }
    }
}
