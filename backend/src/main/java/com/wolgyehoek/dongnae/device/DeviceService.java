package com.wolgyehoek.dongnae.device;

import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

@Service
public class DeviceService {

    private final DeviceRepository deviceRepository;

    public DeviceService(DeviceRepository deviceRepository) {
        this.deviceRepository = deviceRepository;
    }

    @Transactional
    public DeviceInfo getOrCreate(String deviceId) {
        Device device = deviceRepository.findById(deviceId).orElseGet(() -> createDevice(deviceId));
        return DeviceInfo.from(device);
    }

    @Transactional
    public DeviceInfo rename(String deviceId, String nickname) {
        String clean = nickname == null ? "" : nickname.trim();
        if (clean.length() < 2 || clean.length() > 20) {
            throw new com.wolgyehoek.dongnae.common.BadRequestException("닉네임은 2~20자로 적어 주세요.");
        }
        getOrCreate(deviceId);
        Device device = deviceRepository.findById(deviceId).orElseThrow();
        device.rename(clean);
        return DeviceInfo.from(device);
    }

    private Device createDevice(String id) {
        deviceRepository.ensureDevice(id, defaultNickname(id));
        return deviceRepository.findById(id).orElseThrow();
    }

    private String defaultNickname(String deviceId) {
        return "주민 " + deviceId.substring(deviceId.length() - 4).toUpperCase();
    }
}
