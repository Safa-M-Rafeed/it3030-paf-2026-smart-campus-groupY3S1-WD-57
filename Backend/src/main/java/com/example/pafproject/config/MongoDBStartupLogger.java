package com.example.pafproject.config;

import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Configuration
public class MongoDBStartupLogger {

    private static final Logger logger = LoggerFactory.getLogger(MongoDBStartupLogger.class);

    @Bean
    public ApplicationRunner mongoDbConnectionLogger(MongoTemplate mongoTemplate) {
        return args -> {
            try {
                // MongoDB connection test
                mongoTemplate.getDb().getName();
                
                // Display connection status
                String dbName = mongoTemplate.getDb().getName();
                
                logger.info("═".repeat(80));
                logger.info("                         ✅ MONGODB CONNECTION SUCCESS                       ");
                logger.info("═".repeat(80));
                logger.info("  Database Name    : " + dbName);
                logger.info("  Status           : ACTIVE ✅");
                logger.info("  Cluster          : cluster1.via4f4a.mongodb.net");
                logger.info("  API Endpoint     : http://localhost:9091/api/resources");
                logger.info("═".repeat(80));
                
            } catch (Exception e) {
                logger.error("❌ MONGODB CONNECTION FAILED: " + e.getMessage());
            }
        };
    }
}
