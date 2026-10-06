package com.wolgyehoek.dongnae.device;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.UUID;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;

@SpringBootTest
class DeviceServiceTest {

    @Autowired
    private DeviceService deviceService;

    @Test
    void 처음_보는_기기는_기본_닉네임으로_등록() {
        String deviceId = "d_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);

        DeviceInfo info = deviceService.getOrCreate(deviceId);

        String lastFour = deviceId.substring(deviceId.length() - 4).toUpperCase();
        assertThat(info.id()).isEqualTo(deviceId);
        assertThat(info.nickname()).isEqualTo("주민 " + lastFour);
        assertThat(info.operator()).isFalse();
    }

    @Test
    void 같은_기기로_두_번_요청하면_같은_기기를_돌려준다() {
        String deviceId = "d_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);

        DeviceInfo first = deviceService.getOrCreate(deviceId);
        DeviceInfo second = deviceService.getOrCreate(deviceId);

        assertThat(second).isEqualTo(first);
    }
}
