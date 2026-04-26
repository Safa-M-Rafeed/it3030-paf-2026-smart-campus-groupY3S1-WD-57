package com.smartcampus.controller;

import com.smartcampus.dto.ResourceDTO;
import com.smartcampus.dto.response.ApiResponse;
import com.smartcampus.model.enums.ResourceStatus;
import com.smartcampus.model.enums.ResourceType;
import com.smartcampus.service.ResourceService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
public class ResourceController {

    private final ResourceService resourceService;

    public ResourceController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ResourceDTO>> createResource(@Valid @RequestBody ResourceDTO resourceDTO) {
        ResourceDTO created = resourceService.createResource(resourceDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(created, "Resource created successfully"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ResourceDTO>>> getAllResources(
            @RequestParam(required = false) ResourceType type,
            @RequestParam(required = false) Integer capacity,
            @RequestParam(required = false) String location
    ) {
        List<ResourceDTO> resources = resourceService.getAllResources(type, capacity, location);
        return ResponseEntity.ok(ApiResponse.success(resources, "Resources fetched successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ResourceDTO>> getResourceById(@PathVariable String id) {
        ResourceDTO resource = resourceService.getResourceById(id);
        return ResponseEntity.ok(ApiResponse.success(resource, "Resource fetched successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ResourceDTO>> updateResource(
            @PathVariable String id,
            @Valid @RequestBody ResourceDTO resourceDTO
    ) {
        ResourceDTO updated = resourceService.updateResource(id, resourceDTO);
        return ResponseEntity.ok(ApiResponse.success(updated, "Resource updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResource(@PathVariable String id) {
        resourceService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<ResourceDTO>> updateStatus(
            @PathVariable String id,
            @Valid @RequestBody StatusUpdateRequest statusRequest
    ) {
        ResourceDTO updated = resourceService.updateStatus(id, statusRequest.getStatus());
        return ResponseEntity.ok(ApiResponse.success(updated, "Resource status updated successfully"));
    }

    public static class StatusUpdateRequest {
        @NotNull(message = "Status is required")
        private ResourceStatus status;

        public ResourceStatus getStatus() {
            return status;
        }

        public void setStatus(ResourceStatus status) {
            this.status = status;
        }
    }
}
