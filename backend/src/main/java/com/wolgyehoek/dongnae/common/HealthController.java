package com.wolgyehoek.dongnae.common;
import javax.sql.DataSource;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
@RestController
public class HealthController {
    private final DataSource dataSource;
    public HealthController(DataSource dataSource) { this.dataSource = dataSource; }
    @GetMapping("/api/health")
    public Map<String, String> health() throws java.sql.SQLException {
        try (var connection = dataSource.getConnection(); var stmt = connection.createStatement()) {
            stmt.execute("SELECT 1");
        }
        return Map.of("status", "ok");
    }
}
