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
        Device device = deviceRepository.findById(deviceId).orElseGet(() -> deviceRepository.save(new Device(deviceId, defaultNickname(deviceId))));
        return DeviceInfo.from(device);
    }

    private String defaultNickname(String deviceId) {
        return "주민 " + deviceId.substring(deviceId.length() - 4).toUpperCase();
    }
}
