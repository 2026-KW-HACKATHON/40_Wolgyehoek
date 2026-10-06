package com.wolgyehoek.dongnae.reaction;

import com.wolgyehoek.dongnae.device.DeviceCookieFilter;
import com.wolgyehoek.dongnae.device.DeviceInfo;
import com.wolgyehoek.dongnae.device.DeviceService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "02. 수요 반응")
@RestController
@RequestMapping("/api/cards/{cardId}/reaction")
public class ReactionController {

    private final ReactionService reactionService;
    private final DeviceService deviceService;

    public ReactionController(ReactionService reactionService, DeviceService deviceService) {
        this.reactionService = reactionService;
        this.deviceService = deviceService;
    }

    @PutMapping
    public ReactionResponse react(@PathVariable String cardId,
                                  @RequestAttribute(DeviceCookieFilter.ATTRIBUTE_NAME) String deviceId,
                                  @Valid @RequestBody ReactRequest request) {
        DeviceInfo device = deviceService.getOrCreate(deviceId);
        return reactionService.react(cardId, device.id(), request);
    }
}