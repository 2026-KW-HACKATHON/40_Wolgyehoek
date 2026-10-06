package com.wolgyehoek.dongnae.device;

public record MeResponse(String nickname, boolean operator) {

    public static MeResponse from(DeviceInfo device) {
        return new MeResponse(device.nickname(), device.operator());
    }
}
