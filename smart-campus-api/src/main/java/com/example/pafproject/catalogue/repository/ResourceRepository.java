package com.example.pafproject.catalogue.repository;

import com.example.pafproject.catalogue.model.Resource;
import com.example.pafproject.catalogue.model.ResourceType;
import com.example.pafproject.catalogue.model.ResourceStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ResourceRepository extends MongoRepository<Resource, String> {

    List<Resource> findByType(ResourceType type);

    List<Resource> findByCapacityGreaterThanEqual(int capacity);

    List<Resource> findByLocationContainingIgnoreCase(String location);

    List<Resource> findByStatus(ResourceStatus status);

    List<Resource> findByTypeAndCapacityGreaterThanEqualAndLocationContainingIgnoreCase(
        ResourceType type, int capacity, String location);

    List<Resource> findByTypeAndCapacityGreaterThanEqualAndLocationContainingIgnoreCaseAndStatus(
        ResourceType type, int capacity, String location, ResourceStatus status);
}
