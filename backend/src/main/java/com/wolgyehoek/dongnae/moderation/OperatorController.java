package com.wolgyehoek.dongnae.moderation;

import com.wolgyehoek.dongnae.device.DeviceCookieFilter;
import com.wolgyehoek.dongnae.device.DeviceInfo;
import com.wolgyehoek.dongnae.device.DeviceService;
import com.wolgyehoek.dongnae.device.MeResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "08. 운영자")
@RestController
@RequestMapping("/api/operator")
public class OperatorController {

    private final OperatorService operatorService;
    private final DeviceService deviceService;

    public OperatorController(OperatorService operatorService, DeviceService deviceService) {
        this.operatorService = operatorService;
        this.deviceService = deviceService;
    }

    @PostMapping("/enter")
    public MeResponse enter(@RequestAttribute(DeviceCookieFilter.ATTRIBUTE_NAME) String deviceId,
                            @Valid @RequestBody OperatorEnterRequest request) {
        DeviceInfo device = deviceService.getOrCreate(deviceId);
        DeviceInfo operator = operatorService.enter(device.id(), request.code());
        return new MeResponse(operator.nickname(), operator.operator());
    }
}