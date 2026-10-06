package com.wolgyehoek.dongnae.conclusion;

import com.wolgyehoek.dongnae.device.DeviceCookieFilter;
import com.wolgyehoek.dongnae.device.DeviceService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "05. 결론")
@RestController
@RequestMapping("/api/cards/{cardId}/conclusions")
public class ConclusionController {

    private final ConclusionService conclusionService;
    private final DeviceService deviceService;

    public ConclusionController(ConclusionService conclusionService, DeviceService deviceService) {
        this.conclusionService = conclusionService;
        this.deviceService = deviceService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RecordConclusionResponse record(@PathVariable String cardId,
                                           @RequestAttribute(DeviceCookieFilter.ATTRIBUTE_NAME) String deviceId,
                                           @Valid @RequestBody RecordConclusionRequest request) {
        return conclusionService.record(cardId, deviceService.getOrCreate(deviceId), request);
    }

    @GetMapping
    public List<ConclusionResponse> history(@PathVariable String cardId) {
        return conclusionService.history(cardId);
    }
}