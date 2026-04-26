package com.smartcampus.service.impl;

import com.smartcampus.dto.ResourceDTO;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.Resource;
import com.smartcampus.model.enums.ResourceStatus;
import com.smartcampus.model.enums.ResourceType;
import com.smartcampus.repository.ResourceRepository;
import com.smartcampus.service.ResourceService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ResourceServiceImpl implements ResourceService {

    private final ResourceRepository resourceRepository;

    public ResourceServiceImpl(ResourceRepository resourceRepository) {
        this.resourceRepository = resourceRepository;
    }

    @Override
    public ResourceDTO createResource(ResourceDTO resourceDTO) {
        LocalDateTime now = LocalDateTime.now();
        Resource entity = toEntity(resourceDTO);
        entity.setId(null);
        entity.setStatus(resourceDTO.getStatus() == null ? ResourceStatus.ACTIVE : resourceDTO.getStatus());
        entity.setCreatedAt(now);
        entity.setUpdatedAt(now);

        return toDTO(resourceRepository.save(entity));
    }

    @Override
    public List<ResourceDTO> getAllResources(ResourceType type, Integer capacity, String location) {
        return resourceRepository.findAll().stream()
                .filter(resource -> type == null || resource.getType() == type)
                .filter(resource -> capacity == null || resource.getCapacity() >= capacity)
                .filter(resource -> location == null || location.isBlank() ||
                        (resource.getLocation() != null && resource.getLocation().toLowerCase().contains(location.toLowerCase())))
                .map(this::toDTO)
                .toList();
    }

    @Override
    public ResourceDTO getResourceById(String id) {
        Resource resource = findByIdOrThrow(id);
        return toDTO(resource);
    }

    @Override
    public ResourceDTO updateResource(String id, ResourceDTO resourceDTO) {
        Resource existing = findByIdOrThrow(id);

        existing.setName(resourceDTO.getName());
        existing.setType(resourceDTO.getType());
        existing.setCapacity(resourceDTO.getCapacity());
        existing.setLocation(resourceDTO.getLocation());
        existing.setDescription(resourceDTO.getDescription());
        existing.setAvailabilityWindows(resourceDTO.getAvailabilityWindows());
        existing.setStatus(resourceDTO.getStatus());
        existing.setUpdatedAt(LocalDateTime.now());

        return toDTO(resourceRepository.save(existing));
    }

    @Override
    public void deleteResource(String id) {
        Resource existing = findByIdOrThrow(id);
        resourceRepository.delete(existing);
    }

    @Override
    public ResourceDTO updateStatus(String id, ResourceStatus status) {
        Resource existing = findByIdOrThrow(id);
        existing.setStatus(status);
        existing.setUpdatedAt(LocalDateTime.now());
        return toDTO(resourceRepository.save(existing));
    }

    private Resource findByIdOrThrow(String id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource", "id", id));
    }

    private ResourceDTO toDTO(Resource entity) {
        return ResourceDTO.builder()
                .id(entity.getId())
                .name(entity.getName())
                .type(entity.getType())
                .capacity(entity.getCapacity())
                .location(entity.getLocation())
                .description(entity.getDescription())
                .availabilityWindows(entity.getAvailabilityWindows())
                .status(entity.getStatus())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private Resource toEntity(ResourceDTO dto) {
        return Resource.builder()
                .id(dto.getId())
                .name(dto.getName())
                .type(dto.getType())
                .capacity(dto.getCapacity())
                .location(dto.getLocation())
                .description(dto.getDescription())
                .availabilityWindows(dto.getAvailabilityWindows())
                .status(dto.getStatus())
                .createdAt(dto.getCreatedAt())
                .updatedAt(dto.getUpdatedAt())
                .build();
    }
}
