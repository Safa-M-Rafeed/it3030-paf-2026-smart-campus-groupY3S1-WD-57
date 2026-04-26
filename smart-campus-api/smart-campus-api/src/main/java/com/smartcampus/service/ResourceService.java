package com.smartcampus.service;

import com.smartcampus.dto.ResourceDTO;
import com.smartcampus.model.enums.ResourceStatus;
import com.smartcampus.model.enums.ResourceType;

import java.util.List;

public interface ResourceService {
    ResourceDTO createResource(ResourceDTO resourceDTO);
    List<ResourceDTO> getAllResources(ResourceType type, Integer capacity, String location);
    ResourceDTO getResourceById(String id);
    ResourceDTO updateResource(String id, ResourceDTO resourceDTO);
    void deleteResource(String id);
    ResourceDTO updateStatus(String id, ResourceStatus status);
}
