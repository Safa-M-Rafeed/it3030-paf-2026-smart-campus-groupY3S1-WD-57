package com.example.pafproject.catalogue.controller;

import com.example.pafproject.catalogue.model.Resource;
import com.example.pafproject.catalogue.model.ResourceType;
import com.example.pafproject.catalogue.dto.ResourceRequestDTO;
import com.example.pafproject.catalogue.dto.ResourceResponseDTO;
import com.example.pafproject.catalogue.service.ResourceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/resources")
@CrossOrigin(origins = "*")
public class ResourceController {

    @Autowired
    private ResourceService resourceService;

    @GetMapping
    public ResponseEntity<List<ResourceResponseDTO>> getAllResources() {
        List<Resource> resources = resourceService.getAllResources();
        List<ResourceResponseDTO> responseDTOs = resources.stream()
            .map(ResourceResponseDTO::fromEntity)
            .collect(Collectors.toList());
        return ResponseEntity.ok(responseDTOs);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResourceResponseDTO> getResourceById(@PathVariable String id) {
        Resource resource = resourceService.getResourceById(id);
        ResourceResponseDTO responseDTO = ResourceResponseDTO.fromEntity(resource);
        return ResponseEntity.ok(responseDTO);
    }

    @PostMapping
    public ResponseEntity<ResourceResponseDTO> createResource(@Valid @RequestBody ResourceRequestDTO requestDTO) {
        Resource resource = requestDTO.toEntity();
        Resource savedResource = resourceService.createResource(resource);
        ResourceResponseDTO responseDTO = ResourceResponseDTO.fromEntity(savedResource);
        return new ResponseEntity<>(responseDTO, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResourceResponseDTO> updateResource(
            @PathVariable String id,
            @Valid @RequestBody ResourceRequestDTO requestDTO) {
        Resource resource = requestDTO.toEntity();
        Resource updatedResource = resourceService.updateResource(id, resource);
        ResourceResponseDTO responseDTO = ResourceResponseDTO.fromEntity(updatedResource);
        return ResponseEntity.ok(responseDTO);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResource(@PathVariable String id) {
        resourceService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<ResourceResponseDTO>> searchResources(
            @RequestParam(required = false) ResourceType type,
            @RequestParam(required = false) Integer capacity,
            @RequestParam(required = false) String location) {
        List<Resource> resources = resourceService.searchResources(type, capacity, location);
        List<ResourceResponseDTO> responseDTOs = resources.stream()
            .map(ResourceResponseDTO::fromEntity)
            .collect(Collectors.toList());
        return ResponseEntity.ok(responseDTOs);
    }
}
