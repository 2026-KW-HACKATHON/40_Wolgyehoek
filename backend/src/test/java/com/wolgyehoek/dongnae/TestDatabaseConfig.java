package com.wolgyehoek.dongnae;

import org.springframework.boot.flyway.autoconfigure.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration
@Profile("test")
public class TestDatabaseConfig {

    @Bean
    public FlywayMigrationStrategy cleanThenMigrate() {
        return flyway -> {
            String url;
            try (var connection = flyway.getConfiguration().getDataSource().getConnection()) {
                url = connection.getMetaData().getURL();
            } catch (java.sql.SQLException e) {
                throw new IllegalStateException("Cannot verify test database", e);
            }
            if (!url.matches("jdbc:postgresql://[^/]+/dongnae_test(?:\\?.*)?")) {
                throw new IllegalStateException("Refusing to clean non-test database: " + url);
            }
            flyway.clean();
            flyway.migrate();
        };
    }
}