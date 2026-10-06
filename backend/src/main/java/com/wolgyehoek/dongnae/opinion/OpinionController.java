package com.wolgyehoek.dongnae.opinion;

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

@Tag(name = "04. 의견")
@RestController
@RequestMapping("/api/cards/{cardId}/opinions")
public class OpinionController {

    private final OpinionService opinionService;
    private final DeviceService deviceService;

    public OpinionController(OpinionService opinionService, DeviceService deviceService) {
        this.opinionService = opinionService;
        this.deviceService = deviceService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OpinionResponse create(@PathVariable String cardId,
                                  @RequestAttribute(DeviceCookieFilter.ATTRIBUTE_NAME) String deviceId,
                                  @Valid @RequestBody CreateOpinionRequest request) {
        return opinionService.create(cardId, deviceService.getOrCreate(deviceId), request);
    }

    @GetMapping
    public List<OpinionResponse> list(@PathVariable String cardId) {
        return opinionService.list(cardId);
    }
}