package com.wolgyehoek.dongnae.device;

public record DeviceInfo(String id, String nickname, boolean operator) {

    public static DeviceInfo from(Device device) {
        return new DeviceInfo(device.getId(), device.getNickname(), device.isOperator());
    }
}
