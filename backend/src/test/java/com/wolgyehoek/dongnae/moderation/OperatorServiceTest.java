package com.wolgyehoek.dongnae.moderation;

import com.wolgyehoek.dongnae.common.ForbiddenException;
import com.wolgyehoek.dongnae.device.DeviceInfo;
import com.wolgyehoek.dongnae.device.DeviceRepository;
import com.wolgyehoek.dongnae.device.DeviceService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest(properties = "dongnae.operator-code=test-operator-code")
class OperatorServiceTest {

    @Autowired private OperatorService operatorService;
    @Autowired private DeviceService deviceService;
    @Autowired private DeviceRepository deviceRepository;

    @Test
    void 맞는_코드를_넣으면_운영자가_된다() {
        DeviceInfo device = deviceService.getOrCreate("d_00000000000000a1");

        DeviceInfo result = operatorService.enter(device.id(), "test-operator-code");

        assertThat(result.operator()).isTrue();
        assertThat(deviceRepository.findById(device.id()).orElseThrow().isOperator()).isTrue();
    }

    @Test
    void 틀린_코드를_넣으면_거부한다() {
        DeviceInfo device = deviceService.getOrCreate("d_00000000000000a2");

        assertThatThrownBy(() -> operatorService.enter(device.id(), "wrong-code"))
                .isInstanceOf(ForbiddenException.class);
    }
}