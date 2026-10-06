package com.wolgyehoek.dongnae.moderation;

import com.wolgyehoek.dongnae.common.BadRequestException;
import com.wolgyehoek.dongnae.common.ForbiddenException;
import com.wolgyehoek.dongnae.common.Ids;
import com.wolgyehoek.dongnae.device.Device;
import com.wolgyehoek.dongnae.device.DeviceInfo;
import com.wolgyehoek.dongnae.device.DeviceRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

@Service
public class OperatorService {

    private final DeviceRepository deviceRepository;
    private final ModerationLogRepository logRepository;
    private final String operatorCode;

    public OperatorService(DeviceRepository deviceRepository,
                           ModerationLogRepository logRepository,
                           @Value("${dongnae.operator-code}") String operatorCode) {
        this.deviceRepository = deviceRepository;
        this.logRepository = logRepository;
        this.operatorCode = operatorCode;
    }

    @Transactional
    public DeviceInfo enter(String deviceId, String code) {
        if (operatorCode == null || operatorCode.isBlank()) {
            throw new BadRequestException("운영 코드가 설정되지 않았어요.");
        }
        if (code == null || !matches(code)) {
            throw new ForbiddenException("운영 코드가 맞지 않아요.");
        }

        Device device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new IllegalStateException("기기가 등록되지 않았어요: " + deviceId));
        device.becomeOperator();
        logRepository.save(new ModerationLog(Ids.newId(), deviceId, ModerationAction.ENTER_OPERATOR,
                "device:" + deviceId, ""));

        return new DeviceInfo(device.getId(), device.getNickname(), true);
    }

    private boolean matches(String code) {
        return MessageDigest.isEqual(
                operatorCode.getBytes(StandardCharsets.UTF_8),
                code.getBytes(StandardCharsets.UTF_8));
    }

}