package com.wolgyehoek.dongnae.device;

import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "09. 내 정보")
@RestController
@RequestMapping("/api/me")
public class MeController {

    private final DeviceService deviceService;

    public MeController(DeviceService deviceService) {
        this.deviceService = deviceService;
    }

    @GetMapping
    public MeResponse me(@RequestAttribute(DeviceCookieFilter.ATTRIBUTE_NAME) String deviceId) {
        DeviceInfo device = deviceService.getOrCreate(deviceId);
        return MeResponse.from(device);
    }
}
