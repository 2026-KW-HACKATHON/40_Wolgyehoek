package com.wolgyehoek.dongnae.institution;

import com.wolgyehoek.dongnae.device.DeviceCookieFilter;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import java.util.List;

@RestController
public class InstitutionController {
    private final InstitutionService institutions;
    public InstitutionController(InstitutionService institutions) { this.institutions = institutions; }
    public record CreateRequest(String name) {}
    public record EnterRequest(String code) {}
    public record ResponseRequest(String stance, String comment) {}

    @PostMapping("/api/operator/institutions")
    public InstitutionService.Created create(@RequestAttribute(DeviceCookieFilter.ATTRIBUTE_NAME) String deviceId,
                                             @RequestBody CreateRequest request) {
        return institutions.create(deviceId, request.name());
    }
    @GetMapping("/api/operator/institutions")
    public List<InstitutionService.Institution> list(@RequestAttribute(DeviceCookieFilter.ATTRIBUTE_NAME) String deviceId) {
        return institutions.list(deviceId);
    }
    @PostMapping("/api/institutions/enter")
    public InstitutionService.Linked enter(@RequestAttribute(DeviceCookieFilter.ATTRIBUTE_NAME) String deviceId,
                                           @RequestBody EnterRequest request) {
        return institutions.enter(deviceId, request.code());
    }
    @GetMapping("/api/me/institution")
    public ResponseEntity<?> mine(@RequestAttribute(DeviceCookieFilter.ATTRIBUTE_NAME) String deviceId) {
        var institution = institutions.mine(deviceId);
        return institution == null ? ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body("null") : ResponseEntity.ok(institution);
    }
    @PutMapping("/api/cards/{id}/institution-response")
    public void save(@PathVariable String id, @RequestAttribute(DeviceCookieFilter.ATTRIBUTE_NAME) String deviceId,
                     @RequestBody ResponseRequest request) {
        institutions.save(id, deviceId, request.stance(), request.comment());
    }
}
