package com.wolgyehoek.dongnae.report;

import com.wolgyehoek.dongnae.device.DeviceCookieFilter;
import com.wolgyehoek.dongnae.device.DeviceService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "03. 검증 리포트")
@RestController
@RequestMapping("/api/cards/{cardId}/report")
public class ReportController {

    private final ReportService reportService;
    private final DeviceService deviceService;

    public ReportController(ReportService reportService, DeviceService deviceService) {
        this.reportService = reportService;
        this.deviceService = deviceService;
    }

    @GetMapping
    public ReportViewResponse view(@PathVariable String cardId,
                                   @RequestAttribute(DeviceCookieFilter.ATTRIBUTE_NAME) String deviceId) {
        return reportService.view(cardId, deviceService.getOrCreate(deviceId));
    }

    @PostMapping
    public ReportResponse publish(@PathVariable String cardId,
                                  @RequestAttribute(DeviceCookieFilter.ATTRIBUTE_NAME) String deviceId,
                                  @Valid @RequestBody PublishReportRequest request) {
        return reportService.publish(cardId, deviceService.getOrCreate(deviceId), request);
    }
}